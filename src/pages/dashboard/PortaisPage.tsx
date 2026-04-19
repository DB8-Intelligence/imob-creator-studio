// ============================================================
// PortaisPage — Sprint 11: Portal XML Feed dedicado
// Rota: /dashboard/portais
//
// Consolida stats de imóveis publicados em cada portal (ZAP, OLX, VivaReal...)
// + URL pública do feed XML VRSync para o corretor colar nas configs de cada
// portal externo.
// ============================================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink, Copy, CheckCircle2, Info, Globe, TrendingUp,
  Sparkles, ArrowRight, RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PortalConfig {
  slug:            string;
  name:            string;
  logo:            string;
  active_default:  boolean;
  color:           string;
}

const PORTALS: PortalConfig[] = [
  { slug: "zap",         name: "ZAP Imóveis",    logo: "🟡", active_default: true,  color: "bg-yellow-50 border-yellow-200" },
  { slug: "olx",         name: "OLX Imóveis",    logo: "🟠", active_default: true,  color: "bg-orange-50 border-orange-200" },
  { slug: "vivareal",    name: "VivaReal",       logo: "🔵", active_default: true,  color: "bg-blue-50 border-blue-200" },
  { slug: "imovelweb",   name: "ImovelWeb",      logo: "🌐", active_default: true,  color: "bg-cyan-50 border-cyan-200" },
  { slug: "chavesnamao", name: "Chaves na Mão",  logo: "🔑", active_default: false, color: "bg-amber-50 border-amber-200" },
  { slug: "mitula",      name: "Mitula",         logo: "📍", active_default: false, color: "bg-rose-50 border-rose-200" },
  { slug: "trovit",      name: "Trovit",         logo: "🔍", active_default: false, color: "bg-purple-50 border-purple-200" },
  { slug: "quercasa",    name: "QuerCasa",       logo: "🏡", active_default: false, color: "bg-emerald-50 border-emerald-200" },
];

interface PortalStats {
  sent:     number;
  featured: number;
  lastAt:   string | null;
}

export default function PortaisPage() {
  const { workspaceSlug, workspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const [stats, setStats] = useState<Record<string, PortalStats>>({});
  const [totalPropsPublished, setTotalPropsPublished] = useState(0);
  const [loading, setLoading] = useState(true);

  const feedBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-xml-feed`;

  const loadStats = async () => {
    setLoading(true);
    const [portalsRes, propsRes] = await Promise.all([
      supabase
        .from("property_portals")
        .select("portal_slug, status, is_featured, last_sent_at"),
      workspaceId
        ? supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .eq("portals_feed", true)
            .neq("status", "archived")
        : Promise.resolve({ count: 0 }),
    ]);

    const byPortal: Record<string, PortalStats> = {};
    for (const row of (portalsRes.data ?? []) as Array<{
      portal_slug: string; status: string; is_featured: boolean; last_sent_at: string | null;
    }>) {
      if (row.status !== "sent") continue;
      const s = byPortal[row.portal_slug] ?? { sent: 0, featured: 0, lastAt: null };
      s.sent++;
      if (row.is_featured) s.featured++;
      if (!s.lastAt || (row.last_sent_at && row.last_sent_at > s.lastAt)) s.lastAt = row.last_sent_at;
      byPortal[row.portal_slug] = s;
    }
    setStats(byPortal);
    setTotalPropsPublished(propsRes.count ?? 0);
    setLoading(false);
  };

  useEffect(() => { loadStats(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [workspaceId]);

  const urlFor = (slug: string) =>
    workspaceSlug
      ? `${feedBase}?workspace=${workspaceSlug}&portal=${slug}`
      : `${feedBase}?portal=${slug}`;

  const copy = (slug: string) => {
    if (!workspaceSlug) {
      toast({ title: "Workspace sem slug", description: "Configure o site primeiro em Meu Site.", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(urlFor(slug));
    toast({ title: "URL copiada", description: `Cole em ${PORTALS.find((p) => p.slug === slug)?.name} pra conectar.` });
  };

  const activePortals = Object.keys(stats).length;
  const totalFeatured = Object.values(stats).reduce((sum, s) => sum + s.featured, 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#002B5B] mb-1">
              <Globe className="h-3.5 w-3.5" />
              Portais Imobiliários
            </div>
            <h1 className="text-2xl font-bold text-[#002B5B]">Feed XML para OLX, ZAP & VivaReal</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Conecte seus imóveis nos principais portais do Brasil em minutos. Copie a URL do feed e cole nas configurações do portal.
            </p>
          </div>
          <Button variant="outline" onClick={loadStats} disabled={loading} className="gap-2 shrink-0">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar stats
          </Button>
        </div>

        {/* Stats hero */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">
                <Globe className="h-3.5 w-3.5" />
                Imóveis no feed
              </div>
              {loading
                ? <Skeleton className="h-8 w-16" />
                : <p className="text-3xl font-bold text-[#002B5B]">{totalPropsPublished}</p>}
              <p className="text-xs text-gray-500 mt-1">Com portals_feed ativo</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium uppercase tracking-wide mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Portais ativos
              </div>
              {loading
                ? <Skeleton className="h-8 w-16" />
                : <p className="text-3xl font-bold text-[#002B5B]">{activePortals}</p>}
              <p className="text-xs text-gray-500 mt-1">Recebendo imóveis</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs text-amber-600 font-medium uppercase tracking-wide mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Destaques
              </div>
              {loading
                ? <Skeleton className="h-8 w-16" />
                : <p className="text-3xl font-bold text-[#002B5B]">{totalFeatured}</p>}
              <p className="text-xs text-gray-500 mt-1">Imóveis em posição premium</p>
            </CardContent>
          </Card>
        </div>

        {/* Sem workspace slug alert */}
        {!workspaceSlug && !loading && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Workspace sem slug configurado</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Pra gerar URLs do feed você precisa configurar o slug do seu site em Meu Site.
                </p>
              </div>
              <Link to="/dashboard/site-imobiliario">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Configurar</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Portal cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Conecte seus portais</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PORTALS.map((portal) => {
              const s = stats[portal.slug] ?? { sent: 0, featured: 0, lastAt: null };
              const isActive = s.sent > 0;
              const url = urlFor(portal.slug);
              return (
                <Card key={portal.slug} className={`border ${isActive ? portal.color : "border-gray-200 bg-white"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl shrink-0">{portal.logo}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#002B5B]">{portal.name}</p>
                          {isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Enviando
                            </Badge>
                          ) : portal.active_default ? (
                            <Badge variant="outline" className="text-[10px]">Pronto</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 text-[10px]">Opcional</Badge>
                          )}
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span><strong className="text-[#002B5B]">{s.sent}</strong> imóveis</span>
                          <span><strong className="text-[#002B5B]">{s.featured}</strong> destaques</span>
                          {s.lastAt && (
                            <span>Último envio: {new Date(s.lastAt).toLocaleDateString("pt-BR")}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/dashboard/portais/${portal.slug}`} className="flex-1">
                        <Button size="sm" className="gap-1.5 w-full bg-[#002B5B] hover:bg-[#001d3d] text-white">
                          Gerenciar imóveis
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copy(portal.slug)}
                        disabled={!workspaceSlug}
                        className="gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        URL
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        disabled={!workspaceSlug}
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer" className="gap-1.5" title="Abrir feed XML">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="sr-only">Testar</span>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Como usar */}
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2 shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#002B5B] mb-2">Como conectar um portal</p>
                <ol className="text-sm text-gray-700 space-y-1.5 list-decimal list-inside">
                  <li>Marque os imóveis que você quer publicar com a opção <strong>&ldquo;Enviar pra portais&rdquo;</strong> no editor</li>
                  <li>Copie a URL do portal aqui (ex: ZAP, OLX)</li>
                  <li>No painel do portal, vá em <strong>Configurações → Integração XML</strong> e cole a URL</li>
                  <li>O portal busca o feed automaticamente (geralmente a cada 1h–24h)</li>
                </ol>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>📦 Formato: <strong>VRSync</strong> (compatível com 100% dos portais brasileiros)</span>
                  <span>⏱️ Cache: 1h</span>
                </div>
              </div>
              <Link to="/imoveis">
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  Gerenciar imóveis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
