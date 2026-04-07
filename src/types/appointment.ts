/**
 * appointment.ts — Tipos do módulo de Atendimentos / Agendamentos
 */

export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "em_andamento"
  | "concluido"
  | "nao_compareceu"
  | "cancelado";

export type AppointmentTipo =
  | "visita_presencial"
  | "visita_virtual"
  | "reuniao_apresentacao";

export type AppointmentDuracao = "30min" | "1h" | "2h";

export type AppointmentResultado =
  | "gostou_muito"
  | "gostou"
  | "neutro"
  | "nao_gostou"
  | null;

export type AppointmentProximoPasso =
  | "enviar_proposta"
  | "agendar_outra_visita"
  | "aguardar"
  | "perdido"
  | null;

export interface Appointment {
  id: string;
  user_id: string;
  workspace_id: string;
  lead_id: string;
  lead_nome: string;
  lead_telefone: string | null;
  property_id: string | null;
  property_nome: string | null;
  property_endereco: string | null;
  data_hora: string;
  duracao: AppointmentDuracao;
  tipo: AppointmentTipo;
  status: AppointmentStatus;
  resultado: AppointmentResultado;
  proximo_passo: AppointmentProximoPasso;
  corretor_responsavel: string | null;
  notas: string | null;
  observacoes_pos_visita: string | null;
  enviar_confirmacao: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentInput {
  lead_id: string;
  lead_nome: string;
  lead_telefone?: string | null;
  property_id?: string | null;
  property_nome?: string | null;
  property_endereco?: string | null;
  data_hora: string;
  duracao: AppointmentDuracao;
  tipo: AppointmentTipo;
  corretor_responsavel?: string | null;
  notas?: string;
  enviar_confirmacao?: boolean;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  resultado?: AppointmentResultado;
  proximo_passo?: AppointmentProximoPasso;
  observacoes_pos_visita?: string | null;
  data_hora?: string;
  notas?: string;
}

// ─── Config ────────────────────────────────────────────────────────────────

export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, { label: string; emoji: string; color: string; bgColor: string; dotColor: string }> = {
  agendado:        { label: "Agendado",        emoji: "📅", color: "text-blue-500",    bgColor: "bg-blue-500/10 border-blue-500/20",    dotColor: "bg-blue-500" },
  confirmado:      { label: "Confirmado",      emoji: "✅", color: "text-emerald-500", bgColor: "bg-emerald-500/10 border-emerald-500/20", dotColor: "bg-emerald-500" },
  em_andamento:    { label: "Em andamento",    emoji: "🔄", color: "text-orange-500",  bgColor: "bg-orange-500/10 border-orange-500/20",  dotColor: "bg-orange-500" },
  concluido:       { label: "Concluído",       emoji: "✔️", color: "text-slate-500",   bgColor: "bg-slate-500/10 border-slate-500/20",   dotColor: "bg-slate-400" },
  nao_compareceu:  { label: "Não compareceu",  emoji: "❌", color: "text-red-500",     bgColor: "bg-red-500/10 border-red-500/20",       dotColor: "bg-red-500" },
  cancelado:       { label: "Cancelado",       emoji: "🚫", color: "text-gray-400",    bgColor: "bg-gray-400/10 border-gray-400/20",    dotColor: "bg-gray-400" },
};

export const APPOINTMENT_TIPO_CONFIG: Record<AppointmentTipo, { label: string; emoji: string }> = {
  visita_presencial:     { label: "Visita presencial",      emoji: "🏠" },
  visita_virtual:        { label: "Visita virtual",         emoji: "💻" },
  reuniao_apresentacao:  { label: "Reunião de apresentação", emoji: "📊" },
};

export const DURACAO_LABEL: Record<AppointmentDuracao, string> = {
  "30min": "30 minutos",
  "1h": "1 hora",
  "2h": "2 horas",
};

export const RESULTADO_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  gostou_muito: { label: "Gostou muito", emoji: "🤩", color: "text-emerald-500 bg-emerald-500/10" },
  gostou:       { label: "Gostou",       emoji: "😊", color: "text-blue-500 bg-blue-500/10" },
  neutro:       { label: "Neutro",       emoji: "😐", color: "text-slate-400 bg-slate-400/10" },
  nao_gostou:   { label: "Não gostou",   emoji: "😕", color: "text-red-500 bg-red-500/10" },
};

export const PROXIMO_PASSO_CONFIG: Record<string, { label: string; emoji: string }> = {
  enviar_proposta:       { label: "Enviar proposta",       emoji: "💰" },
  agendar_outra_visita:  { label: "Agendar outra visita",  emoji: "📅" },
  aguardar:              { label: "Aguardar",              emoji: "⏳" },
  perdido:               { label: "Perdido",               emoji: "🚫" },
};

// ─── Calendar helpers ──────────────────────────────────────────────────────

/** Status → CSS color for calendar dots */
export const STATUS_CALENDAR_COLOR: Record<AppointmentStatus, string> = {
  agendado: "bg-blue-500",
  confirmado: "bg-emerald-500",
  em_andamento: "bg-orange-500",
  concluido: "bg-slate-400",
  nao_compareceu: "bg-red-500",
  cancelado: "bg-gray-300",
};
