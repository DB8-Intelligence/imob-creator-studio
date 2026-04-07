/**
 * PropertyPerformanceTab.tsx — Aba "Performance de Conteúdo" no editor de imóvel
 *
 * Posts gerados, métricas (views, clicks, leads), funil de conversão visual.
 */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Eye, MousePointer, Users, ArrowRight } from "lucide-react";
import type { PropertyContentMetrics } from "@/hooks/usePropertyMAX";

interface PropertyPerformanceTabProps {
  content: PropertyContentMetrics[];
}

const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  post:  { label: "Post",  color: "bg-blue-500/10 text-blue-500" },
  story: { label: "Story", color: "bg-pink-500/10 text-pink-500" },
  reel:  { label: "Reel",  color: "bg-violet-500/10 text-violet-500" },
  video: { label: "Vídeo", color: "bg-red-500/10 text-red-500" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function PropertyPerformanceTab({ content }: PropertyPerformanceTabProps) {
  const totalViews = content.reduce((s, c) => s + c.visualizacoes, 0);
  const totalClicks = content.reduce((s, c) => s + c.cliques, 0);
  const totalLeads = content.reduce((s, c) => s + c.leads_gerados, 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Visualizações</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(totalViews)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <MousePointer className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cliques</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(totalClicks)}</p>
            <p className="text-[10px] text-muted-foreground">CTR: {ctr}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Leads gerados</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Conteúdos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{content.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion funnel */}
      <Card>
        <CardContent className="p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Funil de conversão</h4>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { label: "Posts", value: content.length, color: "bg-blue-500" },
              { label: "Views", value: totalViews, color: "bg-violet-500" },
              { label: "Clicks", value: totalClicks, color: "bg-amber-500" },
              { label: "Leads", value: totalLeads, color: "bg-emerald-500" },
            ].map((step, idx, arr) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${step.color}/15 flex items-center justify-center mx-auto mb-1`}>
                    <span className="text-sm font-bold text-foreground">{formatNumber(step.value)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{step.label}</span>
                </div>
                {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground/40" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content table */}
      {content.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum conteúdo gerado para este imóvel.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {content.map((c) => {
            const tipoCfg = TIPO_CONFIG[c.tipo] ?? TIPO_CONFIG.post;
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <Badge variant="secondary" className={`text-[10px] ${tipoCfg.color}`}>{tipoCfg.label}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.titulo}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(c.data)}</p>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground flex-shrink-0">
                  <span title="Visualizações"><Eye className="w-3 h-3 inline mr-0.5" />{formatNumber(c.visualizacoes)}</span>
                  <span title="Cliques"><MousePointer className="w-3 h-3 inline mr-0.5" />{formatNumber(c.cliques)}</span>
                  <span title="Leads"><Users className="w-3 h-3 inline mr-0.5" />{c.leads_gerados}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
