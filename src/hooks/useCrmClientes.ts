/**
 * useCrmClientes.ts — React Query hooks para CRM Clientes
 * Conectado ao Supabase — tabela "crm_clientes".
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import type {
  CrmCliente,
  CreateClienteInput,
  UpdateClienteInput,
  ClienteTipo,
} from "@/types/crm";

// ─── Row mapper ──────────────────────────────────────────────────────────────

function rowToCliente(row: Record<string, unknown>): CrmCliente {
  return {
    id: String(row.id),
    user_id: String(row.user_id ?? ""),
    workspace_id: String(row.workspace_id ?? ""),
    lead_id: row.lead_id as string | null,
    nome: String(row.nome ?? ""),
    cpf: String(row.cpf ?? ""),
    rg: String(row.rg ?? ""),
    data_nascimento: row.data_nascimento as string | null,
    email: String(row.email ?? ""),
    telefone: String(row.telefone ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    profissao: String(row.profissao ?? ""),
    estado_civil: String(row.estado_civil ?? ""),
    endereco_completo: String(row.endereco_completo ?? ""),
    tipo: (row.tipo as CrmCliente["tipo"]) ?? "comprador",
    imoveis_interesse: (row.imoveis_interesse as string[]) ?? [],
    orcamento_min: row.orcamento_min as number | null,
    orcamento_max: row.orcamento_max as number | null,
    bairros: (row.bairros as string[]) ?? [],
    total_negocios: (row.total_negocios as number) ?? 0,
    valor_total_negocios: (row.valor_total_negocios as number) ?? 0,
    foto_url: String(row.foto_url ?? ""),
    observacoes: String(row.observacoes ?? ""),
    tags: (row.tags as string[]) ?? [],
    ativo: row.ativo !== false,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

async function fetchClientes(
  workspaceId: string,
  search?: string,
  tipo?: ClienteTipo | null
): Promise<CrmCliente[]> {
  let query = supabase
    .from("crm_clientes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (tipo) {
    query = query.eq("tipo", tipo);
  }
  if (search && search.trim()) {
    query = query.or(`nome.ilike.%${search}%,cpf.ilike.%${search}%,email.ilike.%${search}%,telefone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToCliente);
}

async function createCliente(
  workspaceId: string,
  userId: string,
  input: CreateClienteInput
): Promise<CrmCliente> {
  const { data, error } = await supabase
    .from("crm_clientes")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      nome: input.nome,
      cpf: input.cpf ?? "",
      rg: input.rg ?? "",
      data_nascimento: input.data_nascimento ?? null,
      email: input.email ?? "",
      telefone: input.telefone ?? "",
      whatsapp: input.whatsapp ?? "",
      profissao: input.profissao ?? "",
      estado_civil: input.estado_civil ?? "",
      endereco_completo: input.endereco_completo ?? "",
      tipo: input.tipo,
      imoveis_interesse: input.imoveis_interesse ?? [],
      orcamento_min: input.orcamento_min ?? null,
      orcamento_max: input.orcamento_max ?? null,
      bairros: input.bairros ?? [],
      foto_url: input.foto_url ?? "",
      observacoes: input.observacoes ?? "",
      tags: input.tags ?? [],
      lead_id: input.lead_id ?? null,
      ativo: true,
      total_negocios: 0,
      valor_total_negocios: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCliente(data);
}

async function updateCliente(
  clienteId: string,
  input: UpdateClienteInput
): Promise<CrmCliente> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.nome !== undefined) updates.nome = input.nome;
  if (input.cpf !== undefined) updates.cpf = input.cpf;
  if (input.rg !== undefined) updates.rg = input.rg;
  if (input.data_nascimento !== undefined) updates.data_nascimento = input.data_nascimento;
  if (input.email !== undefined) updates.email = input.email;
  if (input.telefone !== undefined) updates.telefone = input.telefone;
  if (input.whatsapp !== undefined) updates.whatsapp = input.whatsapp;
  if (input.profissao !== undefined) updates.profissao = input.profissao;
  if (input.estado_civil !== undefined) updates.estado_civil = input.estado_civil;
  if (input.endereco_completo !== undefined) updates.endereco_completo = input.endereco_completo;
  if (input.tipo !== undefined) updates.tipo = input.tipo;
  if (input.imoveis_interesse !== undefined) updates.imoveis_interesse = input.imoveis_interesse;
  if (input.orcamento_min !== undefined) updates.orcamento_min = input.orcamento_min;
  if (input.orcamento_max !== undefined) updates.orcamento_max = input.orcamento_max;
  if (input.bairros !== undefined) updates.bairros = input.bairros;
  if (input.foto_url !== undefined) updates.foto_url = input.foto_url;
  if (input.observacoes !== undefined) updates.observacoes = input.observacoes;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.ativo !== undefined) updates.ativo = input.ativo;
  if (input.total_negocios !== undefined) updates.total_negocios = input.total_negocios;
  if (input.valor_total_negocios !== undefined) updates.valor_total_negocios = input.valor_total_negocios;

  const { data, error } = await supabase
    .from("crm_clientes")
    .update(updates)
    .eq("id", clienteId)
    .select()
    .single();
  if (error) throw error;
  return rowToCliente(data);
}

async function softDeleteCliente(clienteId: string): Promise<void> {
  const { error } = await supabase
    .from("crm_clientes")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq("id", clienteId);
  if (error) throw error;
}

async function convertLeadToCliente(
  workspaceId: string,
  userId: string,
  leadId: string,
  leadData: { nome: string; telefone?: string | null; email?: string | null }
): Promise<CrmCliente> {
  // Create the cliente
  const cliente = await createCliente(workspaceId, userId, {
    nome: leadData.nome,
    telefone: leadData.telefone ?? "",
    email: leadData.email ?? "",
    whatsapp: leadData.telefone ?? "",
    tipo: "comprador",
    lead_id: leadId,
  });

  // Link lead to cliente
  await supabase
    .from("leads")
    .update({ cliente_id: cliente.id })
    .eq("id", leadId);

  return cliente;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useClientes(search?: string, tipo?: ClienteTipo | null) {
  const { workspaceId } = useWorkspaceContext();
  return useQuery({
    queryKey: ["crm-clientes", workspaceId, search, tipo],
    queryFn: () => fetchClientes(workspaceId as string, search, tipo),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}

export function useCreateCliente() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateClienteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      return createCliente(workspaceId as string, user?.id ?? "", input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-clientes", workspaceId] });
      toast({ title: "Cliente criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar cliente", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateCliente() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateClienteInput & { id: string }) => updateCliente(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-clientes", workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar cliente", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteCliente() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: softDeleteCliente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-clientes", workspaceId] });
      toast({ title: "Cliente desativado" });
    },
  });
}

export function useConvertLeadToCliente() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: { id: string; nome: string; telefone?: string | null; email?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      return convertLeadToCliente(workspaceId as string, user?.id ?? "", lead.id, lead);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-clientes", workspaceId] });
      qc.invalidateQueries({ queryKey: ["leads", workspaceId] });
      toast({ title: "Lead convertido em cliente!" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao converter lead", description: err.message, variant: "destructive" });
    },
  });
}
