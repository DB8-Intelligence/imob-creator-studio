/**
 * ActivationFunnelCard — Funnel de ativação para o dashboard admin (DEV-34 / P4)
 *
 * Mostra:
 *  - Funil: total → wizard → imóvel → criativo → ativado
 *  - Taxa de ativação
 *  - Tempo médio até primeira geração
 */
import { Users, ArrowDown, Timer, Percent } from "lucide-react";
import { useActivationMetrics } from "@/hooks/useActivationMetrics";

export function ActivationFunnelCard() {
  const { data: metrics, isLoading } = useActivationMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 animate-pulse">
        <div className="h-4 w-40 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const funnel = [
    { label: "Total de usuários", value: metrics.totalUsers, color: "bg-blue-500" },
    { label: "Wizard iniciado", value: metrics.wizardStarted, color: "bg-indigo-500" },
    { label: "Imóvel cadastrado", value: metrics.propertyUploaded, color: "bg-violet-500" },
    { label: "Criativo gerado", value: metrics.creativeGenerated, color: "bg-purple-500" },
    { label: "Totalmente ativado", value: metrics.fullyActivated, color: "bg-green-500" },
  ];

  const maxValue = Math.max(metrics.totalUsers, 1);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Funil de Ativação</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {metrics.activationRate}% ativação
          </span>
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {metrics.avgTimeToFirstGenLabel}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {funnel.map((step, i) => {
          const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          const conversionFromPrev = i > 0 && funnel[i - 1].value > 0
            ? Math.round((step.value / funnel[i - 1].value) * 100)
            : null;

          return (
            <div key={step.label}>
              {i > 0 && (
                <div className="flex items-center gap-2 ml-4 my-1">
                  <ArrowDown className="w-3 h-3 text-muted-foreground" />
                  {conversionFromPrev !== null && (
                    <span className="text-[10px] text-muted-foreground">
                      {conversionFromPrev}% conversão
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-28 text-xs text-muted-foreground truncate">{step.label}</div>
                <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                  <div
                    className={`h-full ${step.color} rounded-md transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold mix-blend-difference text-white">
                    {step.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
