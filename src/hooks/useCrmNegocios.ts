/**
 * useCrmNegocios.ts — React Query hooks para CRM Negocios
 * Conectado ao Supabase — tabela "crm_negocios".
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import type {
  CrmNegocio,
  CreateNegocioInput,
  UpdateNegocioInput,
  NegocioStatus,
  NegocioTipo,
} from "@/types/crm";
import { calcularValores } from "@/types/crm";

// ─── Row mapper ──────────────────────────────────────────────────────────────

function rowToNegocio(row: Record<string, unknown>): CrmNegocio {
  return {
    id: String(row.id),
    user_id: String(row.user_id ?? ""),
    workspace_id: String(row.workspace_id ?? ""),
    lead_id: row.lead_id as string | null,
    cliente_id: row.cliente_id as string | null,
    imovel_id: row.imovel_id as string | null,
    tipo: (row.tipo as CrmNegocio["tipo"]) ?? "venda",
    status: (row.status as CrmNegocio["status"]) ?? "em_andamento",
    valor_imovel: (row.valor_imovel as number) ?? 0,
    valor_negociado: (row.valor_negociado as number) ?? 0,
    percentual_comissao: (row.percentual_comissao as number) ?? 6,
    valor_comissao_bruta: (row.valor_comissao_bruta as number) ?? 0,
    percentual_repasse: (row.percentual_repasse as number) ?? 0,
    valor_repasse: (row.valor_repasse as number) ?? 0,
    valor_comissao_liquida: (row.valor_comissao_liquida as number) ?? 0,
    data_fechamento: row.data_fechamento as string | null,
    data_escritura: row.data_escritura as string | null,
    data_recebimento: row.data_recebimento as string | null,
    numero_contrato: String(row.numero_contrato ?? ""),
    observacoes: String(row.observacoes ?? ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

interface NegocioFiltros {
  clienteId?: string;
  status?: NegocioStatus;
  tipo?: NegocioTipo;
}

async function fetchNegocios(
  workspaceId: string,
  filtros?: NegocioFiltros
): Promise<CrmNegocio[]> {
  let query = supabase
    .from("crm_negocios")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (filtros?.clienteId) query = query.eq("cliente_id", filtros.clienteId);
  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToNegocio);
}

async function createNegocio(
  workspaceId: string,
  userId: string,
  input: CreateNegocioInput
): Promise<CrmNegocio> {
  const { bruta, repasse, liquida } = calcularValores(
    input.valor_negociado,
    input.percentual_comissao,
    input.percentual_repasse ?? 0
  );

  const { data, error } = await supabase
    .from("crm_negocios")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      lead_id: input.lead_id ?? null,
      cliente_id: input.cliente_id ?? null,
      imovel_id: input.imovel_id ?? null,
      tipo: input.tipo,
      status: "em_andamento",
      valor_imovel: input.valor_imovel,
      valor_negociado: input.valor_negociado,
      percentual_comissao: input.percentual_comissao,
      valor_comissao_bruta: bruta,
      percentual_repasse: input.percentual_repasse ?? 0,
      valor_repasse: repasse,
      valor_comissao_liquida: liquida,
      data_fechamento: input.data_fechamento ?? null,
      data_escritura: input.data_escritura ?? null,
      numero_contrato: input.numero_contrato ?? "",
      observacoes: input.observacoes ?? "",
    })
    .select()
    .single();
  if (error) throw error;

  const negocio = rowToNegocio(data);

  // Update cliente totals if linked
  if (input.cliente_id) {
    await updateClienteTotals(input.cliente_id);
  }

  return negocio;
}

async function updateNegocio(
  negocioId: string,
  input: UpdateNegocioInput,
  currentNegocio: CrmNegocio
): Promise<CrmNegocio> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const valorNeg = input.valor_negociado ?? currentNegocio.valor_negociado;
  const percCom = input.percentual_comissao ?? currentNegocio.percentual_comissao;
  const percRep = input.percentual_repasse ?? currentNegocio.percentual_repasse;

  if (input.valor_negociado !== undefined || input.percentual_comissao !== undefined || input.percentual_repasse !== undefined) {
    const { bruta, repasse, liquida } = calcularValores(valorNeg, percCom, percRep);
    updates.valor_comissao_bruta = bruta;
    updates.valor_repasse = repasse;
    updates.valor_comissao_liquida = liquida;
  }

  if (input.tipo !== undefined) updates.tipo = input.tipo;
  if (input.status !== undefined) updates.status = input.status;
  if (input.valor_imovel !== undefined) updates.valor_imovel = input.valor_imovel;
  if (input.valor_negociado !== undefined) updates.valor_negociado = input.valor_negociado;
  if (input.percentual_comissao !== undefined) updates.percentual_comissao = input.percentual_comissao;
  if (input.percentual_repasse !== undefined) updates.percentual_repasse = input.percentual_repasse;
  if (input.data_fechamento !== undefined) updates.data_fechamento = input.data_fechamento;
  if (input.data_escritura !== undefined) updates.data_escritura = input.data_escritura;
  if (input.data_recebimento !== undefined) updates.data_recebimento = input.data_recebimento;
  if (input.numero_contrato !== undefined) updates.numero_contrato = input.numero_contrato;
  if (input.observacoes !== undefined) updates.observacoes = input.observacoes;

  const { data, error } = await supabase
    .from("crm_negocios")
    .update(updates)
    .eq("id", negocioId)
    .select()
    .single();
  if (error) throw error;

  const negocio = rowToNegocio(data);

  // Update cliente totals
  if (currentNegocio.cliente_id) {
    await updateClienteTotals(currentNegocio.cliente_id);
  }

  return negocio;
}

/** Recalculate cliente totals from all their negocios */
async function updateClienteTotals(clienteId: string) {
  const { data } = await supabase
    .from("crm_negocios")
    .select("valor_comissao_liquida, status")
    .eq("cliente_id", clienteId);

  const negocios = data ?? [];
  const total_negocios = negocios.length;
  const valor_total_negocios = negocios
    .filter((n) => n.status === "fechado")
    .reduce((sum, n) => sum + ((n.valor_comissao_liquida as number) ?? 0), 0);

  await supabase
    .from("crm_clientes")
    .update({ total_negocios, valor_total_negocios, updated_at: new Date().toISOString() })
    .eq("id", clienteId);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useNegocios(filtros?: NegocioFiltros) {
  const { workspaceId } = useWorkspaceContext();
  return useQuery({
    queryKey: ["crm-negocios", workspaceId, filtros],
    queryFn: () => fetchNegocios(workspaceId as string, filtros),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}

export function useCreateNegocio() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateNegocioInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      return createNegocio(workspaceId as string, user?.id ?? "", input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-negocios", workspaceId] });
      qc.invalidateQueries({ queryKey: ["crm-clientes", workspaceId] });
      toast({ title: "Negocio criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar negocio", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateNegocio() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, currentNegocio, ...input }: UpdateNegocioInput & { id: string; currentNegocio: CrmNegocio }) =>
      updateNegocio(id, input, currentNegocio),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-negocios", workspaceId] });
      qc.invalidateQueries({ queryKey: ["crm-clientes", workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar negocio", description: err.message, variant: "destructive" });
    },
  });
}
