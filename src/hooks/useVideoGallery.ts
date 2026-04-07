/**
 * useVideoGallery.ts
 *
 * Hook para a galeria de vídeos do ImobCreator.
 *
 * Fonte de dados: `generated_assets` (asset_type = "video") + `generation_jobs`
 * (generation_type in video types).
 *
 * Retorna lista unificada com metadados do job (template, preset, mood, etc.)
 * já resolvidos para exibição na galeria.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type GenerationJobRow = Database["public"]["Tables"]["generation_jobs"]["Row"];
type GeneratedAssetRow = Database["public"]["Tables"]["generated_assets"]["Row"];

// ─── Video generation types that produce video assets ──────────────────────
const VIDEO_GENERATION_TYPES = [
  "video_compose",
  "video_compose_v2",
  "image_to_video",
];

// ─── Unified gallery item ──────────────────────────────────────────────────
export interface VideoGalleryItem {
  id: string;
  assetId: string;
  jobId: string;
  assetUrl: string;
  previewUrl: string | null;
  status: "pending" | "processing" | "done" | "error";
  generationType: string;
  templateId: string | null;
  templateName: string | null;
  presetId: string | null;
  moodId: string | null;
  style: string | null;
  format: string | null;
  aspectRatio: string | null;
  duration: number | null;
  propertyId: string | null;
  imageUrls: string[] | null;
  metadata: Record<string, unknown> | null;
  jobMetadata: Record<string, unknown> | null;
  createdAt: string;
}

function buildGalleryItem(
  asset: GeneratedAssetRow,
  job: GenerationJobRow | null
): VideoGalleryItem {
  const jobMeta = (job?.metadata ?? {}) as Record<string, unknown>;
  const assetMeta = (asset.metadata ?? {}) as Record<string, unknown>;

  return {
    id: asset.id,
    assetId: asset.id,
    jobId: asset.job_id,
    assetUrl: asset.asset_url,
    previewUrl: asset.preview_url ?? job?.preview_url ?? null,
    status: (job?.status as VideoGalleryItem["status"]) ?? "done",
    generationType: asset.generation_type ?? job?.generation_type ?? "video_compose_v2",
    templateId: asset.template_id ?? job?.template_id ?? null,
    templateName: job?.template_name ?? (jobMeta.template_name as string) ?? null,
    presetId: (jobMeta.visual_preset as string) ?? job?.style ?? null,
    moodId: (jobMeta.music_mood as string) ?? null,
    style: job?.style ?? null,
    format: asset.format ?? (jobMeta.format as string) ?? null,
    aspectRatio: job?.aspect_ratio ?? null,
    duration: (jobMeta.computed_duration_seconds as number) ?? (jobMeta.total_duration as number) ?? null,
    propertyId: asset.property_id ?? job?.property_id ?? null,
    imageUrls: job?.image_urls ?? null,
    metadata: assetMeta,
    jobMetadata: jobMeta,
    createdAt: asset.created_at ?? job?.created_at ?? new Date().toISOString(),
  };
}

// ─── Fetch video assets with their generation jobs ─────────────────────────

async function fetchVideoGallery(workspaceId: string): Promise<VideoGalleryItem[]> {
  // 1. Fetch video assets
  const { data: assets, error: assetsError } = await supabase
    .from("generated_assets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("asset_type", "video")
    .order("created_at", { ascending: false })
    .limit(100);

  if (assetsError) throw assetsError;
  if (!assets || assets.length === 0) {
    // Fallback: check generation_jobs with video types that are done but have result_url
    const { data: jobs, error: jobsError } = await supabase
      .from("generation_jobs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .in("generation_type", VIDEO_GENERATION_TYPES)
      .order("created_at", { ascending: false })
      .limit(100);

    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) return [];

    // Build items from jobs that have result_url
    return jobs
      .filter((j) => j.result_url || j.status === "processing" || j.status === "pending")
      .map((job) => ({
        id: job.id,
        assetId: job.id,
        jobId: job.id,
        assetUrl: job.result_url ?? "",
        previewUrl: job.preview_url ?? null,
        status: job.status as VideoGalleryItem["status"],
        generationType: job.generation_type,
        templateId: job.template_id ?? null,
        templateName: job.template_name ?? null,
        presetId: (job.metadata as Record<string, unknown>)?.visual_preset as string ?? job.style ?? null,
        moodId: (job.metadata as Record<string, unknown>)?.music_mood as string ?? null,
        style: job.style ?? null,
        format: (job.metadata as Record<string, unknown>)?.format as string ?? null,
        aspectRatio: job.aspect_ratio ?? null,
        duration: (job.metadata as Record<string, unknown>)?.computed_duration_seconds as number ?? null,
        propertyId: job.property_id ?? null,
        imageUrls: job.image_urls ?? null,
        metadata: null,
        jobMetadata: job.metadata as Record<string, unknown> ?? null,
        createdAt: job.created_at ?? new Date().toISOString(),
      }));
  }

  // 2. Collect unique job IDs
  const jobIds = [...new Set(assets.map((a) => a.job_id))];

  // 3. Fetch related generation jobs
  const { data: jobs, error: jobsError } = await supabase
    .from("generation_jobs")
    .select("*")
    .in("id", jobIds);

  if (jobsError) throw jobsError;

  const jobMap = new Map((jobs ?? []).map((j) => [j.id, j]));

  // 4. Also fetch processing/pending video jobs that don't have assets yet
  const { data: pendingJobs, error: pendingError } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .in("generation_type", VIDEO_GENERATION_TYPES)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(20);

  if (pendingError) throw pendingError;

  // 5. Build unified list
  const items: VideoGalleryItem[] = assets.map((asset) =>
    buildGalleryItem(asset, jobMap.get(asset.job_id) ?? null)
  );

  // Add pending jobs that don't have assets yet
  const existingJobIds = new Set(items.map((i) => i.jobId));
  for (const job of pendingJobs ?? []) {
    if (!existingJobIds.has(job.id)) {
      const meta = (job.metadata ?? {}) as Record<string, unknown>;
      items.push({
        id: job.id,
        assetId: job.id,
        jobId: job.id,
        assetUrl: job.result_url ?? "",
        previewUrl: job.preview_url ?? null,
        status: job.status as VideoGalleryItem["status"],
        generationType: job.generation_type,
        templateId: job.template_id ?? null,
        templateName: job.template_name ?? null,
        presetId: (meta.visual_preset as string) ?? job.style ?? null,
        moodId: (meta.music_mood as string) ?? null,
        style: job.style ?? null,
        format: (meta.format as string) ?? null,
        aspectRatio: job.aspect_ratio ?? null,
        duration: (meta.computed_duration_seconds as number) ?? null,
        propertyId: job.property_id ?? null,
        imageUrls: job.image_urls ?? null,
        metadata: null,
        jobMetadata: meta,
        createdAt: job.created_at ?? new Date().toISOString(),
      });
    }
  }

  // Sort by date descending
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return items;
}

// ─── Delete a video asset ──────────────────────────────────────────────────

async function deleteVideoAsset(assetId: string): Promise<void> {
  // Try deleting from generated_assets first
  const { error } = await supabase
    .from("generated_assets")
    .delete()
    .eq("id", assetId);

  // If no row was deleted (assetId might be a job id for pending items),
  // just silently succeed — the gallery will refresh anyway
  if (error) {
    console.warn("[useVideoGallery] deleteVideoAsset error:", error.message);
  }
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function useVideoGallery(workspaceId: string | null) {
  return useQuery({
    queryKey: ["video-gallery", workspaceId],
    queryFn: () => fetchVideoGallery(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 10_000,
    refetchInterval: 15_000, // Auto-refresh to catch processing → done transitions
  });
}

export function useDeleteVideoAsset(workspaceId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteVideoAsset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-gallery", workspaceId] });
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
    },
  });
}
