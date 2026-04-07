/**
 * useActivationMetrics — Hook para métricas de ativação (DEV-34 / P4)
 *
 * Calcula:
 *  - Tempo médio até primeira geração
 *  - Taxa de ativação (% de usuários que completaram core steps)
 *  - Funnel por etapa do wizard
 *  - Total de usuários no onboarding vs ativados
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivationMetrics {
  totalUsers: number;
  wizardStarted: number;
  propertyUploaded: number;
  creativeGenerated: number;
  fullyActivated: number;
  activationRate: number;               // 0–100
  avgTimeToFirstGenMs: number | null;   // average milliseconds from signup to first generation
  avgTimeToFirstGenLabel: string;       // human-readable
}

async function fetchActivationMetrics(): Promise<ActivationMetrics> {
  // Use count queries instead of fetching full rows
  const [
    { count: totalUsers },
    { count: wizardStarted },
    { count: fullyActivated },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("onboarding_progress").select("*", { count: "exact", head: true }).not("wizard_started_at", "is", null),
    supabase.from("onboarding_progress").select("*", { count: "exact", head: true }).not("activated_at", "is", null),
  ]);

  // Only fetch rows needed for time calculation (small subset)
  const { data: timeData } = await supabase
    .from("onboarding_progress")
    .select("steps_done, wizard_started_at, first_generation_at")
    .not("wizard_started_at", "is", null);

  const records = timeData ?? [];

  const propertyUploaded = records.filter((r) =>
    (r.steps_done as string[])?.includes("property_uploaded")
  ).length;
  const creativeGenerated = records.filter((r) =>
    (r.steps_done as string[])?.includes("creative_generated")
  ).length;

  // Average time to first generation
  const timeDiffs: number[] = [];
  for (const r of records) {
    if (r.wizard_started_at && r.first_generation_at) {
      const start = new Date(r.wizard_started_at).getTime();
      const end = new Date(r.first_generation_at).getTime();
      if (end > start) timeDiffs.push(end - start);
    }
  }

  const avgTimeToFirstGenMs = timeDiffs.length > 0
    ? timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
    : null;

  const total = totalUsers ?? 0;

  return {
    totalUsers: total,
    wizardStarted,
    propertyUploaded,
    creativeGenerated,
    fullyActivated,
    activationRate: total > 0 ? Math.round((fullyActivated / total) * 100) : 0,
    avgTimeToFirstGenMs,
    avgTimeToFirstGenLabel: formatDuration(avgTimeToFirstGenMs),
  };
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

export function useActivationMetrics() {
  return useQuery({
    queryKey: ["activation-metrics"],
    queryFn: fetchActivationMetrics,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
