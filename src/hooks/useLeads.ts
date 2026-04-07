/**
 * useLeads.ts — React Query hooks para o módulo de Leads
 *
 * Padrão: Supabase direct queries + React Query.
 * Tabela: "leads" (será criada via migration quando necessário).
 *
 * Enquanto a tabela não existe no Supabase, usa dados mockados
 * para permitir desenvolvimento do frontend.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import type {
  Lead,
  LeadStatus,
  CreateLeadInput,
  UpdateLeadInput,
} from "@/types/lead";

// ─── Mock data (usado enquanto tabela não existe) ──────────────────────────

const MOCK_LEADS: Lead[] = [
  {
    id: "1", user_id: "u1", workspace_id: "w1", nome: "Carlos Mendes", telefone: "(11) 99999-1234", email: "carlos@email.com",
    status: "novo", interesse_tipo: "compra", imovel_interesse_id: null, imovel_interesse_nome: "Apt Vila Mariana 3Q",
    valor_estimado: 850000, fonte: "instagram", temperatura: "quente", notas: "Viu no reels, pediu mais info",
    corretor_responsavel: null, ultimo_contato: "2026-04-04T14:30:00Z", created_at: "2026-04-01T10:00:00Z", updated_at: "2026-04-04T14:30:00Z",
  },
  {
    id: "2", user_id: "u1", workspace_id: "w1", nome: "Ana Paula Silva", telefone: "(11) 98888-5678", email: "ana@email.com",
    status: "contato_feito", interesse_tipo: "aluguel", imovel_interesse_id: null, imovel_interesse_nome: "Studio Moema",
    valor_estimado: 3500, fonte: "whatsapp", temperatura: "morno", notas: "Quer visitar semana que vem",
    corretor_responsavel: null, ultimo_contato: "2026-04-03T11:00:00Z", created_at: "2026-03-28T09:00:00Z", updated_at: "2026-04-03T11:00:00Z",
  },
  {
    id: "3", user_id: "u1", workspace_id: "w1", nome: "Roberto Almeida", telefone: "(11) 97777-9012", email: null,
    status: "visita_agendada", interesse_tipo: "compra", imovel_interesse_id: null, imovel_interesse_nome: "Casa Alphaville 420m²",
    valor_estimado: 2200000, fonte: "indicacao", temperatura: "quente", notas: "Visita agendada para sábado 10h",
    corretor_responsavel: null, ultimo_contato: "2026-04-05T08:00:00Z", created_at: "2026-03-25T14:00:00Z", updated_at: "2026-04-05T08:00:00Z",
  },
  {
    id: "4", user_id: "u1", workspace_id: "w1", nome: "Mariana Costa", telefone: "(11) 96666-3456", email: "mari@email.com",
    status: "proposta_enviada", interesse_tipo: "compra", imovel_interesse_id: null, imovel_interesse_nome: "Cobertura Itaim 200m²",
    valor_estimado: 3500000, fonte: "site", temperatura: "quente", notas: "Proposta de R$ 3.2M enviada, aguardando retorno",
    corretor_responsavel: null, ultimo_contato: "2026-04-04T16:00:00Z", created_at: "2026-03-20T11:00:00Z", updated_at: "2026-04-04T16:00:00Z",
  },
  {
    id: "5", user_id: "u1", workspace_id: "w1", nome: "Fernando Souza", telefone: "(11) 95555-7890", email: "fernando@email.com",
    status: "fechado", interesse_tipo: "compra", imovel_interesse_id: null, imovel_interesse_nome: "Apt Brooklin 2Q",
    valor_estimado: 720000, fonte: "instagram", temperatura: "quente", notas: "Fechou! Escritura em andamento",
    corretor_responsavel: null, ultimo_contato: "2026-04-02T10:00:00Z", created_at: "2026-03-10T09:00:00Z", updated_at: "2026-04-02T10:00:00Z",
  },
  {
    id: "6", user_id: "u1", workspace_id: "w1", nome: "Juliana Prado", telefone: "(11) 94444-1234", email: null,
    status: "perdido", interesse_tipo: "aluguel", imovel_interesse_id: null, imovel_interesse_nome: null,
    valor_estimado: null, fonte: "whatsapp", temperatura: "frio", notas: "Não respondeu mais",
    corretor_responsavel: null, ultimo_contato: "2026-03-15T09:00:00Z", created_at: "2026-03-12T08:00:00Z", updated_at: "2026-03-15T09:00:00Z",
  },
  {
    id: "7", user_id: "u1", workspace_id: "w1", nome: "Ricardo Lima", telefone: "(11) 93333-5678", email: "ricardo@empresa.com",
    status: "novo", interesse_tipo: "lancamento", imovel_interesse_id: null, imovel_interesse_nome: "Lançamento Pinheiros",
    valor_estimado: 950000, fonte: "site", temperatura: "morno", notas: "Preencheu formulário do site",
    corretor_responsavel: null, ultimo_contato: null, created_at: "2026-04-05T07:00:00Z", updated_at: "2026-04-05T07:00:00Z",
  },
  {
    id: "8", user_id: "u1", workspace_id: "w1", nome: "Beatriz Nunes", telefone: "(11) 92222-9012", email: "bia@email.com",
    status: "contato_feito", interesse_tipo: "compra", imovel_interesse_id: null, imovel_interesse_nome: "Casa Morumbi 350m²",
    valor_estimado: 1800000, fonte: "indicacao", temperatura: "quente", notas: "Indicação do Fernando. Muito interessada.",
    corretor_responsavel: null, ultimo_contato: "2026-04-04T09:00:00Z", created_at: "2026-04-02T15:00:00Z", updated_at: "2026-04-04T09:00:00Z",
  },
];

// ─── Fetch (mock for now, Supabase-ready) ──────────────────────────────────

async function fetchLeads(workspaceId: string): Promise<Lead[]> {
  // TODO: Replace with real Supabase query when "leads" table is migrated
  // const { data, error } = await supabase
  //   .from("leads")
  //   .select("*")
  //   .eq("workspace_id", workspaceId)
  //   .order("created_at", { ascending: false });
  // if (error) throw error;
  // return data ?? [];

  // Mock: simulate async fetch
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_LEADS]), 300));
}

async function createLead(workspaceId: string, input: CreateLeadInput): Promise<Lead> {
  const newLead: Lead = {
    id: crypto.randomUUID(),
    user_id: "current",
    workspace_id: workspaceId,
    nome: input.nome,
    telefone: input.telefone ?? null,
    email: input.email ?? null,
    status: input.status ?? "novo",
    interesse_tipo: input.interesse_tipo,
    imovel_interesse_id: input.imovel_interesse_id ?? null,
    imovel_interesse_nome: input.imovel_interesse_nome ?? null,
    valor_estimado: input.valor_estimado ?? null,
    fonte: input.fonte,
    temperatura: input.temperatura ?? "morno",
    notas: input.notas ?? null,
    corretor_responsavel: input.corretor_responsavel ?? null,
    ultimo_contato: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  MOCK_LEADS.unshift(newLead);
  return newLead;
}

async function updateLead(leadId: string, input: UpdateLeadInput): Promise<Lead> {
  const idx = MOCK_LEADS.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error("Lead não encontrado");
  MOCK_LEADS[idx] = { ...MOCK_LEADS[idx], ...input, updated_at: new Date().toISOString() };
  return MOCK_LEADS[idx];
}

async function deleteLead(leadId: string): Promise<void> {
  const idx = MOCK_LEADS.findIndex((l) => l.id === leadId);
  if (idx !== -1) MOCK_LEADS.splice(idx, 1);
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

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
    mutationFn: (input: CreateLeadInput) => createLead(workspaceId as string, input),
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

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateLeadInput & { id: string }) => updateLead(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", workspaceId] });
    },
    onError: (err: Error) => {
      const { toast } = useToast();
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
