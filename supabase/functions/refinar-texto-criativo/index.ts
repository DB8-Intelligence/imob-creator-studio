import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conceito, canal, tipo, template } = await req.json();

    if (!conceito?.trim()) {
      return new Response(JSON.stringify({ error: "conceito is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const canalLabel = canal === "instagram" ? "Instagram" : "Facebook";
    const tipoLabel = tipo === "post" ? "post profissional" : "anúncio";

    const prompt = `Você é um especialista em copywriting para marketing digital imobiliário brasileiro.

Com base na ideia abaixo, crie textos otimizados para um ${tipoLabel} no ${canalLabel}.
Estilo visual do template: "${template}".

Ideia do usuário: "${conceito}"

Retorne APENAS um JSON válido com exatamente este formato (sem markdown, sem explicações):
{
  "titulo": "título principal impactante, máx 60 caracteres",
  "subtitulo": "subtítulo complementar, máx 100 caracteres",
  "cta": "call to action direto, máx 30 caracteres"
}

Regras:
- Tom profissional e persuasivo para o mercado imobiliário brasileiro
- Título deve ser chamativo e gerar curiosidade ou urgência
- CTA deve ser acionável (ex: "Saiba mais", "Agende uma visita", "Fale conosco")
- Textos em português brasileiro`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini error:", response.status, err);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse JSON from response (strip markdown code blocks if present)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini did not return valid JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        titulo: parsed.titulo ?? "",
        subtitulo: parsed.subtitulo ?? "",
        cta: parsed.cta ?? "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("refinar-texto-criativo error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
