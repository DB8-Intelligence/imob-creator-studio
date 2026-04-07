/**
 * useMediaLibrary.ts — Hook unificado da Biblioteca de Mídia (DEV-24)
 *
 * Fonte única: generated_assets (image, video, post) + creatives (legado).
 * Retorna lista normalizada de MediaItem com filtros aplicáveis.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { MediaItem, MediaType, MediaStatus } from "@/types/media-library";

type GeneratedAssetRow = Database["public"]["Tables"]["generated_assets"]["Row"];
type CreativeRow = Database["public"]["Tables"]["creatives"]["Row"];
type GenerationJobRow = Database["public"]["Tables"]["generation_jobs"]["Row"];

// ─── Resolvers ────────────────────────────────────────────────────────────

function assetTypeToMediaType(assetType: string | null): MediaType {
  if (assetType === "video") return "video";
  if (assetType === "post" || assetType === "creative") return "post";
  return "image"; // default: image
}

function jobStatusToMediaStatus(status: string | null): MediaStatus {
  switch (status) {
    case "done":
    case "completed":
      return "done";
    case "processing":
      return "processing";
    case "pending":
      return "pending";
    case "error":
    case "failed":
      return "error";
    default:
      return "done";
  }
}

function creativeStatusToMediaStatus(status: string | null): MediaStatus {
  if (status === "published" || status === "exported") return "done";
  if (status === "draft") return "draft";
  if (status === "scheduled") return "done";
  return "done";
}

function resolveAssetName(asset: GeneratedAssetRow, job: GenerationJobRow | null): string {
  const meta = (asset.metadata ?? {}) as Record<string, unknown>;
  if (meta.name && typeof meta.name === "string") return meta.name;
  if (job?.template_name) return job.template_name;
  const ext = asset.asset_type === "video" ? ".mp4" : ".png";
  const typeLabel = asset.asset_type ?? "asset";
  return `${typeLabel}-${asset.id.slice(0, 8)}${ext}`;
}

function buildMediaItemFromAsset(
  asset: GeneratedAssetRow,
  job: GenerationJobRow | null
): MediaItem {
  const jobMeta = (job?.metadata ?? {}) as Record<string, unknown>;
  return {
    id: asset.id,
    source: "asset",
    sourceId: asset.id,
    type: assetTypeToMediaType(asset.asset_type),
    name: resolveAssetName(asset, job),
    url: asset.asset_url,
    previewUrl: asset.preview_url ?? job?.preview_url ?? null,
    status: job ? jobStatusToMediaStatus(job.status) : "done",
    format: asset.format ?? (jobMeta.format as string) ?? null,
    generationType: asset.generation_type ?? job?.generation_type ?? null,
    templateId: asset.template_id ?? job?.template_id ?? null,
    templateName: job?.template_name ?? null,
    presetId: (jobMeta.visual_preset as string) ?? job?.style ?? null,
    moodId: (jobMeta.music_mood as string) ?? null,
    engineId: asset.engine_id ?? job?.engine_id ?? null,
    aspectRatio: job?.aspect_ratio ?? null,
    propertyId: asset.property_id ?? job?.property_id ?? null,
    fileSizeBytes: asset.file_size_bytes ?? null,
    width: asset.width ?? null,
    height: asset.height ?? null,
    metadata: (asset.metadata ?? jobMeta) as Record<string, unknown> | null,
    jobId: asset.job_id,
    createdAt: asset.created_at ?? new Date().toISOString(),
  };
}

function buildMediaItemFromCreative(creative: CreativeRow): MediaItem {
  return {
    id: `creative-${creative.id}`,
    source: "creative",
    sourceId: creative.id,
    type: "post",
    name: creative.name || `Post ${creative.id.slice(0, 8)}`,
    url: creative.exported_url ?? "",
    previewUrl: creative.exported_url ?? null,
    status: creativeStatusToMediaStatus(creative.status),
    format: creative.format,
    generationType: null,
    templateId: null,
    templateName: null,
    presetId: null,
    moodId: null,
    engineId: null,
    aspectRatio: null,
    propertyId: creative.property_id ?? null,
    fileSizeBytes: null,
    width: null,
    height: null,
    metadata: (creative.content_data ?? null) as Record<string, unknown> | null,
    jobId: null,
    createdAt: creative.created_at,
  };
}

// ─── Fetch ────────────────────────────────────────────────────────────────

async function fetchMediaLibrary(workspaceId: string): Promise<MediaItem[]> {
  // 1. Fetch all generated_assets (images + videos + posts)
  const { data: assets, error: assetsErr } = await supabase
    .from("generated_assets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (assetsErr) throw assetsErr;

  // 2. Fetch related generation_jobs for asset metadata
  const jobIds = [...new Set((assets ?? []).map((a) => a.job_id))];
  let jobMap = new Map<string, GenerationJobRow>();

  if (jobIds.length > 0) {
    const { data: jobs } = await supabase
      .from("generation_jobs")
      .select("*")
      .in("id", jobIds);
    jobMap = new Map((jobs ?? []).map((j) => [j.id, j]));
  }

  // 3. Build MediaItems from assets
  const items: MediaItem[] = (assets ?? []).map((asset) =>
    buildMediaItemFromAsset(asset, jobMap.get(asset.job_id) ?? null)
  );

  // 4. Fetch creatives (legacy posts) that have exported_url
  const { data: creatives } = await supabase
    .from("creatives")
    .select("*")
    .eq("workspace_id", workspaceId)
    .not("exported_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  for (const creative of creatives ?? []) {
    items.push(buildMediaItemFromCreative(creative));
  }

  // 5. Add pending/processing jobs without assets yet
  const { data: pendingJobs } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(20);

  const existingJobIds = new Set(items.map((i) => i.jobId));
  for (const job of pendingJobs ?? []) {
    if (!existingJobIds.has(job.id)) {
      const meta = (job.metadata ?? {}) as Record<string, unknown>;
      const isVideo = ["video_compose", "video_compose_v2", "image_to_video"].includes(job.generation_type);
      items.push({
        id: `job-${job.id}`,
        source: "asset",
        sourceId: job.id,
        type: isVideo ? "video" : "image",
        name: job.template_name ?? `${job.generation_type}-${job.id.slice(0, 8)}`,
        url: job.result_url ?? "",
        previewUrl: job.preview_url ?? null,
        status: jobStatusToMediaStatus(job.status),
        format: (meta.format as string) ?? null,
        generationType: job.generation_type,
        templateId: job.template_id ?? null,
        templateName: job.template_name ?? null,
        presetId: (meta.visual_preset as string) ?? job.style ?? null,
        moodId: (meta.music_mood as string) ?? null,
        engineId: job.engine_id,
        aspectRatio: job.aspect_ratio ?? null,
        propertyId: job.property_id ?? null,
        fileSizeBytes: null,
        width: null,
        height: null,
        metadata: meta,
        jobId: job.id,
        createdAt: job.created_at ?? new Date().toISOString(),
      });
    }
  }

  // Sort by date descending
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}

// ─── Delete ───────────────────────────────────────────────────────────────

async function deleteMediaItem(item: MediaItem): Promise<void> {
  if (item.source === "creative") {
    const { error } = await supabase
      .from("creatives")
      .delete()
      .eq("id", item.sourceId);
    if (error) console.warn("[useMediaLibrary] delete creative:", error.message);
  } else {
    const { error } = await supabase
      .from("generated_assets")
      .delete()
      .eq("id", item.sourceId);
    if (error) console.warn("[useMediaLibrary] delete asset:", error.message);
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────

export function useMediaLibrary(workspaceId: string | null) {
  return useQuery({
    queryKey: ["media-library", workspaceId],
    queryFn: () => fetchMediaLibrary(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
    refetchInterval: 20_000,
  });
}

export function useDeleteMediaItem(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMediaItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-library", workspaceId] });
      qc.invalidateQueries({ queryKey: ["video-gallery", workspaceId] });
    },
  });
}
