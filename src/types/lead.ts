/**
 * lead.ts — Tipos do módulo de Leads (CRM simplificado)
 */

export type LeadStatus =
  | "novo"
  | "contato_feito"
  | "visita_agendada"
  | "proposta_enviada"
  | "fechado"
  | "perdido";

export type LeadInteresse = "compra" | "aluguel" | "lancamento";
export type LeadFonte = "instagram" | "whatsapp" | "site" | "indicacao" | "outro";
export type LeadTemperatura = "quente" | "morno" | "frio";

export interface Lead {
  id: string;
  user_id: string;
  workspace_id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: LeadStatus;
  interesse_tipo: LeadInteresse;
  imovel_interesse_id: string | null;
  imovel_interesse_nome: string | null;
  valor_estimado: number | null;
  fonte: LeadFonte;
  temperatura: LeadTemperatura;
  notas: string | null;
  corretor_responsavel: string | null;
  ultimo_contato: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInput {
  nome: string;
  telefone?: string;
  email?: string;
  status?: LeadStatus;
  interesse_tipo: LeadInteresse;
  imovel_interesse_id?: string | null;
  imovel_interesse_nome?: string | null;
  valor_estimado?: number | null;
  fonte: LeadFonte;
  temperatura?: LeadTemperatura;
  notas?: string;
  corretor_responsavel?: string | null;
}

export interface UpdateLeadInput {
  nome?: string;
  telefone?: string | null;
  email?: string | null;
  status?: LeadStatus;
  interesse_tipo?: LeadInteresse;
  imovel_interesse_id?: string | null;
  imovel_interesse_nome?: string | null;
  valor_estimado?: number | null;
  fonte?: LeadFonte;
  temperatura?: LeadTemperatura;
  notas?: string | null;
  corretor_responsavel?: string | null;
  ultimo_contato?: string | null;
}

// ─── Pipeline config ───────────────────────────────────────────────────────

export interface PipelineColumn {
  id: LeadStatus;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: "novo",              label: "Novo Lead",         emoji: "🟡", color: "text-yellow-500",  bgColor: "bg-yellow-500/10 border-yellow-500/20" },
  { id: "contato_feito",     label: "Contato Feito",     emoji: "🔵", color: "text-blue-500",    bgColor: "bg-blue-500/10 border-blue-500/20" },
  { id: "visita_agendada",   label: "Visita Agendada",   emoji: "🟣", color: "text-purple-500",  bgColor: "bg-purple-500/10 border-purple-500/20" },
  { id: "proposta_enviada",  label: "Proposta Enviada",  emoji: "🟠", color: "text-orange-500",  bgColor: "bg-orange-500/10 border-orange-500/20" },
  { id: "fechado",           label: "Fechado",           emoji: "🟢", color: "text-emerald-500", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  { id: "perdido",           label: "Perdido",           emoji: "🔴", color: "text-red-500",     bgColor: "bg-red-500/10 border-red-500/20" },
];

export const TEMPERATURA_CONFIG = {
  quente: { label: "Quente", emoji: "🔥", color: "text-red-500 bg-red-500/10" },
  morno:  { label: "Morno",  emoji: "☀️", color: "text-amber-500 bg-amber-500/10" },
  frio:   { label: "Frio",   emoji: "❄️", color: "text-blue-400 bg-blue-400/10" },
} as const;

export const FONTE_CONFIG: Record<LeadFonte, { label: string; color: string }> = {
  instagram:  { label: "Instagram",  color: "bg-pink-500/10 text-pink-500" },
  whatsapp:   { label: "WhatsApp",   color: "bg-green-500/10 text-green-500" },
  site:       { label: "Site",       color: "bg-blue-500/10 text-blue-500" },
  indicacao:  { label: "Indicação",  color: "bg-violet-500/10 text-violet-500" },
  outro:      { label: "Outro",      color: "bg-gray-500/10 text-gray-500" },
};

export const INTERESSE_LABEL: Record<LeadInteresse, string> = {
  compra:      "Compra",
  aluguel:     "Aluguel",
  lancamento:  "Lançamento",
};

// ─── Lead Activities (timeline) ────────────────────────────────────────────

export type LeadActivityType =
  | "lead_criado"
  | "status_alterado"
  | "mensagem_whatsapp"
  | "mensagem_email"
  | "ligacao"
  | "visita_presencial"
  | "agendamento_criado"
  | "imovel_enviado"
  | "proposta_enviada"
  | "criativo_compartilhado"
  | "nota_adicionada"
  | "outro";

export type LeadActivityResultado = "positivo" | "neutro" | "negativo" | null;

export interface LeadActivity {
  id: string;
  lead_id: string;
  tipo: LeadActivityType;
  descricao: string;
  resultado: LeadActivityResultado;
  proximo_passo: string | null;
  /** Extra metadata (e.g. old_status / new_status for status changes) */
  metadata: Record<string, unknown> | null;
  usuario_id: string | null;
  usuario_nome: string | null;
  created_at: string;
}

export interface CreateLeadActivityInput {
  tipo: LeadActivityType;
  descricao: string;
  resultado?: LeadActivityResultado;
  proximo_passo?: string;
}

export const ACTIVITY_TYPE_CONFIG: Record<LeadActivityType, { label: string; emoji: string; color: string; iconBg: string }> = {
  lead_criado:            { label: "Lead criado",            emoji: "📝", color: "text-emerald-500", iconBg: "bg-emerald-500/15" },
  status_alterado:        { label: "Status alterado",        emoji: "↕️", color: "text-blue-500",    iconBg: "bg-blue-500/15" },
  mensagem_whatsapp:      { label: "WhatsApp",               emoji: "💬", color: "text-green-500",   iconBg: "bg-green-500/15" },
  mensagem_email:         { label: "E-mail",                 emoji: "📧", color: "text-violet-500",  iconBg: "bg-violet-500/15" },
  ligacao:                { label: "Ligação",                emoji: "📞", color: "text-cyan-500",    iconBg: "bg-cyan-500/15" },
  visita_presencial:      { label: "Visita presencial",      emoji: "🏠", color: "text-purple-500",  iconBg: "bg-purple-500/15" },
  agendamento_criado:     { label: "Agendamento criado",     emoji: "📅", color: "text-orange-500",  iconBg: "bg-orange-500/15" },
  imovel_enviado:         { label: "Imóvel enviado",         emoji: "🏠", color: "text-teal-500",    iconBg: "bg-teal-500/15" },
  proposta_enviada:       { label: "Proposta enviada",       emoji: "💰", color: "text-amber-500",   iconBg: "bg-amber-500/15" },
  criativo_compartilhado: { label: "Criativo compartilhado", emoji: "📸", color: "text-pink-500",    iconBg: "bg-pink-500/15" },
  nota_adicionada:        { label: "Nota adicionada",        emoji: "📝", color: "text-slate-500",   iconBg: "bg-slate-500/15" },
  outro:                  { label: "Outro",                  emoji: "📌", color: "text-gray-500",    iconBg: "bg-gray-500/15" },
};

export const RESULTADO_CONFIG = {
  positivo: { label: "Positivo", emoji: "✅", color: "text-emerald-500 bg-emerald-500/10" },
  neutro:   { label: "Neutro",   emoji: "➖", color: "text-slate-400 bg-slate-400/10" },
  negativo: { label: "Negativo", emoji: "❌", color: "text-red-500 bg-red-500/10" },
} as const;
