// ============================================================
// enrich-property — Sprint 8: Property Enrichment IA
//
// Recebe property_id, carrega até 3 fotos, chama Claude Sonnet com Vision
// via tool_use estruturado. Retorna sugestões para os campos do editor:
// title, description, property_type, bedrooms, suites, parking, area_built,
// amenities, highlights.
//
// Auth: Bearer SERVICE_ROLE (via invoke do frontend autenticado).
// Não sobrescreve a propriedade — frontend decide quais campos aplicar.
//
// Env:
//   ANTHROPIC_API_KEY
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-sonnet-4-6";
const MAX_PHOTOS = 3;

interface EnrichRequest {
  property_id: string;
}

interface Suggestion {
  title?:         string;
  description?:   string;
  property_type?: string; // apartamento | casa | lancamento | terreno | oportunidade
  bedrooms?:      number;
  suites?:        number;
  parking?:       number;
  bathrooms?:     number;
  area_built?:    number;
  amenities?:     string[];
  highlights?:    string;
  confidence:     number;
}

const ENRICH_TOOL = {
  name: "suggest_property_fields",
  description: "Sugere valores para campos de um imóvel analisando fotos e dados existentes. Só preencha campos que consiga inferir das fotos/dados com alta confiança. Deixe null para o que não souber.",
  input_schema: {
    type: "object",
    properties: {
      title:         { type: ["string", "null"], description: "Título de marketing ~80 chars. Ex: 'Apto 3 Dorms na Pituba com vista mar'" },
      description:   { type: ["string", "null"], description: "Descrição completa do imóvel, 2-4 parágrafos, pt-BR, tom profissional imobiliário." },
      property_type: { type: ["string", "null"], enum: ["apartamento", "casa", "lancamento", "terreno", "oportunidade", null] },
      bedrooms:      { type: ["integer", "null"], minimum: 0, maximum: 20 },
      suites:        { type: ["integer", "null"], minimum: 0, maximum: 20 },
      parking:       { type: ["integer", "null"], minimum: 0, maximum: 10 },
      bathrooms:     { type: ["integer", "null"], minimum: 0, maximum: 20 },
      area_built:    { type: ["number", "null"], description: "Área construída em m², inferida visualmente se não informada." },
      amenities:     { type: "array", items: { type: "string" }, description: "Lista de comodidades visíveis nas fotos (Piscina, Academia, Churrasqueira, etc)." },
      highlights:    { type: ["string", "null"], description: "Diferenciais curtos separados por vírgula. Ex: 'Vista mar, andar alto, prédio novo'" },
      confidence:    { type: "number", minimum: 0, maximum: 1 },
    },
    required: ["confidence", "amenities"],
  },
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  if (!ANTHROPIC_API_KEY) return json({ ok: false, error: "missing_anthropic_key" }, 500);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "unauthorized" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return json({ ok: false, error: "unauthorized" }, 401);

  let body: EnrichRequest;
  try { body = await req.json(); } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!body.property_id) return json({ ok: false, error: "missing_property_id" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Verifica ownership via workspace
  const { data: prop } = await admin
    .from("properties")
    .select("id, workspace_id, title, description, property_type, bedrooms, suites, parking, area_built, area_sqm, city, neighborhood, price, pretension, amenities, photos, images")
    .eq("id", body.property_id)
    .maybeSingle();

  if (!prop) return json({ ok: false, error: "property_not_found" }, 404);

  // Workspace do user precisa bater (workspaces.owner_id)
  const { data: ws } = await userClient
    .from("workspaces")
    .select("id")
    .eq("id", prop.workspace_id)
    .maybeSingle();
  if (!ws) return json({ ok: false, error: "forbidden" }, 403);

  // Monta lista de URLs de foto (photos text[] tem prioridade; fallback images jsonb)
  const photoUrls: string[] = (() => {
    if (Array.isArray(prop.photos) && prop.photos.length) return prop.photos as string[];
    if (Array.isArray(prop.images)) return (prop.images as string[]);
    if (prop.images && typeof prop.images === "object") {
      const maybe = Object.values(prop.images as Record<string, unknown>).filter((v) => typeof v === "string");
      return maybe as string[];
    }
    return [];
  })().slice(0, MAX_PHOTOS);

  // Constrói o user message com text + image blocks
  const dataContext = [
    prop.title        && `Título atual: ${prop.title}`,
    prop.description  && `Descrição atual: ${String(prop.description).slice(0, 500)}`,
    prop.property_type && `Tipo atual: ${prop.property_type}`,
    prop.city         && `Cidade: ${prop.city}`,
    prop.neighborhood && `Bairro: ${prop.neighborhood}`,
    prop.bedrooms     && `Quartos atuais: ${prop.bedrooms}`,
    prop.suites       && `Suítes atuais: ${prop.suites}`,
    prop.parking      && `Vagas atuais: ${prop.parking}`,
    prop.area_built   && `Área atual: ${prop.area_built}m²`,
    prop.price        && `Valor: R$ ${Number(prop.price).toLocaleString("pt-BR")}`,
    prop.pretension   && `Pretensão: ${prop.pretension}`,
  ].filter(Boolean).join("\n");

  const userContent: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: `Analise este imóvel e sugira valores para os campos faltantes/incompletos.
Se houver dados atuais, apenas complemente/melhore — não contradiga o corretor.
${dataContext ? `\nDADOS ATUAIS:\n${dataContext}` : "\nSem dados atuais além das fotos."}

Preencha apenas o que você consiga inferir com confiança. Deixe null ou omita o que não souber.`,
    },
  ];

  // Adiciona cada foto como image block (Claude Vision)
  for (const url of photoUrls) {
    userContent.push({
      type: "image",
      source: { type: "url", url },
    });
  }

  const systemPrompt = `Você é um especialista em cadastro de imóveis para o Brasil.
Seu papel: analisar fotos e dados existentes e sugerir valores para os campos do editor.

Regras:
1. SEMPRE use a tool "suggest_property_fields" para responder.
2. Título deve ser em pt-BR, orientado a venda, sem clickbait.
3. Descrição: 2-4 parágrafos, tom profissional, destaque diferenciais visíveis nas fotos.
4. Amenities: só inclua o que REALMENTE aparece nas fotos (piscina, academia, vista, varanda, churrasqueira).
5. Quartos/suítes/vagas: só conte se visível nas fotos OU consistente com a descrição. Se incerto, deixe null.
6. Confidence: 0.9+ = alta, 0.6-0.9 = média, <0.6 = baixa (prefira null então).`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:       MODEL,
        max_tokens:  1500,
        system:      systemPrompt,
        tools:       [ENRICH_TOOL],
        tool_choice: { type: "tool", name: "suggest_property_fields" },
        messages:    [{ role: "user", content: userContent }],
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Anthropic error:", result);
      return json({ ok: false, error: "anthropic_failed", detail: result?.error ?? result }, 502);
    }

    const toolBlock = (result.content as Array<{ type: string; name?: string; input?: Record<string, unknown> }> | undefined)
      ?.find((b) => b.type === "tool_use" && b.name === "suggest_property_fields");

    if (!toolBlock?.input) {
      return json({ ok: false, error: "no_tool_block", detail: result }, 502);
    }

    const suggestion = toolBlock.input as Suggestion;

    return json({
      ok:            true,
      suggestion,
      photos_used:   photoUrls.length,
      model:         MODEL,
    });
  } catch (e) {
    console.error("enrich-property error:", e);
    return json({ ok: false, error: "network" }, 502);
  }
});

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
