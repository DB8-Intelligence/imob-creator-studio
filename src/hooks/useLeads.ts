/**
 * useLeads.ts — React Query hooks para o módulo de Leads (CRM)
 * Conectado ao Supabase — tabela "leads".
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import type {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
} from "@/types/lead";

// ─── Supabase row → Lead type mapper ────────────────────────────────────────

function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    user_id: String(row.assigned_to ?? row.created_by ?? ""),
    workspace_id: String(row.workspace_id),
    nome: String(row.name ?? ""),
    telefone: row.phone as string | null,
    email: row.email as string | null,
    status: (row.status as Lead["status"]) ?? "novo",
    interesse_tipo: (row.interesse_tipo as Lead["interesse_tipo"]) ?? "compra",
    imovel_interesse_id: row.imovel_interesse_id as string | null,
    imovel_interesse_nome: row.imovel_interesse_nome as string | null,
    valor_estimado: row.valor_estimado as number | null,
    fonte: (row.source as Lead["fonte"]) ?? "outro",
    temperatura: (row.temperatura as Lead["temperatura"]) ?? "morno",
    notas: row.notas as string | null,
    corretor_responsavel: row.corretor_responsavel as string | null,
    ultimo_contato: row.ultimo_contato as string | null,
    whatsapp_conversation_id: row.whatsapp_conversation_id as string | null,
    qualification_snapshot: (row.qualification_snapshot ?? null) as Lead["qualification_snapshot"],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

async function fetchLeads(workspaceId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToLead);
}

async function createLead(workspaceId: string, userId: string, input: CreateLeadInput): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: workspaceId,
      name: input.nome,
      phone: input.telefone ?? null,
      email: input.email ?? null,
      status: input.status ?? "novo",
      source: input.fonte,
      interesse_tipo: input.interesse_tipo,
      imovel_interesse_id: input.imovel_interesse_id ?? null,
      imovel_interesse_nome: input.imovel_interesse_nome ?? null,
      valor_estimado: input.valor_estimado ?? null,
      temperatura: input.temperatura ?? "morno",
      notas: input.notas ?? null,
      corretor_responsavel: input.corretor_responsavel ?? null,
      assigned_to: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToLead(data);
}

async function updateLead(leadId: string, input: UpdateLeadInput): Promise<Lead> {
  const updates: Record<string, unknown> = {};
  if (input.nome !== undefined) updates.name = input.nome;
  if (input.telefone !== undefined) updates.phone = input.telefone;
  if (input.email !== undefined) updates.email = input.email;
  if (input.status !== undefined) updates.status = input.status;
  if (input.interesse_tipo !== undefined) updates.interesse_tipo = input.interesse_tipo;
  if (input.imovel_interesse_id !== undefined) updates.imovel_interesse_id = input.imovel_interesse_id;
  if (input.imovel_interesse_nome !== undefined) updates.imovel_interesse_nome = input.imovel_interesse_nome;
  if (input.valor_estimado !== undefined) updates.valor_estimado = input.valor_estimado;
  if (input.fonte !== undefined) updates.source = input.fonte;
  if (input.temperatura !== undefined) updates.temperatura = input.temperatura;
  if (input.notas !== undefined) updates.notas = input.notas;
  if (input.corretor_responsavel !== undefined) updates.corretor_responsavel = input.corretor_responsavel;
  if (input.ultimo_contato !== undefined) updates.ultimo_contato = input.ultimo_contato;

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", leadId)
    .select()
    .single();
  if (error) throw error;
  return rowToLead(data);
}

async function deleteLead(leadId: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) throw error;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useLeads() {
  const { workspaceId } = useWorkspaceContext();
  return useQuery({
    queryKey: ["leads", workspaceId],
    queryFn: () => fetchLeads(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}

export function useCreateLead() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      return createLead(workspaceId as string, user?.id ?? "", input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", workspaceId] });
      toast({ title: "Lead criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar lead", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateLead() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateLeadInput & { id: string }) => updateLead(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar lead", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteLead() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", workspaceId] });
      toast({ title: "Lead excluído" });
    },
  });
}
