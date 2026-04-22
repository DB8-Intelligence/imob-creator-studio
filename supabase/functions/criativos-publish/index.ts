/**
 * criativos-publish — Criativos Pro Sprint 3.
 *
 * Publica no Instagram um job aprovado via pipeline (Graph API v18.0:
 * container → publish). Chamada server-to-server (service role) por:
 *   - whatsapp-events quando detecta 👍 do corretor
 *
 * Diferença do publish-social existente: aquela função exige JWT do usuário
 * final (frontend dashboard). Aqui é server-to-server, opera sem JWT.
 *
 * Em erro: status='error' + notifica corretor via WhatsApp.
 * Em sucesso: status='published', ig_post_id salvo, notifica corretor
 * com link do post.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EVO_URL      = Deno.env.get("EVOLUTION_API_URL");
const EVO_KEY      = Deno.env.get("EVOLUTION_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  let creative_job_id = "";

  try {
    const body = await req.json();
    creative_job_id = body.creative_job_id;
    if (!creative_job_id) {
      return new Response(JSON.stringify({ error: "creative_job_id required" }), {
        status: 400,
      });
    }

    // Carrega job + property pra achar workspace
    const { data: job, error: jobErr } = await supabase
      .from("creatives_gallery")
      .select("id, user_id, property_id, format_feed, caption, hashtags, cta_text, status")
      .eq("id", creative_job_id)
      .maybeSingle();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "job not found" }), { status: 404 });
    }

    if (job.status !== "approved") {
      // Defensivo: só publica se foi explicitamente aprovado.
      return new Response(
        JSON.stringify({ error: `job não aprovado (status=${job.status})` }),
        { status: 409 }
      );
    }

    if (!job.format_feed) {
      await failJob(creative_job_id, "sem imagem pra publicar");
      return new Response(JSON.stringify({ error: "no image" }), { status: 400 });
    }

    // Lock atômico: status=approved → status=publishing. Se outro processo
    // (ex: dashboard aprovou e Zap aprovou quase junto) já pegou, o UPDATE
    // retorna 0 linhas e abortamos — evita publicar duplicado no Instagram.
    const { data: locked, error: lockErr } = await supabase
      .from("creatives_gallery")
      .update({ status: "publishing" })
      .eq("id", creative_job_id)
      .eq("status", "approved")
      .select("id")
      .maybeSingle();

    if (lockErr) {
      return new Response(JSON.stringify({ error: `lock falhou: ${lockErr.message}` }), {
        status: 500,
      });
    }

    if (!locked) {
      // Já tem outro processo publicando ou já publicou
      return new Response(
        JSON.stringify({ error: "job já está sendo publicado ou foi publicado", idempotent: true }),
        { status: 200 }
      );
    }

    // Workspace a partir da property
    const { data: property } = await supabase
      .from("properties")
      .select("workspace_id")
      .eq("id", job.property_id)
      .maybeSingle();

    if (!property?.workspace_id) {
      await failJob(creative_job_id, "property sem workspace");
      return new Response(JSON.stringify({ error: "no workspace" }), { status: 404 });
    }

    // Conta Instagram do workspace (primeira ativa)
    const { data: account } = await supabase
      .from("social_accounts")
      .select("account_id, access_token")
      .eq("workspace_id", property.workspace_id)
      .eq("platform", "instagram")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!account) {
      await failJob(creative_job_id, "nenhuma conta Instagram conectada");
      await notifyOwner(
        job.user_id,
        "❌ Tentei publicar mas você ainda não conectou o Instagram.\n\nConecte em: Configurações → Integrações."
      );
      return new Response(JSON.stringify({ error: "no instagram account" }), { status: 400 });
    }

    // Graph API: container → publish
    const fullCaption = `${job.caption ?? ""}\n\n${job.hashtags ?? ""}`.trim();

    const containerRes = await fetch(
      `https://graph.facebook.com/v18.0/${account.account_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url:    job.format_feed,
          caption:      fullCaption,
          access_token: account.access_token,
        }),
      }
    );
    const container = await containerRes.json();

    if (!container.id) {
      const reason = container?.error?.message ?? "graph container sem id";
      await failJob(creative_job_id, `IG container falhou: ${reason.slice(0, 300)}`);
      await notifyOwner(job.user_id, `❌ Instagram rejeitou a publicação: ${reason.slice(0, 200)}`);
      return new Response(JSON.stringify({ error: "container failed", reason }), { status: 502 });
    }

    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${account.account_id}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id:  container.id,
          access_token: account.access_token,
        }),
      }
    );
    const published = await publishRes.json();
    const igPostId  = published?.id ?? null;

    if (!igPostId) {
      const reason = published?.error?.message ?? "graph publish sem id";
      await failJob(creative_job_id, `IG publish falhou: ${reason.slice(0, 300)}`);
      await notifyOwner(job.user_id, `❌ Instagram rejeitou a publicação: ${reason.slice(0, 200)}`);
      return new Response(JSON.stringify({ error: "publish failed", reason }), { status: 502 });
    }

    await supabase
      .from("creatives_gallery")
      .update({
        status:       "published",
        published_at: new Date().toISOString(),
        ig_post_id:   igPostId,
      })
      .eq("id", creative_job_id);

    await notifyOwner(
      job.user_id,
      `✅ Post publicado no Instagram!\n\nVer post: https://instagram.com/p/${igPostId}\n\nAcompanhe curtidas e comentários. 📈`
    );

    return new Response(
      JSON.stringify({ success: true, ig_post_id: igPostId }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("criativos-publish error:", err);
    if (creative_job_id) await failJob(creative_job_id, (err as Error).message);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "internal error" }),
      { status: 500 }
    );
  }
});

async function failJob(creative_job_id: string, reason: string): Promise<void> {
  await supabase
    .from("creatives_gallery")
    .update({
      status:  "error",
      caption: `ERRO publish: ${reason.slice(0, 500)}`,
    })
    .eq("id", creative_job_id);
}

/**
 * Manda texto pro próprio corretor (ownerJid da instance Evolution dele).
 * Sem instance conectada → silencioso (não é erro fatal).
 */
async function notifyOwner(ownerUserId: string, text: string): Promise<void> {
  if (!EVO_URL || !EVO_KEY) return;

  const { data: instance } = await supabase
    .from("user_whatsapp_instances")
    .select("instance_name")
    .eq("user_id", ownerUserId)
    .maybeSingle();

  if (!instance?.instance_name) return;

  const infoRes = await fetch(
    `${EVO_URL}/instance/fetchInstances?instanceName=${instance.instance_name}`,
    { headers: { apikey: EVO_KEY } }
  );
  const info = await infoRes.json().catch(() => null);
  const ownerJid = Array.isArray(info)
    ? info[0]?.instance?.ownerJid
    : info?.instance?.ownerJid;

  if (!ownerJid) return;

  await fetch(`${EVO_URL}/message/sendText/${instance.instance_name}`, {
    method: "POST",
    headers: { apikey: EVO_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ number: ownerJid, text }),
  }).catch((e) => console.error("notifyOwner failed:", e));
}
