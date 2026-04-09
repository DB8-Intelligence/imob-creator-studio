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

  // Ignore own messages
  if (key?.fromMe) return new Response("ok");

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
    .eq("owner_id", instance.user_id)
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
  }

  // Save to inbox
  await supabase.from("whatsapp_inbox").insert({
    workspace_id: workspace.id,
    instance_name: instanceName,
    from_phone: fromPhone,
    from_name: fromName,
    message_type: msgType,
    message_text: messageText,
    media_urls: mediaUrls,
    received_at: new Date().toISOString(),
  });

  // Detect potential property listing
  const propertyKeywords =
    /quart|suite|vaga|m²|m2|imovel|imóvel|casa|apto|apartamento|terreno|preco|preço|venda|aluguel|r\$/i;
  const looksLikeProperty =
    mediaUrls.length > 0 || propertyKeywords.test(messageText);

  if (!looksLikeProperty) return new Response("ok");

  // Extract property data with AI
  try {
    const aiData = await extractPropertyData(messageText, mediaUrls);

    const { data: property } = await supabase
      .from("properties")
      .insert({
        workspace_id: workspace.id,
        status: "pending_approval",
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
      await notifyCorretor(instanceName, fromName, property.reference);
    }
  } catch (e) {
    console.error("Erro IA:", e);
  }

  return new Response("ok");
});

async function extractPropertyData(
  text: string,
  imageUrls: string[]
): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set, skipping AI extraction");
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
