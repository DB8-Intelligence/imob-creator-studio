import { supabase } from "@/integrations/supabase/client";
import type { CreateVideoJobInput, VideoJob, VideoModuleOverview, VideoPlanAddon } from "@/types/video";
import { getUploadSummary, getVideoPlanRule, resolveVideoPlanTier } from "@/lib/video-plan-rules";

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

export async function fetchVideoJobs(workspaceId: string): Promise<VideoJob[]> {
  const { data, error } = await supabase
    .from("video_jobs" as never)
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as any[]) ?? []).map(mapJob);
}

export async function fetchActiveVideoAddon(workspaceId: string): Promise<VideoPlanAddon | null> {
  const { data, error } = await supabase
    .from("video_plan_addons" as never)
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
  const { data, error } = await supabase.rpc("consume_video_credit" as never, {
    target_workspace_id: workspaceId,
  } as never);

  if (error) throw error;
  return mapAddon(data);
}

export async function releaseVideoCredit(workspaceId: string, creditAmount?: number): Promise<VideoPlanAddon> {
  const { data, error } = await supabase.rpc("release_video_credit" as never, {
    target_workspace_id: workspaceId,
    credit_amount: creditAmount ?? null,
  } as never);

  if (error) throw error;
  return mapAddon(data);
}

export async function activateVideoAddon(params: {
  workspaceId: string;
  addonType: "standard" | "plus" | "premium";
  billingCycle: "monthly" | "yearly";
}): Promise<VideoPlanAddon> {
  const { data, error } = await supabase.rpc("activate_video_addon" as never, {
    target_workspace_id: params.workspaceId,
    target_addon_type: params.addonType,
    target_billing_cycle: params.billingCycle,
  } as never);

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

  const creditCost = consumedAddon.credits_total === null ? 0 : planRule.creditCostPerVideo;

  try {
    const { data, error } = await supabase
      .from("video_jobs" as never)
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
        },
        created_by: userResult.data.user?.id ?? null,
      } as never)
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
  const payload: Record<string, unknown> = { status };
  if (outputUrl !== undefined) payload.output_url = outputUrl;

  const { data, error } = await supabase
    .from("video_jobs" as never)
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapJob(data);
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
