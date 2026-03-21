import { supabase } from "@/integrations/supabase/client";
import type { CreateVideoJobInput, VideoJob, VideoModuleOverview, VideoPlanAddon } from "@/types/video";

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

export async function createVideoJob(input: CreateVideoJobInput): Promise<VideoJob> {
  const userResult = await supabase.auth.getUser();
  if (userResult.error) throw userResult.error;

  const { data, error } = await supabase
    .from("video_jobs" as never)
    .insert({
      workspace_id: input.workspaceId,
      property_id: input.propertyId ?? null,
      title: input.title,
      style: input.style,
      format: input.format,
      duration_seconds: input.durationSeconds,
      resolution: input.resolution ?? "4K Ultra HD",
      status: "queued",
      photos_count: input.photosCount,
      credits_used: input.photosCount > 0 ? 5 : 0,
      metadata: input.metadata ?? null,
      created_by: userResult.data.user?.id ?? null,
    } as never)
    .select("*")
    .single();

  if (error) throw error;
  return mapJob(data);
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
