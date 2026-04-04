/**
 * usePlatformStats — fetches pre-aggregated platform counters from
 * the public `platform_stats` table (no auth required).
 * Falls back to seeded values if the query fails.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  creativesToday:       number;
  creativesTotal:       number;
  activeUsersToday:     number;
  propertiesProcessed:  number;
}

const FALLBACK: PlatformStats = {
  creativesToday:      284,
  creativesTotal:      18_430,
  activeUsersToday:    73,
  propertiesProcessed: 9_210,
};

export function usePlatformStats(): { stats: PlatformStats; loading: boolean } {
  const [stats,   setStats]   = useState<PlatformStats>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const { data, error } = await supabase
          .from("platform_stats")
          .select("key, value");

        if (error || !data) throw error ?? new Error("no data");

        const map: Record<string, number> = {};
        for (const row of data) map[row.key] = Number(row.value);

        if (!cancelled) {
          setStats({
            creativesToday:      map["creatives_today"]      ?? FALLBACK.creativesToday,
            creativesTotal:      map["creatives_total"]      ?? FALLBACK.creativesTotal,
            activeUsersToday:    map["active_users_today"]   ?? FALLBACK.activeUsersToday,
            propertiesProcessed: map["properties_processed"] ?? FALLBACK.propertiesProcessed,
          });
        }
      } catch {
        // silently fall back to seeded values
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return { stats, loading };
}
