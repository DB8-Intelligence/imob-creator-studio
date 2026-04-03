// Insights Engine — pure functions, zero extra DB queries.
// Derives alerts from already-fetched React Query data.

import type { AnalyticsKpis, FeatureUsageRow } from "./attributionQueries";

export type Severity = "danger" | "warning" | "info" | "success";

export interface AnalyticsInsight {
  id:       string;
  severity: Severity;
  title:    string;
  body:     string;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  danger: 0, warning: 1, info: 2, success: 3,
};

const MAX_ALERTS = 8;

// ─── Rule helpers ─────────────────────────────────────────────────────────────

function usageFor(rows: FeatureUsageRow[], event: string, window: "last_7d" | "last_30d"): number {
  return rows.find((r) => r.event_type === event)?.[window] ?? 0;
}

// ─── computeInsights ─────────────────────────────────────────────────────────

export interface InsightsInput {
  kpis:         AnalyticsKpis | null;
  featureUsage: FeatureUsageRow[];
}

export function computeInsights(input: InsightsInput): AnalyticsInsight[] {
  const { kpis, featureUsage } = input;
  const insights: AnalyticsInsight[] = [];

  // ── KPI-based rules ────────────────────────────────────────────────────────

  if (kpis) {
    if (kpis.signups_30d === 0) {
      insights.push({
        id: "no-signups-30d",
        severity: "danger",
        title: "Sem cadastros nos últimos 30 dias",
        body: "Nenhum novo usuário se cadastrou no último mês. Verifique campanhas e landing page.",
      });
    } else if (kpis.signups_30d < 5) {
      insights.push({
        id: "low-signups-30d",
        severity: "warning",
        title: `Apenas ${kpis.signups_30d} cadastros em 30 dias`,
        body: "Volume de aquisição abaixo do esperado. Considere aumentar o investimento em tráfego.",
      });
    } else {
      insights.push({
        id: "signups-ok",
        severity: "success",
        title: `${kpis.signups_30d} cadastros nos últimos 30 dias`,
        body: "Aquisição saudável. Continue monitorando a qualidade dos leads.",
      });
    }

    if (kpis.active_users_7d === 0) {
      insights.push({
        id: "no-active-users",
        severity: "danger",
        title: "Nenhum usuário ativo nos últimos 7 dias",
        body: "Risco de churn alto. Verifique se há problemas de produto ou onboarding.",
      });
    } else if (kpis.active_users_7d < 3) {
      insights.push({
        id: "low-active-users",
        severity: "warning",
        title: `Apenas ${kpis.active_users_7d} usuários ativos (7d)`,
        body: "Engajamento baixo. Considere campanhas de reativação ou melhoria no onboarding.",
      });
    }

    if (kpis.events_total === 0) {
      insights.push({
        id: "no-events",
        severity: "info",
        title: "Tracking ainda sem dados",
        body: "Nenhum evento registrado. O sistema de analytics pode não estar instrumentado.",
      });
    }
  }

  // ── Feature usage rules ────────────────────────────────────────────────────

  if (featureUsage.length > 0) {
    const creative30 = usageFor(featureUsage, "creative_generated", "last_30d");
    const upscale30  = usageFor(featureUsage, "upscale_used",        "last_30d");
    const video30    = usageFor(featureUsage, "video_creator_used",  "last_30d");
    const agents30   = usageFor(featureUsage, "ai_agents_used",       "last_30d");

    if (creative30 === 0) {
      insights.push({
        id: "no-creatives-30d",
        severity: "warning",
        title: "Nenhum criativo gerado em 30 dias",
        body: "O núcleo do produto não está sendo usado. Analise funil e barreiras de ativação.",
      });
    } else if (creative30 >= 50) {
      insights.push({
        id: "high-creative-usage",
        severity: "success",
        title: `${creative30} criativos gerados nos últimos 30 dias`,
        body: "Excelente uso do gerador de criativos. Feature saudável.",
      });
    }

    if (upscale30 >= 20) {
      insights.push({
        id: "upscale-spike",
        severity: "info",
        title: `Pico de uso no Upscale (${upscale30}x em 30d)`,
        body: "Alta demanda por upscale. Considere monitorar consumo de créditos desta feature.",
      });
    }

    if (video30 === 0) {
      insights.push({
        id: "no-video-usage",
        severity: "info",
        title: "Vídeos IA ainda sem uso",
        body: "Nenhum vídeo criado em 30 dias. Considere destacar essa funcionalidade no onboarding.",
      });
    }

    if (agents30 >= 10) {
      insights.push({
        id: "agents-adoption",
        severity: "success",
        title: `Agentes IA em crescimento (${agents30}x em 30d)`,
        body: "Boa adoção de Agentes IA. Feature com potencial de expansão.",
      });
    }
  }

  // ── Sort by severity and cap ───────────────────────────────────────────────
  return insights
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, MAX_ALERTS);
}
