import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

const API_BASE_URL = "https://api.db8intelligence.com.br";

/** Fetch user's custom prompts from prompt_templates table */
async function getUserPrompts(
  userId: string,
  propertyType?: string | null,
  propertyStandard?: string | null,
  state?: string | null,
): Promise<{ byType?: string; byStandard?: string; byState?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  const filters: { category: string; category_value: string }[] = [];
  if (propertyType) filters.push({ category: "property_type", category_value: propertyType });
  if (propertyStandard) filters.push({ category: "property_standard", category_value: propertyStandard });
  if (state) filters.push({ category: "state", category_value: state });

  if (filters.length === 0) return {};

  const { data, error } = await admin
    .from("prompt_templates")
    .select("category, category_value, prompt_text")
    .eq("user_id", userId)
    .in("category", filters.map((f) => f.category));

  if (error || !data) return {};

  const result: { byType?: string; byStandard?: string; byState?: string } = {};
  for (const row of data) {
    const match = filters.find(
      (f) => f.category === row.category && f.category_value === row.category_value,
    );
    if (!match) continue;
    if (row.category === "property_type") result.byType = row.prompt_text;
    if (row.category === "property_standard") result.byStandard = row.prompt_text;
    if (row.category === "state") result.byState = row.prompt_text;
  }
  return result;
}

/** Extract user id from the Authorization JWT */
async function extractUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(supabaseUrl, anonKey);
  const token = authHeader.replace("Bearer ", "");
  const { data } = await client.auth.getUser(token);
  return data?.user?.id ?? null;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, propertyData, aiPrompt } = await req.json();

    // Resolve user-specific prompts
    let customPrompts: { byType?: string; byStandard?: string; byState?: string } = {};
    const userId = await extractUserId(req);
    if (userId) {
      customPrompts = await getUserPrompts(
        userId,
        propertyData?.propertyType,
        propertyData?.propertyStandard,
        propertyData?.state,
      );
    }

    // Build a combined custom_prompt string
    const parts: string[] = [];
    if (customPrompts.byType) parts.push(`[Tipo] ${customPrompts.byType}`);
    if (customPrompts.byStandard) parts.push(`[Padrão] ${customPrompts.byStandard}`);
    if (customPrompts.byState) parts.push(`[Regional] ${customPrompts.byState}`);
    const customPromptText = parts.length > 0 ? parts.join("\n") : null;

    const response = await fetch(`${API_BASE_URL}/generate-caption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        property_type: propertyData?.propertyType || null,
        property_standard: propertyData?.propertyStandard || null,
        city: propertyData?.city || null,
        neighborhood: propertyData?.neighborhood || null,
        investment_value: propertyData?.investmentValue || null,
        built_area_m2: propertyData?.builtAreaM2 || null,
        highlights: propertyData?.highlights || null,
        title: propertyData?.title || null,
        subtitle: propertyData?.subtitle || null,
        price: propertyData?.price || null,
        cta: propertyData?.cta || null,
        ai_prompt: aiPrompt || null,
        custom_prompt: customPromptText,
      }),
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (e) {
    console.error("generate-caption proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
