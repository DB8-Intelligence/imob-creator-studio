/**
 * bug-webhook-notify — edge function disparada por trigger SQL
 * quando chega um bug_report com severity='blocker'.
 *
 * Envia POST pra BUG_WEBHOOK_URL (Slack/Discord/qualquer webhook
 * genérico que aceite JSON). Formato é compatível com Slack Incoming
 * Webhook por padrão, mas qualquer endpoint que aceite JSON POST
 * também funciona.
 *
 * Secrets necessárias (Supabase Settings → Edge Functions):
 *   - BUG_WEBHOOK_URL (ex: https://hooks.slack.com/services/...)
 *   - INTERNAL_WEBHOOK_SECRET (mesmo do cron whatsapp-followup)
 *   - PUBLIC_DASHBOARD_URL (opcional, default: https://nexoimobai.com.br)
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const WEBHOOK_URL = Deno.env.get("BUG_WEBHOOK_URL") || "";
const INTERNAL_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET") || "";
const DASHBOARD_URL =
  Deno.env.get("PUBLIC_DASHBOARD_URL") || "https://nexoimobai.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const provided = req.headers.get("x-internal-secret");
  if (INTERNAL_SECRET && provided !== INTERNAL_SECRET) {
    return json({ error: "forbidden" }, 403);
  }

  if (!WEBHOOK_URL) {
    return json({ error: "webhook_not_configured", skipped: true }, 200);
  }

  try {
    const { bug_id } = await req.json();
    if (!bug_id) return json({ error: "bug_id_required" }, 400);

    const { data: bug, error: bugErr } = await supabase
      .from("bug_reports")
      .select("*")
      .eq("id", bug_id)
      .maybeSingle();

    if (bugErr || !bug) return json({ error: "bug_not_found" }, 404);

    // Só alerta em blocker (defensivo — trigger já filtra mas reforçamos)
    if (bug.severity !== "blocker") {
      return json({ skipped: true, reason: "not_blocker" }, 200);
    }

    const ctx = bug.context || {};
    const route = ctx.route || "(rota não informada)";
    const url = ctx.url || "(url não informada)";

    // Payload compatível com Slack Incoming Webhook.
    // Funciona também com Discord (ignora campos desconhecidos) e
    // qualquer webhook genérico que consuma JSON.
    const payload = {
      text: `🚨 Bug crítico reportado — ${bug.title}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `🚨 Bug crítico: ${bug.title}` },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Rota:*\n\`${route}\`` },
            { type: "mrkdwn", text: `*Reporter:*\n\`${bug.user_id.slice(0, 8)}…\`` },
            {
              type: "mrkdwn",
              text: `*Criado:*\n${new Date(bug.created_at).toLocaleString("pt-BR")}`,
            },
            { type: "mrkdwn", text: `*URL:*\n${url}` },
          ],
        },
        ...(bug.description
          ? [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Descrição:*\n${String(bug.description).slice(0, 500)}`,
                },
              },
            ]
          : []),
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Abrir admin" },
              url: `${DASHBOARD_URL}/admin/bugs`,
              style: "primary",
            },
          ],
        },
      ],
    };

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("webhook_post_failed", res.status, text);
      return json({ error: "webhook_post_failed", status: res.status }, 502);
    }

    return json({ success: true, notified: true });
  } catch (err) {
    console.error("bug_webhook_error", err);
    return json(
      {
        error: "internal_error",
        detail: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
