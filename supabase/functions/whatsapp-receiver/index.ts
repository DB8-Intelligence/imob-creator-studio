/**
 * whatsapp-receiver — Supabase Edge Function
 *
 * Recebe webhooks da Evolution API (WhatsApp) e inicia o pipeline
 * de automação para corretores Pro:
 *
 *   Corretor parceiro → WhatsApp → Evolution API → este webhook
 *   → cria partner_submission → dispara n8n para processar
 *
 * Eventos suportados da Evolution API:
 *   MESSAGES_UPSERT — nova mensagem (texto, imagem, documento)
 *   MESSAGES_UPDATE — status de mensagem (entregue, lido)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const N8N_WHATSAPP_WEBHOOK = "https://automacao.db8intelligence.com.br/webhook/imobcreator-whatsapp";

serve(async (req) => {
  // Webhook chamado pela Evolution API (servidor), não por browser.
  // CORS só necessário para eventual preflight; respostas JSON não precisam de CORS.
  if (req.method === "OPTIONS") {
    const corsHeaders = buildCorsHeaders(req, {
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
    });
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase    = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const { event, instance, data } = body as EvolutionWebhook;

    // Só processamos mensagens novas
    if (event !== "MESSAGES_UPSERT") {
      return json({ ok: true, skipped: true, event });
    }

    const message = data?.message;
    if (!message || message.key?.fromMe) {
      return json({ ok: true, skipped: true, reason: "fromMe or empty" });
    }

    // Número de destino (instância configurada para este workspace)
    const instancePhone = normalizePhone(instance?.owner ?? "");
    if (!instancePhone) {
      return json({ error: "instance.owner missing" }, 400);
    }

    // Buscar workspace pela instância/número
    const { data: configs, error: configErr } = await supabase
      .rpc("get_whatsapp_config_by_phone", { p_phone: instancePhone });

    if (configErr || !configs?.length) {
      console.warn("No active whatsapp_config for", instancePhone);
      return json({ ok: true, skipped: true, reason: "no_config" });
    }

    const config = configs[0];

    // Apenas Pro e VIP processam esse fluxo
    if (!["pro", "vip"].includes(config.workspace_plan)) {
      return json({ ok: true, skipped: true, reason: "not_pro" });
    }

    const senderPhone = normalizePhone(message.key?.remoteJid ?? "");
    const messageType = detectMessageType(message);

    // Verificar se já existe uma submissão aberta para este remetente (últimas 24h)
    const { data: openSub } = await supabase
      .from("partner_submissions")
      .select("id, status, images_received")
      .eq("workspace_id", config.workspace_id)
      .eq("sender_phone", senderPhone)
      .not("status", "in", '("published","failed","cancelled")')
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let submissionId: string;

    if (openSub && messageType !== "text_with_images") {
      // Adicionar à submissão existente (mais imagens ou texto)
      submissionId = openSub.id;
      await appendToSubmission(supabase, openSub, message, messageType);
    } else {
      // Criar nova submissão
      const { data: newSub, error: subErr } = await supabase
        .from("partner_submissions")
        .insert({
          workspace_id:        config.workspace_id,
          whatsapp_config_id:  config.id,
          sender_phone:        senderPhone,
          sender_name:         message.pushName ?? null,
          raw_description:     extractText(message),
          images_received:     extractImageUrls(message),
          status:              "received",
          whatsapp_message_id: message.key?.id ?? null,
        })
        .select("id")
        .single();

      if (subErr || !newSub) {
        console.error("Failed to create partner_submission:", subErr);
        return json({ error: "db error" }, 500);
      }

      submissionId = newSub.id;
    }

    // Log do evento recebido
    await supabase.from("partner_submission_events").insert({
      submission_id:       submissionId,
      event_type:          "message_received",
      direction:           "inbound",
      message_text:        extractText(message),
      media_url:           extractFirstMediaUrl(message),
      whatsapp_message_id: message.key?.id ?? null,
      metadata:            { message_type: messageType, instance },
    });

    // Disparar n8n para processar (não-bloqueante)
    fireAndForget(N8N_WHATSAPP_WEBHOOK, {
      event:           "whatsapp.message_received",
      submission_id:   submissionId,
      workspace_id:    config.workspace_id,
      sender_phone:    senderPhone,
      message_type:    messageType,
      instance_phone:  instancePhone,
      dispatched_at:   new Date().toISOString(),
      source:          "imobcreator-whatsapp-receiver",
    });

    return json({ ok: true, submission_id: submissionId, status: "received" });

  } catch (err) {
    console.error("whatsapp-receiver error:", err);
    return json({ error: "internal error" }, 500);
  }
});

// ─── Helpers ────────────────────────────────────────────────────────────────

interface EvolutionWebhook {
  event:    string;
  instance: { owner?: string; name?: string };
  data:     { message?: EvolutionMessage };
}

interface EvolutionMessage {
  key?:          { id?: string; remoteJid?: string; fromMe?: boolean };
  pushName?:     string;
  messageType?:  string;
  message?:      Record<string, unknown>;
}

function normalizePhone(jid: string): string {
  // Remove @s.whatsapp.net e caracteres não numéricos
  return jid.replace(/@.*/, "").replace(/\D/g, "");
}

function detectMessageType(msg: EvolutionMessage): string {
  const inner = msg.message ?? {};
  if (inner.imageMessage)    return "image";
  if (inner.videoMessage)    return "video";
  if (inner.documentMessage) return "document";
  if (inner.audioMessage)    return "audio";
  if (inner.conversation || inner.extendedTextMessage) return "text";
  return "unknown";
}

function extractText(msg: EvolutionMessage): string | null {
  const inner = msg.message ?? {};
  return (
    (inner.conversation as string) ??
    (inner.extendedTextMessage as Record<string,string>)?.text ??
    (inner.imageMessage as Record<string,string>)?.caption ??
    null
  );
}

function extractImageUrls(msg: EvolutionMessage): string[] {
  const inner = msg.message ?? {};
  const imgMsg = inner.imageMessage as Record<string, unknown> | undefined;
  if (!imgMsg) return [];
  // A URL real vem após download via Evolution API — armazenamos o ID para buscar depois
  const mediaKey = (imgMsg.mediaKey as string) ?? "";
  const msgId    = msg.key?.id ?? "";
  return mediaKey || msgId ? [`wamsg://${msgId}`] : [];
}

function extractFirstMediaUrl(msg: EvolutionMessage): string | null {
  const urls = extractImageUrls(msg);
  return urls[0] ?? null;
}

async function appendToSubmission(
  supabase: ReturnType<typeof createClient>,
  sub: { id: string; images_received: string[] },
  msg: EvolutionMessage,
  msgType: string
) {
  const newImages  = extractImageUrls(msg);
  const newText    = extractText(msg);
  const updateData: Record<string, unknown> = {};

  if (newImages.length) {
    updateData.images_received = [...(sub.images_received ?? []), ...newImages];
  }
  if (newText && msgType === "text") {
    updateData.raw_description = newText;
  }

  if (Object.keys(updateData).length) {
    await supabase.from("partner_submissions").update(updateData).eq("id", sub.id);
  }
}

function fireAndForget(url: string, payload: Record<string, unknown>) {
  fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  }).catch((err) => console.warn("[n8n dispatch]", err));
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
