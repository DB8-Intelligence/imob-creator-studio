// React Query wrappers for analytics data

import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsKpis,
  fetchFeatureUsage,
  fetchAttributionMetrics,
  type AnalyticsKpis,
  type FeatureUsageRow,
  type AttributionMetrics,
} from "@/services/analytics/attributionQueries";

export function useAnalyticsKpis() {
  return useQuery<AnalyticsKpis>({
    queryKey: ["analytics", "kpis"],
    queryFn:  fetchAnalyticsKpis,
    staleTime: 5 * 60_000,
  });
}

export function useFeatureUsage(workspaceId?: string) {
  return useQuery<FeatureUsageRow[]>({
    queryKey: ["analytics", "feature-usage", workspaceId],
    queryFn:  () => fetchFeatureUsage(workspaceId),
    staleTime: 5 * 60_000,
  });
}

export function useAttributionMetrics() {
  return useQuery<AttributionMetrics>({
    queryKey: ["analytics", "attribution"],
    queryFn:  fetchAttributionMetrics,
    staleTime: 5 * 60_000,
  });
}
