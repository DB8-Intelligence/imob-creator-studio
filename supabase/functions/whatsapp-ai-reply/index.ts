// ============================================================
// whatsapp-ai-reply — Secretária Virtual 24h (Sprint 1)
//
// Invocada pelo webhook whatsapp-events quando:
//   * Mensagem NÃO é listagem de imóvel (já tratada pelo extractPropertyData)
//   * A IA está habilitada (user_whatsapp_instances.ai_enabled OR conversa override)
//
// Fluxo:
//   1. Carrega settings da IA, histórico recente e perfil do lead
//   2. Chama Claude (modelo da tabela) com system prompt imobiliário
//   3. Envia resposta via Evolution API
//   4. Persiste whatsapp_sent_messages + atualiza whatsapp_conversations
//
// Auth: requer Authorization Bearer <SERVICE_ROLE> OU x-internal-secret
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY     = Deno.env.get("ANTHROPIC_API_KEY");
const EVOLUTION_URL         = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_KEY         = Deno.env.get("EVOLUTION_API_KEY");

const DEFAULT_MODEL   = "claude-sonnet-4-6";
const HISTORY_LIMIT   = 12;
const PROPERTIES_CTX  = 15;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface ReplyRequest {
  user_id:        string;
  phone:          string;
  contact_name?:  string;
  message_text:   string;
  instance_name:  string;
  inbox_id?:      string;
}

interface LeadQualification {
  intent?:         "compra" | "aluguel" | "investimento" | "desconhecido";
  budget?:         string;
  region?:         string;
  property_type?:  string;
  urgency?:        "alta" | "media" | "baixa" | "desconhecida";
  confidence?:     number;
  notes?:          string;
}

interface BookingRequest {
  confirmed:    boolean;
  summary?:     string;
  description?: string;
  location?:    string;
  start_at?:    string; // ISO 8601
  end_at?:      string; // ISO 8601
}

interface AiJsonResponse {
  reply: string;
  lead_qualification: LeadQualification;
  handoff_to_human?: boolean;
  handoff_reason?: string;
  booking?: BookingRequest;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Simple auth: aceita SERVICE_ROLE via Authorization ou secret interno
  const auth = req.headers.get("authorization") ?? "";
  const internal = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_WEBHOOK_SECRET");

  const isServiceRole = auth === `Bearer ${SERVICE_ROLE_KEY}`;
  const isInternal    = expected && internal === expected;
  if (!isServiceRole && !isInternal) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: ReplyRequest;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }

  const { user_id, phone, contact_name, message_text, instance_name, inbox_id } = body;
  if (!user_id || !phone || !message_text || !instance_name) {
    return json({ ok: false, error: "missing fields" }, 400);
  }

  // ── 1. Settings ───────────────────────────────────────────
  const { data: instance } = await supabase
    .from("user_whatsapp_instances")
    .select("ai_enabled, ai_agent_name, ai_agent_tone, ai_custom_instructions, ai_model, status, followup_enabled, followup_delay_hours, voice_mode")
    .eq("user_id", user_id)
    .maybeSingle();

  if (!instance || instance.status !== "connected") {
    return await skip(inbox_id, "instance_not_connected");
  }

  // Busca ou cria conversa
  const { data: existing } = await supabase
    .from("whatsapp_conversations")
    .select("id, ai_enabled, lead_qualification, followup_paused")
    .eq("user_id", user_id)
    .eq("phone", phone)
    .maybeSingle();

  const conversation = existing ?? (await supabase
    .from("whatsapp_conversations")
    .insert({ user_id, phone, contact_name: contact_name ?? null, last_inbound_at: new Date().toISOString() })
    .select("id, ai_enabled, lead_qualification, followup_paused")
    .single()
  ).data;

  // Resolve IA on/off: conversa > instance
  const aiEnabled = conversation?.ai_enabled ?? instance.ai_enabled;
  if (!aiEnabled) {
    return await skip(inbox_id, "ai_disabled");
  }

  if (!ANTHROPIC_API_KEY) {
    return await skip(inbox_id, "missing_anthropic_key");
  }
  if (!EVOLUTION_URL || !EVOLUTION_KEY) {
    return await skip(inbox_id, "missing_evolution_config");
  }

  // ── 2. Histórico + contexto de imóveis ────────────────────
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user_id)
    .maybeSingle();

  const [incomingRes, outgoingRes, propertiesRes] = await Promise.all([
    supabase
      .from("whatsapp_inbox")
      .select("message_text, received_at")
      .eq("from_phone", phone)
      .eq("workspace_id", workspace?.id ?? "00000000-0000-0000-0000-000000000000")
      .order("received_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase
      .from("whatsapp_sent_messages")
      .select("body, created_at")
      .eq("user_id", user_id)
      .eq("to_phone", phone)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    workspace
      ? supabase
          .from("properties")
          .select("reference, type, bedrooms, suites, parking, area_built, price, address, description, status")
          .eq("workspace_id", workspace.id)
          .neq("status", "archived")
          .order("created_at", { ascending: false })
          .limit(PROPERTIES_CTX)
      : Promise.resolve({ data: [] }),
  ]);

  const historyLines = mergeHistory(incomingRes.data ?? [], outgoingRes.data ?? []);
  const propertiesContext = formatProperties(propertiesRes.data ?? []);

  // ── 3. Chama Claude ───────────────────────────────────────
  const systemPrompt = buildSystemPrompt({
    agentName:     instance.ai_agent_name ?? "Secretária Virtual",
    agentTone:     instance.ai_agent_tone ?? "profissional, claro e acolhedor",
    customInstructions: instance.ai_custom_instructions ?? "",
    propertiesContext,
    existingQualification: (conversation?.lead_qualification as LeadQualification) ?? {},
  });

  const userPrompt = [
    historyLines && `Histórico recente (mais antigo → mais novo):\n${historyLines}`,
    `Contato: ${contact_name ?? phone} (${phone})`,
    `Nova mensagem do cliente:\n"${message_text}"`,
  ].filter(Boolean).join("\n\n");

  const aiStart = Date.now();
  const aiResponse = await callClaude({
    model:  instance.ai_model ?? DEFAULT_MODEL,
    system: systemPrompt,
    user:   userPrompt,
  });
  const aiLatency = Date.now() - aiStart;

  if (!aiResponse) {
    return await skip(inbox_id, "ai_empty_response");
  }

  // Handoff para humano: IA não responde, mas marca pendência
  if (aiResponse.handoff_to_human) {
    await supabase
      .from("whatsapp_conversations")
      .update({
        lead_qualification: mergeQualification(conversation?.lead_qualification ?? {}, aiResponse.lead_qualification),
        last_inbound_at:    new Date().toISOString(),
      })
      .eq("id", conversation?.id);
    return await skip(inbox_id, aiResponse.handoff_reason ?? "handoff_to_human");
  }

  // ── 4. Decide modo (texto/voz) + envia ────────────────────
  const voiceMode = ((instance as { voice_mode?: string }).voice_mode ?? "texto") as "texto" | "voz" | "auto";
  const shouldSendVoice = await decideSendVoice(user_id, voiceMode, aiResponse.reply);

  let sendData: Record<string, unknown> = {};
  if (shouldSendVoice) {
    // Voz clonada via edge interna
    const voiceRes = await fetch(`${SUPABASE_URL}/functions/v1/voice-send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      body: JSON.stringify({
        user_id,
        phone,
        text: aiResponse.reply,
        instance_name,
      }),
    });
    const voiceData = await voiceRes.json().catch(() => ({}));
    if (!voiceRes.ok || voiceData.ok === false) {
      console.error("voice-send failed, fallback para texto:", voiceData);
      // fallback: envia texto se voz falhar
      const sendRes = await fetch(`${EVOLUTION_URL}/message/sendText/${instance_name}`, {
        method:  "POST",
        headers: { apikey: EVOLUTION_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone.replace(/[^\d]/g, ""), text: aiResponse.reply, linkPreview: true }),
      });
      sendData = await sendRes.json().catch(() => ({}));
      if (!sendRes.ok) {
        console.error("Evolution sendText fallback error:", sendData);
        return await skip(inbox_id, "evolution_send_failed");
      }
    } else {
      sendData = { _voice: true, ...voiceData };
    }
  } else {
    // Texto normal
    const sendRes = await fetch(`${EVOLUTION_URL}/message/sendText/${instance_name}`, {
      method:  "POST",
      headers: { apikey: EVOLUTION_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: phone.replace(/[^\d]/g, ""), text: aiResponse.reply, linkPreview: true }),
    });
    sendData = await sendRes.json().catch(() => ({}));
    if (!sendRes.ok) {
      console.error("Evolution sendText error:", sendData);
      return await skip(inbox_id, "evolution_send_failed");
    }
  }

  // ── 5. Persiste ───────────────────────────────────────────
  // Schedule next follow-up if feature is enabled and conversa não está pausada
  const followupEnabled = (instance as { followup_enabled?: boolean }).followup_enabled === true;
  const followupDelayHours = (instance as { followup_delay_hours?: number }).followup_delay_hours ?? 48;
  const followupPaused = (conversation as { followup_paused?: boolean })?.followup_paused === true;
  const nextFollowupAt = followupEnabled && !followupPaused
    ? new Date(Date.now() + followupDelayHours * 3600_000).toISOString()
    : null;

  // Se foi voz, voice-send já inseriu em whatsapp_sent_messages — não duplicar.
  const sentAsVoice = (sendData as { _voice?: boolean })._voice === true;
  const persistMessage = sentAsVoice
    ? Promise.resolve()
    : supabase.from("whatsapp_sent_messages").insert({
        user_id,
        to_phone: phone.replace(/[^\d]/g, ""),
        body:     aiResponse.reply,
        evolution_response: { ...sendData, _source: "ai_reply", _latency_ms: aiLatency },
      });

  await Promise.all([
    persistMessage,
    supabase
      .from("whatsapp_conversations")
      .update({
        contact_name:       contact_name ?? undefined,
        lead_qualification: mergeQualification(conversation?.lead_qualification ?? {}, aiResponse.lead_qualification),
        last_inbound_at:    new Date().toISOString(),
        last_ai_reply_at:   new Date().toISOString(),
        next_followup_at:   nextFollowupAt,
        followup_count:     0, // reset quando o corretor (IA) envia mensagem
      })
      .eq("id", conversation?.id),
    inbox_id
      ? supabase.from("whatsapp_inbox").update({ ai_replied: true }).eq("id", inbox_id)
      : Promise.resolve(),
  ]);

  // ── 5.5 Sync CRM: cria/atualiza lead no Kanban ──────────────
  try {
    const mergedQualification = mergeQualification(
      conversation?.lead_qualification ?? {},
      aiResponse.lead_qualification,
    );
    await supabase.rpc("upsert_lead_from_whatsapp", {
      p_workspace_id:      workspace?.id,
      p_phone:             phone.replace(/[^\d]/g, ""),
      p_contact_name:      contact_name ?? null,
      p_conversation_id:   conversation?.id,
      p_qualification:     mergedQualification,
      p_booking_confirmed: aiResponse.booking?.confirmed === true,
    });
  } catch (e) {
    console.error("upsert_lead_from_whatsapp failed:", e);
    // CRM sync falhar não bloqueia resposta da IA
  }

  // ── 6. Booking: se a IA confirmou agendamento, cria evento ────
  if (aiResponse.booking?.confirmed && aiResponse.booking.start_at && aiResponse.booking.end_at) {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/calendar-create-event`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
        body: JSON.stringify({
          user_id,
          summary:         aiResponse.booking.summary ?? `Visita — ${contact_name ?? phone}`,
          description:     aiResponse.booking.description ?? aiResponse.reply,
          location:        aiResponse.booking.location,
          start_at:        aiResponse.booking.start_at,
          end_at:          aiResponse.booking.end_at,
          phone,
          conversation_id: conversation?.id,
        }),
      });
    } catch (e) {
      console.error("calendar-create-event failed:", e);
    }
  }

  return json({ ok: true, reply: aiResponse.reply, lead_qualification: aiResponse.lead_qualification, booking: aiResponse.booking });
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function skip(inbox_id: string | undefined, reason: string): Promise<Response> {
  if (inbox_id) {
    await supabase.from("whatsapp_inbox").update({ ai_skipped_reason: reason }).eq("id", inbox_id);
  }
  return json({ ok: true, skipped: reason });
}

function mergeHistory(
  incoming: Array<{ message_text: string | null; received_at: string }>,
  outgoing: Array<{ body: string | null; created_at: string }>,
): string {
  const all = [
    ...incoming.map((m) => ({ who: "Cliente", text: m.message_text ?? "", at: m.received_at })),
    ...outgoing.map((m) => ({ who: "Corretor", text: m.body ?? "", at: m.created_at })),
  ]
    .filter((m) => m.text.trim())
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(-HISTORY_LIMIT * 2);

  return all.map((m) => `${m.who}: ${m.text}`).join("\n");
}

function formatProperties(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "Nenhum imóvel cadastrado no portfólio ainda.";
  return rows
    .map((p) => {
      const bairro = (p.address as { bairro?: string } | null)?.bairro ?? "";
      const cidade = (p.address as { cidade?: string } | null)?.cidade ?? "";
      const local = [bairro, cidade].filter(Boolean).join(", ");
      const preco = p.price ? `R$ ${Number(p.price).toLocaleString("pt-BR")}` : "preço a consultar";
      const dorms = p.bedrooms ? `${p.bedrooms} dorms` : "";
      const area  = p.area_built ? `${p.area_built}m²` : "";
      const specs = [dorms, area].filter(Boolean).join(" · ");
      return `- [${p.reference}] ${p.type ?? "Imóvel"} ${specs} · ${local} · ${preco}`;
    })
    .join("\n");
}

function buildSystemPrompt(opts: {
  agentName: string;
  agentTone: string;
  customInstructions: string;
  propertiesContext: string;
  existingQualification: LeadQualification;
}): string {
  const { agentName, agentTone, customInstructions, propertiesContext, existingQualification } = opts;

  return `Você é ${agentName}, secretária virtual de um corretor de imóveis brasileiro.

TOM DE VOZ: ${agentTone}.
Responda em português do Brasil, 1 a 3 parágrafos curtos, linguagem de WhatsApp (evite formalidade excessiva).

REGRAS:
1. NUNCA se passe por humano se perguntarem diretamente. Se questionarem, diga que você é a assistente IA do corretor e que passa o contato adiante quando necessário.
2. Foque em qualificar o lead: intenção (compra/aluguel/investimento), faixa de orçamento, região de interesse, tipo de imóvel (casa/apto/terreno/comercial), urgência (vai visitar essa semana? esse mês?).
3. Só sugira imóveis do portfólio abaixo. NUNCA invente imóveis, preços ou endereços.
4. Se o cliente pedir algo fora do seu alcance (negociar desconto, fechar contrato, marcar visita com data específica no fim de semana fora do horário comercial), marque handoff_to_human=true e explique brevemente no handoff_reason.
5. Se o cliente parecer frio ou desinteressado após 2 trocas sem qualificação, tente uma pergunta aberta para resgatar ("O que faria você agendar uma visita ainda esta semana?").

PORTFÓLIO DISPONÍVEL:
${propertiesContext}

QUALIFICAÇÃO JÁ CAPTURADA (pode estar vazia):
${JSON.stringify(existingQualification)}

${customInstructions ? `INSTRUÇÕES DO CORRETOR:\n${customInstructions}\n` : ""}

AGENDAMENTO DE VISITA:
- Se o cliente confirmar DATA e HORA específicas para uma visita (ex: "pode ser amanhã 15h" ou "sexta 10h da manhã"), preencha "booking.confirmed=true" e os campos start_at/end_at em ISO 8601 com timezone -03:00.
- Duração default: 1h. Nunca agende fora do horário comercial (seg-sex 8h-19h, sáb 9h-14h) sem confirmação explícita.
- Se o cliente só DEMONSTRAR INTERESSE em visitar sem data concreta, NÃO preencha booking — pergunte a disponibilidade dele.
- Resumo ("summary") deve ser "Visita — <nome do cliente> — <referência do imóvel>".

FORMATO DA SUA RESPOSTA — retorne APENAS um JSON válido, sem markdown:
{
  "reply": "texto que será enviado no WhatsApp",
  "lead_qualification": {
    "intent": "compra" | "aluguel" | "investimento" | "desconhecido",
    "budget": "faixa ou valor exato, ou null",
    "region": "região/bairro mencionado, ou null",
    "property_type": "casa | apartamento | terreno | comercial | null",
    "urgency": "alta" | "media" | "baixa" | "desconhecida",
    "confidence": 0 a 1,
    "notes": "observações relevantes para o corretor"
  },
  "handoff_to_human": false,
  "handoff_reason": "preencha só se handoff_to_human=true",
  "booking": {
    "confirmed": false,
    "summary": "Visita — ...",
    "description": "contexto breve pro corretor",
    "location": "endereço se souber",
    "start_at": "2026-04-20T15:00:00-03:00",
    "end_at":   "2026-04-20T16:00:00-03:00"
  }
}

Preserve campos já capturados quando a nova mensagem não os contradizer.`;
}

async function callClaude(args: {
  model: string;
  system: string;
  user: string;
}): Promise<AiJsonResponse | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":     "application/json",
        "x-api-key":        ANTHROPIC_API_KEY!,
        "anthropic-version":"2023-06-01",
      },
      body: JSON.stringify({
        model:      args.model,
        max_tokens: 800,
        system:     args.system,
        messages:   [{ role: "user", content: args.user }],
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Anthropic error:", result);
      return null;
    }

    const raw = result.content?.[0]?.type === "text" ? result.content[0].text : "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as AiJsonResponse;
    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) return null;
    return parsed;
  } catch (e) {
    console.error("callClaude failed:", e);
    return null;
  }
}

/**
 * Decide se a resposta deve ir como áudio (voz clonada) ou texto.
 *
 * voice_mode:
 *   - 'texto'  → sempre texto
 *   - 'voz'    → sempre voz (se tiver clone ativo)
 *   - 'auto'   → heurística: voz se mensagem curta/conversacional, texto se estruturada
 */
async function decideSendVoice(
  user_id: string,
  mode:    "texto" | "voz" | "auto",
  reply:   string,
): Promise<boolean> {
  if (mode === "texto") return false;

  // Precisa de clone ativo
  const { data: clone } = await supabase
    .from("voice_clones")
    .select("id")
    .eq("user_id", user_id)
    .eq("status", "ready")
    .limit(1)
    .maybeSingle();
  if (!clone) return false;

  if (mode === "voz") return true;

  // mode === 'auto' — heurística: voz só se resposta é curta e sem estrutura
  if (reply.length > 400) return false;
  if (/^\s*[-•*\d]\./m.test(reply)) return false;          // lista numerada/bullet
  if (reply.split("\n").filter(Boolean).length > 3) return false; // muitos parágrafos
  if (/https?:\/\//.test(reply)) return false;             // URL na resposta
  return true;
}

function mergeQualification(prev: LeadQualification, next: LeadQualification): LeadQualification {
  return {
    intent:        next.intent        ?? prev.intent,
    budget:        next.budget        ?? prev.budget,
    region:        next.region        ?? prev.region,
    property_type: next.property_type ?? prev.property_type,
    urgency:       next.urgency       ?? prev.urgency,
    confidence:    next.confidence    ?? prev.confidence,
    notes:         [prev.notes, next.notes].filter(Boolean).join(" | ") || undefined,
  };
}
