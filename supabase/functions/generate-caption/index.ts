import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { type, propertyData, aiPrompt } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "caption") {
      systemPrompt = `Você é especialista em marketing imobiliário no Brasil. Crie descrições persuasivas para Instagram com foco em conversão.

Regras de tom conforme o padrão do imóvel:
- Baixo padrão → foco em custo-benefício, oportunidade, financiamento.
- Médio padrão → foco em conforto, localização, praticidade.
- Luxo → foco em sofisticação, exclusividade e status.

Estrutura obrigatória da resposta:
1. Título chamativo com emoji
2. Descrição envolvente (2-3 frases)
3. Bullet points com diferenciais (use ✅ ou similares)
4. CTA forte direcionando para WhatsApp
5. 5 a 8 hashtags locais e imobiliárias

Formate com espaçamento visual agradável. Responda APENAS com a legenda, sem explicações.`;

      userPrompt = `Gere uma legenda completa para o seguinte imóvel:
Tipo: Apartamento
Título: ${propertyData.title || "Imóvel"}
Detalhes: ${propertyData.subtitle || ""}
Preço: ${propertyData.price || "Consulte"}
CTA: ${propertyData.cta || "Agende sua visita"}
${aiPrompt ? `\nInstrução adicional do corretor: ${aiPrompt}` : ""}`;
    } else if (type === "adjust-text") {
      systemPrompt = `Você é um copywriter especialista em marketing imobiliário. Ajuste os textos do criativo conforme solicitado. 
Responda em JSON com os campos: title, subtitle, price, cta. Mantenha os textos curtos e impactantes.`;

      userPrompt = `Textos atuais do criativo:
Título: ${propertyData.title}
Subtítulo: ${propertyData.subtitle}
Preço: ${propertyData.price}
CTA: ${propertyData.cta}

Instrução: ${aiPrompt}

Responda APENAS em JSON: {"title": "...", "subtitle": "...", "price": "...", "cta": "..."}`;
    } else if (type === "regenerate-caption") {
      systemPrompt = `Você é um especialista em marketing imobiliário brasileiro. Gere uma variação diferente da legenda para posts de imóveis.
Inclua emojis, hashtags e call-to-action. Seja criativo e use um tom diferente do usual. Responda APENAS com a legenda.`;

      userPrompt = `Gere uma nova variação de legenda para:
Título: ${propertyData.title || "Imóvel"}
Detalhes: ${propertyData.subtitle || ""}
Preço: ${propertyData.price || "Consulte"}
${aiPrompt ? `\nTom desejado: ${aiPrompt}` : ""}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione mais créditos nas configurações." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-caption error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
