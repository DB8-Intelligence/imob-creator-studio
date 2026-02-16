import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_BASE_URL = "https://db8-agent-production.up.railway.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, propertyData, aiPrompt } = await req.json();

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
      }),
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": response.headers.get("Content-Type") || "application/json" },
    });
  } catch (e) {
    console.error("generate-caption proxy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
