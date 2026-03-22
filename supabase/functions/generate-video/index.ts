import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE_URL = "https://api.db8intelligence.com.br";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "authorization header is required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey);
    const anon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await anon.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "invalid user token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const style = String(formData.get("style") ?? "cinematic");
    const format = String(formData.get("format") ?? "reels");
    const requestedDuration = Number(formData.get("duration") ?? "30");
    const addonType = String(formData.get("addonType") ?? "standard");
    const workspaceId = String(formData.get("workspaceId") ?? "");
    const videoJobId = String(formData.get("videoJobId") ?? "");
    const title = String(formData.get("title") ?? "Vídeo imobiliário");

    const photos = formData.getAll("photos").filter((item) => item instanceof File) as File[];

    if (!workspaceId || !videoJobId) {
      return new Response(JSON.stringify({ error: "workspaceId and videoJobId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (photos.length < 1) {
      return new Response(JSON.stringify({ error: "at least one photo is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planRules: Record<string, { maxUploadImages: number; maxRenderedSegments: number; secondsPerImage: number; maxDurationSeconds: number; resolution: string }> = {
      standard: { maxUploadImages: 10, maxRenderedSegments: 10, secondsPerImage: 5, maxDurationSeconds: 50, resolution: "720p" },
      plus: { maxUploadImages: 15, maxRenderedSegments: 15, secondsPerImage: 5, maxDurationSeconds: 75, resolution: "1080p Full HD" },
      premium: { maxUploadImages: 20, maxRenderedSegments: 18, secondsPerImage: 5, maxDurationSeconds: 90, resolution: "4K Ultra HD" },
    };

    const planRule = planRules[addonType] ?? planRules.standard;
    const uploadedPhotoCount = Math.min(photos.length, planRule.maxUploadImages);
    const renderedSegments = Math.min(uploadedPhotoCount, planRule.maxRenderedSegments);
    const computedDuration = Math.min(renderedSegments * planRule.secondsPerImage, planRule.maxDurationSeconds);
    const effectivePhotos = photos.slice(0, uploadedPhotoCount);

    const inputPaths: string[] = [];

    for (let i = 0; i < effectivePhotos.length; i++) {
      const file = effectivePhotos[i];
      const arrayBuffer = await file.arrayBuffer();
      const filePath = `${workspaceId}/${videoJobId}/inputs/${String(i + 1).padStart(2, "0")}-${sanitizeFileName(file.name || `photo-${i + 1}.jpg`)}`;

      const { error: uploadError } = await admin.storage
        .from("video-assets")
        .upload(filePath, arrayBuffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`failed to upload source photo: ${uploadError.message}`);
      }

      inputPaths.push(filePath);
    }

    await admin
      .from("video_jobs")
      .update({
        status: "processing",
        metadata: {
          source_paths: inputPaths,
          style,
          format,
          requested_duration: requestedDuration,
          computed_duration: computedDuration,
          uploaded_images: photos.length,
          uploaded_images_accepted: uploadedPhotoCount,
          rendered_segments: renderedSegments,
          title,
          addon_type: addonType,
        },
      })
      .eq("id", videoJobId)
      .eq("workspace_id", workspaceId);

    await admin
      .from("video_job_segments")
      .update({ status: "processing" })
      .eq("video_job_id", videoJobId)
      .eq("workspace_id", workspaceId);

    const relayForm = new FormData();
    effectivePhotos.forEach((file) => relayForm.append("photos", file, file.name));
    relayForm.append("style", style);
    relayForm.append("format", format);
    relayForm.append("duration", String(computedDuration));
    relayForm.append("title", title);

    const apiResponse = await fetch(`${API_BASE_URL}/generate-video`, {
      method: "POST",
      body: relayForm,
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      await admin.from("video_jobs").update({ status: "failed", metadata: { source_paths: inputPaths, upstream_error: text, requested_duration: requestedDuration, computed_duration: computedDuration, uploaded_images: photos.length, uploaded_images_accepted: uploadedPhotoCount, rendered_segments: renderedSegments, addon_type: addonType } }).eq("id", videoJobId);
      await admin.from("video_job_segments").update({ status: "failed", metadata: { upstream_error: text } }).eq("video_job_id", videoJobId).eq("workspace_id", workspaceId);
      return new Response(text, {
        status: apiResponse.status,
        headers: { ...corsHeaders, "Content-Type": apiResponse.headers.get("Content-Type") || "application/json" },
      });
    }

    const videoBlob = await apiResponse.blob();
    const extension = videoBlob.type.includes("mp4") ? "mp4" : "bin";
    const outputPath = `${workspaceId}/${videoJobId}/output/final-video.${extension}`;

    const { error: outputError } = await admin.storage
      .from("video-outputs")
      .upload(outputPath, await videoBlob.arrayBuffer(), {
        contentType: videoBlob.type || "video/mp4",
        upsert: true,
      });

    if (outputError) {
      throw new Error(`failed to upload generated video: ${outputError.message}`);
    }

    const { data: publicUrlData } = admin.storage.from("video-outputs").getPublicUrl(outputPath);
    const publicUrl = publicUrlData.publicUrl;

    await admin
      .from("video_jobs")
      .update({
        status: "completed",
        output_url: publicUrl,
        metadata: {
          source_paths: inputPaths,
          output_path: outputPath,
          style,
          format,
          requested_duration: requestedDuration,
          computed_duration: computedDuration,
          uploaded_images: photos.length,
          uploaded_images_accepted: uploadedPhotoCount,
          rendered_segments: renderedSegments,
          title,
          addon_type: addonType,
        },
      })
      .eq("id", videoJobId)
      .eq("workspace_id", workspaceId);

    await admin
      .from("video_job_segments")
      .update({ status: "completed", metadata: { final_output_path: outputPath } })
      .eq("video_job_id", videoJobId)
      .eq("workspace_id", workspaceId);

    return new Response(JSON.stringify({ success: true, videoUrl: publicUrl, outputPath, sourcePaths: inputPaths, computedDuration, renderedSegments, uploadedImages: photos.length, acceptedImages: uploadedPhotoCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-video error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
