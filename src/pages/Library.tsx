import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/app/AppLayout";
import CreativeSpotlight from "@/components/library/CreativeSpotlight";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  ImageIcon,
} from "lucide-react";

type Creative = {
  id: string;
  name: string;
  format: string;
  status: string | null;
  created_at: string;
  exported_url: string | null;
  caption: string | null;
  property_id: string | null;
  brand_id: string | null;
  properties: { title: string } | null;
  brands: { name: string } | null;
};

const FORMAT_LABELS: Record<string, string> = {
  feed_square: "Feed",
  feed_portrait: "Feed",
  story: "Story",
  carousel: "Carrossel",
  reels: "Reels",
  facebook_cover: "Facebook",
};

const formatLabel = (format: string) => FORMAT_LABELS[format] ?? format;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "published":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Publicado</Badge>;
    case "scheduled":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Agendado</Badge>;
    case "ready":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Pronto</Badge>;
    default:
      return <Badge variant="outline">Rascunho</Badge>;
  }
};

const TAB_STATUSES: Record<string, string[]> = {
  published: ["published"],
  scheduled: ["scheduled"],
  draft: ["draft", "ready"],
};

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const { data: creatives = [], isLoading } = useQuery({
    queryKey: ["library-creatives", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creatives")
        .select("id, name, format, status, created_at, exported_url, caption, property_id, brand_id, properties(title), brands(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Creative[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("creatives").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-creatives"] });
      toast({ title: "Criativo excluído" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir criativo", variant: "destructive" });
    },
  });

  const handleDownload = (creative: Creative) => {
    if (!creative.exported_url) {
      toast({ title: "Imagem ainda não gerada", variant: "destructive" });
      return;
    }
    window.open(creative.exported_url, "_blank");
  };

  const filteredItems = creatives.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.properties?.title ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const statuses = TAB_STATUSES[activeTab];
    const matchesTab =
      activeTab === "all" ||
      statuses.includes(item.status ?? "draft");

    return matchesSearch && matchesTab;
  });

  const countByStatus = (statuses: string[]) =>
    creatives.filter((i) => statuses.includes(i.status ?? "draft")).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Biblioteca</h1>
            <p className="text-muted-foreground mt-1">Todos os seus criativos em um só lugar</p>
          </div>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/upload")}
          >
            Novo Criativo
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar criativos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <div className="border rounded-lg flex">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos ({creatives.length})</TabsTrigger>
            <TabsTrigger value="published">Publicados ({countByStatus(["published"])})</TabsTrigger>
            <TabsTrigger value="scheduled">Agendados ({countByStatus(["scheduled"])})</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos ({countByStatus(["draft", "ready"])})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Loading skeletons */}
            {isLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Grid view */}
            {!isLoading && viewMode === "grid" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="group hover:shadow-soft transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        {item.exported_url ? (
                          <img
                            src={item.exported_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                        )}
                        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-8 h-8"
                            onClick={() => navigate(`/editor/${item.property_id}`)}
                            disabled={!item.property_id}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-8 h-8"
                            onClick={() => navigate(`/editor/${item.property_id}`)}
                            disabled={!item.property_id}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-8 h-8"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <h4 className="font-medium text-foreground line-clamp-1">
                            {item.properties?.title ?? item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">{formatLabel(item.format)}</Badge>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/editor/${item.property_id}`)}
                              disabled={!item.property_id}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/editor/${item.property_id}`)}
                              disabled={!item.property_id}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(item)}>
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(item.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List view */}
            {!isLoading && viewMode === "list" && (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-soft transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.exported_url ? (
                          <img
                            src={item.exported_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {item.properties?.title ?? item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">{formatLabel(item.format)}</Badge>
                          {item.brands?.name && (
                            <Badge variant="outline" className="text-xs">{item.brands.name}</Badge>
                          )}
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground hidden sm:block shrink-0">
                        {formatDate(item.created_at)}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => navigate(`/editor/${item.property_id}`)}
                          disabled={!item.property_id}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleDownload(item)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/editor/${item.property_id}`)}
                              disabled={!item.property_id}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(item.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground">
                  {searchQuery || activeTab !== "all"
                    ? "Nenhum criativo encontrado"
                    : "Nenhum criativo ainda"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || activeTab !== "all"
                    ? "Tente ajustar os filtros"
                    : "Publique seu primeiro imóvel para ver os criativos aqui"}
                </p>
                {!searchQuery && activeTab === "all" && (
                  <Button className="mt-4" onClick={() => navigate("/upload")}>
                    Criar primeiro criativo
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Library;
=> navigate("/upload")}>
                    Criar primeiro criativo
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Library;
