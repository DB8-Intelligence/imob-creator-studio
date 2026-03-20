import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InboxLayout from "@/components/inbox/InboxLayout";
import PostCard from "@/components/inbox/PostCard";
import FiltersBar, { type FilterOption } from "@/components/inbox/FiltersBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { InboxProperty } from "@/components/inbox/PropertyCard";
import type { PropertyStatus } from "@/components/inbox/StatusBadge";
import { ArrowLeft, ExternalLink } from "lucide-react";

const RELEVANT_STATUSES: PropertyStatus[] = ["approved", "published", "error"];

const POST_FILTERS: FilterOption[] = [
  { label: "Todos", value: "all" },
  { label: "Aprovados", value: "approved" },
  { label: "Publicados", value: "published" },
  { label: "Erros", value: "error" },
];

async function fetchAllProperties(): Promise<InboxProperty[]> {
  const res = await supabase.functions.invoke("inbox-proxy", { method: "GET" });
  if (res.error) throw new Error(res.error.message);
  return res.data as InboxProperty[];
}

async function retryPublication(id: string): Promise<void> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "POST", _path: `/properties/${id}/confirm-publication` },
  });
  if (res.error) throw new Error(res.error.message);
}

const PostsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pollingId = (location.state as { pollingId?: string } | null)?.pollingId;

  const [properties, setProperties] = useState<InboxProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadProperties = useCallback(async () => {
    try {
      const all = await fetchAllProperties();
      const relevant = all.filter((p) => RELEVANT_STATUSES.includes(p.status));
      setProperties(relevant);
      return all;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    loadProperties().finally(() => setIsLoading(false));
  }, [loadProperties]);

  // Polling when redirected from confirm
  useEffect(() => {
    if (!pollingId) return;

    pollingRef.current = setInterval(async () => {
      const all = await loadProperties();
      const target = all.find((p) => p.id === pollingId);

      if (target?.status === "published") {
        toast({ title: "✅ Post publicado com sucesso no Instagram!" });
        if (pollingRef.current) clearInterval(pollingRef.current);
      } else if (target?.status === "error") {
        toast({
          title: "Erro na publicação",
          description: "Houve um problema ao publicar no Instagram.",
          variant: "destructive",
        });
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pollingId, loadProperties]);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await retryPublication(id);
      toast({ title: "Post reenviado para publicação automática" });
      await loadProperties();
    } catch (err: any) {
      toast({ title: "Erro ao reenviar", description: err.message, variant: "destructive" });
    } finally {
      setRetryingId(null);
    }
  };

  const filtered = filter === "all" ? properties : properties.filter((p) => p.status === filter);

  return (
    <InboxLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Publicações</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe o status dos seus posts
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/inbox")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Inbox
          </Button>
        </div>

        {/* Polling indicator */}
        {pollingId && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 border border-amber-500/30 rounded-lg p-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Aguardando confirmação de publicação no Instagram...
          </div>
        )}

        <PublicationPipelineHero />
        <PublicationStatsRow items={properties} />

        {/* Filters */}
        <FiltersBar active={filter} onChange={setFilter} filters={POST_FILTERS} />

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
            <ExternalLink className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium">Nenhum post encontrado</p>
            <p className="text-xs mt-1">
              {filter === "all"
                ? "Imóveis aprovados e publicados aparecerão aqui."
                : "Nenhum resultado para o filtro selecionado."}
            </p>
            <p className="text-xs mt-3 max-w-md">
              Avance o fluxo no inbox para aprovação/publicação e use esta tela como painel de acompanhamento operacional.
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <PostCard
                key={p.id}
                property={p}
                isHighlighted={p.id === pollingId}
                isRetrying={retryingId === p.id}
                onRetry={handleRetry}
              />
            ))}
          </div>
        )}
      </div>
    </InboxLayout>
  );
};

export default PostsPage;
