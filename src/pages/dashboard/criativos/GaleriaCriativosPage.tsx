import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Search, Images, Download, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GalleryCreative {
  id: string;
  template_name: string;
  template_slug: string;
  status: "generating" | "ready" | "approved" | "scheduled" | "published" | "expired";
  format_feed: string | null;
  format_story: string | null;
  format_square: string | null;
  format_reel: string | null;
  caption: string | null;
  hashtags: string | null;
  cta_text: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  property_id: string | null;
  credits_used: number | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Status badge config                                                */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  generating: { label: "Gerando", bg: "bg-gray-100", text: "text-gray-600" },
  ready:      { label: "Pronto", bg: "bg-blue-100", text: "text-blue-700" },
  approved:   { label: "Aprovado", bg: "bg-green-100", text: "text-green-700" },
  scheduled:  { label: "Agendado", bg: "bg-yellow-100", text: "text-yellow-700" },
  published:  { label: "Publicado", bg: "bg-purple-100", text: "text-purple-700" },
  expired:    { label: "Expirado", bg: "bg-red-100", text: "text-red-600" },
};

/* ------------------------------------------------------------------ */
/*  Gradient placeholders per slug                                     */
/* ------------------------------------------------------------------ */

const GRADIENTS = [
  "from-[#002B5B] to-[#0055a5]",
  "from-[#002B5B] via-[#1a3a6b] to-[#FFD700]",
  "from-[#1e1e2f] to-[#3a3a5c]",
  "from-[#002B5B] to-[#004080]",
  "from-[#0d0d0d] to-[#333333]",
  "from-[#FFD700] via-[#f5c200] to-[#002B5B]",
];

function gradientFor(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GaleriaCriativosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [creatives, setCreatives] = useState<GalleryCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  /* ---- Fetch ---- */
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("creatives_gallery")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar criativos:", error);
      } else {
        setCreatives((data ?? []) as GalleryCreative[]);
      }
      setLoading(false);
    }

    load();
  }, [user]);

  /* ---- Filters ---- */
  const filtered = creatives.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !c.template_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* ---- Actions ---- */
  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("creatives_gallery")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao aprovar", description: error.message, variant: "destructive" });
    } else {
      setCreatives((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c))
      );
      toast({ title: "Criativo aprovado!" });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({ title: "Download iniciado" });
  };

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#002B5B]">Galeria de Criativos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie e acompanhe todos os seus criativos imobiliarios
            </p>
          </div>
          <Link to="/dashboard/criativos/novo">
            <Button className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2">
              <Plus className="h-4 w-4" />
              Novo Criativo
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome do template..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ready">Pronto</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid / States */}
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#002B5B]/10 flex items-center justify-center mb-4">
              <Images className="h-8 w-8 text-[#002B5B]/40" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Nenhum criativo ainda</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Crie seu primeiro criativo e ele aparecera aqui!
            </p>
            <Link to="/dashboard/criativos/novo">
              <Button className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Criativo
              </Button>
            </Link>
          </div>
        ) : (
          /* Creative cards grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((creative, idx) => {
              const style = STATUS_STYLES[creative.status] ?? STATUS_STYLES.ready;
              return (
                <Card
                  key={creative.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
                  onClick={() => navigate(`/dashboard/criativos/${creative.id}`)}
                >
                  {/* Gradient placeholder */}
                  <div
                    className={`h-48 bg-gradient-to-br ${gradientFor(idx)} flex items-center justify-center`}
                  >
                    <span className="text-white/60 text-sm font-medium tracking-wide uppercase">
                      {creative.template_name}
                    </span>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[#002B5B] text-sm leading-tight line-clamp-1">
                        {creative.template_name}
                      </h3>
                      <Badge className={`${style.bg} ${style.text} border-0 text-[11px] shrink-0`}>
                        {style.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-400">
                      Criado em{" "}
                      {new Date(creative.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5 border-gray-300"
                        onClick={handleDownload}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar
                      </Button>
                      {creative.status === "ready" && (
                        <Button
                          size="sm"
                          className="text-xs gap-1.5 bg-[#002B5B] hover:bg-[#001d3d] text-white"
                          onClick={(e) => handleApprove(e, creative.id)}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Aprovar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
