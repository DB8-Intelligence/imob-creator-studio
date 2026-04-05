import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { CreateVideoJobInput, CreateVideoJobSegmentsInput, VideoJob, VideoJobSegment, VideoModuleOverview, VideoPlanAddon } from "@/types/video";
import { getUploadSummary, getVideoPlanRule, resolveVideoPlanTier } from "@/lib/video-plan-rules";
import { getDefaultVideoMotionPreset, getVideoMotionPresetConfig } from "@/lib/video-motion-presets";

function mapJob(row: any): VideoJob {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    property_id: row.property_id,
    title: row.title,
    style: row.style,
    format: row.format,
    duration_seconds: row.duration_seconds,
    resolution: row.resolution,
    status: row.status,
    photos_count: row.photos_count ?? 0,
    credits_used: row.credits_used ?? 0,
    output_url: row.output_url,
    thumbnail_url: row.thumbnail_url,
    metadata: row.metadata ?? null,
    created_by: row.created_by ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapAddon(row: any): VideoPlanAddon {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    addon_type: row.addon_type,
    billing_cycle: row.billing_cycle,
    credits_total: row.credits_total,
    credits_used: row.credits_used ?? 0,
    status: row.status,
    expires_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapSegment(row: any): VideoJobSegment {
  return {
    id: row.id,
    video_job_id: row.video_job_id,
    workspace_id: row.workspace_id,
    sequence_index: row.sequence_index,
    source_image_path: row.source_image_path ?? null,
    source_image_name: row.source_image_name ?? null,
    clip_duration_seconds: row.clip_duration_seconds ?? 5,
    status: row.status,
    output_clip_url: row.output_clip_url ?? null,
    provider: row.provider ?? null,
    provider_job_id: row.provider_job_id ?? null,
    metadata: row.metadata ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function fetchVideoJobs(workspaceId: string): Promise<VideoJob[]> {
  const { data, error } = await supabase
    .from("video_jobs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as any[]) ?? []).map(mapJob);
}

export async function fetchActiveVideoAddon(workspaceId: string): Promise<VideoPlanAddon | null> {
  const { data, error } = await supabase
    .from("video_plan_addons")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAddon(data) : null;
}

export async function fetchVideoModuleOverview(workspaceId: string): Promise<VideoModuleOverview> {
  const [jobs, addOn] = await Promise.all([
    fetchVideoJobs(workspaceId),
    fetchActiveVideoAddon(workspaceId),
  ]);

  return { jobs, addOn };
}

export async function consumeVideoCredit(workspaceId: string): Promise<VideoPlanAddon> {
  const { data, error } = await supabase.rpc("consume_video_credit", {
    target_workspace_id: workspaceId,
  });

  if (error) throw error;
  return mapAddon(data);
}

export async function releaseVideoCredit(workspaceId: string, creditAmount?: number): Promise<VideoPlanAddon> {
  const { data, error } = await supabase.rpc("release_video_credit", {
    target_workspace_id: workspaceId,
    credit_amount: creditAmount ?? null,
  });

  if (error) throw error;
  return mapAddon(data);
}

export async function activateVideoAddon(params: {
  workspaceId: string;
  addonType: "standard" | "plus" | "premium";
  billingCycle: "monthly" | "yearly";
}): Promise<VideoPlanAddon> {
  const { data, error } = await supabase.rpc("activate_video_addon", {
    target_workspace_id: params.workspaceId,
    target_addon_type: params.addonType,
    target_billing_cycle: params.billingCycle,
  });

  if (error) throw error;
  return mapAddon(data);
}

export async function createVideoJob(input: CreateVideoJobInput): Promise<VideoJob> {
  const userResult = await supabase.auth.getUser();
  if (userResult.error) throw userResult.error;

  const consumedAddon = await consumeVideoCredit(input.workspaceId);
  const planTier = resolveVideoPlanTier(consumedAddon.addon_type);
  const planRule = getVideoPlanRule(planTier);
  const uploadSummary = getUploadSummary(input.photosCount, planTier);
  const motionPreset = input.motionPreset ?? getDefaultVideoMotionPreset();
  const motionPresetConfig = getVideoMotionPresetConfig(motionPreset);

  const creditCost = consumedAddon.credits_total === null ? 0 : planRule.creditCostPerVideo;

  try {
    const { data, error } = await supabase
      .from("video_jobs")
      .insert({
        workspace_id: input.workspaceId,
        property_id: input.propertyId ?? null,
        title: input.title,
        style: input.style,
        format: input.format,
        duration_seconds: uploadSummary.computedDurationSeconds,
        resolution: input.resolution ?? planRule.resolution,
        status: "queued",
        photos_count: input.photosCount,
        credits_used: creditCost,
        metadata: {
          ...(input.metadata ?? {}),
          consumed_addon_type: consumedAddon.addon_type,
          billing_cycle: consumedAddon.billing_cycle,
          credit_cost: creditCost,
          max_upload_images: planRule.maxUploadImages,
          max_rendered_segments: planRule.maxRenderedSegments,
          seconds_per_image: planRule.secondsPerImage,
          computed_duration_seconds: uploadSummary.computedDurationSeconds,
          rendered_segments: uploadSummary.renderedSegments,
          ignored_images: uploadSummary.ignoredImages,
          has_optimization: uploadSummary.hasOptimization,
          motion_preset: motionPreset,
          motion_preset_config: motionPresetConfig,
        },
        created_by: userResult.data.user?.id ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapJob(data);
  } catch (error) {
    await releaseVideoCredit(input.workspaceId, creditCost);
    throw error;
  }
}

export async function updateVideoJobStatus(id: string, status: VideoJob["status"], outputUrl?: string | null) {
  const payload: Database["public"]["Tables"]["video_jobs"]["Update"] = { status };
  if (outputUrl !== undefined) payload.output_url = outputUrl;

  const { data, error } = await supabase
    .from("video_jobs")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapJob(data);
}

export async function createVideoJobSegments(input: CreateVideoJobSegmentsInput): Promise<VideoJobSegment[]> {
  const rows = input.imageNames.slice(0, input.renderedSegments).map((imageName, index) => ({
    video_job_id: input.videoJobId,
    workspace_id: input.workspaceId,
    sequence_index: index,
    source_image_name: imageName,
    source_image_path: input.sourcePaths?.[index] ?? null,
    clip_duration_seconds: 5,
    status: "pending",
    metadata: {
      segment_kind: "image_to_clip",
      source_index: index,
      motion_preset: getDefaultVideoMotionPreset(),
    },
  }));

  if (!rows.length) return [];

  const { data, error } = await supabase
    .from("video_job_segments")
    .insert(rows)
    .select("*");

  if (error) throw error;
  return ((data as any[]) ?? []).map(mapSegment);
}

export async function updateVideoJobSegmentsStatus(params: {
  videoJobId: string;
  status: "pending" | "queued" | "processing" | "completed" | "failed" | "skipped";
  outputClipUrl?: string | null;
}) {
  const payload: Database["public"]["Tables"]["video_job_segments"]["Update"] = { status: params.status };
  if (params.outputClipUrl !== undefined) payload.output_clip_url = params.outputClipUrl;

  const { data, error } = await supabase
    .from("video_job_segments")
    .update(payload)
    .eq("video_job_id", params.videoJobId)
    .select("*");

  if (error) throw error;
  return ((data as any[]) ?? []).map(mapSegment);
}

export async function renderVideoJob(params: {
  workspaceId: string;
  videoJobId: string;
  title: string;
  style: string;
  format: string;
  duration: string;
  photos: File[];
  addonType?: string;
}) {
  const formData = new FormData();
  formData.append("workspaceId", params.workspaceId);
  formData.append("videoJobId", params.videoJobId);
  formData.append("title", params.title);
  formData.append("style", params.style);
  formData.append("format", params.format);
  formData.append("duration", params.duration);
  if (params.addonType) formData.append("addonType", params.addonType);
  params.photos.forEach((file) => formData.append("photos", file));

  const { data, error } = await supabase.functions.invoke("generate-video", {
    body: formData,
  });

  if (error) throw error;
  return data as { success: boolean; videoUrl: string; outputPath: string; sourcePaths: string[] };
}

// ── Video v2 Pipeline (FFmpeg Ken Burns) ─────────────────────────────────────

/**
 * Upload photos to Supabase Storage and invoke generate-video-v2 (FFmpeg pipeline).
 *
 * Flow:
 * 1. Upload each photo to `video-assets/{workspaceId}/{jobId}/inputs/`
 * 2. Collect public URLs
 * 3. POST to generate-video-v2 with FFmpegJobSpec-compatible payload
 * 4. Returns immediately with { job_id, status: "processing" }
 *    (backend calls generation-callback when done)
 */
export async function renderVideoJobV2(params: {
  workspaceId: string;
  videoJobId: string;
  title: string;
  style: string;
  format: string;
  photos: File[];
  addonType?: string;
  property?: {
    address?: string;
    price?: string;
    details?: string;
    broker_name?: string;
    broker_phone?: string;
  };
  audioMood?: string;
}) {
  const {
    workspaceId,
    videoJobId,
    photos,
    style,
    format,
    addonType = "standard",
    property,
    audioMood,
  } = params;

  // 1. Upload photos to storage, collect public URLs
  const photoUrls: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const file = photos[i];
    const ext = file.name.split(".").pop() ?? "jpg";
    const filePath = `${workspaceId}/${videoJobId}/inputs/${String(i + 1).padStart(2, "0")}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("video-assets")
      .upload(filePath, file, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Falha ao fazer upload da foto ${i + 1}: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("video-assets")
      .getPublicUrl(filePath);

    photoUrls.push(urlData.publicUrl);
  }

  // 2. Map format to aspect ratio
  const aspectMap: Record<string, string> = {
    reels: "9:16",
    feed: "1:1",
    youtube: "16:9",
  };

  // 3. Map style to motion preset
  const styleToPreset: Record<string, string> = {
    cinematic: "default",
    moderno: "fast_sales",
    luxury: "luxury",
    drone: "default",
    walkthrough: "default",
  };

  // 4. Invoke generate-video-v2
  const { data, error } = await supabase.functions.invoke("generate-video-v2", {
    body: {
      workspace_id: workspaceId,
      video_job_id: videoJobId,
      photo_urls: photoUrls,
      motion_preset: styleToPreset[style] ?? "default",
      aspect_ratio: aspectMap[format] ?? "9:16",
      resolution: addonType === "premium" ? "1080p" : addonType === "plus" ? "1080p" : "720p",
      property: property ?? undefined,
      audio: audioMood ? { mood: audioMood } : undefined,
      plan_tier: addonType,
    },
  });

  if (error) throw error;

  return data as {
    job_id: string;          // generation_jobs ID (for pollJobUntilDone)
    video_job_id: string;    // video_jobs ID
    status: string;
    pipeline_version: string;
    total_clips: number;
    total_duration: number;
    output_dimensions: { w: number; h: number };
    motion_preset: string;
  };
}

/**
 * Gera um clip de vídeo a partir de uma única imagem usando Veo 3.1 (Gemini API).
 * Endpoint assíncrono: retorna operationName para polling.
 * @deprecated Prefer renderVideoJobV2 (FFmpeg pipeline) for production use.
 */
export async function generateVideoClipFromImage(params: {
  imageBase64: string;
  style: "cinematic" | "moderno" | "luxury" | "drone" | "walkthrough";
  aspectRatio: "16:9" | "9:16" | "1:1";
  workspaceId: string;
  jobId?: string;
  segmentIndex?: number;
}) {
  const { data, error } = await supabase.functions.invoke("image-to-video", {
    body: {
      imageBase64: params.imageBase64,
      style: params.style,
      aspectRatio: params.aspectRatio,
      workspaceId: params.workspaceId,
      jobId: params.jobId,
      segmentIndex: params.segmentIndex,
    },
  });

  if (error) throw error;
  return data as {
    success: boolean;
    status: "completed" | "processing";
    videoUrl?: string;
    operationName?: string;
    style: string;
    message?: string;
  };
}
