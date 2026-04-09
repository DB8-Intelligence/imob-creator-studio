import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return new Response("ANTHROPIC_API_KEY not set", { status: 500 });

  const { company_name, about_text, city } = await req.json();

  const prompt = `Você é especialista em SEO imobiliário brasileiro.
Gere título SEO, descrição SEO e 5 palavras-chave para um site imobiliário com estas informações:
- Empresa: ${company_name ?? "Imobiliária"}
- Cidade: ${city ?? "Salvador, BA"}
- Sobre: ${about_text ?? "Imóveis de alto padrão"}

Retorne SOMENTE JSON válido no formato:
{"title": "...", "description": "...", "keywords": ["...", "...", "...", "...", "..."]}

Regras:
- Título: máximo 60 caracteres, incluir cidade
- Descrição: máximo 155 caracteres, incluir cidade e especialidade
- Keywords: 5 expressões long-tail específicas para a cidade`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const result = await response.json();
  const text = result.content?.[0]?.type === "text" ? result.content[0].text : "{}";
  const clean = text.replace(/```json|```/g, "").trim();

  return new Response(clean, {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
