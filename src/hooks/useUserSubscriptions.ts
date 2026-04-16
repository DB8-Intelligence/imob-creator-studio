/**
 * useUserSubscriptions — Fetch active subscriptions + Supabase Realtime.
 * Re-fetches automatically when webhooks insert/update rows.
 */
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserSubscription {
  id: string;
  workspace_id: string;
  email: string;
  module_id: string;
  plan_slug: string;
  plan_name: string;
  credits_total: number;
  credits_used: number;
  max_users: number;
  status: string;
  activated_at: string | null;
  expires_at: string | null;
}

const SUBS_KEY = ["user-subscriptions"];

export function useUserSubscriptions() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: SUBS_KEY,
    queryFn: async (): Promise<UserSubscription[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id, workspace_id, email, module_id, plan_slug, plan_name, credits_total, credits_used, max_users, status, activated_at, expires_at")
        .eq("email", user.email!)
        .eq("status", "active")
        .order("activated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserSubscription[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Realtime: re-fetch quando webhook insere/atualiza subscriptions
  useEffect(() => {
    if (!user?.email) return;
    const channel = supabase
      .channel("user-subs-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_subscriptions",
          filter: `email=eq.${user.email}`,
        },
        () => qc.invalidateQueries({ queryKey: SUBS_KEY }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.email, qc]);

  const activeModules = query.data ?? [];
  const hasModule = (moduleId: string) => activeModules.some((s) => s.module_id === moduleId);

  return { subscriptions: activeModules, hasModule, ...query };
}
