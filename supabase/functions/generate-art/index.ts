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
    const { propertyId, imageUrl, title, description, brandId, format, customPrompt, workspaceId } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

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


    // Download the image and convert to base64 for Gemini API
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const imageMimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // gemini-2.0-flash-exp is the model that supports responseModalities: ["IMAGE"]
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);

      if (geminiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();

    // Extract generated image from Gemini response
    const parts = geminiData.candidates?.[0]?.content?.parts ?? [];
    let generatedImageBase64: string | null = null;
    let generatedMimeType = "image/png";

    for (const part of parts) {
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
        generatedMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!generatedImageBase64) {
      console.error("No image in Gemini response:", JSON.stringify(geminiData).substring(0, 500));
      throw new Error("Gemini não retornou uma imagem. Tente novamente.");
    }

    // Upload to Supabase Storage
    const binaryStr = atob(generatedImageBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const ext = generatedMimeType.includes("png") ? "png" : "jpg";
    const fileName = `art-${propertyId || "unknown"}-${selectedFormat}-${Date.now()}.${ext}`;
    const filePath = `generated/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("creatives")
      .upload(filePath, bytes, {
        contentType: generatedMimeType,
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
