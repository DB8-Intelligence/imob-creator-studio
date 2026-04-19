// ============================================================
// PortalDetailPage — Sprint 17: gerenciamento de imóveis por portal
// Rota: /dashboard/portais/:slug
//
// Lista todas as properties do workspace e permite togglar quais vão pra
// este portal específico + marcar quais são destaque (is_featured).
// Persiste em property_portals (uma linha por property × portal).
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Star, Copy, ExternalLink, Search, Loader2, CheckSquare, Square,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const PORTALS: Record<string, { name: string; logo: string; supportsFeatured: boolean }> = {
  zap:         { name: "ZAP Imóveis",   logo: "🟡", supportsFeatured: true  },
  olx:         { name: "OLX Imóveis",   logo: "🟠", supportsFeatured: true  },
  vivareal:    { name: "VivaReal",      logo: "🔵", supportsFeatured: true  },
  imovelweb:   { name: "ImovelWeb",     logo: "🌐", supportsFeatured: true  },
  chavesnamao: { name: "Chaves na Mão", logo: "🔑", supportsFeatured: false },
  mitula:      { name: "Mitula",        logo: "📍", supportsFeatured: false },
  trovit:      { name: "Trovit",        logo: "🔍", supportsFeatured: false },
  quercasa:    { name: "QuerCasa",      logo: "🏡", supportsFeatured: false },
};

interface PropertyRow {
  id:             string;
  reference:      string | null;
  title:          string | null;
  property_type:  string | null;
  bedrooms:       number | null;
  city:           string | null;
  neighborhood:   string | null;
  price:          number | null;
  photos:         string[] | null;
}

interface PortalRow {
  property_id: string;
  is_featured: boolean;
  status:      string;
}

export default function PortalDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { workspaceId, workspaceSlug } = useWorkspaceContext();
  const { toast } = useToast();

  const portal = PORTALS[slug];
  const [props, setProps] = useState<PropertyRow[]>([]);
  const [portalRows, setPortalRows] = useState<Map<string, PortalRow>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const feedUrl = workspaceSlug
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-xml-feed?workspace=${workspaceSlug}&portal=${slug}`
    : "";

  const loadData = async () => {
    if (!workspaceId) return;
    setLoading(true);
    const [propsRes, portalsRes] = await Promise.all([
      supabase
        .from("properties")
        .select("id, reference, title, property_type, bedrooms, city, neighborhood, price, photos")
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("property_portals")
        .select("property_id, is_featured, status")
        .eq("portal_slug", slug),
    ]);

    setProps((propsRes.data ?? []) as PropertyRow[]);
    const map = new Map<string, PortalRow>();
    for (const r of (portalsRes.data ?? []) as PortalRow[]) map.set(r.property_id, r);
    setPortalRows(map);
    setLoading(false);
  };

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [workspaceId, slug]);

  const toggleProperty = async (propertyId: string) => {
    if (savingId) return;
    setSavingId(propertyId);
    const existing = portalRows.get(propertyId);
    try {
      if (existing) {
        // Remove
        await supabase.from("property_portals").delete()
          .eq("property_id", propertyId).eq("portal_slug", slug);
        setPortalRows((prev) => { const n = new Map(prev); n.delete(propertyId); return n; });
      } else {
        // Add
        const { data } = await supabase.from("property_portals").insert({
          property_id: propertyId, portal_slug: slug, status: "sent", is_featured: false,
        }).select("property_id, is_featured, status").single();
        if (data) {
          setPortalRows((prev) => { const n = new Map(prev); n.set(propertyId, data as PortalRow); return n; });
        }
      }
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const toggleFeatured = async (propertyId: string) => {
    const existing = portalRows.get(propertyId);
    if (!existing) {
      toast({ title: "Adicione o imóvel ao portal primeiro", variant: "destructive" });
      return;
    }
    setSavingId(propertyId);
    try {
      const next = !existing.is_featured;
      await supabase.from("property_portals").update({ is_featured: next })
        .eq("property_id", propertyId).eq("portal_slug", slug);
      setPortalRows((prev) => {
        const n = new Map(prev);
        n.set(propertyId, { ...existing, is_featured: next });
        return n;
      });
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const selectAll = async () => {
    const missing = props.filter((p) => !portalRows.has(p.id));
    if (!missing.length) return;
    setSavingId("__bulk");
    try {
      const rows = missing.map((p) => ({
        property_id: p.id, portal_slug: slug, status: "sent", is_featured: false,
      }));
      await supabase.from("property_portals").insert(rows);
      await loadData();
      toast({ title: `${missing.length} imóveis adicionados ao ${portal?.name ?? slug}` });
    } finally {
      setSavingId(null);
    }
  };

  const clearAll = async () => {
    if (!confirm("Remover TODOS os imóveis deste portal?")) return;
    setSavingId("__bulk");
    try {
      await supabase.from("property_portals").delete().eq("portal_slug", slug);
      await loadData();
      toast({ title: `Todos os imóveis removidos do ${portal?.name ?? slug}` });
    } finally {
      setSavingId(null);
    }
  };

  const copyFeedUrl = () => {
    if (!feedUrl) return;
    navigator.clipboard.writeText(feedUrl);
    toast({ title: "URL copiada" });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return props;
    const q = search.toLowerCase();
    return props.filter((p) =>
      (p.title ?? "").toLowerCase().includes(q) ||
      (p.reference ?? "").toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q) ||
      (p.neighborhood ?? "").toLowerCase().includes(q),
    );
  }, [props, search]);

  const activeCount = portalRows.size;
  const featuredCount = Array.from(portalRows.values()).filter((r) => r.is_featured).length;

  if (!portal) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-sm text-gray-500">Portal <strong>{slug}</strong> não encontrado.</p>
          <Link to="/dashboard/portais" className="text-sm text-[#002B5B] underline mt-2 inline-block">
            Voltar pros Portais
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <Link to="/dashboard/portais" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#002B5B] mb-2">
            <ArrowLeft className="h-3 w-3" /> Portais XML
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{portal.logo}</span>
              <div>
                <h1 className="text-2xl font-bold text-[#002B5B]">{portal.name}</h1>
                <p className="text-sm text-gray-500">
                  <strong>{activeCount}</strong> imóveis · <strong>{featuredCount}</strong> destaques
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyFeedUrl} disabled={!feedUrl} className="gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copiar URL XML
              </Button>
              {feedUrl && (
                <a href={feedUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" /> Testar
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, referência, cidade..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={selectAll} disabled={savingId === "__bulk"} className="gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" /> Adicionar todos
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={savingId === "__bulk" || activeCount === 0} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
            <Square className="h-3.5 w-3.5" /> Limpar
          </Button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-sm text-gray-500">
                {props.length === 0
                  ? "Você ainda não tem imóveis ativos. Cadastre imóveis para publicá-los neste portal."
                  : "Nenhum imóvel corresponde à busca."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const active  = portalRows.has(p.id);
              const row     = portalRows.get(p.id);
              const featured = row?.is_featured ?? false;
              const saving  = savingId === p.id;
              return (
                <Card key={p.id} className={`transition-colors ${active ? "border-[#002B5B] bg-blue-50/30" : "border-gray-200"}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleProperty(p.id)}
                        disabled={saving}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          active ? "border-[#002B5B] bg-[#002B5B] text-white" : "border-gray-300 hover:border-[#002B5B]"
                        }`}
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : active && <CheckSquare className="h-3.5 w-3.5" />}
                      </button>

                      {/* Thumb */}
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {Array.isArray(p.photos) && p.photos.length > 0 ? (
                          <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">–</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#002B5B] truncate">
                          {p.title ?? `[${p.reference ?? "s/ref"}] ${p.property_type ?? "Imóvel"}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {[p.neighborhood, p.city].filter(Boolean).join(" · ")}
                          {p.price && ` · R$ ${Number(p.price).toLocaleString("pt-BR")}`}
                          {p.bedrooms ? ` · ${p.bedrooms} dorms` : ""}
                        </p>
                      </div>

                      {/* Featured star */}
                      {portal.supportsFeatured && active && (
                        <button
                          type="button"
                          onClick={() => toggleFeatured(p.id)}
                          disabled={saving}
                          title={featured ? "Remover destaque" : "Marcar como destaque"}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            featured ? "bg-amber-100 text-amber-600" : "text-gray-300 hover:text-amber-500"
                          }`}
                        >
                          <Star className={`h-4 w-4 ${featured ? "fill-current" : ""}`} />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
