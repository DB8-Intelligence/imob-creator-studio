/**
 * useDashboardLayout — fetch/save do layout personalizado do dashboard.
 * Retorna layout efetivo (custom ou default), estado de loading e saveLayout().
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  type WidgetLayout,
} from "@/types/dashboard-layout";

interface UseDashboardLayoutResult {
  layout: WidgetLayout[];
  loading: boolean;
  saving: boolean;
  /** Persiste um novo layout no Supabase. */
  saveLayout: (next: WidgetLayout[]) => Promise<{ success: boolean; error?: string }>;
  /** Reseta pro default (deleta a linha). */
  resetLayout: () => Promise<{ success: boolean; error?: string }>;
}

export function useDashboardLayout(): UseDashboardLayoutResult {
  const { user } = useAuth();
  const [layout, setLayout] = useState<WidgetLayout[]>(DEFAULT_DASHBOARD_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLayout(DEFAULT_DASHBOARD_LAYOUT);
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
        setLayout(DEFAULT_DASHBOARD_LAYOUT);
      } else if (data?.layout && Array.isArray(data.layout) && data.layout.length > 0) {
        setLayout(data.layout as WidgetLayout[]);
      } else {
        setLayout(DEFAULT_DASHBOARD_LAYOUT);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const saveLayout = useCallback(
    async (next: WidgetLayout[]) => {
      if (!user?.id) return { success: false, error: "Sessão inválida" };
      setSaving(true);
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert(
          { user_id: user.id, layout: next },
          { onConflict: "user_id" }
        );
      setSaving(false);

      if (error) {
        return { success: false, error: error.message };
      }
      setLayout(next);
      return { success: true };
    },
    [user?.id]
  );

  const resetLayout = useCallback(async () => {
    if (!user?.id) return { success: false, error: "Sessão inválida" };
    setSaving(true);
    const { error } = await supabase
      .from("dashboard_layouts")
      .delete()
      .eq("user_id", user.id);
    setSaving(false);

    if (error) return { success: false, error: error.message };
    setLayout(DEFAULT_DASHBOARD_LAYOUT);
    return { success: true };
  }, [user?.id]);

  return { layout, loading, saving, saveLayout, resetLayout };
}
