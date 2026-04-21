/**
 * AdminDashboardPage — visão geral operacional da plataforma.
 * Rota: /admin (só super_admin).
 *
 * Métricas globais (auth.users, LPs, bugs, leads) via RPC admin_stats
 * + listas de "últimos bugs" e "últimas LPs" pra triagem rápida.
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileText, Bug, Home, Globe, Loader2, ShieldOff, RefreshCw,
  TrendingUp, Eye, AlertTriangle, Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { supabase } from "@/integrations/supabase/client";
import {
  SEVERITY_LABELS, STATUS_LABELS, type BugReport,
} from "@/types/bug-report";
import { LP_TEMPLATES, type LandingPage, type LPTemplate } from "@/types/landing-page";

interface AdminStats {
  total_users: number;
  users_active_7d: number;
  users_new_30d: number;
  lps_html_active: number;
  lps_pdf_valid: number;
  lps_total: number;
  lp_views_total: number;
  lp_leads_total: number;
  imoveis_total: number;
  leads_30d: number;
  leads_today: number;
  bugs_new: number;
  bugs_investigating: number;
  bugs_blockers_open: number;
  bugs_30d: number;
  sites_published: number;
  generated_at: string;
}

export default function AdminDashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsSuperAdmin();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBugs, setRecentBugs] = useState<BugReport[]>([]);
  const [recentLps, setRecentLps] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [statsRes, bugsRes, lpsRes] = await Promise.all([
      supabase.rpc("admin_stats"),
      supabase
        .from("bug_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("landing_pages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (statsRes.error) {
      toast({
        title: "Erro ao carregar stats",
        description: statsRes.error.message,
        variant: "destructive",
      });
    } else {
      setStats(statsRes.data as AdminStats);
    }

    setRecentBugs((bugsRes.data as BugReport[]) || []);
    setRecentLps((lpsRes.data as LandingPage[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  if (adminLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md py-24 text-center">
          <ShieldOff className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h1 className="mb-2 text-xl font-bold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Só super_admin pode ver esta página.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral operacional da plataforma NexoImob AI
              {stats && (
                <span className="ml-2 text-[10px] opacity-70">
                  · atualizado{" "}
                  {new Date(stats.generated_at).toLocaleTimeString("pt-BR")}
                </span>
              )}
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Alerta bugs críticos abertos */}
        {stats && stats.bugs_blockers_open > 0 && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">
                {stats.bugs_blockers_open} bug{stats.bugs_blockers_open > 1 ? "s" : ""} crítico
                {stats.bugs_blockers_open > 1 ? "s" : ""} aberto
                {stats.bugs_blockers_open > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-700">
                Severidade blocker com status new ou investigating.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/bugs">Ver bugs</Link>
            </Button>
          </div>
        )}

        {/* KPIs principais */}
        {loading && !stats ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          stats && (
            <>
              {/* Seção: Usuários */}
              <Section title="Usuários">
                <KpiCard
                  icon={<Users className="h-5 w-5" />}
                  label="Total de corretores"
                  value={stats.total_users}
                  hint={`${stats.users_new_30d} novos nos últimos 30d`}
                />
                <KpiCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Ativos nos últimos 7d"
                  value={stats.users_active_7d}
                  hint="Logaram na plataforma"
                />
                <KpiCard
                  icon={<Globe className="h-5 w-5" />}
                  label="Sites publicados"
                  value={stats.sites_published}
                  hint="Com publicado=true"
                />
              </Section>

              {/* Seção: Landing Pages */}
              <Section title="Landing Pages">
                <KpiCard
                  icon={<FileText className="h-5 w-5" />}
                  label="HTML ativas"
                  value={stats.lps_html_active}
                  hint={`${stats.lps_pdf_valid} PDFs válidos`}
                />
                <KpiCard
                  icon={<Eye className="h-5 w-5" />}
                  label="Views totais"
                  value={stats.lp_views_total}
                  hint="Acumulado histórico"
                />
                <KpiCard
                  icon={<Users className="h-5 w-5" />}
                  label="Leads via LPs"
                  value={stats.lp_leads_total}
                  hint={
                    stats.lp_views_total > 0
                      ? `Conv ${Math.round(
                          (stats.lp_leads_total / stats.lp_views_total) * 1000,
                        ) / 10}%`
                      : "Sem views ainda"
                  }
                />
              </Section>

              {/* Seção: Imóveis & Leads */}
              <Section title="Imóveis & Leads">
                <KpiCard
                  icon={<Home className="h-5 w-5" />}
                  label="Imóveis cadastrados"
                  value={stats.imoveis_total}
                  hint="Em site_imoveis"
                />
                <KpiCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Leads 30 dias"
                  value={stats.leads_30d}
                  hint={`${stats.leads_today} hoje`}
                />
                <KpiCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Leads hoje"
                  value={stats.leads_today}
                  hint="Criados após 00:00"
                  highlight={stats.leads_today > 0}
                />
              </Section>

              {/* Seção: Bugs */}
              <Section title="Bugs">
                <KpiCard
                  icon={<Bug className="h-5 w-5" />}
                  label="Novos"
                  value={stats.bugs_new}
                  hint="Aguardam triagem"
                  highlight={stats.bugs_new > 0}
                />
                <KpiCard
                  icon={<AlertTriangle className="h-5 w-5" />}
                  label="Críticos abertos"
                  value={stats.bugs_blockers_open}
                  hint="Severity=blocker não resolvidos"
                  highlight={stats.bugs_blockers_open > 0}
                  danger={stats.bugs_blockers_open > 0}
                />
                <KpiCard
                  icon={<Bug className="h-5 w-5" />}
                  label="30 dias"
                  value={stats.bugs_30d}
                  hint={`${stats.bugs_investigating} em investigação`}
                />
              </Section>
            </>
          )
        )}

        {/* Listas: últimos bugs + últimas LPs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <RecentList
            title="Últimos bugs reportados"
            emptyMsg="Nenhum bug reportado."
            viewAllLink="/admin/bugs"
            items={recentBugs.map((b) => ({
              id: b.id,
              title: b.title,
              meta: `${SEVERITY_LABELS[b.severity].emoji} ${SEVERITY_LABELS[b.severity].label} · ${STATUS_LABELS[b.status].label}`,
              date: b.created_at,
              href: "/admin/bugs",
            }))}
          />

          <RecentList
            title="Últimas LPs criadas"
            emptyMsg="Nenhuma LP ainda."
            items={recentLps.map((lp) => {
              const t = LP_TEMPLATES.find(
                (x) => x.id === (lp.template as LPTemplate),
              );
              return {
                id: lp.id,
                title: lp.headline || "(sem título)",
                meta: `${t?.label || lp.template} · ${lp.tipo.toUpperCase()} · ${
                  lp.views_count || 0
                } views`,
                date: lp.created_at,
                href: `/dashboard/minhas-lps/${lp.id}`,
              };
            })}
          />
        </div>
      </div>
    </AppLayout>
  );
}

/* ---------------- components ---------------- */

function Section({
  title, children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, hint, highlight, danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  const borderClass = danger
    ? "border-red-200 bg-red-50/30"
    : highlight
      ? "border-accent/30 bg-accent/5"
      : "";
  return (
    <Card className={borderClass}>
      <CardContent className="pt-5">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-[11px] font-medium uppercase tracking-wider">
            {label}
          </span>
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function RecentList({
  title, emptyMsg, viewAllLink, items,
}: {
  title: string;
  emptyMsg: string;
  viewAllLink?: string;
  items: Array<{ id: string; title: string; meta: string; date: string; href: string }>;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-[11px] font-semibold text-accent hover:underline"
            >
              Ver todos
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-muted-foreground">
            {emptyMsg}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="py-2.5">
                <Link to={it.href} className="block hover:underline">
                  <p className="line-clamp-1 text-sm font-semibold">{it.title}</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate">{it.meta}</span>
                    <span className="flex-shrink-0">
                      {new Date(it.date).toLocaleString("pt-BR", {
                        day: "2-digit", month: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
