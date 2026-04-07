/**
 * useAppointments.ts — React Query hooks para Atendimentos / Agendamentos
 *
 * Tabela futura: "appointments" no Supabase.
 * Mock data enquanto tabela não existe.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/types/appointment";

// ─── Mock data ─────────────────────────────────────────────────────────────

const today = new Date();
const fmt = (d: Date, h: number, m: number) => {
  const r = new Date(d);
  r.setHours(h, m, 0, 0);
  return r.toISOString();
};
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "ap1", user_id: "u1", workspace_id: "w1",
    lead_id: "3", lead_nome: "Roberto Almeida", lead_telefone: "(11) 97777-9012",
    property_id: null, property_nome: "Casa Alphaville 420m²", property_endereco: "Alameda Araguaia, 1200 — Alphaville, Barueri",
    data_hora: fmt(today, 10, 0), duracao: "1h", tipo: "visita_presencial",
    status: "confirmado", resultado: null, proximo_passo: null,
    corretor_responsavel: null, notas: "Levar material impresso", observacoes_pos_visita: null, enviar_confirmacao: true,
    created_at: addDays(today, -3).toISOString(), updated_at: today.toISOString(),
  },
  {
    id: "ap2", user_id: "u1", workspace_id: "w1",
    lead_id: "1", lead_nome: "Carlos Mendes", lead_telefone: "(11) 99999-1234",
    property_id: null, property_nome: "Apt Vila Mariana 3Q", property_endereco: "Rua Domingos de Morais, 800 — Vila Mariana, SP",
    data_hora: fmt(today, 14, 30), duracao: "30min", tipo: "visita_virtual",
    status: "agendado", resultado: null, proximo_passo: null,
    corretor_responsavel: null, notas: "Tour virtual pelo Zoom", observacoes_pos_visita: null, enviar_confirmacao: true,
    created_at: addDays(today, -1).toISOString(), updated_at: addDays(today, -1).toISOString(),
  },
  {
    id: "ap3", user_id: "u1", workspace_id: "w1",
    lead_id: "8", lead_nome: "Beatriz Nunes", lead_telefone: "(11) 92222-9012",
    property_id: null, property_nome: "Casa Morumbi 350m²", property_endereco: "Rua Eng. Oscar Americano, 500 — Morumbi, SP",
    data_hora: fmt(today, 16, 0), duracao: "1h", tipo: "visita_presencial",
    status: "agendado", resultado: null, proximo_passo: null,
    corretor_responsavel: null, notas: null, observacoes_pos_visita: null, enviar_confirmacao: false,
    created_at: addDays(today, -2).toISOString(), updated_at: addDays(today, -2).toISOString(),
  },
  {
    id: "ap4", user_id: "u1", workspace_id: "w1",
    lead_id: "4", lead_nome: "Mariana Costa", lead_telefone: "(11) 96666-3456",
    property_id: null, property_nome: "Cobertura Itaim 200m²", property_endereco: "Rua Joaquim Floriano, 1000 — Itaim Bibi, SP",
    data_hora: fmt(addDays(today, -5), 10, 0), duracao: "1h", tipo: "visita_presencial",
    status: "concluido", resultado: "gostou_muito", proximo_passo: "enviar_proposta",
    corretor_responsavel: null, notas: "Visita presencial", observacoes_pos_visita: "Mariana adorou a vista e o acabamento. Quer negociar valor.",
    enviar_confirmacao: true,
    created_at: addDays(today, -8).toISOString(), updated_at: addDays(today, -5).toISOString(),
  },
  {
    id: "ap5", user_id: "u1", workspace_id: "w1",
    lead_id: "2", lead_nome: "Ana Paula Silva", lead_telefone: "(11) 98888-5678",
    property_id: null, property_nome: "Studio Moema", property_endereco: "Av. Moema, 350 — Moema, SP",
    data_hora: fmt(addDays(today, 2), 11, 0), duracao: "30min", tipo: "visita_presencial",
    status: "agendado", resultado: null, proximo_passo: null,
    corretor_responsavel: null, notas: "Confirmar 1 dia antes", observacoes_pos_visita: null, enviar_confirmacao: true,
    created_at: today.toISOString(), updated_at: today.toISOString(),
  },
  {
    id: "ap6", user_id: "u1", workspace_id: "w1",
    lead_id: "7", lead_nome: "Ricardo Lima", lead_telefone: "(11) 93333-5678",
    property_id: null, property_nome: "Lançamento Pinheiros", property_endereco: "Rua dos Pinheiros, 900 — Pinheiros, SP",
    data_hora: fmt(addDays(today, 3), 15, 0), duracao: "2h", tipo: "reuniao_apresentacao",
    status: "agendado", resultado: null, proximo_passo: null,
    corretor_responsavel: null, notas: "Apresentação do empreendimento completo", observacoes_pos_visita: null, enviar_confirmacao: true,
    created_at: today.toISOString(), updated_at: today.toISOString(),
  },
  {
    id: "ap7", user_id: "u1", workspace_id: "w1",
    lead_id: "6", lead_nome: "Juliana Prado", lead_telefone: "(11) 94444-1234",
    property_id: null, property_nome: null, property_endereco: null,
    data_hora: fmt(addDays(today, -10), 14, 0), duracao: "30min", tipo: "visita_presencial",
    status: "nao_compareceu", resultado: null, proximo_passo: "perdido",
    corretor_responsavel: null, notas: null, observacoes_pos_visita: "Não apareceu e não atende mais",
    enviar_confirmacao: false,
    created_at: addDays(today, -14).toISOString(), updated_at: addDays(today, -10).toISOString(),
  },
];

// ─── CRUD ──────────────────────────────────────────────────────────────────

async function fetchAppointments(_workspaceId: string): Promise<Appointment[]> {
  await new Promise((r) => setTimeout(r, 250));
  return [...MOCK_APPOINTMENTS].sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
}

async function createAppointment(workspaceId: string, input: CreateAppointmentInput): Promise<Appointment> {
  const apt: Appointment = {
    id: crypto.randomUUID(),
    user_id: "u1",
    workspace_id: workspaceId,
    lead_id: input.lead_id,
    lead_nome: input.lead_nome,
    lead_telefone: input.lead_telefone ?? null,
    property_id: input.property_id ?? null,
    property_nome: input.property_nome ?? null,
    property_endereco: input.property_endereco ?? null,
    data_hora: input.data_hora,
    duracao: input.duracao,
    tipo: input.tipo,
    status: "agendado",
    resultado: null,
    proximo_passo: null,
    corretor_responsavel: input.corretor_responsavel ?? null,
    notas: input.notas ?? null,
    observacoes_pos_visita: null,
    enviar_confirmacao: input.enviar_confirmacao ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  MOCK_APPOINTMENTS.unshift(apt);

  // TODO: If enviar_confirmacao, dispatch n8n webhook for WhatsApp via Evolution API
  // await supabase.functions.invoke("n8n-webhook", { body: { event: "appointment_created", ... } });

  return apt;
}

async function updateAppointment(aptId: string, input: UpdateAppointmentInput): Promise<Appointment> {
  const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === aptId);
  if (idx === -1) throw new Error("Agendamento não encontrado");
  MOCK_APPOINTMENTS[idx] = { ...MOCK_APPOINTMENTS[idx], ...input, updated_at: new Date().toISOString() };
  return MOCK_APPOINTMENTS[idx];
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

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
