/**
 * Tipos pro layout personalizável do dashboard (react-grid-layout).
 * Suporta breakpoints responsivos (lg/md/sm) + widget library (add/remove).
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
  i: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export type Breakpoint = "lg" | "md" | "sm";

export interface DashboardLayouts {
  lg: WidgetLayout[];
  md: WidgetLayout[];
  sm: WidgetLayout[];
}

/** Breakpoints (px) e colunas por breakpoint. */
export const BREAKPOINTS: Record<Breakpoint, number> = {
  lg: 1200,
  md: 768,
  sm: 0,
};

export const COLS_BY_BREAKPOINT: Record<Breakpoint, number> = {
  lg: 12,
  md: 8,
  sm: 4,
};

export const DASHBOARD_ROW_HEIGHT = 50;

/**
 * Layout padrão para cada breakpoint.
 * Desktop (lg) = layout original 2x2 + pretensão full.
 * Tablet (md) = 8 colunas, widgets em 2 por linha.
 * Mobile (sm) = 4 colunas, widgets empilhados full-width.
 */
export const DEFAULT_DASHBOARD_LAYOUTS: DashboardLayouts = {
  lg: [
    { i: "kpis",                   x: 0, y: 0,  w: 12, h: 3, minW: 6, minH: 2 },
    { i: "atendimentos-pendentes", x: 0, y: 3,  w: 6,  h: 6, minW: 3, minH: 4 },
    { i: "compromissos",           x: 6, y: 3,  w: 6,  h: 6, minW: 3, minH: 4 },
    { i: "meus-imoveis",           x: 0, y: 9,  w: 6,  h: 4, minW: 3, minH: 3 },
    { i: "meus-clientes",          x: 6, y: 9,  w: 6,  h: 4, minW: 3, minH: 3 },
    { i: "pretensao",              x: 0, y: 13, w: 12, h: 6, minW: 6, minH: 4 },
  ],
  md: [
    { i: "kpis",                   x: 0, y: 0,  w: 8, h: 3, minW: 4, minH: 2 },
    { i: "atendimentos-pendentes", x: 0, y: 3,  w: 4, h: 6, minW: 3, minH: 4 },
    { i: "compromissos",           x: 4, y: 3,  w: 4, h: 6, minW: 3, minH: 4 },
    { i: "meus-imoveis",           x: 0, y: 9,  w: 4, h: 4, minW: 3, minH: 3 },
    { i: "meus-clientes",          x: 4, y: 9,  w: 4, h: 4, minW: 3, minH: 3 },
    { i: "pretensao",              x: 0, y: 13, w: 8, h: 6, minW: 4, minH: 4 },
  ],
  sm: [
    { i: "kpis",                   x: 0, y: 0,  w: 4, h: 4, minW: 2, minH: 3 },
    { i: "atendimentos-pendentes", x: 0, y: 4,  w: 4, h: 6, minW: 2, minH: 4 },
    { i: "compromissos",           x: 0, y: 10, w: 4, h: 6, minW: 2, minH: 4 },
    { i: "meus-imoveis",           x: 0, y: 16, w: 4, h: 4, minW: 2, minH: 3 },
    { i: "meus-clientes",          x: 0, y: 20, w: 4, h: 4, minW: 2, minH: 3 },
    { i: "pretensao",              x: 0, y: 24, w: 4, h: 6, minW: 2, minH: 4 },
  ],
};

/** Metadata de cada widget (usado no menu de add/remove). */
export const WIDGET_META: Record<
  WidgetId,
  { label: string; description: string; emoji: string }
> = {
  "kpis": {
    label: "KPIs rápidos",
    description: "4 indicadores principais no topo",
    emoji: "📊",
  },
  "atendimentos-pendentes": {
    label: "Atendimentos pendentes",
    description: "Leads que aguardam resposta",
    emoji: "💬",
  },
  "compromissos": {
    label: "Compromissos",
    description: "Agenda do dia",
    emoji: "📅",
  },
  "meus-imoveis": {
    label: "Meus imóveis",
    description: "Contador de imóveis ativos",
    emoji: "🏠",
  },
  "meus-clientes": {
    label: "Meus clientes",
    description: "Contador de clientes no CRM",
    emoji: "👥",
  },
  "pretensao": {
    label: "Pretensão de compra",
    description: "Distribuição dos leads por intenção",
    emoji: "🎯",
  },
};

/** Todos os widgets disponíveis no sistema (pra iterar no menu). */
export const ALL_WIDGET_IDS = Object.keys(WIDGET_META) as WidgetId[];

/**
 * Normaliza um valor vindo do banco (pode ser array legacy ou objeto novo).
 * Retorna sempre DashboardLayouts válido.
 */
export function normalizeDashboardLayouts(raw: unknown): DashboardLayouts {
  // Formato antigo (array flat) — aplica como layout "lg" e deriva md/sm padrão
  if (Array.isArray(raw) && raw.length > 0) {
    return {
      lg: raw as WidgetLayout[],
      md: DEFAULT_DASHBOARD_LAYOUTS.md,
      sm: DEFAULT_DASHBOARD_LAYOUTS.sm,
    };
  }

  // Formato novo (objeto com lg/md/sm)
  if (
    raw &&
    typeof raw === "object" &&
    "lg" in raw &&
    "md" in raw &&
    "sm" in raw
  ) {
    const obj = raw as DashboardLayouts;
    return {
      lg: Array.isArray(obj.lg) && obj.lg.length > 0 ? obj.lg : DEFAULT_DASHBOARD_LAYOUTS.lg,
      md: Array.isArray(obj.md) && obj.md.length > 0 ? obj.md : DEFAULT_DASHBOARD_LAYOUTS.md,
      sm: Array.isArray(obj.sm) && obj.sm.length > 0 ? obj.sm : DEFAULT_DASHBOARD_LAYOUTS.sm,
    };
  }

  return DEFAULT_DASHBOARD_LAYOUTS;
}

/**
 * Adiciona um widget ao fim do layout de todos os breakpoints.
 * Usa tamanho padrão do DEFAULT pra aquele widget.
 */
export function addWidgetToLayouts(
  layouts: DashboardLayouts,
  widgetId: WidgetId
): DashboardLayouts {
  const result: DashboardLayouts = { lg: [...layouts.lg], md: [...layouts.md], sm: [...layouts.sm] };

  (Object.keys(result) as Breakpoint[]).forEach((bp) => {
    if (result[bp].some((w) => w.i === widgetId)) return;
    // busca o default pra esse widget nesse breakpoint
    const defaultItem = DEFAULT_DASHBOARD_LAYOUTS[bp].find((w) => w.i === widgetId);
    if (!defaultItem) return;
    // pega o maior Y atual pra empilhar o novo no fim
    const maxY = result[bp].reduce((m, w) => Math.max(m, w.y + w.h), 0);
    result[bp] = [...result[bp], { ...defaultItem, x: 0, y: maxY }];
  });

  return result;
}

/** Remove um widget de todos os breakpoints. */
export function removeWidgetFromLayouts(
  layouts: DashboardLayouts,
  widgetId: WidgetId
): DashboardLayouts {
  return {
    lg: layouts.lg.filter((w) => w.i !== widgetId),
    md: layouts.md.filter((w) => w.i !== widgetId),
    sm: layouts.sm.filter((w) => w.i !== widgetId),
  };
}
