/**
 * useDashboardLayout — fetch/save do layout personalizado do dashboard.
 * Suporta layouts por breakpoint (lg/md/sm).
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_DASHBOARD_LAYOUTS,
  normalizeDashboardLayouts,
  type DashboardLayouts,
} from "@/types/dashboard-layout";

interface UseDashboardLayoutResult {
  layouts: DashboardLayouts;
  loading: boolean;
  saving: boolean;
  saveLayouts: (next: DashboardLayouts) => Promise<{ success: boolean; error?: string }>;
  resetLayouts: () => Promise<{ success: boolean; error?: string }>;
}

export function useDashboardLayout(): UseDashboardLayoutResult {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<DashboardLayouts>(DEFAULT_DASHBOARD_LAYOUTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLayouts(DEFAULT_DASHBOARD_LAYOUTS);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("dashboard_layout_fetch_failed", error);
        setLayouts(DEFAULT_DASHBOARD_LAYOUTS);
      } else {
        setLayouts(normalizeDashboardLayouts(data?.layout));
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const saveLayouts = useCallback(
    async (next: DashboardLayouts) => {
      if (!user?.id) return { success: false, error: "Sessão inválida" };
      setSaving(true);
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert(
          { user_id: user.id, layout: next },
          { onConflict: "user_id" }
        );
      setSaving(false);

      if (error) return { success: false, error: error.message };
      setLayouts(next);
      return { success: true };
    },
    [user?.id]
  );

  const resetLayouts = useCallback(async () => {
    if (!user?.id) return { success: false, error: "Sessão inválida" };
    setSaving(true);
    const { error } = await supabase
      .from("dashboard_layouts")
      .delete()
      .eq("user_id", user.id);
    setSaving(false);

    if (error) return { success: false, error: error.message };
    setLayouts(DEFAULT_DASHBOARD_LAYOUTS);
    return { success: true };
  }, [user?.id]);

  return { layouts, loading, saving, saveLayouts, resetLayouts };
}
