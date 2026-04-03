import type { AnalyticsInsight, Severity } from "@/services/analytics/insightsEngine";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const SEVERITY_STYLE: Record<Severity, { bg: string; text: string; icon: typeof Info }> = {
  danger:  { bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",     text: "text-red-700 dark:text-red-400",     icon: XCircle       },
  warning: { bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400", icon: AlertTriangle },
  info:    { bg: "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800",       text: "text-sky-700 dark:text-sky-400",       icon: Info          },
  success: { bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
};

interface InsightCardProps {
  insight: AnalyticsInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const style = SEVERITY_STYLE[insight.severity];
  const Icon  = style.icon;
  return (
    <div className={`rounded-lg border p-4 ${style.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${style.text}`} />
        <div>
          <p className={`text-sm font-semibold ${style.text}`}>{insight.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

interface InsightsPanelProps {
  insights: AnalyticsInsight[];
  isLoading?: boolean;
}

export function InsightsPanel({ insights, isLoading }: InsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
        <p className="text-sm font-medium text-foreground">Tudo estável</p>
        <p className="text-xs text-muted-foreground mt-1">Sem alertas no momento.</p>
      </div>
    );
  }

  const critical = insights.filter((i) => i.severity === "danger");
  const rest     = insights.filter((i) => i.severity !== "danger");

  return (
    <div className="space-y-3">
      {critical.map((i) => <InsightCard key={i.id} insight={i} />)}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rest.map((i) => <InsightCard key={i.id} insight={i} />)}
        </div>
      )}
    </div>
  );
}
