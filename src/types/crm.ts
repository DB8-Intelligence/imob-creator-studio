/**
 * crm.ts — Tipos do modulo CRM (Clientes + Negocios)
 */

export type ClienteTipo = 'comprador' | 'vendedor' | 'locatario' | 'locador' | 'investidor';
export type NegocioTipo = 'venda' | 'aluguel' | 'permuta' | 'temporada';
export type NegocioStatus = 'em_andamento' | 'fechado' | 'cancelado';

export interface CrmCliente {
  id: string;
  user_id: string;
  workspace_id: string;
  lead_id?: string | null;
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento?: string | null;
  email: string;
  telefone: string;
  whatsapp: string;
  profissao: string;
  estado_civil: string;
  endereco_completo: string;
  tipo: ClienteTipo;
  imoveis_interesse: string[];
  orcamento_min?: number | null;
  orcamento_max?: number | null;
  bairros: string[];
  total_negocios: number;
  valor_total_negocios: number;
  foto_url: string;
  observacoes: string;
  tags: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClienteInput {
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string | null;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  profissao?: string;
  estado_civil?: string;
  endereco_completo?: string;
  tipo: ClienteTipo;
  imoveis_interesse?: string[];
  orcamento_min?: number | null;
  orcamento_max?: number | null;
  bairros?: string[];
  foto_url?: string;
  observacoes?: string;
  tags?: string[];
  lead_id?: string | null;
}

export interface UpdateClienteInput {
  nome?: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string | null;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  profissao?: string;
  estado_civil?: string;
  endereco_completo?: string;
  tipo?: ClienteTipo;
  imoveis_interesse?: string[];
  orcamento_min?: number | null;
  orcamento_max?: number | null;
  bairros?: string[];
  foto_url?: string;
  observacoes?: string;
  tags?: string[];
  ativo?: boolean;
  total_negocios?: number;
  valor_total_negocios?: number;
}

export interface CrmNegocio {
  id: string;
  user_id: string;
  workspace_id: string;
  lead_id?: string | null;
  cliente_id?: string | null;
  imovel_id?: string | null;
  tipo: NegocioTipo;
  status: NegocioStatus;
  valor_imovel: number;
  valor_negociado: number;
  percentual_comissao: number;
  valor_comissao_bruta: number;
  percentual_repasse: number;
  valor_repasse: number;
  valor_comissao_liquida: number;
  data_fechamento?: string | null;
  data_escritura?: string | null;
  data_recebimento?: string | null;
  numero_contrato: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNegocioInput {
  lead_id?: string | null;
  cliente_id?: string | null;
  imovel_id?: string | null;
  tipo: NegocioTipo;
  valor_imovel: number;
  valor_negociado: number;
  percentual_comissao: number;
  percentual_repasse?: number;
  data_fechamento?: string | null;
  data_escritura?: string | null;
  numero_contrato?: string;
  observacoes?: string;
}

export interface UpdateNegocioInput {
  tipo?: NegocioTipo;
  status?: NegocioStatus;
  valor_imovel?: number;
  valor_negociado?: number;
  percentual_comissao?: number;
  percentual_repasse?: number;
  data_fechamento?: string | null;
  data_escritura?: string | null;
  data_recebimento?: string | null;
  numero_contrato?: string;
  observacoes?: string;
}

// ─── Config ────────────────────────────────────────────────────────────────

export const CLIENTE_TIPO_CONFIG: Record<ClienteTipo, { label: string; color: string }> = {
  comprador:  { label: "Comprador",  color: "bg-blue-500/10 text-blue-500" },
  vendedor:   { label: "Vendedor",   color: "bg-emerald-500/10 text-emerald-500" },
  locatario:  { label: "Locatario",  color: "bg-purple-500/10 text-purple-500" },
  locador:    { label: "Locador",    color: "bg-orange-500/10 text-orange-500" },
  investidor: { label: "Investidor", color: "bg-amber-500/10 text-amber-600" },
};

export const NEGOCIO_TIPO_CONFIG: Record<NegocioTipo, { label: string; color: string }> = {
  venda:     { label: "Venda",     color: "bg-emerald-500/10 text-emerald-600" },
  aluguel:   { label: "Aluguel",   color: "bg-blue-500/10 text-blue-600" },
  permuta:   { label: "Permuta",   color: "bg-purple-500/10 text-purple-600" },
  temporada: { label: "Temporada", color: "bg-orange-500/10 text-orange-600" },
};

export const NEGOCIO_STATUS_CONFIG: Record<NegocioStatus, { label: string; color: string }> = {
  em_andamento: { label: "Em andamento", color: "bg-blue-500/10 text-blue-600" },
  fechado:      { label: "Fechado",      color: "bg-emerald-500/10 text-emerald-600" },
  cancelado:    { label: "Cancelado",    color: "bg-red-500/10 text-red-500" },
};

export function calcularComissaoLiquida(bruta: number, percentualRepasse: number): number {
  const repasse = bruta * (percentualRepasse / 100);
  return bruta - repasse;
}

export function calcularValores(valorNegociado: number, percentualComissao: number, percentualRepasse: number) {
  const bruta = valorNegociado * (percentualComissao / 100);
  const repasse = bruta * (percentualRepasse / 100);
  const liquida = bruta - repasse;
  return { bruta, repasse, liquida };
}
