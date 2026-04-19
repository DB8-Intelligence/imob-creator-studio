// ============================================================
// embed-property — Módulo 4 (RAG)
//
// Gera embedding OpenAI text-embedding-3-small para um imóvel e salva
// em properties.embedding. Chamada pelo trigger dispatch_embed_property_event
// (fire-and-forget via pg_net) toda vez que o imóvel é criado/atualizado.
//
// Auth:
//   - x-internal-secret (via trigger do Postgres) OU
//   - Bearer SERVICE_ROLE_KEY (via backfill script)
//
// Env:
//   OPENAI_API_KEY
//   INTERNAL_WEBHOOK_SECRET
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL       = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY     = Deno.env.get("OPENAI_API_KEY");
const INTERNAL_SECRET    = Deno.env.get("INTERNAL_WEBHOOK_SECRET");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const EMBED_MODEL = "text-embedding-3-small";
const EMBED_DIMS  = 1536;

interface EmbedRequest {
  property_id: string;
}

serve(async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const auth     = req.headers.get("authorization") ?? "";
  const internal = req.headers.get("x-internal-secret");
  const isServiceRole = auth === `Bearer ${SERVICE_ROLE_KEY}`;
  const isInternal    = INTERNAL_SECRET && internal === INTERNAL_SECRET;
  if (!isServiceRole && !isInternal) return json({ ok: false, error: "unauthorized" }, 401);

  if (!OPENAI_API_KEY) return json({ ok: false, error: "missing_openai_key" }, 500);

  let body: EmbedRequest;
  try { body = await req.json(); } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!body.property_id) return json({ ok: false, error: "missing_property_id" }, 400);

  // Lê a propriedade
  const { data: prop, error: propErr } = await admin
    .from("properties")
    .select("id, reference, title, property_type, standard, bedrooms, suites, parking, area_built, area_sqm, price, price_type, pretension, city, neighborhood, address, state, description, amenities, status")
    .eq("id", body.property_id)
    .maybeSingle();

  if (propErr || !prop) {
    console.error("property not found:", propErr);
    return json({ ok: false, error: "property_not_found" }, 404);
  }

  if (prop.status === "archived") {
    return json({ ok: true, skipped: "archived" });
  }

  // Monta texto compacto para embedar
  const embedText = buildEmbeddingText(prop);
  if (!embedText.trim()) return json({ ok: true, skipped: "empty_text" });

  // Chama OpenAI embeddings
  let embedding: number[];
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:      EMBED_MODEL,
        input:      embedText,
        dimensions: EMBED_DIMS,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data?.[0]?.embedding) {
      console.error("OpenAI embeddings failed:", data);
      return json({ ok: false, error: "openai_failed", detail: data?.error ?? data }, 502);
    }
    embedding = data.data[0].embedding;
  } catch (e) {
    console.error("OpenAI network error:", e);
    return json({ ok: false, error: "openai_network" }, 502);
  }

  // pgvector aceita string formato '[0.1,0.2,...]'
  const vectorLiteral = `[${embedding.join(",")}]`;

  const { error: updErr } = await admin
    .from("properties")
    .update({
      embedding:            vectorLiteral,
      embedding_updated_at: new Date().toISOString(),
    })
    .eq("id", body.property_id);

  if (updErr) {
    console.error("properties update embedding failed:", updErr);
    return json({ ok: false, error: "update_failed" }, 500);
  }

  return json({
    ok: true,
    property_id: body.property_id,
    chars: embedText.length,
    model: EMBED_MODEL,
  });
});

/**
 * Constrói texto compacto para embedar. Foca no que o lead busca:
 * tipo + bairro + cidade + quartos + vagas + preço + descrição.
 */
function buildEmbeddingText(p: Record<string, unknown>): string {
  const parts: string[] = [];

  const type = String(p.property_type ?? "Imóvel");
  const pret = String(p.pretension ?? "venda");
  parts.push(`${type} para ${pret}`);

  const specs: string[] = [];
  if (p.bedrooms)   specs.push(`${p.bedrooms} quartos`);
  if (p.suites)     specs.push(`${p.suites} suítes`);
  if (p.parking)    specs.push(`${p.parking} vagas`);
  const area = p.area_built ?? p.area_sqm;
  if (area)         specs.push(`${area}m²`);
  if (specs.length) parts.push(specs.join(", "));

  const price = Number(p.price ?? 0);
  if (price > 0) {
    const fmt = price.toLocaleString("pt-BR");
    const suffix = p.price_type === "monthly" ? "/mês" : "";
    parts.push(`R$ ${fmt}${suffix}`);
  }

  const loc: string[] = [];
  if (p.neighborhood) loc.push(String(p.neighborhood));
  if (p.city)         loc.push(String(p.city));
  if (p.state)        loc.push(String(p.state));
  if (loc.length) parts.push(loc.join(", "));

  if (Array.isArray(p.amenities) && p.amenities.length) {
    parts.push("Comodidades: " + (p.amenities as string[]).join(", "));
  }

  if (p.title)       parts.push(String(p.title));
  if (p.description) parts.push(String(p.description).slice(0, 1200));
  if (p.reference)   parts.push(`Ref: ${p.reference}`);

  return parts.join(". ");
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
