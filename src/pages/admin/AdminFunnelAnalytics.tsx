/**
 * /admin/funnel-analytics — A/B Funnel Analytics Dashboard.
 * Reads funnel_events (via service_role RPC) and visualizes
 * CTR by section × variant, conversion funnel, and scroll depth.
 */
import { useEffect, useState, useMemo } from "react";
import AppLayout from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, TrendingUp, MousePointerClick, Eye, UserPlus } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell,
} from "recharts";

interface FunnelRow {
  event: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const SECTIONS = ["solucoes", "features", "metrics", "diferenciais", "testimonials", "pricing", "cta_final", "faq"];
const SECTION_LABELS: Record<string, string> = {
  solucoes: "Soluções", features: "Features", metrics: "Métricas",
  diferenciais: "Diferenciais", testimonials: "Depoimentos",
  pricing: "Planos", cta_final: "CTA Final", faq: "FAQ",
};
const FUNNEL_COLORS = ["#002B5B", "#1E4D8C", "#3B7DD8", "#FFD700"];

export default function AdminFunnelAnalytics() {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("funnel_events")
        .select("event, metadata, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) {
        console.error("Failed to load funnel_events:", error.message);
      }
      setRows((data as FunnelRow[] | null) ?? []);
      setLoading(false);
    })();
  }, [days]);

  // Aggregations
  const stats = useMemo(() => {
    const views = rows.filter(r => r.event === "view_landing");
    const clicks = rows.filter(r => r.event === "click_cta");
    const scrolls = rows.filter(r => r.event === "scroll_section");
    const signups = rows.filter(r => r.event === "start_signup");
    const completes = rows.filter(r => r.event === "complete_signup");

    const variantA = views.filter(r => (r.metadata as Record<string, unknown>)?.variant === "a").length;
    const variantB = views.filter(r => (r.metadata as Record<string, unknown>)?.variant === "b").length;

    return { views: views.length, clicks: clicks.length, scrolls: scrolls.length, signups: signups.length, completes: completes.length, variantA, variantB };
  }, [rows]);

  // CTR by section × variant
  const ctrData = useMemo(() => {
    return SECTIONS.map(section => {
      const sectionScrolls = rows.filter(r => r.event === "scroll_section" && (r.metadata as Record<string, unknown>)?.section === section);
      const sectionClicks = rows.filter(r => r.event === "click_cta" && (r.metadata as Record<string, unknown>)?.section === section);

      const scrollsA = sectionScrolls.filter(r => (r.metadata as Record<string, unknown>)?.variant === "a").length;
      const scrollsB = sectionScrolls.filter(r => (r.metadata as Record<string, unknown>)?.variant === "b").length;
      const clicksA = sectionClicks.filter(r => (r.metadata as Record<string, unknown>)?.variant === "a").length;
      const clicksB = sectionClicks.filter(r => (r.metadata as Record<string, unknown>)?.variant === "b").length;

      return {
        section: SECTION_LABELS[section] || section,
        "Variante A": scrollsA > 0 ? Math.round((clicksA / scrollsA) * 100) : 0,
        "Variante B": scrollsB > 0 ? Math.round((clicksB / scrollsB) * 100) : 0,
      };
    });
  }, [rows]);

  // Funnel data
  const funnelData = useMemo(() => [
    { name: "Visitas", value: stats.views },
    { name: "Cliques CTA", value: stats.clicks },
    { name: "Início Signup", value: stats.signups },
    { name: "Signup Completo", value: stats.completes },
  ], [stats]);

  // Scroll depth (% visitors reaching each section)
  const scrollDepthData = useMemo(() => {
    const totalViews = stats.views || 1;
    return SECTIONS.map(section => {
      const reached = rows.filter(r => r.event === "scroll_section" && (r.metadata as Record<string, unknown>)?.section === section).length;
      return {
        section: SECTION_LABELS[section] || section,
        "% visitantes": Math.round((reached / totalViews) * 100),
      };
    });
  }, [rows, stats.views]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--ds-bg)] section-px py-10">
        <div className="section-container max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-[var(--ds-cyan)]" />
                <h1 className="text-xl font-bold text-[var(--ds-fg)]">Funnel Analytics — A/B Testing</h1>
              </div>
              <p className="text-sm text-[var(--ds-fg-muted)]">Performance da homepage por variante</p>
            </div>
            <div className="flex gap-2">
              {[7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${days === d ? "bg-[var(--ds-cyan)] text-white" : "bg-[var(--ds-surface)] text-[var(--ds-fg-muted)] border border-[var(--ds-border)]"}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-20 text-[var(--ds-fg-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" /> <span className="text-sm">Carregando eventos...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { icon: Eye, label: "Views", value: stats.views, sub: `A: ${stats.variantA} · B: ${stats.variantB}` },
                  { icon: MousePointerClick, label: "Cliques CTA", value: stats.clicks, sub: `CTR: ${stats.views > 0 ? Math.round((stats.clicks / stats.views) * 100) : 0}%` },
                  { icon: Eye, label: "Scroll Events", value: stats.scrolls, sub: undefined as string | undefined },
                  { icon: UserPlus, label: "Signups Iniciados", value: stats.signups, sub: undefined },
                  { icon: UserPlus, label: "Signups Completos", value: stats.completes, sub: stats.signups > 0 ? `Conv: ${Math.round((stats.completes / stats.signups) * 100)}%` : undefined },
                ].map(kpi => (
                  <Card key={kpi.label} className="bg-[var(--ds-surface)] border-[var(--ds-border)]">
                    <CardContent className="p-4">
                      <kpi.icon className="w-4 h-4 text-[var(--ds-fg-muted)] mb-2" />
                      <p className="text-2xl font-bold text-[var(--ds-fg)]">{kpi.value.toLocaleString("pt-BR")}</p>
                      <p className="text-xs text-[var(--ds-fg-muted)]">{kpi.label}</p>
                      {kpi.sub && <p className="text-[10px] text-[var(--ds-fg-subtle)] mt-0.5">{kpi.sub}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTR by Section × Variant */}
              <Card className="bg-[var(--ds-surface)] border-[var(--ds-border)]">
                <CardContent className="p-6">
                  <h2 className="text-sm font-semibold text-[var(--ds-fg)] mb-4">CTR por Seção (Variante A vs B)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ctrData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="section" tick={{ fontSize: 11, fill: "var(--ds-fg-muted)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--ds-fg-muted)" }} unit="%" />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Variante A" fill="#002B5B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Variante B" fill="#FFD700" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <Card className="bg-[var(--ds-surface)] border-[var(--ds-border)]">
                  <CardContent className="p-6">
                    <h2 className="text-sm font-semibold text-[var(--ds-fg)] mb-4">Funil de Conversão</h2>
                    <ResponsiveContainer width="100%" height={280}>
                      <FunnelChart>
                        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                          {funnelData.map((_, i) => (
                            <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                          ))}
                          <LabelList position="right" fill="var(--ds-fg-muted)" stroke="none" fontSize={11} />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Scroll Depth */}
                <Card className="bg-[var(--ds-surface)] border-[var(--ds-border)]">
                  <CardContent className="p-6">
                    <h2 className="text-sm font-semibold text-[var(--ds-fg)] mb-4">Scroll Depth (% visitantes que alcançam)</h2>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={scrollDepthData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: "var(--ds-fg-muted)" }} />
                        <YAxis dataKey="section" type="category" tick={{ fontSize: 11, fill: "var(--ds-fg-muted)" }} width={90} />
                        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="% visitantes" fill="#3B7DD8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Raw events count */}
              <p className="text-xs text-[var(--ds-fg-subtle)] text-center">
                {rows.length.toLocaleString("pt-BR")} eventos nos últimos {days} dias
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
