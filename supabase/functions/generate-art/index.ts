import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, imageUrl, title, description, brandId, format, customPrompt } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user from JWT
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const anonClient = createClient(supabaseUrl, anonKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await anonClient.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    // Fetch brand info
    let brand = { name: "Imobiliária", primary_color: "#1E3A5F", secondary_color: "#D4AF37", logo_url: null as string | null, slogan: "" };
    if (brandId) {
      const { data: brandData } = await supabase.from("brands").select("*").eq("id", brandId).single();
      if (brandData) brand = brandData;
    }

    // Determine dimensions based on format
    const selectedFormat = format || "feed";
    let dimensions = "1080x1080 square";
    if (selectedFormat === "story" || selectedFormat === "reels") {
      dimensions = "1080x1920 vertical (9:16 aspect ratio)";
    }

    // Build prompt
    let prompt = `Create a professional real estate social media post image (${dimensions} format).

The image should feature:
- The property photo as the main visual element
- A sleek, modern frame/border using brand colors: primary ${brand.primary_color} and accent ${brand.secondary_color}
- The brand name "${brand.name}" displayed prominently
${brand.slogan ? `- The slogan "${brand.slogan}" in smaller text` : ""}
- Property title: "${title || "Imóvel Exclusivo"}"
${description ? `- Brief description overlay: "${description.substring(0, 80)}"` : ""}
- Professional real estate marketing aesthetic
- Clean, modern design with good contrast and readability
- The frame should look like a branded template, not just a border

Style: Premium real estate marketing material, Instagram-ready, high contrast text on overlays for readability.`;

    // Append custom prompt if provided
    if (customPrompt) {
      prompt += `\n\nAdditional instructions from the user: ${customPrompt}`;
    }

    console.log("Generating art:", { format: selectedFormat, brand: brand.name, hasCustomPrompt: !!customPrompt });

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedImage = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      console.error("No image in AI response:", JSON.stringify(aiData).substring(0, 500));
      throw new Error("AI did not return an image");
    }

    // Extract base64 data and upload to storage
    const base64Match = generatedImage.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!base64Match) throw new Error("Invalid image format from AI");

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];

    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const fileName = `art-${propertyId || "unknown"}-${selectedFormat}-${Date.now()}.${imageFormat === "jpeg" ? "jpg" : imageFormat}`;
    const filePath = `generated/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("creatives")
      .upload(filePath, bytes, {
        contentType: `image/${imageFormat}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from("creatives").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Save to creatives table if we have a user
    let creativeId: string | null = null;
    if (userId && propertyId) {
      const { data: creative, error: insertError } = await supabase
        .from("creatives")
        .insert({
          user_id: userId,
          property_id: propertyId,
          brand_id: brandId || null,
          name: `Arte ${selectedFormat} - ${title || "Imóvel"}`,
          format: selectedFormat,
          exported_url: publicUrl,
          status: "draft",
          content_data: { customPrompt: customPrompt || null },
        })
        .select("id")
        .single();

      if (!insertError && creative) {
        creativeId = creative.id;
      }
    }

    console.log("Art generated and uploaded:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        artUrl: publicUrl,
        fileName,
        format: selectedFormat,
        creativeId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-art error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
