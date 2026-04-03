// Attribution Queries — reads user_events to compute acquisition attribution metrics.
// Groups acquisition events by UTM fields stored in the event metadata JSON.

import { supabase } from "@/integrations/supabase/client";

export interface AttributionRow {
  key:   string;
  count: number;
}

export interface AttributionMetrics {
  // First-touch dimensions
  by_source:   AttributionRow[];
  by_medium:   AttributionRow[];
  by_campaign: AttributionRow[];
  by_landing:  AttributionRow[];
  // Last-touch dimensions (lt_ prefix in metadata)
  lt_by_source:   AttributionRow[];
  lt_by_medium:   AttributionRow[];
  lt_by_campaign: AttributionRow[];
  lt_by_landing:  AttributionRow[];
  total_signups: number;
  tracked_pct:   number; // % of signups that had UTM data
}

type RawEvent = {
  metadata: Record<string, string | null> | null;
};

function groupBy(events: RawEvent[], field: string): AttributionRow[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    const val = e.metadata?.[field];
    if (val) counts[val] = (counts[val] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchAttributionMetrics(): Promise<AttributionMetrics> {
  const { data, error } = await supabase
    .from("user_events")
    .select("metadata")
    .eq("event_type", "signup");

  if (error) throw new Error(error.message);

  const events = (data ?? []) as RawEvent[];
  const total  = events.length;
  const tracked = events.filter((e) => e.metadata?.utm_source).length;

  return {
    by_source:      groupBy(events, "utm_source"),
    by_medium:      groupBy(events, "utm_medium"),
    by_campaign:    groupBy(events, "utm_campaign"),
    by_landing:     groupBy(events, "landing_page"),
    lt_by_source:   groupBy(events, "lt_utm_source"),
    lt_by_medium:   groupBy(events, "lt_utm_medium"),
    lt_by_campaign: groupBy(events, "lt_utm_campaign"),
    lt_by_landing:  groupBy(events, "lt_landing_page"),
    total_signups:  total,
    tracked_pct:    total > 0 ? Math.round((tracked / total) * 100) : 0,
  };
}

// ─── Feature usage query ──────────────────────────────────────────────────────

export interface FeatureUsageRow {
  event_type: string;
  last_7d:    number;
  last_30d:   number;
}

export async function fetchFeatureUsage(workspaceId?: string): Promise<FeatureUsageRow[]> {
  const now      = new Date();
  const d7  = new Date(now.getTime() - 7  * 86400_000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 86400_000).toISOString();

  let query = supabase
    .from("user_events")
    .select("event_type, created_at")
    .eq("category", "usage");

  if (workspaceId) query = query.eq("workspace_id", workspaceId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const counts: Record<string, { last_7d: number; last_30d: number }> = {};

  for (const r of rows) {
    const ts = r.created_at as string;
    const et = r.event_type as string;
    if (!counts[et]) counts[et] = { last_7d: 0, last_30d: 0 };
    if (ts >= d30) counts[et].last_30d++;
    if (ts >= d7)  counts[et].last_7d++;
  }

  return Object.entries(counts).map(([event_type, c]) => ({
    event_type,
    ...c,
  }));
}

// ─── Dashboard KPI query ─────────────────────────────────────────────────────

export interface AnalyticsKpis {
  signups_30d:      number;
  active_users_7d:  number;
  events_total:     number;
  top_feature:      string | null;
}

export async function fetchAnalyticsKpis(): Promise<AnalyticsKpis> {
  const d30 = new Date(Date.now() - 30 * 86400_000).toISOString();
  const d7  = new Date(Date.now() -  7 * 86400_000).toISOString();

  const [signupsRes, activeRes, totalRes] = await Promise.all([
    supabase.from("user_events").select("id", { count: "exact", head: true })
      .eq("event_type", "signup").gte("created_at", d30),
    supabase.from("user_events").select("user_id")
      .gte("created_at", d7),
    supabase.from("user_events").select("id", { count: "exact", head: true }),
  ]);

  const activeSet = new Set((activeRes.data ?? []).map((r: { user_id: string }) => r.user_id));

  // Top feature by last-30d usage
  const featRes = await supabase
    .from("user_events")
    .select("event_type")
    .eq("category", "usage")
    .gte("created_at", d30);

  const featureCounts: Record<string, number> = {};
  for (const r of (featRes.data ?? [])) {
    featureCounts[r.event_type as string] = (featureCounts[r.event_type as string] ?? 0) + 1;
  }
  const topFeature = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    signups_30d:     signupsRes.count ?? 0,
    active_users_7d: activeSet.size,
    events_total:    totalRes.count ?? 0,
    top_feature:     topFeature,
  };
}
