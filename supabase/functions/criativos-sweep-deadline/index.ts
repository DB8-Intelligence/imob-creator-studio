/**
 * criativos-sweep-deadline — Criativos Pro Sprint 3.
 *
 * Rodado por pg_cron a cada 1 minuto. Varre jobs `pending_approval` com
 * deadline vencido e aplica:
 *   - reminders < 2: manda fallback texto pro corretor e prorroga deadline
 *     +3min (dá duas chances antes de expirar)
 *   - reminders >= 2: status='expired' + notifica corretor (pode regenerar)
 *
 * Substitui o `setTimeout` que estava no spec original (não funciona em
 * edge functions Deno — invocação morre antes dos 2min).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EVO_URL          = Deno.env.get("EVOLUTION_API_URL");
const EVO_KEY          = Deno.env.get("EVOLUTION_API_KEY");
const INTERNAL_SECRET  = Deno.env.get("INTERNAL_WEBHOOK_SECRET") || "";

const MAX_REMINDERS  = 2;
const EXTEND_MINUTES = 3;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface ExpiredJob {
  id:                       string;
  user_id:                  string;
  property_id:              string | null;
  approval_reminders_sent:  number | null;
}

serve(async (req) => {
  // Segurança: sem JWT (chamada por pg_cron). Valida x-internal-secret
  // contra vault `internal_webhook_secret` (mesmo padrão do cleanup-expired-lp-pdfs).
  const provided = req.headers.get("x-internal-secret");
  if (INTERNAL_SECRET && provided !== INTERNAL_SECRET) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }

  try {
    const nowIso = new Date().toISOString();

    const { data: jobs, error } = await supabase
      .from("creatives_gallery")
      .select("id, user_id, property_id, approval_reminders_sent")
      .eq("status", "pending_approval")
      .lt("approval_deadline", nowIso)
      .limit(50)
      .returns<ExpiredJob[]>();

    if (error) {
      console.error("sweep-deadline select failed:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let reminded = 0;
    let expired  = 0;

    for (const job of jobs) {
      const reminders = job.approval_reminders_sent ?? 0;

      if (reminders < MAX_REMINDERS) {
        const newDeadline = new Date(Date.now() + EXTEND_MINUTES * 60 * 1000).toISOString();
        await supabase
          .from("creatives_gallery")
          .update({
            approval_reminders_sent: reminders + 1,
            approval_deadline:       newDeadline,
          })
          .eq("id", job.id);

        await sendOwnerText(
          job.user_id,
          `⏱ Criativo ainda esperando sua resposta!\n\nResponda 👍 (publico) ou 👎 (descarto).\n\nTentativa ${reminders + 1} de ${MAX_REMINDERS}.`
        );
        reminded++;
      } else {
        await supabase
          .from("creatives_gallery")
          .update({ status: "expired" })
          .eq("id", job.id);

        await sendOwnerText(
          job.user_id,
          `⌛ Criativo expirado sem resposta. Se quiser retomar, me envie a foto do imóvel de novo — gero um novo criativo em instantes.`
        );
        expired++;
      }
    }

    return new Response(
      JSON.stringify({ processed: jobs.length, reminded, expired }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sweep-deadline error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "internal error" }),
      { status: 500 }
    );
  }
});

/**
 * Manda texto pro ownerJid da instance Evolution do corretor.
 * Falhar aqui não deve interromper o sweep — log e segue pros próximos jobs.
 */
async function sendOwnerText(ownerUserId: string, text: string): Promise<void> {
  if (!EVO_URL || !EVO_KEY) return;

  try {
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
    });
  } catch (e) {
    console.error("sweep sendOwnerText failed:", e);
  }
}
