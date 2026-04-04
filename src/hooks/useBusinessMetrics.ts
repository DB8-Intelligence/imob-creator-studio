/**
 * useBusinessMetrics — loads MRR + financial config from Supabase,
 * computes monthly timeline and health summary.
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchMrrHistory,
  fetchFinancialConfig,
  buildMonthlyMetrics,
  buildHealthSummary,
  evaluateScalingRules,
  getOverallScalingSignal,
  type MonthlyMetrics,
  type SaasHealthSummary,
  type ScalingEvaluation,
  type ScalingSignal,
} from "@/lib/businessMetrics";

export interface UseBusinessMetricsResult {
  monthly:       MonthlyMetrics[];
  health:        SaasHealthSummary;
  scalingEvals:  ScalingEvaluation[];
  overallSignal: ScalingSignal;
  isLoading:     boolean;
  error:         Error | null;
}

const EMPTY_HEALTH: SaasHealthSummary = {
  currentMrr: 0, arr: 0, arpu: 0, cac: 0, ltv: 0,
  ltvCacRatio: 0, paybackMonths: 0, churnRate: 0,
  monthlyGrowth: 0, totalAdSpend: 0, activePaid: 0,
};

export function useBusinessMetrics(): UseBusinessMetricsResult {
  const { data: snapshots = [], isLoading: snapLoading, error: snapErr } = useQuery({
    queryKey: ["mrr-snapshots"],
    queryFn:  fetchMrrHistory,
    staleTime: 5 * 60_000,
  });

  const { data: configs = [], isLoading: cfgLoading, error: cfgErr } = useQuery({
    queryKey: ["financial-config"],
    queryFn:  fetchFinancialConfig,
    staleTime: 5 * 60_000,
  });

  const isLoading = snapLoading || cfgLoading;
  const error     = (snapErr || cfgErr) as Error | null;

  const monthly      = buildMonthlyMetrics(snapshots, configs);
  const health       = snapshots.length ? buildHealthSummary(snapshots, configs) : EMPTY_HEALTH;
  const scalingEvals = evaluateScalingRules(health);
  const overallSignal = getOverallScalingSignal(scalingEvals);

  return { monthly, health, scalingEvals, overallSignal, isLoading, error };
}
