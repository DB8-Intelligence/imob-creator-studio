/**
 * useAppointments.ts — React Query hooks para Atendimentos / Agendamentos
 * Conectado ao Supabase — tabela "appointments".
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/types/appointment";

// ─── Row mapper ──────────────────────────────────────────────────────────────

function rowToAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: String(row.id),
    user_id: String(row.corretor_responsavel ?? ""),
    workspace_id: String(row.workspace_id),
    lead_id: String(row.lead_id ?? ""),
    lead_nome: String(row.lead_nome ?? ""),
    lead_telefone: row.lead_telefone as string | null,
    property_id: row.property_id as string | null,
    property_nome: row.property_nome as string | null,
    property_endereco: row.property_endereco as string | null,
    data_hora: String(row.scheduled_at ?? row.created_at),
    duracao: (row.duracao as Appointment["duracao"]) ?? "1h",
    tipo: (row.tipo as Appointment["tipo"]) ?? "visita_presencial",
    status: (row.status as Appointment["status"]) ?? "agendado",
    resultado: row.resultado as Appointment["resultado"],
    proximo_passo: row.proximo_passo as Appointment["proximo_passo"],
    corretor_responsavel: row.corretor_responsavel as string | null,
    notas: row.notas as string | null,
    observacoes_pos_visita: row.observacoes_pos_visita as string | null,
    enviar_confirmacao: (row.enviar_confirmacao as boolean) ?? true,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

async function fetchAppointments(workspaceId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToAppointment);
}

async function createAppointment(workspaceId: string, input: CreateAppointmentInput): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      workspace_id: workspaceId,
      title: `${input.tipo} — ${input.lead_nome}`,
      scheduled_at: input.data_hora,
      lead_id: input.lead_id,
      lead_nome: input.lead_nome,
      lead_telefone: input.lead_telefone ?? null,
      property_id: input.property_id ?? null,
      property_nome: input.property_nome ?? null,
      property_endereco: input.property_endereco ?? null,
      duracao: input.duracao,
      tipo: input.tipo,
      status: "agendado",
      corretor_responsavel: input.corretor_responsavel ?? null,
      notas: input.notas ?? null,
      enviar_confirmacao: input.enviar_confirmacao ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToAppointment(data);
}

async function updateAppointment(aptId: string, input: UpdateAppointmentInput): Promise<Appointment> {
  const updates: Record<string, unknown> = {};
  if (input.data_hora !== undefined) updates.scheduled_at = input.data_hora;
  if (input.status !== undefined) updates.status = input.status;
  if (input.resultado !== undefined) updates.resultado = input.resultado;
  if (input.proximo_passo !== undefined) updates.proximo_passo = input.proximo_passo;
  if (input.notas !== undefined) updates.notas = input.notas;
  if (input.observacoes_pos_visita !== undefined) updates.observacoes_pos_visita = input.observacoes_pos_visita;
  if (input.tipo !== undefined) updates.tipo = input.tipo;
  if (input.duracao !== undefined) updates.duracao = input.duracao;

  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", aptId)
    .select()
    .single();
  if (error) throw error;
  return rowToAppointment(data);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAppointments() {
  const { workspaceId } = useWorkspaceContext();
  return useQuery({
    queryKey: ["appointments", workspaceId],
    queryFn: () => fetchAppointments(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}

export function useCreateAppointment() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointment(workspaceId as string, input),
    onSuccess: (apt) => {
      qc.invalidateQueries({ queryKey: ["appointments", workspaceId] });
      toast({ title: "Agendamento criado", description: `${apt.lead_nome} — ${new Date(apt.data_hora).toLocaleDateString("pt-BR")}` });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao agendar", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateAppointment() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateAppointmentInput & { id: string }) => updateAppointment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments", workspaceId] });
    },
  });
}
