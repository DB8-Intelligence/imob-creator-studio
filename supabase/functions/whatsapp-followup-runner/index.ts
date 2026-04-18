// ============================================================
// whatsapp-followup-runner — Re-engaja leads frios automaticamente.
//
// Invocado por pg_cron (ou manualmente via service_role).
// Para cada conversa com next_followup_at <= now():
//   1. Verifica se IA ainda está ligada e instance conectada
//   2. Verifica se já atingiu o cap de follow-ups
//   3. Gera mensagem com Claude usando contexto da conversa
//   4. Envia via Evolution
//   5. Atualiza followup_count + next_followup_at + log
//
// Auth: Bearer <SERVICE_ROLE> OU x-internal-secret
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL        = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY   = Deno.env.get("ANTHROPIC_API_KEY");
const EVOLUTION_URL       = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_KEY       = Deno.env.get("EVOLUTION_API_KEY");

const MAX_PER_RUN        = 25;
const DEFAULT_MODEL      = "claude-haiku-4-5-20251001"; // follow-up barato
const HISTORY_LIMIT      = 6;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface Due {
  id: string;
  user_id: string;
  phone: string;
  contact_name: string | null;
  lead_qualification: Record<string, unknown> | null;
  followup_count: number;
  last_ai_reply_at: string | null;
  last_inbound_at: string | null;
}

serve(async (req: Request) => {
  // Auth
  const auth     = req.headers.get("authorization") ?? "";
  const internal = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  const isService = auth === `Bearer ${SERVICE_ROLE_KEY}`;
  const isInternal = expected && internal === expected;
  if (!isService && !isInternal) return new Response("Unauthorized", { status: 401 });

  if (!ANTHROPIC_API_KEY || !EVOLUTION_URL || !EVOLUTION_KEY) {
    return json({ ok: false, error: "missing_env" }, 500);
  }

  // ── 1. Find due conversations ─────────────────────────────
  const { data: dueList, error: dueErr } = await supabase
    .from("whatsapp_conversations")
    .select("id, user_id, phone, contact_name, lead_qualification, followup_count, last_ai_reply_at, last_inbound_at")
    .lte("next_followup_at", new Date().toISOString())
    .eq("followup_paused", false)
    .limit(MAX_PER_RUN);

  if (dueErr) return json({ ok: false, error: dueErr.message }, 500);
  if (!dueList || dueList.length === 0) return json({ ok: true, processed: 0 });

  let sent = 0, skipped = 0, failed = 0;

  for (const conv of dueList as Due[]) {
    try {
      const result = await processOne(conv);
      if (result === "sent") sent++;
      else if (result === "skipped") skipped++;
      else failed++;
    } catch (e) {
      console.error(`followup failed for ${conv.id}:`, e);
      failed++;
    }
  }

  return json({ ok: true, processed: dueList.length, sent, skipped, failed });
});

async function processOne(conv: Due): Promise<"sent" | "skipped" | "failed"> {
  // Carrega instance + config
  const { data: instance } = await supabase
    .from("user_whatsapp_instances")
    .select("instance_name, status, ai_enabled, ai_agent_name, ai_agent_tone, ai_model, followup_enabled, followup_delay_hours, followup_max_attempts")
    .eq("user_id", conv.user_id)
    .maybeSingle();

  if (!instance || instance.status !== "connected") {
    await logSkipped(conv, "instance_not_connected");
    await clearNextFollowup(conv.id);
    return "skipped";
  }

  if (!instance.followup_enabled || !instance.ai_enabled) {
    await logSkipped(conv, "followup_or_ai_disabled");
    await clearNextFollowup(conv.id);
    return "skipped";
  }

  const maxAttempts = instance.followup_max_attempts ?? 2;
  if (conv.followup_count >= maxAttempts) {
    await logSkipped(conv, "max_attempts_reached");
    await clearNextFollowup(conv.id);
    return "skipped";
  }

  // Não re-engaja se o cliente respondeu DEPOIS da última resposta da IA
  if (conv.last_inbound_at && conv.last_ai_reply_at && conv.last_inbound_at > conv.last_ai_reply_at) {
    await logSkipped(conv, "lead_responded_already");
    await clearNextFollowup(conv.id);
    return "skipped";
  }

  // ── Gera mensagem ─────────────────────────────────────────
  const history = await loadHistory(conv.user_id, conv.phone);
  const prompt = buildFollowupPrompt({
    agentName:      instance.ai_agent_name ?? "Secretária Virtual",
    agentTone:      instance.ai_agent_tone ?? "profissional, claro e acolhedor",
    contactName:    conv.contact_name,
    leadQual:       conv.lead_qualification ?? {},
    history,
    attemptNumber:  conv.followup_count + 1,
    maxAttempts,
  });

  const reply = await callClaudePlain(instance.ai_model ?? DEFAULT_MODEL, prompt);
  if (!reply) {
    await logFailed(conv, "ai_empty_response");
    return "failed";
  }

  // ── Envia via Evolution ───────────────────────────────────
  const sendRes = await fetch(`${EVOLUTION_URL}/message/sendText/${instance.instance_name}`, {
    method:  "POST",
    headers: { apikey: EVOLUTION_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ number: conv.phone.replace(/[^\d]/g, ""), text: reply, linkPreview: true }),
  });
  const sendData = await sendRes.json().catch(() => ({}));
  if (!sendRes.ok) {
    await logFailed(conv, "evolution_send_failed");
    return "failed";
  }

  // ── Persiste ──────────────────────────────────────────────
  const newCount  = conv.followup_count + 1;
  const reachedMax = newCount >= maxAttempts;
  const nextAt = reachedMax
    ? null
    : new Date(Date.now() + (instance.followup_delay_hours ?? 48) * 3600_000).toISOString();

  await Promise.all([
    supabase.from("whatsapp_sent_messages").insert({
      user_id: conv.user_id,
      to_phone: conv.phone.replace(/[^\d]/g, ""),
      body: reply,
      evolution_response: { ...sendData, _source: "followup" },
    }),
    supabase.from("whatsapp_conversations").update({
      followup_count:   newCount,
      next_followup_at: nextAt,
      last_ai_reply_at: new Date().toISOString(),
    }).eq("id", conv.id),
    supabase.from("whatsapp_followup_log").insert({
      user_id: conv.user_id,
      conversation_id: conv.id,
      phone: conv.phone,
      body: reply,
      status: "sent",
    }),
  ]);

  return "sent";
}

async function loadHistory(userId: string, phone: string): Promise<string> {
  const [inc, out] = await Promise.all([
    supabase.from("whatsapp_inbox")
      .select("message_text, received_at")
      .eq("from_phone", phone)
      .order("received_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase.from("whatsapp_sent_messages")
      .select("body, created_at")
      .eq("user_id", userId).eq("to_phone", phone)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
  ]);

  const merged = [
    ...(inc.data ?? []).map((m) => ({ who: "Cliente", text: m.message_text ?? "", at: m.received_at })),
    ...(out.data ?? []).map((m) => ({ who: "Corretor", text: m.body ?? "", at: m.created_at })),
  ]
    .filter((m) => m.text.trim())
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(-HISTORY_LIMIT * 2);

  return merged.map((m) => `${m.who}: ${m.text}`).join("\n");
}

function buildFollowupPrompt(opts: {
  agentName: string;
  agentTone: string;
  contactName: string | null;
  leadQual: Record<string, unknown>;
  history: string;
  attemptNumber: number;
  maxAttempts: number;
}): string {
  const { agentName, agentTone, contactName, leadQual, history, attemptNumber, maxAttempts } = opts;

  const levelHint = attemptNumber === 1
    ? "Seja leve e curioso. Retome de onde parou."
    : attemptNumber === maxAttempts
    ? "Este é o último follow-up. Ofereça uma saída clara (visita, material, ou 'podemos encerrar a conversa?')."
    : "Varie a abordagem — faça uma pergunta nova baseada na qualificação do lead.";

  return `Você é ${agentName}, secretária virtual de um corretor imobiliário brasileiro.
Tom: ${agentTone}.

O lead parou de responder. Escreva 1 mensagem curta de re-engajamento para o WhatsApp.

REGRAS:
- 1 a 2 frases. Evite ser insistente ou desesperado.
- Não se desculpe nem mencione "não obtive resposta".
- Traga VALOR: novidade do portfólio, pergunta que instigue, ou convite para visita.
- NUNCA invente imóveis ou preços.
- Assine apenas com emoji sutil ou nada.

CONTATO: ${contactName ?? "cliente"}
QUALIFICAÇÃO DO LEAD: ${JSON.stringify(leadQual)}
HISTÓRICO RECENTE:
${history || "(sem mensagens anteriores)"}

ESTA É A TENTATIVA ${attemptNumber} DE ${maxAttempts}. ${levelHint}

Retorne APENAS o texto da mensagem, sem aspas, sem markdown, sem prefixos.`;
}

async function callClaudePlain(model: string, prompt: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      console.error("Anthropic error:", j);
      return null;
    }
    const raw = j.content?.[0]?.type === "text" ? j.content[0].text : "";
    const cleaned = raw.trim().replace(/^"(.*)"$/s, "$1");
    return cleaned || null;
  } catch (e) {
    console.error("callClaudePlain failed:", e);
    return null;
  }
}

async function logSkipped(conv: Due, reason: string): Promise<void> {
  await supabase.from("whatsapp_followup_log").insert({
    user_id: conv.user_id,
    conversation_id: conv.id,
    phone: conv.phone,
    status: "skipped",
    skipped_reason: reason,
  });
}

async function logFailed(conv: Due, reason: string): Promise<void> {
  await supabase.from("whatsapp_followup_log").insert({
    user_id: conv.user_id,
    conversation_id: conv.id,
    phone: conv.phone,
    status: "failed",
    skipped_reason: reason,
  });
}

async function clearNextFollowup(conversationId: string): Promise<void> {
  await supabase.from("whatsapp_conversations")
    .update({ next_followup_at: null })
    .eq("id", conversationId);
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
