/**
 * useLeadActivities.ts — Hook para timeline de atividades do lead
 *
 * Tabela: "lead_activities" (será criada via migration).
 * Mock data enquanto tabela não existe.
 * Supabase Realtime-ready para updates de WhatsApp.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { LeadActivity, CreateLeadActivityInput } from "@/types/lead";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_ACTIVITIES: Record<string, LeadActivity[]> = {
  "1": [
    { id: "a1", lead_id: "1", tipo: "lead_criado", descricao: "Lead criado via Instagram Reels", resultado: null, proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-01T10:00:00Z" },
    { id: "a2", lead_id: "1", tipo: "mensagem_whatsapp", descricao: "Enviou fotos do Apt Vila Mariana 3Q. Lead respondeu com interesse.", resultado: "positivo", proximo_passo: "Ligar amanhã para agendar visita", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-02T09:30:00Z" },
    { id: "a3", lead_id: "1", tipo: "status_alterado", descricao: "Status: Novo Lead → Contato Feito", resultado: null, proximo_passo: null, metadata: { old_status: "novo", new_status: "contato_feito" }, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-02T09:31:00Z" },
    { id: "a4", lead_id: "1", tipo: "imovel_enviado", descricao: "Enviou link do Apt Vila Mariana 3Q com fotos profissionais e vídeo", resultado: "positivo", proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-03T14:00:00Z" },
    { id: "a5", lead_id: "1", tipo: "ligacao", descricao: "Ligou para confirmar interesse. Carlos quer visitar sábado.", resultado: "positivo", proximo_passo: "Agendar visita para sábado 10h", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-04T11:00:00Z" },
    { id: "a6", lead_id: "1", tipo: "nota_adicionada", descricao: "Carlos mencionou que precisa de financiamento. Verificar condições com o banco.", resultado: null, proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-04T14:30:00Z" },
  ],
  "3": [
    { id: "b1", lead_id: "3", tipo: "lead_criado", descricao: "Lead criado via indicação do Fernando Souza", resultado: null, proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-03-25T14:00:00Z" },
    { id: "b2", lead_id: "3", tipo: "mensagem_whatsapp", descricao: "Primeiro contato por WhatsApp. Interessado em casas acima de R$ 2M em Alphaville.", resultado: "positivo", proximo_passo: "Enviar opções", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-03-26T10:00:00Z" },
    { id: "b3", lead_id: "3", tipo: "imovel_enviado", descricao: "Enviou 3 opções: Casa Alphaville 420m², Casa Residencial 380m², Sobrado Tamboré", resultado: "positivo", proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-03-28T09:00:00Z" },
    { id: "b4", lead_id: "3", tipo: "agendamento_criado", descricao: "Visita agendada: Casa Alphaville 420m² — Sábado 05/04 às 10h", resultado: null, proximo_passo: "Confirmar 1 dia antes", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-01T16:00:00Z" },
    { id: "b5", lead_id: "3", tipo: "status_alterado", descricao: "Status: Contato Feito → Visita Agendada", resultado: null, proximo_passo: null, metadata: { old_status: "contato_feito", new_status: "visita_agendada" }, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-01T16:01:00Z" },
    { id: "b6", lead_id: "3", tipo: "visita_presencial", descricao: "Visita realizada na Casa Alphaville. Roberto gostou muito, quer voltar com a esposa.", resultado: "positivo", proximo_passo: "Agendar segunda visita com esposa", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-05T08:00:00Z" },
  ],
  "4": [
    { id: "c1", lead_id: "4", tipo: "lead_criado", descricao: "Lead criado via site — formulário de contato", resultado: null, proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-03-20T11:00:00Z" },
    { id: "c2", lead_id: "4", tipo: "ligacao", descricao: "Primeiro contato por telefone. Mariana procura cobertura no Itaim acima de 180m².", resultado: "positivo", proximo_passo: "Enviar opções premium", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-03-21T09:00:00Z" },
    { id: "c3", lead_id: "4", tipo: "criativo_compartilhado", descricao: "Compartilhou vídeo profissional da Cobertura Itaim 200m²", resultado: "positivo", proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-03-25T14:00:00Z" },
    { id: "c4", lead_id: "4", tipo: "visita_presencial", descricao: "Visita à Cobertura Itaim. Mariana aprovou. Quer negociar valor.", resultado: "positivo", proximo_passo: "Preparar proposta formal", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-03-30T10:00:00Z" },
    { id: "c5", lead_id: "4", tipo: "proposta_enviada", descricao: "Proposta de R$ 3.200.000 enviada por e-mail com condições de pagamento", resultado: "neutro", proximo_passo: "Aguardar retorno até sexta", metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-02T15:00:00Z" },
    { id: "c6", lead_id: "4", tipo: "status_alterado", descricao: "Status: Visita Agendada → Proposta Enviada", resultado: null, proximo_passo: null, metadata: { old_status: "visita_agendada", new_status: "proposta_enviada" }, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-02T15:01:00Z" },
    { id: "c7", lead_id: "4", tipo: "nota_adicionada", descricao: "Mariana pediu redução de 5%. Proprietário aceitou R$ 3.150.000. Aguardando confirmação final.", resultado: null, proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: "2026-04-04T16:00:00Z" },
  ],
};

// Generate default activities for leads without specific mocks
function getDefaultActivities(leadId: string, createdAt: string): LeadActivity[] {
  return [
    { id: `def-${leadId}`, lead_id: leadId, tipo: "lead_criado", descricao: "Lead cadastrado no sistema", resultado: null, proximo_passo: null, metadata: null, usuario_id: "u1", usuario_nome: "Você", created_at: createdAt },
  ];
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchLeadActivities(leadId: string, leadCreatedAt?: string): Promise<LeadActivity[]> {
  // TODO: Replace with real Supabase query:
  // const { data, error } = await supabase
  //   .from("lead_activities")
  //   .select("*")
  //   .eq("lead_id", leadId)
  //   .order("created_at", { ascending: false });

  await new Promise((r) => setTimeout(r, 200));
  const activities = MOCK_ACTIVITIES[leadId] ?? getDefaultActivities(leadId, leadCreatedAt ?? new Date().toISOString());
  return [...activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function createLeadActivity(leadId: string, input: CreateLeadActivityInput): Promise<LeadActivity> {
  const activity: LeadActivity = {
    id: crypto.randomUUID(),
    lead_id: leadId,
    tipo: input.tipo,
    descricao: input.descricao,
    resultado: input.resultado ?? null,
    proximo_passo: input.proximo_passo ?? null,
    metadata: null,
    usuario_id: "u1",
    usuario_nome: "Você",
    created_at: new Date().toISOString(),
  };

  if (!MOCK_ACTIVITIES[leadId]) MOCK_ACTIVITIES[leadId] = [];
  MOCK_ACTIVITIES[leadId].unshift(activity);
  return activity;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function useLeadActivities(leadId: string | null, leadCreatedAt?: string) {
  return useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => fetchLeadActivities(leadId as string, leadCreatedAt),
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

    // TODO: Activate when lead_activities table exists
    // const channel = supabase
    //   .channel(`lead_activities_${leadId}`)
    //   .on("postgres_changes", {
    //     event: "INSERT",
    //     schema: "public",
    //     table: "lead_activities",
    //     filter: `lead_id=eq.${leadId}`,
    //   }, () => {
    //     qc.invalidateQueries({ queryKey: ["lead-activities", leadId] });
    //   })
    //   .subscribe();
    //
    // return () => { supabase.removeChannel(channel); };
  }, [leadId, qc]);
}
