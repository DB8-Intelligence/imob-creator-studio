/**
 * useContentAutomation.ts — Hook para automação de conteúdo (DEV-26 / QA-26B)
 *
 * CRUD de automation_rules + listagem de automation_logs.
 * Integração real com Supabase via @tanstack/react-query.
 */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type {
  AutomationRule,
  AutomationLog,
  AutomationRuleInput,
} from "@/types/automation";

export function useContentAutomation(workspaceId: string | null) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Query: automation_rules ────────────────────────────────────────
  const {
    data: rules = [],
    isLoading: isLoadingRules,
    error: rulesError,
  } = useQuery<AutomationRule[]>({
    queryKey: ["automation-rules", workspaceId],
    enabled: !!workspaceId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("id, user_id, workspace_id, name, generation_type, template_id, preset, mood, engine_id, frequency, property_id, is_active, created_at, updated_at")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as AutomationRule[];
    },
    staleTime: 15_000,
  });

  // ── Query: automation_logs (todas do workspace) ────────────────────
  const ruleIds = rules.map((r) => r.id);

  const {
    data: logs = [],
    isLoading: isLoadingLogs,
  } = useQuery<AutomationLog[]>({
    queryKey: ["automation-logs", ruleIds],
    enabled: ruleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_logs")
        .select("id, automation_id, status, asset_id, job_id, error, created_at")
        .in("automation_id", ruleIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as AutomationLog[];
    },
    staleTime: 10_000,
  });

  // ── Realtime: automation_logs updates ─────────────────────────────
  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`automation-rt-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "automation_logs",
        },
        (payload) => {
          // Only invalidate if the log belongs to one of our rules
          const logAutomationId = (payload.new as Record<string, unknown>)?.automation_id as string;
          if (logAutomationId && ruleIds.includes(logAutomationId)) {
            queryClient.invalidateQueries({ queryKey: ["automation-logs", ruleIds] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, ruleIds, queryClient]);

  // ── Derived ────────────────────────────────────────────────────────
  const activeCount = rules.filter((r) => r.is_active).length;

  function getLogsForRule(automationId: string): AutomationLog[] {
    return logs.filter((l) => l.automation_id === automationId);
  }

  // ── Mutation: toggle is_active ─────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const rule = rules.find((r) => r.id === id);
      if (!rule) throw new Error("Rule not found");
      const { error } = await supabase
        .from("automation_rules")
        .update({ is_active: !rule.is_active })
        .eq("id", id);
      if (error) throw error;
      return { name: rule.name, newState: !rule.is_active };
    },
    onSuccess: ({ name, newState }) => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules", workspaceId] });
      toast({ title: `${name} ${newState ? "ativada" : "desativada"}` });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao alterar automação", description: err.message, variant: "destructive" });
    },
  });

  // ── Mutation: create rule ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (input: AutomationRuleInput) => {
      const { data, error } = await supabase
        .from("automation_rules")
        .insert({
          user_id: user!.id,
          workspace_id: workspaceId!,
          name: input.name,
          generation_type: input.generation_type,
          frequency: input.frequency,
          property_id: input.property_id ?? null,
          template_id: input.template_id ?? null,
          preset: input.preset ?? null,
          mood: input.mood ?? null,
          engine_id: input.engine_id ?? null,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules", workspaceId] });
      toast({ title: `Automação "${input.name}" criada` });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar automação", description: err.message, variant: "destructive" });
    },
  });

  // ── Mutation: delete rule ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("automation_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["automation-logs"] });
      toast({ title: "Automação excluída" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir automação", description: err.message, variant: "destructive" });
    },
  });

  return {
    rules,
    logs,
    activeCount,
    isLoading: isLoadingRules || isLoadingLogs,
    error: rulesError,
    toggleRule: (id: string) => toggleMutation.mutate(id),
    createRule: (input: AutomationRuleInput) => createMutation.mutate(input),
    deleteRule: (id: string) => deleteMutation.mutate(id),
    getLogsForRule,
    isCreating: createMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
}
