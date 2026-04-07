/**
 * useContentFeed.ts — Hook unificado do feed de conteúdo (DEV-27)
 *
 * Fontes:
 * - generated_assets + generation_jobs (manual + automation)
 * - automation_logs (para enriquecer origem)
 * - creatives com scheduled_at (agendados)
 *
 * Retorna lista normalizada de ContentFeedItem para feed e calendário.
 */
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ContentFeedItem, ContentStatus, ContentType, ContentOrigin } from "@/types/content-feed";

type GeneratedAssetRow = Database["public"]["Tables"]["generated_assets"]["Row"];
type GenerationJobRow = Database["public"]["Tables"]["generation_jobs"]["Row"];
type CreativeRow = Database["public"]["Tables"]["creatives"]["Row"];

// ─── Resolvers ────────────────────────────────────────────────────────────

const VIDEO_TYPES = ["video_compose", "video_compose_v2", "image_to_video"];
const TEXT_TYPES = ["gerar_descricao"];

function resolveContentType(genType: string | null, assetType: string | null): ContentType {
  if (genType && VIDEO_TYPES.includes(genType)) return "video";
  if (genType && TEXT_TYPES.includes(genType)) return "text";
  if (assetType === "video") return "video";
  return "post";
}

function resolveStatus(jobStatus: string | null, hasUrl: boolean): ContentStatus {
  switch (jobStatus) {
    case "done":
    case "completed":
      return hasUrl ? "done" : "ready_to_publish";
    case "processing":
      return "processing";
    case "pending":
      return "scheduled";
    case "error":
    case "failed":
      return "error";
    default:
      return hasUrl ? "done" : "scheduled";
  }
}

function resolveCreativeStatus(status: string | null, scheduledAt: string | null): ContentStatus {
  if (status === "published" || status === "exported") return "done";
  if (scheduledAt && new Date(scheduledAt) > new Date()) return "scheduled";
  if (status === "draft") return "ready_to_publish";
  return "done";
}

// ─── Fetch ────────────────────────────────────────────────────────────────

async function fetchContentFeed(workspaceId: string): Promise<ContentFeedItem[]> {
  const items: ContentFeedItem[] = [];

  // 1. Fetch generated_assets (specific columns)
  const { data: assets, error: assetsErr } = await supabase
    .from("generated_assets")
    .select("id, job_id, asset_url, preview_url, asset_type, generation_type, template_id, property_id, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (assetsErr) throw assetsErr;

  // 2. Fetch related generation_jobs (specific columns, batched)
  const jobIds = [...new Set((assets ?? []).map((a) => a.job_id))];
  let jobMap = new Map<string, GenerationJobRow>();

  if (jobIds.length > 0) {
    const { data: jobs, error: jobsErr } = await supabase
      .from("generation_jobs")
      .select("id, status, generation_type, template_id, template_name, property_id, style, result_url, preview_url, error_message, metadata, created_at")
      .in("id", jobIds);
    if (jobsErr) throw jobsErr;
    jobMap = new Map((jobs ?? []).map((j) => [j.id, j]));
  }

  // 3. Build items from assets + jobs
  for (const asset of assets ?? []) {
    const job = jobMap.get(asset.job_id) ?? null;
    const jobMeta = (job?.metadata ?? {}) as Record<string, unknown>;
    const isAutomation = Boolean(jobMeta.automation);

    items.push({
      id: asset.id,
      type: resolveContentType(asset.generation_type ?? job?.generation_type, asset.asset_type),
      origin: isAutomation ? "automation" : "manual",
      status: resolveStatus(job?.status, Boolean(asset.asset_url)),
      name: job?.template_name ?? `${asset.asset_type ?? "asset"}-${asset.id.slice(0, 8)}`,
      templateId: asset.template_id ?? job?.template_id ?? null,
      templateName: job?.template_name ?? null,
      presetId: (jobMeta.visual_preset as string) ?? job?.style ?? null,
      generationType: asset.generation_type ?? job?.generation_type ?? null,
      propertyId: asset.property_id ?? job?.property_id ?? null,
      url: asset.asset_url,
      previewUrl: asset.preview_url ?? job?.preview_url ?? null,
      platform: null,
      automationId: isAutomation ? (jobMeta.automation_id as string) ?? null : null,
      automationName: null,
      scheduledAt: null,
      createdAt: asset.created_at ?? new Date().toISOString(),
      error: job?.error_message ?? null,
      publicationStatus: null,
      publicationChannel: null,
    });
  }

  // 4. Add pending/processing jobs without assets (specific columns)
  const { data: pendingJobs, error: pendingErr } = await supabase
    .from("generation_jobs")
    .select("id, status, generation_type, template_id, template_name, property_id, style, result_url, preview_url, error_message, metadata, created_at")
    .eq("workspace_id", workspaceId)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(30);
  if (pendingErr) throw pendingErr;

  // O(1) lookup: collect job_ids directly from assets
  const existingJobIds = new Set((assets ?? []).map((a) => a.job_id));

  for (const job of pendingJobs ?? []) {
    if (existingJobIds.has(job.id)) continue;
    const meta = (job.metadata ?? {}) as Record<string, unknown>;
    const isAutomation = Boolean(meta.automation);

    items.push({
      id: `job-${job.id}`,
      type: resolveContentType(job.generation_type, null),
      origin: isAutomation ? "automation" : "manual",
      status: resolveStatus(job.status, Boolean(job.result_url)),
      name: job.template_name ?? `${job.generation_type}-${job.id.slice(0, 8)}`,
      templateId: job.template_id ?? null,
      templateName: job.template_name ?? null,
      presetId: (meta.visual_preset as string) ?? job.style ?? null,
      generationType: job.generation_type,
      propertyId: job.property_id ?? null,
      url: job.result_url ?? null,
      previewUrl: job.preview_url ?? null,
      platform: null,
      automationId: isAutomation ? (meta.automation_id as string) ?? null : null,
      automationName: null,
      scheduledAt: null,
      createdAt: job.created_at ?? new Date().toISOString(),
      error: job.error_message ?? null,
    });
  }

  // 5. Fetch creatives (specific columns)
  const { data: creatives, error: creativesErr } = await supabase
    .from("creatives")
    .select("id, name, status, format, property_id, exported_url, scheduled_at, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (creativesErr) throw creativesErr;

  for (const c of creatives ?? []) {
    items.push({
      id: `creative-${c.id}`,
      type: "post",
      origin: "manual",
      status: resolveCreativeStatus(c.status, c.scheduled_at),
      name: c.name || `Post ${c.id.slice(0, 8)}`,
      templateId: null,
      templateName: null,
      presetId: null,
      generationType: null,
      propertyId: c.property_id ?? null,
      url: c.exported_url ?? null,
      previewUrl: c.exported_url ?? null,
      platform: c.format ?? null,
      automationId: null,
      automationName: null,
      scheduledAt: c.scheduled_at ?? null,
      createdAt: c.created_at,
      error: null,
      publicationStatus: null,
      publicationChannel: null,
    });
  }

  // 6. Enrich with publication_queue status (DEV-29B)
  const { data: pubQueue, error: pubErr } = await supabase
    .from("publication_queue")
    .select("id, asset_id, content_feed_id, channel, status, scheduled_at")
    .eq("workspace_id", workspaceId)
    .in("status", ["queued", "publishing", "published", "error"])
    .order("created_at", { ascending: false })
    .limit(200);
  if (pubErr) throw pubErr;

  if (pubQueue && pubQueue.length > 0) {
    // Build lookup: asset_id or content_feed_id → pub status
    const pubMap = new Map<string, { status: string; channel: string; scheduledAt: string | null }>();
    for (const pq of pubQueue) {
      const key = pq.asset_id ?? pq.content_feed_id;
      if (key && !pubMap.has(key)) {
        pubMap.set(key, { status: pq.status, channel: pq.channel, scheduledAt: pq.scheduled_at });
      }
    }

    // Enrich existing items
    for (const item of items) {
      const pub = pubMap.get(item.id) ?? pubMap.get(item.id.replace("creative-", "")) ?? pubMap.get(item.id.replace("job-", ""));
      if (pub) {
        item.publicationStatus = pub.status;
        item.publicationChannel = pub.channel;
        // If published, override scheduledAt for calendar display
        if (pub.scheduledAt && !item.scheduledAt) {
          item.scheduledAt = pub.scheduledAt;
        }
      }
    }
  }

  // Sort by most recent
  items.sort((a, b) => {
    const dateA = a.scheduledAt ?? a.createdAt;
    const dateB = b.scheduledAt ?? b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return items;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useContentFeed(workspaceId: string | null) {
  const qc = useQueryClient();

  // Realtime: invalidate feed when generation_jobs change (new job done, status update)
  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`content-feed-rt-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "generation_jobs",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["content-feed", workspaceId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "generated_assets",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["content-feed", workspaceId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, qc]);

  return useQuery({
    queryKey: ["content-feed", workspaceId],
    queryFn: () => fetchContentFeed(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
