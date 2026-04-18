/**
 * GerarPosts.tsx — Grid de imóveis publicados para gerar posts.
 * Rota: /gerar-posts
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ImageIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SiteImovel } from "@/types/site";

/* ─── Fetch published properties ─────────────────────────────────────────── */

async function fetchPublishedImoveis(userId: string): Promise<SiteImovel[]> {
  const { data, error } = await supabase
    .from("site_imoveis")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as SiteImovel[];
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function GerarPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: imoveis, isLoading } = useQuery({
    queryKey: ["gerador-imoveis", user?.id],
    queryFn: () => fetchPublishedImoveis(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!imoveis) return [];
    if (!search.trim()) return imoveis;
    const q = search.toLowerCase();
    return imoveis.filter(
      (im) =>
        im.titulo.toLowerCase().includes(q) ||
        im.cidade?.toLowerCase().includes(q) ||
        im.bairro?.toLowerCase().includes(q),
    );
  }, [imoveis, search]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gerar posts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Selecione um imóvel para criar posts profissionais com IA
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar imóvel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              Nenhum imóvel publicado
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Publique imóveis no seu site imobiliário para começar a gerar posts profissionais.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/dashboard/site-imobiliario")}
            >
              Ir para Site Imobiliário
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((imovel) => (
              <Card
                key={imovel.id}
                className="overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
                onClick={() => navigate(`/gerar-posts/${imovel.id}`)}
              >
                {/* Image 16:9 */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {imovel.foto_capa ? (
                    <img
                      src={imovel.foto_capa}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <Badge
                    className="absolute top-3 left-3"
                    variant={imovel.finalidade === "venda" ? "default" : "secondary"}
                  >
                    {imovel.finalidade === "venda" ? "Venda" : imovel.finalidade === "aluguel" ? "Aluguel" : "Temporada"}
                  </Badge>
                </div>

                {/* Info */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {imovel.titulo}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {imovel.tipo && imovel.tipo.charAt(0).toUpperCase() + imovel.tipo.slice(1)}
                        {imovel.cidade ? ` · ${imovel.cidade}` : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-navy-700 hover:text-navy-900"
                    >
                      Ver <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
