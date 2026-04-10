/**
 * useLeadActivities.ts — Hook para timeline de atividades do lead
 * Conectado ao Supabase — tabela "lead_activities".
 * Supabase Realtime para updates em tempo real (WhatsApp, etc).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { LeadActivity, CreateLeadActivityInput } from "@/types/lead";

// ─── Row mapper ──────────────────────────────────────────────────────────────

function rowToActivity(row: Record<string, unknown>): LeadActivity {
  return {
    id: String(row.id),
    lead_id: String(row.lead_id),
    tipo: String(row.tipo) as LeadActivity["tipo"],
    descricao: row.descricao as string | null,
    resultado: row.resultado as string | null,
    proximo_passo: row.proximo_passo as string | null,
    metadata: row.metadata as Record<string, unknown> | null,
    usuario_id: String(row.usuario_id ?? ""),
    usuario_nome: String(row.usuario_nome ?? "Sistema"),
    created_at: String(row.created_at),
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

async function fetchLeadActivities(leadId: string): Promise<LeadActivity[]> {
  const { data, error } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToActivity);
}

async function createLeadActivity(leadId: string, input: CreateLeadActivityInput): Promise<LeadActivity> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: leadId,
      tipo: input.tipo,
      descricao: input.descricao,
      resultado: input.resultado ?? null,
      proximo_passo: input.proximo_passo ?? null,
      usuario_id: user?.id ?? null,
      usuario_nome: user?.user_metadata?.full_name ?? "Você",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToActivity(data);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useLeadActivities(leadId: string | null, _leadCreatedAt?: string) {
  return useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => fetchLeadActivities(leadId as string),
    enabled: Boolean(leadId),
    staleTime: 10_000,
  });
}

export function useCreateLeadActivity(leadId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLeadActivityInput) => createLeadActivity(leadId as string, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead-activities", leadId] });
    },
  });
}

/**
 * Realtime subscription for new activities (e.g. WhatsApp messages).
 * Call in the page component to auto-refresh when new rows arrive.
 */
export function useLeadActivitiesRealtime(leadId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!leadId) return;

    const channel = supabase
      .channel(`lead_activities_${leadId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "lead_activities",
        filter: `lead_id=eq.${leadId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["lead-activities", leadId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [leadId, qc]);
}
