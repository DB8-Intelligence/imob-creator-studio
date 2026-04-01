import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Image-to-Video — Gera vídeos cinematográficos a partir de fotos de imóveis
 *
 * Usa o Google Veo 3.1 (via Gemini API) para transformar uma foto estática
 * em um clip de vídeo com movimento de câmera (pan, zoom, etc.).
 *
 * O endpoint é assíncrono: submete o job e retorna o operation name.
 * O frontend faz polling até o vídeo estar pronto.
 */

type VideoStylePrompt = "cinematic" | "moderno" | "luxury" | "drone" | "walkthrough";

const STYLE_PROMPTS: Record<VideoStylePrompt, string> = {
  cinematic:
    "Cinematic slow camera pan through this real estate property interior. Professional videography with smooth dolly movement, dramatic natural lighting, shallow depth of field. High-end real estate promotional video style.",
  moderno:
    "Modern dynamic camera movement through this property. Clean transitions, contemporary editing style, bright and airy atmosphere. Social media ready real estate video with energetic but smooth pacing.",
  luxury:
    "Ultra luxury real estate showcase. Slow elegant glide through this premium property. Golden hour lighting, sophisticated atmosphere, magazine-quality cinematography. Emphasize high-end finishes and spaciousness.",
  drone:
    "Aerial drone flyover perspective of this property. Smooth ascending camera revealing the full property and surroundings. Professional real estate aerial videography with stabilized footage.",
  walkthrough:
    "First-person walkthrough of this property. Steady camera movement as if walking through the space. Natural perspective, eye-level view, smooth stabilized motion. Virtual tour style.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      imageBase64,
      imageUrl,
      style,
      aspectRatio,
      workspaceId,
      jobId,
      segmentIndex,
    } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageBase64 ou imageUrl é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const selectedStyle: VideoStylePrompt = style || "cinematic";
    const selectedAspectRatio = aspectRatio || "16:9"; // 16:9 or 9:16
    const promptText = STYLE_PROMPTS[selectedStyle] || STYLE_PROMPTS.cinematic;

    console.log("Image-to-video request:", {
      style: selectedStyle,
      aspectRatio: selectedAspectRatio,
      jobId,
      segmentIndex,
    });

    // Prepare image for Veo API
    let imagePayload: Record<string, unknown>;
    if (imageBase64) {
      let mimeType = "image/jpeg";
      let rawBase64 = imageBase64;
      if (imageBase64.startsWith("data:")) {
        const match = imageBase64.match(/^data:(image\/\w+);base64,/);
        if (match) mimeType = match[1];
        rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      }
      imagePayload = { image: { imageBytes: rawBase64, mimeType } };
    } else {
      imagePayload = { image: { imageUri: imageUrl, mimeType: "image/jpeg" } };
    }

    // Call Veo 3.1 via Gemini API — generateVideos endpoint (async operation)
    const veoModel = "veo-3.0-generate-preview"; // Veo 3 with image-to-video
    const veoResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${veoModel}:generateVideos?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: imagePayload.image,
                },
              ],
            },
          ],
          generationConfig: {
            aspectRatio: selectedAspectRatio,
            numberOfVideos: 1,
          },
        }),
      }
    );

    if (!veoResponse.ok) {
      const errText = await veoResponse.text();
      console.error("Veo API error:", veoResponse.status, errText);

      if (veoResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (veoResponse.status === 402 || veoResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: "Acesso ao Veo não disponível. Verifique sua API key e billing." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Veo API error: ${veoResponse.status} - ${errText}`);
    }

    const veoData = await veoResponse.json();

    // Veo returns an async operation — we need to poll for completion
    const operationName = veoData.name;

    if (!operationName) {
      // Some models return the video directly
      const generatedVideos = veoData.response?.generatedVideos
        || veoData.generatedVideos
        || [];

      if (generatedVideos.length > 0) {
        const videoData = generatedVideos[0].video;
        if (videoData?.uri) {
          // Video is ready — download and upload to Supabase
          const videoResponse = await fetch(videoData.uri);
          const videoBlob = await videoResponse.arrayBuffer();
          const videoBytes = new Uint8Array(videoBlob);

          const fileName = `video-${selectedStyle}-${Date.now()}.mp4`;
          const storagePath = `video-clips/${workspaceId || "global"}/${jobId || "direct"}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("video-outputs")
            .upload(storagePath, videoBytes, {
              contentType: "video/mp4",
              upsert: false,
            });

          if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

          const { data: urlData } = supabase.storage.from("video-outputs").getPublicUrl(storagePath);

          // Update segment status if this is part of a video job
          if (jobId && segmentIndex !== undefined) {
            await supabase
              .from("video_job_segments")
              .update({
                status: "completed",
                output_clip_url: urlData.publicUrl,
                provider: "veo-3",
                metadata: { style: selectedStyle, aspectRatio: selectedAspectRatio },
              })
              .eq("video_job_id", jobId)
              .eq("sequence_index", segmentIndex);
          }

          return new Response(
            JSON.stringify({
              success: true,
              status: "completed",
              videoUrl: urlData.publicUrl,
              style: selectedStyle,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Async operation — return the operation name for polling
    // Update segment to processing state
    if (jobId && segmentIndex !== undefined) {
      await supabase
        .from("video_job_segments")
        .update({
          status: "processing",
          provider: "veo-3",
          provider_job_id: operationName,
          metadata: { style: selectedStyle, aspectRatio: selectedAspectRatio },
        })
        .eq("video_job_id", jobId)
        .eq("sequence_index", segmentIndex);
    }

    console.log("Veo operation started:", operationName);

    return new Response(
      JSON.stringify({
        success: true,
        status: "processing",
        operationName,
        style: selectedStyle,
        message: "Vídeo em processamento. Use o operationName para verificar o status.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("image-to-video error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno no servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
