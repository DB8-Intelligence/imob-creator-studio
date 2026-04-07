/**
 * content-analytics.ts — Tipos de analytics do ciclo de conteúdo (DEV-31)
 *
 * KPIs, métricas por canal, métricas por template/preset.
 */

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "all";

export interface ContentKPIs {
  totalGenerated: number;
  totalPublished: number;
  totalErrors: number;
  totalAutomations: number;
  videoCount: number;
  postCount: number;
  textCount: number;
  publishRate: number; // published / generated %
}

export interface ChannelMetric {
  channel: string;
  label: string;
  icon: string;
  published: number;
  errors: number;
  queued: number;
}

export interface TemplateMetric {
  id: string;
  name: string;
  count: number;
  errorCount: number;
  errorRate: number;
}

export interface PresetMetric {
  id: string;
  name: string;
  count: number;
}
