import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InboxLayout from "@/components/inbox/InboxLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/inbox/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { InboxProperty } from "@/components/inbox/PropertyCard";
import { ArrowLeft, ImageIcon, ExternalLink, AlertCircle } from "lucide-react";

async function fetchAllProperties(): Promise<InboxProperty[]> {
  const res = await supabase.functions.invoke("inbox-proxy", { method: "GET" });
  if (res.error) throw new Error(res.error.message);
  return res.data as InboxProperty[];
}

const PostsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pollingId = (location.state as { pollingId?: string } | null)?.pollingId;

  const [properties, setProperties] = useState<InboxProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadProperties = async () => {
    try {
      const all = await fetchAllProperties();
      const relevant = all.filter(
        (p) => p.status === "approved" || p.status === "published" || p.status === "error"
      );
      setProperties(relevant);
      return all;
    } catch {
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    loadProperties().finally(() => setIsLoading(false));
  }, []);

  // Polling for status changes when redirected from confirm
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
  }, [pollingId]);

  return (
    <InboxLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Posts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Imóveis aprovados e publicados
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/inbox")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Inbox
          </Button>
        </div>

        {pollingId && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 border border-amber-500/30 rounded-lg p-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Aguardando confirmação de publicação no Instagram...
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
            <ExternalLink className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium">Nenhum post ainda</p>
            <p className="text-xs mt-1">Imóveis aprovados e publicados aparecerão aqui.</p>
          </div>
        )}

        {!isLoading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <Card key={p.id} className={`overflow-hidden ${p.id === pollingId ? "ring-2 ring-primary" : ""}`}>
                <div className="relative aspect-video bg-muted">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{p.title}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.description || "Sem descrição"}
                  </p>
                  {p.status === "error" && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" /> Erro na publicação
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </InboxLayout>
  );
};

export default PostsPage;
