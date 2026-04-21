/**
 * Tipos pro layout personalizável do dashboard (react-grid-layout).
 */

export type WidgetId =
  | "kpis"
  | "atendimentos-pendentes"
  | "compromissos"
  | "meus-imoveis"
  | "meus-clientes"
  | "pretensao";

/** Posição/tamanho de um widget no grid (formato react-grid-layout). */
export interface WidgetLayout {
  /** Identificador estável do widget (match com key no JSX) */
  i: WidgetId;
  /** Coluna X (0 a cols-1) */
  x: number;
  /** Linha Y (em unidades de rowHeight) */
  y: number;
  /** Largura em colunas */
  w: number;
  /** Altura em rowHeight units */
  h: number;
  /** Opcionais (bloqueios) */
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export const DASHBOARD_COLS = 12;
export const DASHBOARD_ROW_HEIGHT = 50;

/**
 * Layout padrão (mesmo que o dashboard atual hardcoded).
 * Quando o usuário nunca personalizou, este é mostrado.
 */
export const DEFAULT_DASHBOARD_LAYOUT: WidgetLayout[] = [
  { i: "kpis",                     x: 0, y: 0,  w: 12, h: 3, minW: 6, minH: 2 },
  { i: "atendimentos-pendentes",   x: 0, y: 3,  w: 6,  h: 6, minW: 3, minH: 4 },
  { i: "compromissos",             x: 6, y: 3,  w: 6,  h: 6, minW: 3, minH: 4 },
  { i: "meus-imoveis",             x: 0, y: 9,  w: 6,  h: 4, minW: 3, minH: 3 },
  { i: "meus-clientes",            x: 6, y: 9,  w: 6,  h: 4, minW: 3, minH: 3 },
  { i: "pretensao",                x: 0, y: 13, w: 12, h: 6, minW: 6, minH: 4 },
];

/** Metadata de cada widget pra UI de edição futura (add/remove, toggles). */
export const WIDGET_META: Record<WidgetId, { label: string; description: string }> = {
  "kpis":                   { label: "KPIs rápidos",         description: "4 indicadores principais no topo" },
  "atendimentos-pendentes": { label: "Atendimentos pendentes", description: "Leads que aguardam resposta" },
  "compromissos":           { label: "Compromissos",          description: "Agenda do dia" },
  "meus-imoveis":           { label: "Meus imóveis",          description: "Contador de imóveis ativos" },
  "meus-clientes":          { label: "Meus clientes",         description: "Contador de clientes no CRM" },
  "pretensao":              { label: "Pretensão de compra",   description: "Distribuição dos leads por intenção" },
};
