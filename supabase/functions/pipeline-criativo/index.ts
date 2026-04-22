/**
 * pipeline-criativo — Criativos Pro Sprint 2.
 *
 * Orquestra geração automática de criativo Instagram a partir de um imóvel
 * capturado via WhatsApp (source='whatsapp' em `properties`).
 *
 * Chamada server-to-server (service role) pelo whatsapp-events quando
 * workspace tem módulo `criativos_pro` ativo.
 *
 * Fluxo:
 *   1. Carrega property + creative_job
 *   2. Claude Sonnet gera legenda + hashtags + CTA
 *   3. Gemini 2.0 (via edge function generate-art) compõe arte 1080x1080
 *      usando photo[0] como base
 *   4. UPDATE creatives_gallery (caption, hashtags, cta_text, format_feed,
 *      status='pending_approval', approval_deadline=now()+2min)
 *   5. Notifica corretor via WhatsApp com link pro dashboard
 *
 * Sprint 3 vai trocar o passo 5 por aprovação bidirecional (👍/👎 citando
 * o job) + pg_cron pra fallback de deadline.
 *
 * Em erro: status='error' + erro logado no creative_job + notifica corretor.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const EVO_URL = Deno.env.get("EVOLUTION_API_URL");
const EVO_KEY = Deno.env.get("EVOLUTION_API_KEY");
const DASHBOARD_URL = Deno.env.get("PUBLIC_DASHBOARD_URL") ?? "https://nexoimobai.com.br";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface PropertyRow {
  id: string;
  workspace_id: string;
  reference: string | null;
  type: string | null;
  pretension: string | null;
  price: number | null;
  bedrooms: number | null;
  suites: number | null;
  parking: number | null;
  area_built: number | null;
  address: Record<string, unknown> | null;
  photos: string[] | null;
  description: string | null;
  captured_by: string | null;
}

interface CopyResult {
  legenda: string;
  hashtags: string[];
  cta: string;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  let creative_job_id = "";
  let property_id = "";

  try {
    const body = await req.json();
    property_id = body.property_id;
    creative_job_id = body.creative_job_id;

    if (!property_id || !creative_job_id) {
      return new Response(JSON.stringify({ error: "property_id and creative_job_id required" }), {
        status: 400,
      });
    }

    // Marca job como generating
    await supabase
      .from("creatives_gallery")
      .update({ status: "generating" })
      .eq("id", creative_job_id);

    // ── 1. Carrega property ───────────────────────────────────────────────
    const { data: property, error: propErr } = await supabase
      .from("properties")
      .select(
        "id, workspace_id, reference, type, pretension, price, bedrooms, suites, parking, area_built, address, photos, description, captured_by"
      )
      .eq("id", property_id)
      .maybeSingle<PropertyRow>();

    if (propErr || !property) {
      await failJob(creative_job_id, `property não encontrado: ${propErr?.message ?? "null"}`);
      return new Response(JSON.stringify({ error: "property not found" }), { status: 404 });
    }

    const photoUrl = property.photos?.[0];
    if (!photoUrl) {
      await failJob(creative_job_id, "property sem foto");
      return new Response(JSON.stringify({ error: "property has no photo" }), { status: 400 });
    }

    // ── 2. Claude gera copy ───────────────────────────────────────────────
    const copy = await generateCopy(property);

    // ── 3. Gemini compõe arte (via edge function generate-art) ────────────
    const artUrl = await generateArt({
      propertyId: property.id,
      workspaceId: property.workspace_id,
      imageUrl: photoUrl,
      title: deriveTitle(property),
      description: copy.legenda.slice(0, 180),
    });

    // ── 4. UPDATE creatives_gallery ───────────────────────────────────────
    const deadline = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const { error: updateErr } = await supabase
      .from("creatives_gallery")
      .update({
        status: "pending_approval",
        format_feed: artUrl,
        caption: copy.legenda,
        hashtags: copy.hashtags.join(" "),
        cta_text: copy.cta,
        approval_deadline: deadline,
      })
      .eq("id", creative_job_id);

    if (updateErr) {
      await failJob(creative_job_id, `update creatives_gallery falhou: ${updateErr.message}`);
      throw updateErr;
    }

    // ── 5. Notifica corretor (Sprint 2: link dashboard; Sprint 3: 👍/👎) ──
    if (property.captured_by) {
      await notifyCorretor(property.captured_by, creative_job_id, property.reference);
    }

    return new Response(
      JSON.stringify({ success: true, creative_job_id, art_url: artUrl }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("pipeline-criativo error:", err);
    if (creative_job_id) await failJob(creative_job_id, (err as Error).message);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "internal error" }),
      { status: 500 }
    );
  }
});

/* ────────────────────────────────────────────────────────────────────────── */

async function failJob(creative_job_id: string, reason: string): Promise<void> {
  await supabase
    .from("creatives_gallery")
    .update({ status: "error", caption: `ERRO: ${reason.slice(0, 500)}` })
    .eq("id", creative_job_id);
}

function deriveTitle(p: PropertyRow): string {
  const addr = (p.address ?? {}) as Record<string, string>;
  const tipo = p.type ?? "Imóvel";
  const bairro = addr.bairro ?? addr.cidade ?? "";
  return bairro ? `${tipo} em ${bairro}` : tipo;
}

function fmtBRL(v: number | null): string {
  if (v == null) return "Consulte";
  return `R$ ${Number(v).toLocaleString("pt-BR")}`;
}

/**
 * Gera legenda + hashtags + CTA via Claude Sonnet.
 * Fallback textual se Claude falhar — garante que o job nunca trava por causa
 * da copy. Prioridade: sempre entregar o criativo, mesmo que com copy simples.
 */
async function generateCopy(p: PropertyRow): Promise<CopyResult> {
  const addr = (p.address ?? {}) as Record<string, string>;
  const bairro = addr.bairro ?? "";
  const cidade = addr.cidade ?? "";
  const preco = fmtBRL(p.price);
  const finalidade = p.pretension === "aluguel" ? "Para Alugar" : "À Venda";

  const fallback: CopyResult = {
    legenda: `✨ ${p.type ?? "Imóvel"} ${finalidade} em ${bairro}${cidade ? `, ${cidade}` : ""}\n\n${preco}${p.bedrooms ? ` · ${p.bedrooms} quartos` : ""}${p.area_built ? ` · ${p.area_built}m²` : ""}\n\nFale comigo no WhatsApp! 📲`,
    hashtags: ["#imovel", "#imoveis", bairro ? `#${bairro.replace(/\s+/g, "")}` : "#imobiliaria"].filter(Boolean),
    cta: "Fale comigo no WhatsApp!",
  };

  if (!ANTHROPIC_KEY) return fallback;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system:
          `Você é copywriter imobiliário brasileiro de alta conversão para Instagram.
Crie legendas que geram CURIOSIDADE e DESEJO, linguagem natural BR, emojis estratégicos, CTA claro.
Responda SEMPRE em JSON puro (sem markdown, sem crases):
{"legenda":"texto completo","hashtags":["#tag1","#tag2"],"cta":"texto do CTA"}`,
        messages: [
          {
            role: "user",
            content: `Crie legenda de Instagram para:
Tipo: ${p.type ?? "imóvel"}
Finalidade: ${finalidade}
Preço: ${preco}
Quartos: ${p.bedrooms ?? "—"}  Suítes: ${p.suites ?? "—"}  Vagas: ${p.parking ?? "—"}
Área: ${p.area_built ?? "—"} m²
Bairro: ${bairro || "—"}  Cidade: ${cidade || "—"}
Descrição extra: ${p.description ?? ""}`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text as string | undefined;
    if (!text) return fallback;

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      legenda: typeof parsed.legenda === "string" ? parsed.legenda : fallback.legenda,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : fallback.hashtags,
      cta: typeof parsed.cta === "string" ? parsed.cta : fallback.cta,
    };
  } catch (e) {
    console.error("generateCopy failed, using fallback:", e);
    return fallback;
  }
}

/**
 * Chama edge function generate-art (Gemini 2.0 Flash) pra compor arte feed
 * 1080x1080 sobre a foto do imóvel.
 *
 * Chamada sem Authorization header → generate-art não extrai userId do JWT,
 * logo não insere em `creatives` (evita duplicação — quem persiste é aqui
 * em creatives_gallery).
 */
async function generateArt(args: {
  propertyId: string;
  workspaceId: string;
  imageUrl: string;
  title: string;
  description: string;
}): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-art`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify({
      propertyId: args.propertyId,
      workspaceId: args.workspaceId,
      imageUrl: args.imageUrl,
      title: args.title,
      description: args.description,
      format: "feed",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`generate-art failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  if (!data.artUrl) throw new Error("generate-art não retornou artUrl");
  return data.artUrl as string;
}

/**
 * Manda notificação pro corretor via Evolution (instance dele próprio,
 * não há número centralizado).
 *
 * Sprint 2: link dashboard pra aprovar visualmente.
 * Sprint 3 vai trocar isso por envio de imagem + botões 👍/👎 no próprio Zap.
 */
async function notifyCorretor(
  ownerUserId: string,
  creative_job_id: string,
  reference: string | null
): Promise<void> {
  if (!EVO_URL || !EVO_KEY) return;

  const { data: instance } = await supabase
    .from("user_whatsapp_instances")
    .select("instance_name")
    .eq("user_id", ownerUserId)
    .maybeSingle();

  if (!instance?.instance_name) return;

  // Pega o próprio número do corretor via fetchInstances.ownerJid
  const infoRes = await fetch(
    `${EVO_URL}/instance/fetchInstances?instanceName=${instance.instance_name}`,
    { headers: { apikey: EVO_KEY } }
  );
  const info = await infoRes.json().catch(() => null);
  const ownerJid = Array.isArray(info)
    ? info[0]?.instance?.ownerJid
    : info?.instance?.ownerJid;

  if (!ownerJid) return;

  const url = `${DASHBOARD_URL}/dashboard/criativos/${creative_job_id}`;

  await fetch(`${EVO_URL}/message/sendText/${instance.instance_name}`, {
    method: "POST",
    headers: { apikey: EVO_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      number: ownerJid,
      text: `✨ Seu criativo está pronto!\n\n${reference ? `📋 ${reference}\n` : ""}Revise e publique no Instagram:\n${url}\n\n⏱ Você tem 2 minutos pra aprovar, senão posso gerar outro.`,
    }),
  });
}
