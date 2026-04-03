import { useEffect } from "react";
import AppLayout from "@/components/app/AppLayout";
import { FeatureUsageChart } from "@/components/analytics/FeatureUsageChart";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { useAnalyticsKpis, useFeatureUsage } from "@/hooks/useAnalytics";
import { computeInsights } from "@/services/analytics/insightsEngine";
import { trackEvent } from "@/services/analytics/eventTracker";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Users, Zap, Activity } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

function KpiCard({ icon: Icon, label, value, sub }: {
  icon:  typeof BarChart3;
  label: string;
  value: string | number;
  sub?:  string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { data: kpis, isLoading: kpisLoading } = useAnalyticsKpis();
  const { data: featureUsage = [], isLoading: featLoading } = useFeatureUsage(workspaceId ?? undefined);

  const insights = computeInsights({ kpis: kpis ?? null, featureUsage });

  useEffect(() => {
    if (user) trackEvent(user.id, "analytics_viewed", { workspaceId: workspaceId ?? undefined });
  }, [user, workspaceId]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral de uso e performance da plataforma.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Users}
            label="Cadastros (30d)"
            value={kpisLoading ? "—" : (kpis?.signups_30d ?? 0)}
          />
          <KpiCard
            icon={Activity}
            label="Usuários ativos (7d)"
            value={kpisLoading ? "—" : (kpis?.active_users_7d ?? 0)}
          />
          <KpiCard
            icon={Zap}
            label="Total de eventos"
            value={kpisLoading ? "—" : (kpis?.events_total ?? 0)}
          />
          <KpiCard
            icon={BarChart3}
            label="Feature mais usada"
            value={kpisLoading ? "—" : (kpis?.top_feature ?? "—")}
            sub="últimos 30 dias"
          />
        </div>

        {/* Insights */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4">Alertas e Insights</h2>
          <InsightsPanel insights={insights} isLoading={kpisLoading || featLoading} />
        </section>

        {/* Feature usage */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4">Uso por Feature (30 dias)</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <FeatureUsageChart data={featureUsage} window="last_30d" />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
