import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Voce e um especialista em marketing digital imobiliario brasileiro. Analise a presenca digital do corretor e responda APENAS em JSON valido (sem markdown, sem code fences) com esta estrutura exata:
{
  "score_geral": number (0-100),
  "nivel": "Critico" | "Regular" | "Bom" | "Excelente",
  "resumo": "string com 2-3 frases",
  "pontos_atencao": [{"titulo":"string","descricao":"string","impacto":"Alto|Medio|Baixo"}],
  "pontos_positivos": [{"titulo":"string","descricao":"string"}],
  "oportunidades": [{"titulo":"string","descricao":"string","potencial":"Alto|Medio|Baixo"}],
  "proximos_passos": [{"acao":"string","prazo":"string","dificuldade":"Facil|Medio|Dificil"}],
  "insight_instagram": "string",
  "insight_site": "string"
}
Gere pelo menos 3 itens em pontos_atencao, pontos_positivos e oportunidades. Gere pelo menos 4 proximos_passos. Seja especifico para o mercado imobiliario brasileiro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userPrompt } = await req.json();
    if (!userPrompt || typeof userPrompt !== "string") {
      return new Response(JSON.stringify({ error: "userPrompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(JSON.stringify({ event: "diagnostico_ai", status: "anthropic_error", code: res.status, body: errText }));
      return new Response(JSON.stringify({ error: `AI service error: ${res.status}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const text = json.content?.[0]?.text ?? "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch {
      return new Response(JSON.stringify({ error: "AI returned invalid JSON" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "diagnostico_ai", status: "error", reason: msg }));
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
