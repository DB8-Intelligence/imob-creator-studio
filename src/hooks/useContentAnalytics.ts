/**
 * useContentAnalytics.ts — Hook de analytics do ciclo de conteúdo (DEV-31)
 *
 * Fontes:
 * - generated_assets (conteúdos gerados)
 * - generation_jobs (status de geração, templates, presets)
 * - publication_queue (publicados, erros, agendados por canal)
 * - publication_logs (tentativas, respostas)
 * - automation_logs (execuções automáticas)
 *
 * Retorna KPIs, métricas por canal, métricas por template/preset.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  ContentKPIs,
  ChannelMetric,
  TemplateMetric,
  PresetMetric,
  AnalyticsPeriod,
} from "@/types/content-analytics";
import { PUBLICATION_CHANNELS } from "@/types/publication";

function periodToDate(period: AnalyticsPeriod): string | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function fetchAnalytics(workspaceId: string, period: AnalyticsPeriod) {
  const since = periodToDate(period);

  // ── 1. generated_assets ─────────────────────────────────────────────
  let assetQuery = supabase
    .from("generated_assets")
    .select("id, asset_type, generation_type, template_id, created_at")
    .eq("workspace_id", workspaceId);
  if (since) assetQuery = assetQuery.gte("created_at", since);
  const { data: assets } = await assetQuery.limit(500);

  // ── 2. generation_jobs (for template/preset/mood stats) ─────────────
  let jobQuery = supabase
    .from("generation_jobs")
    .select("id, status, generation_type, template_id, template_name, style, metadata, error_message, created_at")
    .eq("workspace_id", workspaceId);
  if (since) jobQuery = jobQuery.gte("created_at", since);
  const { data: jobs } = await jobQuery.limit(500);

  // ── 3. publication_queue ────────────────────────────────────────────
  let pubQuery = supabase
    .from("publication_queue")
    .select("id, channel, status, created_at")
    .eq("workspace_id", workspaceId);
  if (since) pubQuery = pubQuery.gte("created_at", since);
  const { data: pubs } = await pubQuery.limit(500);

  // ── 4. automation_logs ──────────────────────────────────────────────
  let autoQuery = supabase
    .from("automation_logs")
    .select("id, status, created_at");
  if (since) autoQuery = autoQuery.gte("created_at", since);
  const { data: autoLogs } = await autoQuery.limit(200);

  // ── Compute KPIs ───────────────────────────────────────────────────
  const allAssets = assets ?? [];
  const allJobs = jobs ?? [];
  const allPubs = pubs ?? [];
  const allAuto = autoLogs ?? [];

  const VIDEO_TYPES = ["video_compose", "video_compose_v2", "image_to_video"];
  const TEXT_TYPES = ["gerar_descricao"];

  const videoCount = allAssets.filter((a) => a.asset_type === "video" || (a.generation_type && VIDEO_TYPES.includes(a.generation_type))).length;
  const textCount = allAssets.filter((a) => a.generation_type && TEXT_TYPES.includes(a.generation_type)).length;
  const postCount = allAssets.length - videoCount - textCount;

  const totalGenerated = allAssets.length;
  const totalPublished = allPubs.filter((p) => p.status === "published").length;
  const totalErrors = allJobs.filter((j) => j.status === "error").length + allPubs.filter((p) => p.status === "error").length;
  const totalAutomations = allAuto.filter((a) => a.status === "success").length;
  const publishRate = totalGenerated > 0 ? Math.round((totalPublished / totalGenerated) * 100) : 0;

  const kpis: ContentKPIs = {
    totalGenerated,
    totalPublished,
    totalErrors,
    totalAutomations,
    videoCount,
    postCount,
    textCount,
    publishRate,
  };

  // ── Channel metrics ────────────────────────────────────────────────
  const channelMetrics: ChannelMetric[] = PUBLICATION_CHANNELS.map((ch) => {
    const items = allPubs.filter((p) => p.channel === ch.id);
    return {
      channel: ch.id,
      label: ch.label,
      icon: ch.icon,
      published: items.filter((p) => p.status === "published").length,
      errors: items.filter((p) => p.status === "error").length,
      queued: items.filter((p) => p.status === "queued" || p.status === "publishing").length,
    };
  }).filter((m) => m.published > 0 || m.errors > 0 || m.queued > 0);

  // ── Template metrics ───────────────────────────────────────────────
  const templateMap = new Map<string, { name: string; count: number; errorCount: number }>();
  for (const job of allJobs) {
    const tid = job.template_id ?? job.template_name ?? "unknown";
    const name = job.template_name ?? tid;
    const existing = templateMap.get(tid) ?? { name, count: 0, errorCount: 0 };
    existing.count++;
    if (job.status === "error") existing.errorCount++;
    templateMap.set(tid, existing);
  }
  const templateMetrics: TemplateMetric[] = [...templateMap.entries()]
    .map(([id, v]) => ({ id, name: v.name, count: v.count, errorCount: v.errorCount, errorRate: v.count > 0 ? Math.round((v.errorCount / v.count) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Preset metrics ─────────────────────────────────────────────────
  const presetMap = new Map<string, number>();
  for (const job of allJobs) {
    const meta = (job.metadata ?? {}) as Record<string, unknown>;
    const preset = (meta.visual_preset as string) ?? job.style;
    if (preset) presetMap.set(preset, (presetMap.get(preset) ?? 0) + 1);
  }
  const presetMetrics: PresetMetric[] = [...presetMap.entries()]
    .map(([id, count]) => ({ id, name: id, count }))
    .sort((a, b) => b.count - a.count);

  // ── Mood metrics (reuse PresetMetric type) ─────────────────────────
  const moodMap = new Map<string, number>();
  for (const job of allJobs) {
    const meta = (job.metadata ?? {}) as Record<string, unknown>;
    const mood = meta.music_mood as string;
    if (mood) moodMap.set(mood, (moodMap.get(mood) ?? 0) + 1);
  }
  const moodMetrics: PresetMetric[] = [...moodMap.entries()]
    .map(([id, count]) => ({ id, name: id, count }))
    .sort((a, b) => b.count - a.count);

  return { kpis, channelMetrics, templateMetrics, presetMetrics, moodMetrics };
}

export function useContentAnalytics(workspaceId: string | null, period: AnalyticsPeriod = "30d") {
  return useQuery({
    queryKey: ["content-analytics", workspaceId, period],
    queryFn: () => fetchAnalytics(workspaceId as string, period),
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
  });
}
