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

  // ── 1. Settings (multi-instance: filtra pelo instance_name exato) ────
  const { data: instance } = await supabase
    .from("user_whatsapp_instances")
    .select("ai_enabled, ai_agent_name, ai_agent_tone, ai_custom_instructions, ai_model, status, followup_enabled, followup_delay_hours, voice_mode, ai_work_hours_start, ai_work_hours_end, ai_work_days, ai_delay_min_seconds, ai_delay_max_seconds, ai_after_hours_message")
    .eq("user_id", user_id)
    .eq("instance_name", instance_name)
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

  // ── 1.5 Horário comercial ─────────────────────────────────
  const workHoursCheck = isWithinWorkHours(instance);
  if (!workHoursCheck.within) {
    const afterHoursMsg = (instance as { ai_after_hours_message?: string | null }).ai_after_hours_message;
    if (afterHoursMsg?.trim() && EVOLUTION_URL && EVOLUTION_KEY) {
      // Envia mensagem de fora-do-horário uma vez e skip
      await fetch(`${EVOLUTION_URL}/message/sendText/${instance_name}`, {
        method: "POST",
        headers: { apikey: EVOLUTION_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          number: phone.replace(/[^\d]/g, ""),
          text: afterHoursMsg.trim(),
          linkPreview: false,
        }),
      }).catch((e) => console.error("after-hours send failed:", e));
    }
    return await skip(inbox_id, `outside_work_hours_${workHoursCheck.reason}`);
  }

  // ── 2. Histórico + contexto de imóveis ────────────────────
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user_id)
    .maybeSingle();

  const [incomingRes, outgoingRes] = await Promise.all([
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
  ]);

  const historyLines = mergeHistory(incomingRes.data ?? [], outgoingRes.data ?? []);

  // ── 2.5 RAG: busca top-5 imóveis mais relevantes via embeddings ────
  // Fallback para top-15 mais recentes se RAG não retornar nada (ex: imóveis
  // ainda sem embedding durante backfill) ou OPENAI_API_KEY ausente.
  const propertiesContext = workspace
    ? await fetchPropertiesContext(workspace.id, message_text, incomingRes.data ?? [])
    : "Nenhum imóvel cadastrado no portfólio ainda.";

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
  // Delay humanizado: aguarda random [min, max] antes de enviar (simula digitação)
  const delayMin = (instance as { ai_delay_min_seconds?: number }).ai_delay_min_seconds ?? 2;
  const delayMax = (instance as { ai_delay_max_seconds?: number }).ai_delay_max_seconds ?? 8;
  const delayMs = (delayMin + Math.random() * Math.max(0, delayMax - delayMin)) * 1000;
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));

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

/**
 * RAG: embeda a mensagem atual + 2 últimas do lead, chama match_properties,
 * formata o top-K. Fallback para top-15 recentes se embedding falhar ou
 * se nenhum imóvel tiver embedding ainda.
 */
async function fetchPropertiesContext(
  workspaceId: string,
  currentMessage: string,
  recentInbox: Array<{ message_text: string | null; received_at: string }>,
): Promise<string> {
  // Tenta RAG
  const ragLines = await ragMatchProperties(workspaceId, currentMessage, recentInbox);
  if (ragLines) return ragLines;

  // Fallback: top-15 recentes (comportamento legado)
  const { data } = await supabase
    .from("properties")
    .select("reference, property_type, bedrooms, suites, parking, area_built, price, pretension, city, neighborhood, description, status")
    .eq("workspace_id", workspaceId)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(PROPERTIES_CTX);

  return formatPropertiesRows(data ?? []);
}

async function ragMatchProperties(
  workspaceId:   string,
  currentMessage: string,
  recentInbox:   Array<{ message_text: string | null; received_at: string }>,
): Promise<string | null> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) return null;

  // Monta a query: mensagem atual + últimas 2 do lead (contexto de intenção)
  const recentText = recentInbox
    .slice(0, 2)
    .map((m) => m.message_text ?? "")
    .filter((t) => t.trim())
    .join(" ");
  const queryText = [currentMessage, recentText].filter(Boolean).join(" ").slice(0, 1000);
  if (!queryText.trim()) return null;

  try {
    const embRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: "text-embedding-3-small", input: queryText, dimensions: 1536 }),
    });
    const embData = await embRes.json();
    if (!embRes.ok || !embData.data?.[0]?.embedding) {
      console.error("embedding failed:", embData);
      return null;
    }
    const vec = `[${(embData.data[0].embedding as number[]).join(",")}]`;

    const { data: matches, error } = await supabase.rpc("match_properties", {
      p_workspace_id:    workspaceId,
      p_query_embedding: vec,
      p_match_count:     5,
      p_match_threshold: 0.25,
    });
    if (error) {
      console.error("match_properties rpc error:", error);
      return null;
    }
    if (!matches || matches.length === 0) return null;

    return "IMÓVEIS MAIS RELEVANTES (busca semântica):\n" +
      formatPropertiesRows(matches);
  } catch (e) {
    console.error("ragMatchProperties error:", e);
    return null;
  }
}

function formatPropertiesRows(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "Nenhum imóvel cadastrado no portfólio ainda.";
  return rows
    .map((p) => {
      const local = [p.neighborhood, p.city].filter(Boolean).join(", ");
      const preco = p.price ? `R$ ${Number(p.price).toLocaleString("pt-BR")}` : "preço a consultar";
      const dorms = p.bedrooms ? `${p.bedrooms} dorms` : "";
      const suites = p.suites ? `${p.suites} suítes` : "";
      const vagas = p.parking ? `${p.parking} vagas` : "";
      const area  = p.area_built ? `${p.area_built}m²` : "";
      const specs = [dorms, suites, vagas, area].filter(Boolean).join(" · ");
      const tipo = p.property_type ?? "Imóvel";
      const pret = p.pretension ? ` (${p.pretension})` : "";
      return `- [${p.reference}] ${tipo}${pret} ${specs} · ${local} · ${preco}`;
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
2. Qualifique o lead: intenção (compra/aluguel/investimento), orçamento, região de interesse, tipo de imóvel, urgência.
3. Só sugira imóveis do portfólio abaixo. NUNCA invente imóveis, preços ou endereços.
4. Se o cliente pedir algo fora do alcance (negociar desconto, fechar contrato, agendar fora do horário comercial), use handoff_to_human=true com handoff_reason.
5. Se o cliente parecer frio após 2 trocas, faça pergunta aberta para resgatar.

PORTFÓLIO DISPONÍVEL:
${propertiesContext}

QUALIFICAÇÃO JÁ CAPTURADA (preserve campos quando nova mensagem não contradizer):
${JSON.stringify(existingQualification)}

${customInstructions ? `INSTRUÇÕES DO CORRETOR:\n${customInstructions}\n` : ""}

AGENDAMENTO DE VISITA:
- Se cliente confirmar DATA+HORA específicas, preencha booking.confirmed=true com start_at/end_at em ISO 8601 -03:00.
- Duração default 1h. Horário comercial: seg-sex 8h-19h, sáb 9h-14h.
- Se só demonstrar interesse sem data concreta, NÃO preencha booking — pergunte disponibilidade.
- summary: "Visita — <nome> — <referência>".

IMPORTANTE: SEMPRE use a tool "respond_to_lead" para responder. NUNCA responda em texto livre.`;
}

// ─── Tool schema (Claude nativo tool_use) ────────────────────────────
const RESPOND_TO_LEAD_TOOL = {
  name: "respond_to_lead",
  description: "Responde ao lead no WhatsApp e atualiza qualificação/booking. Use SEMPRE esta tool, nunca responda em texto livre.",
  input_schema: {
    type: "object",
    properties: {
      reply: {
        type: "string",
        description: "Texto que será enviado no WhatsApp ao lead (1-3 parágrafos curtos).",
      },
      lead_qualification: {
        type: "object",
        description: "Dados do lead capturados/atualizados nesta troca. Preserve campos já capturados quando não contradizerem.",
        properties: {
          intent:        { type: "string", enum: ["compra", "aluguel", "investimento", "desconhecido"] },
          budget:        { type: ["string", "null"], description: "Faixa ou valor exato, ou null." },
          region:        { type: ["string", "null"], description: "Região/bairro mencionado, ou null." },
          property_type: { type: ["string", "null"], enum: ["casa", "apartamento", "terreno", "comercial", null] },
          urgency:       { type: "string", enum: ["alta", "media", "baixa", "desconhecida"] },
          confidence:    { type: "number", minimum: 0, maximum: 1 },
          notes:         { type: ["string", "null"], description: "Observações relevantes pro corretor, ou null." },
        },
        required: ["intent", "urgency", "confidence"],
      },
      handoff_to_human: {
        type: "boolean",
        description: "true se a IA não consegue atender (desconto, contrato, fora-de-scope).",
      },
      handoff_reason: {
        type: ["string", "null"],
        description: "Motivo do handoff, só quando handoff_to_human=true.",
      },
      booking: {
        type: "object",
        description: "Preencher confirmed=true APENAS quando cliente confirmar data+hora específicas.",
        properties: {
          confirmed:   { type: "boolean" },
          summary:     { type: ["string", "null"] },
          description: { type: ["string", "null"] },
          location:    { type: ["string", "null"] },
          start_at:    { type: ["string", "null"], description: "ISO 8601 com timezone -03:00, ex 2026-04-20T15:00:00-03:00" },
          end_at:      { type: ["string", "null"], description: "ISO 8601 com timezone -03:00" },
        },
        required: ["confirmed"],
      },
    },
    required: ["reply", "lead_qualification", "handoff_to_human", "booking"],
  },
};

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
        model:       args.model,
        max_tokens:  1024,
        system:      args.system,
        tools:       [RESPOND_TO_LEAD_TOOL],
        tool_choice: { type: "tool", name: "respond_to_lead" },
        messages:    [{ role: "user", content: args.user }],
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Anthropic error:", result);
      return null;
    }

    // Claude retorna tool_use block quando tool_choice força a tool
    const toolBlock = (result.content as Array<{ type: string; name?: string; input?: Record<string, unknown> }> | undefined)
      ?.find((b) => b.type === "tool_use" && b.name === "respond_to_lead");

    if (!toolBlock?.input) {
      // Fallback: tenta parse JSON do primeiro block de texto (defensive)
      const raw = result.content?.[0]?.type === "text" ? result.content[0].text : "";
      if (raw) {
        try {
          const cleaned = raw.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned) as AiJsonResponse;
          if (typeof parsed.reply === "string" && parsed.reply.trim()) return parsed;
        } catch {
          // parser fallback falhou — ignora
        }
      }
      console.error("No tool_use block in Claude response:", result);
      return null;
    }

    const input = toolBlock.input as AiJsonResponse;
    if (typeof input.reply !== "string" || !input.reply.trim()) return null;
    return input;
  } catch (e) {
    console.error("callClaude failed:", e);
    return null;
  }
}

/**
 * Verifica se agora (America/Sao_Paulo) está dentro do horário de
 * atendimento configurado na instance. Se qualquer campo estiver null,
 * assume horário padrão (seg-sab 8h-19h).
 */
function isWithinWorkHours(instance: Record<string, unknown>): { within: boolean; reason: string } {
  const startStr = (instance.ai_work_hours_start as string | null) ?? "08:00:00";
  const endStr   = (instance.ai_work_hours_end   as string | null) ?? "19:00:00";
  const daysRaw  = (instance.ai_work_days as number[] | null) ?? [1, 2, 3, 4, 5, 6];

  // Data atual em America/Sao_Paulo (UTC-3)
  const now     = new Date();
  const brOffset = -3 * 60; // UTC-3 fixed (sem DST no Brasil desde 2019)
  const localMs = now.getTime() + (brOffset - now.getTimezoneOffset()) * 60_000;
  const local   = new Date(localMs);

  // ISO weekday: 1=seg...7=dom. Date.getDay() é 0=dom...6=sab.
  const isoDay = local.getDay() === 0 ? 7 : local.getDay();
  if (!daysRaw.includes(isoDay)) {
    return { within: false, reason: "off_day" };
  }

  const [sH, sM] = startStr.split(":").map(Number);
  const [eH, eM] = endStr.split(":").map(Number);
  const nowMin  = local.getHours() * 60 + local.getMinutes();
  const startMin = sH * 60 + sM;
  const endMin   = eH * 60 + eM;

  if (nowMin < startMin || nowMin >= endMin) {
    return { within: false, reason: "off_hours" };
  }
  return { within: true, reason: "ok" };
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
