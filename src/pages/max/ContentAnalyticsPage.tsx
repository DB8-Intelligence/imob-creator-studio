/**
 * ContentAnalyticsPage.tsx — Analytics operacional de conteúdo (DEV-31)
 *
 * KPIs do ciclo: geração → fila → publicação.
 * Métricas por canal, template, preset, mood.
 * Filtros por período.
 *
 * Fontes: generated_assets, generation_jobs, publication_queue, automation_logs.
 */
import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Image, Video, Type, Send, AlertCircle, Bot,
  TrendingUp, Loader2, Percent, Layers, Music, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useContentAnalytics } from "@/hooks/useContentAnalytics";
import type { AnalyticsPeriod, ChannelMetric, TemplateMetric, PresetMetric } from "@/types/content-analytics";

// ─── Period selector ──────────────────────────────────────────────────────

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "all", label: "Tudo" },
];

// ─── Bar chart helper ─────────────────────────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-5 bg-muted rounded-full overflow-hidden flex-1">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────

export default function ContentAnalyticsPage() {
  const { workspaceId } = useWorkspaceContext();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const { data, isLoading } = useContentAnalytics(workspaceId, period);

  const kpis = data?.kpis;
  const channelMetrics = data?.channelMetrics ?? [];
  const templateMetrics = data?.templateMetrics ?? [];
  const presetMetrics = data?.presetMetrics ?? [];
  const moodMetrics = data?.moodMetrics ?? [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics de Conteúdo</h1>
              <p className="text-sm text-muted-foreground">Ciclo completo: geração → fila → publicação</p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex border border-border rounded-lg">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-muted-foreground animate-spin" /></div>
        ) : !kpis ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <BarChart3 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Sem dados para o período selecionado.</p>
          </div>
        ) : (
          <>
            {/* ── KPIs ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Gerados", value: kpis.totalGenerated, icon: Layers, color: "text-blue-500" },
                { label: "Publicados", value: kpis.totalPublished, icon: Send, color: "text-emerald-500" },
                { label: "Erros", value: kpis.totalErrors, icon: AlertCircle, color: "text-red-500" },
                { label: "Automações", value: kpis.totalAutomations, icon: Bot, color: "text-violet-500" },
              ].map((kpi) => (
                <Card key={kpi.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                    </div>
                    <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Content type breakdown ────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Posts", value: kpis.postCount, icon: Image, color: "text-blue-500" },
                { label: "Vídeos", value: kpis.videoCount, icon: Video, color: "text-violet-500" },
                { label: "Textos", value: kpis.textCount, icon: Type, color: "text-amber-500" },
                { label: "Taxa de publicação", value: `${kpis.publishRate}%`, icon: Percent, color: "text-cyan-500" },
              ].map((kpi) => (
                <Card key={kpi.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                    </div>
                    <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Métricas por canal ────────────────────────── */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-accent" />Publicações por Canal
                </h3>
                {channelMetrics.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4">Nenhuma publicação no período.</p>
                ) : (
                  <div className="space-y-3">
                    {channelMetrics.map((m) => {
                      const total = m.published + m.errors + m.queued;
                      return (
                        <div key={m.channel} className="flex items-center gap-3">
                          <span className="text-base w-6 text-center">{m.icon}</span>
                          <span className="text-sm text-foreground w-[120px] truncate">{m.label}</span>
                          <Bar value={m.published} max={Math.max(...channelMetrics.map((c) => c.published + c.errors + c.queued), 1)} color="bg-emerald-500" />
                          <div className="flex items-center gap-2 text-xs w-[160px] flex-shrink-0 justify-end">
                            <span className="text-emerald-500">{m.published} pub</span>
                            {m.errors > 0 && <span className="text-red-500">{m.errors} err</span>}
                            {m.queued > 0 && <span className="text-blue-500">{m.queued} fila</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Templates + Presets + Moods ───────────────── */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Templates */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />Templates mais usados
                  </h3>
                  {templateMetrics.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem dados.</p>
                  ) : (
                    <div className="space-y-2">
                      {templateMetrics.slice(0, 8).map((t, i) => (
                        <div key={t.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-muted-foreground w-4 text-right">{i + 1}.</span>
                            <span className="text-xs text-foreground truncate">{t.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge variant="secondary" className="text-[10px]">{t.count}x</Badge>
                            {t.errorRate > 0 && (
                              <Badge variant="outline" className="text-[10px] text-red-500">{t.errorRate}% err</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Presets */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-violet-500" />Presets mais usados
                  </h3>
                  {presetMetrics.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem dados.</p>
                  ) : (
                    <div className="space-y-2">
                      {presetMetrics.map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-4 text-right">{i + 1}.</span>
                            <span className="text-xs text-foreground">{p.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{p.count}x</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Moods */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-500" />Moods mais usados
                  </h3>
                  {moodMetrics.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem dados.</p>
                  ) : (
                    <div className="space-y-2">
                      {moodMetrics.map((m, i) => (
                        <div key={m.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-4 text-right">{i + 1}.</span>
                            <span className="text-xs text-foreground">{m.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{m.count}x</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
