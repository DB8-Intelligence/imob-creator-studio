import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  const payload = await req.json().catch(() => ({}));
  const event = payload.event as string;
  const data = payload.data as Record<string, unknown>;

  if (event !== "MESSAGES_UPSERT") return new Response("ok");

  const message = data?.message as Record<string, unknown>;
  const key = data?.key as Record<string, unknown>;
  const instanceName = data?.instance as string;

  const fromMe = !!key?.fromMe;
  const fromPhone = String(key?.remoteJid ?? "").replace("@s.whatsapp.net", "");
  const fromName = String(data?.pushName ?? fromPhone);
  const msgType = message?.messageType as string;

  // Find workspace by instance
  const { data: instance } = await supabase
    .from("user_whatsapp_instances")
    .select("user_id, instance_name")
    .eq("instance_name", instanceName)
    .maybeSingle();

  if (!instance) return new Response("ok");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", instance.user_id)
    .maybeSingle();

  if (!workspace) return new Response("ok");

  // Extract message content
  const mediaUrls: string[] = [];
  let messageText = "";

  if (msgType === "conversation" || msgType === "extendedTextMessage") {
    messageText = String(
      message?.conversation ?? message?.extendedTextMessage?.text ?? ""
    );
  } else if (msgType === "imageMessage") {
    const mediaUrl = String(message?.imageMessage?.url ?? "");
    if (mediaUrl) mediaUrls.push(mediaUrl);
    messageText = String(message?.imageMessage?.caption ?? "");
  } else if (msgType === "audioMessage" || msgType === "pttMessage") {
    // Áudio do lead: transcreve via Whisper para a IA poder responder
    const audioUrl = String(
      (message?.audioMessage as Record<string, unknown> | undefined)?.url
      ?? (message?.pttMessage as Record<string, unknown> | undefined)?.url
      ?? ""
    );
    if (audioUrl) mediaUrls.push(audioUrl);

    const transcription = await transcribeAudio({
      instance_name: instanceName,
      message_id: String(key?.id ?? ""),
      audio_url: audioUrl,
    });

    if (transcription) {
      messageText = transcription;
    }
  }

  // Criativos Pro — aprovação bidirecional: o corretor responde 👍/👎 ao
  // preview enviado pelo pipeline-criativo. É uma mensagem `fromMe=true` porque
  // vem do próprio número conectado à instance. Sem esse fork, o `fromMe` era
  // sempre ignorado. Só processamos se houver pretensão de aprovação; outras
  // self-messages seguem ignoradas.
  if (fromMe) {
    await tryHandleCriativoApproval({
      owner_user_id:     instance.user_id,
      instance_name:     instanceName,
      message_text:      messageText,
      quoted_message_id: extractQuotedMessageId(message),
    });
    return new Response("ok");
  }

  // Save to inbox
  const { data: inboxRow } = await supabase.from("whatsapp_inbox").insert({
    workspace_id: workspace.id,
    instance_name: instanceName,
    from_phone: fromPhone,
    from_name: fromName,
    message_type: msgType,
    message_text: messageText,
    media_urls: mediaUrls,
    received_at: new Date().toISOString(),
  }).select("id").maybeSingle();

  // Detect potential property listing (apenas texto+imagem; áudio é sempre lead)
  const isAudio = msgType === "audioMessage" || msgType === "pttMessage";
  const propertyKeywords =
    /quart|suite|vaga|m²|m2|imovel|imóvel|casa|apto|apartamento|terreno|preco|preço|venda|aluguel|r\$/i;
  const looksLikeProperty = !isAudio && (
    (mediaUrls.length > 0 && msgType === "imageMessage") ||
    propertyKeywords.test(messageText)
  );

  // If it's NOT a property listing (client inquiry), try AI secretary reply
  if (!looksLikeProperty) {
    try {
      await triggerAiReply({
        user_id:       instance.user_id,
        phone:         fromPhone,
        contact_name:  fromName,
        message_text:  messageText,
        instance_name: instanceName,
        inbox_id:      inboxRow?.id,
      });
    } catch (e) {
      console.error("triggerAiReply failed:", e);
    }
    return new Response("ok");
  }

  // Extract property data with AI
  try {
    const aiData = await extractPropertyData(messageText, mediaUrls);

    // Criativos Pro: se o corretor tem o módulo ativo E a mensagem trouxe
    // foto, property entra como 'draft' e dispara pipeline-criativo (gera
    // arte + copy, envia preview pro Zap pra aprovar). Texto puro cai no
    // fluxo tradicional — sem foto não dá pra compor criativo.
    const isPro = mediaUrls.length > 0 && (await hasCriativosPro(workspace.id));

    const { data: property } = await supabase
      .from("properties")
      .insert({
        workspace_id: workspace.id,
        status: isPro ? "draft" : "pending_approval",
        source: "whatsapp",
        source_contact: fromName,
        source_phone: fromPhone,
        photos: mediaUrls,
        type: aiData.type,
        bedrooms: aiData.bedrooms,
        suites: aiData.suites,
        parking: aiData.parking,
        area_built: aiData.area,
        price: aiData.price,
        address: { bairro: aiData.neighborhood, cidade: aiData.city },
        description: aiData.description,
        ai_extracted: aiData,
        captured_by: instance.user_id,
      })
      .select()
      .maybeSingle();

    if (property) {
      if (isPro) {
        await dispatchCriativosPro(instance.user_id, property.id);
      } else {
        await notifyCorretor(instanceName, fromName, property.reference);
      }
    }
  } catch (e) {
    console.error("Erro IA:", e);
  }

  return new Response("ok");
});

/**
 * Retorna true se o workspace tem o módulo `criativos_pro` ativo.
 * user_subscriptions tem workspace_id (não user_id); view my_modules faz
 * o join com workspaces pra filtrar por auth.uid().
 */
async function hasCriativosPro(workspaceId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("module_id", "criativos_pro")
    .eq("status", "active")
    .maybeSingle();
  return !!data;
}

/**
 * Cria o job em creatives_gallery (status='analyzing') e dispara
 * pipeline-criativo fire-and-forget. A edge function atualiza o job pra
 * 'pending_approval' quando termina.
 */
async function dispatchCriativosPro(ownerUserId: string, propertyId: string): Promise<void> {
  const { data: job } = await supabase
    .from("creatives_gallery")
    .insert({
      user_id:       ownerUserId,
      template_name: "whatsapp_intake",
      template_slug: "whatsapp_intake",
      status:        "analyzing",
      property_id:   propertyId,
    })
    .select("id")
    .maybeSingle();

  if (!job) {
    console.error("dispatchCriativosPro: falha ao criar creative job");
    return;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return;

  // Fire-and-forget — não bloqueia o webhook do Evolution (tem que responder
  // rápido). Pipeline-criativo notifica o corretor no fim.
  // Authorization: Bearer <service-role> é o padrão do repo pra chamadas
  // server-to-server passarem no verify_jwt da função destino.
  fetch(`${supabaseUrl}/functions/v1/pipeline-criativo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ property_id: propertyId, creative_job_id: job.id }),
  }).catch((e) => console.error("pipeline-criativo dispatch failed:", e));
}

/**
 * Transcreve áudio do lead via OpenAI Whisper.
 *
 * Fluxo:
 *   1. Chama Evolution /chat/getBase64FromMediaMessage/<instance> com a message_id
 *      (essa rota garante download com decrypt, independente do áudio ter URL direta)
 *   2. Envia binário pra OpenAI /v1/audio/transcriptions (whisper-1)
 *   3. Retorna texto transcrito em PT-BR
 *
 * Retorna string vazia se algo falhar — caller decide fallback.
 */
async function transcribeAudio(args: {
  instance_name: string;
  message_id:    string;
  audio_url:     string;
}): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.warn("transcribeAudio skipped: OPENAI_API_KEY ausente");
    return "";
  }

  const evoUrl = Deno.env.get("EVOLUTION_API_URL");
  const evoKey = Deno.env.get("EVOLUTION_API_KEY");
  if (!evoUrl || !evoKey || !args.message_id) {
    console.warn("transcribeAudio skipped: evolution config ou message_id ausente");
    return "";
  }

  try {
    // 1. Baixa áudio via Evolution (suporta getBase64FromMediaMessage na v2)
    const mediaRes = await fetch(
      `${evoUrl}/chat/getBase64FromMediaMessage/${args.instance_name}`,
      {
        method: "POST",
        headers: { apikey: evoKey, "Content-Type": "application/json" },
        body: JSON.stringify({ message: { key: { id: args.message_id } }, convertToMp4: false }),
      },
    );
    const mediaData = await mediaRes.json().catch(() => ({}));
    if (!mediaRes.ok || !mediaData.base64) {
      console.error("Evolution getBase64 failed:", mediaRes.status, mediaData);
      return "";
    }

    const audioBytes = Uint8Array.from(atob(mediaData.base64), (c) => c.charCodeAt(0));
    const mimeType   = (mediaData.mimetype as string | undefined) ?? "audio/ogg";
    const ext        = mimeType.includes("opus") ? "opus"
                    : mimeType.includes("mp3")  ? "mp3"
                    : mimeType.includes("wav")  ? "wav"
                    : "ogg";

    // 2. Envia pra Whisper
    const form = new FormData();
    form.append("file", new Blob([audioBytes], { type: mimeType }), `lead-audio.${ext}`);
    form.append("model", "whisper-1");
    form.append("language", "pt");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method:  "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body:    form,
    });
    const whisperData = await whisperRes.json().catch(() => ({}));
    if (!whisperRes.ok || typeof whisperData.text !== "string") {
      console.error("Whisper failed:", whisperRes.status, whisperData);
      return "";
    }

    return whisperData.text.trim();
  } catch (e) {
    console.error("transcribeAudio error:", e);
    return "";
  }
}

async function extractPropertyData(
  text: string,
  imageUrls: string[]
): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return {};
  }

  const prompt = `Analise as informações abaixo e extraia dados de um imóvel.
Retorne SOMENTE um JSON válido com os campos:
{ "type": string|null, "bedrooms": number|null, "suites": number|null, "parking": number|null, "area": number|null, "price": number|null, "neighborhood": string|null, "city": string|null, "description": string|null, "confidence": number }

Texto recebido: "${text}"
${imageUrls.length > 0 ? `Há ${imageUrls.length} foto(s) do imóvel.` : ""}

Campos desconhecidos devem ser null. confidence é 0-1.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const result = await response.json();
  const raw =
    result.content?.[0]?.type === "text" ? result.content[0].text : "{}";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

async function triggerAiReply(payload: {
  user_id: string;
  phone: string;
  contact_name: string;
  message_text: string;
  instance_name: string;
  inbox_id?: string;
}): Promise<void> {
  if (!payload.message_text?.trim()) return;

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceKey || !supabaseUrl) return;

  await fetch(`${supabaseUrl}/functions/v1/whatsapp-ai-reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(payload),
  });
}

async function notifyCorretor(
  instanceName: string,
  fromName: string,
  reference: string
) {
  const url = Deno.env.get("EVOLUTION_API_URL");
  const apikey = Deno.env.get("EVOLUTION_API_KEY");
  if (!url || !apikey) return;

  const infoRes = await fetch(
    `${url}/instance/fetchInstances?instanceName=${instanceName}`,
    { headers: { apikey } }
  );
  const info = await infoRes.json();
  const ownerJid = Array.isArray(info)
    ? info[0]?.instance?.ownerJid
    : info?.instance?.ownerJid;

  if (!ownerJid) return;

  await fetch(`${url}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: { apikey, "Content-Type": "application/json" },
    body: JSON.stringify({
      number: ownerJid,
      text: `🏠 Novo imóvel recebido de *${fromName}*!\n\nReferência: *${reference}*\n\nAcesse o dashboard para revisar e aprovar em 30 segundos:\nhttps://imobcreatorai.com.br/dashboard/imoveis`,
    }),
  });
}

/* ── Criativos Pro: aprovação WhatsApp bidirecional ───────────────────── */

/**
 * Extrai stanzaId da mensagem citada (quoted message). Evolution v2 pode pôr
 * o contextInfo em dois caminhos diferentes; cobrimos ambos.
 */
function extractQuotedMessageId(message: Record<string, unknown>): string | null {
  const extended = message?.extendedTextMessage as Record<string, unknown> | undefined;
  const extendedCtx = extended?.contextInfo as Record<string, unknown> | undefined;
  if (typeof extendedCtx?.stanzaId === "string") return extendedCtx.stanzaId;

  const ctx = message?.messageContextInfo as Record<string, unknown> | undefined;
  if (typeof ctx?.stanzaId === "string") return ctx.stanzaId;

  return null;
}

/**
 * Classifica texto do corretor como aprovação / rejeição / ambíguo.
 * Match liberal — aceita 👍, ✅, SIM, OK, APROVA(R/DO) etc. Qualquer mensagem
 * que não bate em nenhum padrão é ignorada (deixa job pendente pro sweep).
 */
function classifyApprovalResponse(text: string): { approve: boolean; reject: boolean } {
  const t = text.trim().toLowerCase();
  if (!t) return { approve: false, reject: false };

  const approve = /^(👍|✅|sim|ok|aprovo|aprovar|aprovad[oa]|pode|publica[r]?)/.test(t);
  const reject  = /^(👎|❌|n[aã]o|rejeito|rejeitar|cancela[r]?|descart[aeo])/.test(t);
  return { approve, reject };
}

/**
 * Handler de aprovação: só age se houver job pendente que case com a
 * resposta. Prefere casar via quoted message (mais robusto); fallback no
 * último job `pending_approval` do corretor (janela curta, dentro do
 * approval_deadline).
 */
async function tryHandleCriativoApproval(args: {
  owner_user_id:     string;
  instance_name:     string;
  message_text:      string;
  quoted_message_id: string | null;
}): Promise<void> {
  const { approve, reject } = classifyApprovalResponse(args.message_text);
  if (!approve && !reject) return; // self-talk comum, ignora

  // Prefere casar via quoted
  let job: { id: string; property_id: string | null } | null = null;
  if (args.quoted_message_id) {
    const { data } = await supabase
      .from("creatives_gallery")
      .select("id, property_id")
      .eq("whatsapp_message_id", args.quoted_message_id)
      .eq("status", "pending_approval")
      .maybeSingle();
    job = data as typeof job;
  }

  if (!job) {
    // Fallback: último pending_approval do corretor ainda dentro do deadline.
    const { data } = await supabase
      .from("creatives_gallery")
      .select("id, property_id")
      .eq("user_id", args.owner_user_id)
      .eq("status", "pending_approval")
      .gte("approval_deadline", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    job = data as typeof job;
  }

  if (!job) return; // sem job pendente — ignora, corretor tá falando sozinho

  if (approve) {
    await supabase
      .from("creatives_gallery")
      .update({ status: "approved" })
      .eq("id", job.id);

    // Dispatch fire-and-forget pra criativos-publish
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      fetch(`${supabaseUrl}/functions/v1/criativos-publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ creative_job_id: job.id }),
      }).catch((e) => console.error("criativos-publish dispatch failed:", e));
    }

    await sendOwnerText(
      args.instance_name,
      `✅ Aprovado! Publicando no Instagram...\n\nVocê recebe o link do post em instantes.`
    );
    return;
  }

  // reject
  await supabase
    .from("creatives_gallery")
    .update({ status: "rejected" })
    .eq("id", job.id);

  await sendOwnerText(
    args.instance_name,
    `❌ Rejeitado. Me mande outra foto (ou o mesmo imóvel com caption diferente) que eu gero um novo criativo.`
  );
}

/**
 * Envia texto pro próprio ownerJid da instance (o corretor). Resolução de
 * ownerJid idêntica à usada em notifyCorretor.
 */
async function sendOwnerText(instanceName: string, text: string): Promise<void> {
  const url = Deno.env.get("EVOLUTION_API_URL");
  const apikey = Deno.env.get("EVOLUTION_API_KEY");
  if (!url || !apikey) return;

  const infoRes = await fetch(
    `${url}/instance/fetchInstances?instanceName=${instanceName}`,
    { headers: { apikey } }
  );
  const info = await infoRes.json().catch(() => null);
  const ownerJid = Array.isArray(info)
    ? info[0]?.instance?.ownerJid
    : info?.instance?.ownerJid;

  if (!ownerJid) return;

  await fetch(`${url}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: { apikey, "Content-Type": "application/json" },
    body: JSON.stringify({ number: ownerJid, text }),
  }).catch((e) => console.error("sendOwnerText failed:", e));
}
