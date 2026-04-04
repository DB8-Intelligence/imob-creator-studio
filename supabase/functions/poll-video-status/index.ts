import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Poll Veo video generation status.
 *
 * Receives an operationName from the initial image-to-video call
 * and checks if the video is ready. If ready, downloads and uploads
 * the video to Supabase Storage.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "authorization header is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const anon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await anon.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const { operationName, workspaceId, jobId, segmentIndex } = await req.json();

    if (!operationName) {
      return new Response(
        JSON.stringify({ error: "operationName é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Poll Veo operation status
    const pollResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_API_KEY}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (!pollResponse.ok) {
      const errText = await pollResponse.text();
      console.error("Veo poll error:", pollResponse.status, errText);
      throw new Error(`Veo poll error: ${pollResponse.status}`);
    }

    const pollData = await pollResponse.json();

    // Check if operation is done
    if (!pollData.done) {
      return new Response(
        JSON.stringify({
          success: true,
          status: "processing",
          operationName,
          progress: pollData.metadata?.progress ?? null,
          message: "Vídeo ainda em processamento.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Operation is done — check for errors
    if (pollData.error) {
      const errorMsg = pollData.error.message || "Erro na geração do vídeo";
      console.error("Veo operation failed:", pollData.error);

      if (jobId && segmentIndex !== undefined) {
        await supabase
          .from("video_job_segments")
          .update({ status: "failed", metadata: { error: errorMsg } })
          .eq("video_job_id", jobId)
          .eq("sequence_index", segmentIndex);
      }

      return new Response(
        JSON.stringify({
          success: false,
          status: "failed",
          error: errorMsg,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract video from response
    const generatedVideos =
      pollData.response?.generateVideoResponse?.generatedSamples
      ?? pollData.response?.generatedVideos
      ?? [];

    if (generatedVideos.length === 0) {
      console.error("No videos in completed operation:", JSON.stringify(pollData).substring(0, 500));
      throw new Error("Operação completa mas nenhum vídeo retornado.");
    }

    const videoData = generatedVideos[0].video;
    if (!videoData?.uri) {
      throw new Error("URI do vídeo não encontrada na resposta.");
    }

    // Download and upload to Supabase Storage
    const videoResponse = await fetch(videoData.uri);
    if (!videoResponse.ok) throw new Error(`Failed to download video: ${videoResponse.status}`);
    const videoBlob = await videoResponse.arrayBuffer();
    const videoBytes = new Uint8Array(videoBlob);

    const fileName = `video-${Date.now()}.mp4`;
    const storagePath = `video-clips/${workspaceId || "global"}/${jobId || "direct"}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("video-outputs")
      .upload(storagePath, videoBytes, {
        contentType: "video/mp4",
        upsert: false,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from("video-outputs").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Update segment status if part of a video job
    if (jobId && segmentIndex !== undefined) {
      await supabase
        .from("video_job_segments")
        .update({
          status: "completed",
          output_clip_url: publicUrl,
        })
        .eq("video_job_id", jobId)
        .eq("sequence_index", segmentIndex);
    }

    console.log("Video ready:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        status: "completed",
        videoUrl: publicUrl,
        operationName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("poll-video-status error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno no servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
