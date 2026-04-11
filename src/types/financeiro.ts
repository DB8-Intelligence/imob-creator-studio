/* ─── Financeiro — Types ─────────────────────────────────────────────── */

export type CategoriaReceita =
  | "comissao"
  | "honorario"
  | "consultoria"
  | "locacao"
  | "outro";

export type CategoriaDespesa =
  | "marketing"
  | "ferramentas"
  | "deslocamento"
  | "escritorio"
  | "impostos"
  | "pessoal"
  | "outro";

export type StatusReceita = "previsto" | "recebido" | "cancelado";
export type StatusDespesa = "pendente" | "pago" | "cancelado";
export type FrequenciaRecorrente = "mensal" | "trimestral" | "anual";

/* ─── Database row interfaces ──────────────────────────────────────── */

export interface FinanceiroReceita {
  id: string;
  user_id: string;
  descricao: string;
  categoria: CategoriaReceita;
  valor: number;
  mes_competencia: string;       // "2026-04"
  data_recebimento: string | null;
  status: StatusReceita;
  observacoes: string | null;
  negocio_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceiroDespesa {
  id: string;
  user_id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  mes_competencia: string;       // "2026-04"
  data_pagamento: string | null;
  status: StatusDespesa;
  recorrente: boolean;
  frequencia: FrequenciaRecorrente | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceiroMeta {
  id: string;
  user_id: string;
  ano: number;
  mes: number;                   // 1-12
  meta_receita: number;
  meta_negocios: number;
  created_at: string;
  updated_at: string;
}

/* ─── Calculated aggregates ────────────────────────────────────────── */

export interface ResumoMensal {
  totalReceitas: number;
  totalRecebido: number;
  totalDespesas: number;
  totalPago: number;
  despesasPendentes: number;
  resultado: number;             // recebido - pago
  metaReceita: number;
  metaNegocios: number;
  percentualMeta: number;        // (recebido / metaReceita) * 100
}

export interface ResumoAnual {
  mes: number;
  label: string;                 // "Jan", "Fev", ...
  receitas: number;
  despesas: number;
  resultado: number;
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

export const CATEGORIAS_RECEITA: Record<CategoriaReceita, { label: string; emoji: string }> = {
  comissao:    { label: "Comissão",    emoji: "💰" },
  honorario:   { label: "Honorário",   emoji: "📋" },
  consultoria: { label: "Consultoria", emoji: "🧠" },
  locacao:     { label: "Locação",     emoji: "🏠" },
  outro:       { label: "Outro",       emoji: "📦" },
};

export const CATEGORIAS_DESPESA: Record<CategoriaDespesa, { label: string; emoji: string }> = {
  marketing:    { label: "Marketing",    emoji: "📣" },
  ferramentas:  { label: "Ferramentas",  emoji: "🔧" },
  deslocamento: { label: "Deslocamento", emoji: "🚗" },
  escritorio:   { label: "Escritório",   emoji: "🏢" },
  impostos:     { label: "Impostos",     emoji: "🧾" },
  pessoal:      { label: "Pessoal",      emoji: "👤" },
  outro:        { label: "Outro",        emoji: "📦" },
};

export const MESES_LABEL = [
  "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const MESES_FULL = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
