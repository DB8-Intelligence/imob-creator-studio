import { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from "@/components/app/AppLayout";
import CreativeSpotlight from "@/components/library/CreativeSpotlight";
import { ShareButton } from "@/components/share/ShareButton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { useVideoJobs } from "@/hooks/useVideoModule";
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
  Film,
  Play,
  Clapperboard,
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
  /** Identifica a origem: "creatives" (legacy) ou "pipeline" (generated_assets) */
  _source: "creatives" | "pipeline";
};

const GENERATION_TYPE_LABELS: Record<string, string> = {
  gerar_post:        "Post gerado",
  gerar_story:       "Story gerado",
  gerar_banner:      "Banner gerado",
  image_restoration: "Restauração de imagem",
  gerar_arte_premium:"Arte premium",
  generate_art:      "Arte gerada",
  upscale:           "Imagem aprimorada",
  sketch_render:     "Render de esboço",
  empty_lot:         "Terreno visualizado",
  gerar_descricao:   "Descrição gerada",
};

const GENERATION_TYPE_FORMAT: Record<string, string> = {
  gerar_post:         "feed",
  gerar_story:        "story",
  gerar_banner:       "feed",
  image_restoration:  "feed",
  gerar_arte_premium: "feed",
  generate_art:       "feed",
};

type VideoItem = {
  id: string;
  title: string;
  format: string;
  style: string;
  status: string;
  created_at: string;
  output_url: string | null;
  duration_seconds: number;
  resolution: string;
};

const FORMAT_LABELS: Record<string, string> = {
  feed_square: "Feed",
  feed_portrait: "Feed",
  story: "Story",
  carousel: "Carrossel",
  reels: "Reels",
  facebook_cover: "Facebook",
  youtube: "YouTube",
  feed: "Feed",
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
    case "completed":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Concluído</Badge>;
    case "processing":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Processando</Badge>;
    case "failed":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Falhou</Badge>;
    default:
      return <Badge variant="outline">Rascunho</Badge>;
  }
};

const TAB_STATUSES: Record<string, string[]> = {
  published: ["published"],
  scheduled: ["scheduled"],
  draft: ["draft", "ready"],
};

const VIDEO_TAB_STATUSES: Record<string, string[]> = {
  completed: ["completed"],
  processing: ["processing", "queued"],
  failed: ["failed"],
};

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [assetType, setAssetType] = useState<"creatives" | "videos">("creatives");
  const [activeTab, setActiveTab] = useState("all");
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  const { data: legacyCreatives = [], isLoading: legacyLoading } = useQuery({
    queryKey: ["library-creatives", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creatives")
        .select("id, name, format, status, created_at, exported_url, caption, property_id, brand_id, properties(title), brands(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Omit<Creative, "_source">[]).map((c) => ({ ...c, _source: "creatives" as const }));
    },
    enabled: !!user,
  });

  const { data: pipelineAssets = [], isLoading: pipelineLoading } = useQuery({
    queryKey: ["library-pipeline-assets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_assets")
        .select("id, asset_url, format, generation_type, created_at, property_id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((a): Creative => ({
        id:           a.id,
        name:         GENERATION_TYPE_LABELS[a.generation_type ?? ""] ?? "Criativo gerado",
        format:       a.format ?? GENERATION_TYPE_FORMAT[a.generation_type ?? ""] ?? "feed",
        status:       "ready",
        created_at:   a.created_at ?? new Date().toISOString(),
        exported_url: a.asset_url,
        caption:      null,
        property_id:  a.property_id ?? null,
        brand_id:     null,
        properties:   null,
        brands:       null,
        _source:      "pipeline",
      }));
    },
    enabled: !!user,
  });

  const creatives = useMemo<Creative[]>(() => {
    const merged = [...legacyCreatives, ...pipelineAssets];
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return merged;
  }, [legacyCreatives, pipelineAssets]);

  const creativesLoading = legacyLoading || pipelineLoading;

  const { data: videoJobs = [], isLoading: videosLoading } = useVideoJobs(workspaceId);

  const videos = useMemo<VideoItem[]>(() => videoJobs.map((job) => ({
    id: job.id,
    title: job.title,
    format: job.format,
    style: job.style,
    status: job.status,
    created_at: job.created_at,
    output_url: job.output_url,
    duration_seconds: job.duration_seconds,
    resolution: job.resolution,
  })), [videoJobs]);

  const deleteMutation = useMutation({
    mutationFn: async ({ id, source }: { id: string; source: "creatives" | "pipeline" }) => {
      if (source === "pipeline") {
        const { error } = await supabase.from("generated_assets").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("creatives").delete().eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-creatives"] });
      queryClient.invalidateQueries({ queryKey: ["library-pipeline-assets"] });
      toast({ title: "Criativo excluído" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir criativo", variant: "destructive" });
    },
  });

  const handleDownloadCreative = (creative: Creative) => {
    if (!creative.exported_url) {
      toast({ title: "Imagem ainda não gerada", variant: "destructive" });
      return;
    }
    window.open(creative.exported_url, "_blank");
  };

  const handleDownloadVideo = (video: VideoItem) => {
    if (!video.output_url) {
      toast({ title: "Vídeo ainda não disponível", variant: "destructive" });
      return;
    }
    window.open(video.output_url, "_blank");
  };

  const filteredCreatives = creatives.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.properties?.title ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const statuses = TAB_STATUSES[activeTab];
    const matchesTab = activeTab === "all" || statuses.includes(item.status ?? "draft");
    return matchesSearch && matchesTab;
  });

  const filteredVideos = videos.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const statuses = VIDEO_TAB_STATUSES[activeTab];
    const matchesTab = activeTab === "all" || statuses.includes(item.status ?? "queued");
    return matchesSearch && matchesTab;
  });

  const countByStatus = (statuses: string[]) => creatives.filter((i) => statuses.includes(i.status ?? "draft")).length;
  const countVideosByStatus = (statuses: string[]) => videos.filter((i) => statuses.includes(i.status ?? "queued")).length;

  const isLoading = assetType === "creatives" ? creativesLoading : videosLoading;
  const spotlightImage = assetType === "creatives" ? creatives[0]?.exported_url : undefined;

  return (
    <AppLayout>
      <div className="space-y-6">
        <CreativeSpotlight
          title={assetType === "creatives" ? "Criativos organizados por status" : "Vídeos prontos para preview e download"}
          subtitle={assetType === "creatives" ? "Use a biblioteca para aprovar, editar e publicar." : "Acompanhe renderizações, assista e baixe seus vídeos sem sair do painel."}
          imageUrl={spotlightImage}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Biblioteca</h1>
            <p className="text-muted-foreground mt-1">Criativos e vídeos organizados em um só lugar</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/video-dashboard")}>
              <Film className="w-4 h-4 mr-2" />
              Dashboard Vídeo
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate(assetType === "creatives" ? "/upload" : "/video-creator")}
            >
              {assetType === "creatives" ? "Novo Criativo" : "Novo Vídeo"}
            </Button>
          </div>
        </div>

        <Tabs value={assetType} onValueChange={(value) => { setAssetType(value as "creatives" | "videos"); setActiveTab("all"); }}>
          <TabsList>
            <TabsTrigger value="creatives">Criativos ({creatives.length})</TabsTrigger>
            <TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={assetType === "creatives" ? "Buscar criativos..." : "Buscar vídeos..."}
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
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {assetType === "creatives" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todos ({creatives.length})</TabsTrigger>
              <TabsTrigger value="published">Publicados ({countByStatus(["published"])})</TabsTrigger>
              <TabsTrigger value="scheduled">Agendados ({countByStatus(["scheduled"])})</TabsTrigger>
              <TabsTrigger value="draft">Rascunhos ({countByStatus(["draft", "ready"])})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {isLoading && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-4 space-y-3"><Skeleton className="aspect-square w-full rounded-lg" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>
                  ))}
                </div>
              )}

              {!isLoading && viewMode === "grid" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCreatives.map((item) => (
                    <Card key={item.id} className="group hover:shadow-soft transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                          {item.exported_url ? <img src={item.exported_url} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-muted-foreground/50" />}
                          <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => navigate(`/editor/${item.property_id}`)} disabled={!item.property_id}><Eye className="w-4 h-4" /></Button>
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => navigate(`/editor/${item.property_id}`)} disabled={!item.property_id}><Edit2 className="w-4 h-4" /></Button>
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => handleDownloadCreative(item)}><Download className="w-4 h-4" /></Button>
                            {item.exported_url && (
                              <ShareButton imageUrl={item.exported_url} caption={item.caption ?? undefined} filename={`${item.name}.jpg`} size="sm" variant="outline" className="w-8 h-8 p-0" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h4 className="font-medium text-foreground line-clamp-1">{item.properties?.title ?? item.name}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap"><Badge variant="outline" className="text-xs">{formatLabel(item.format)}</Badge>{getStatusBadge(item.status)}</div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.created_at)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="w-8 h-8 shrink-0"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/editor/${item.property_id}`)} disabled={!item.property_id}><Eye className="w-4 h-4 mr-2" />Visualizar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/editor/${item.property_id}`)} disabled={!item.property_id}><Edit2 className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadCreative(item)}><Download className="w-4 h-4 mr-2" />Baixar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate({ id: item.id, source: item._source })}><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && viewMode === "list" && (
                <div className="space-y-2">
                  {filteredCreatives.map((item) => (
                    <Card key={item.id} className="hover:shadow-soft transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">{item.exported_url ? <img src={item.exported_url} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground/50" />}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{item.properties?.title ?? item.name}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap"><Badge variant="outline" className="text-xs">{formatLabel(item.format)}</Badge>{item.brands?.name && <Badge variant="outline" className="text-xs">{item.brands.name}</Badge>}{getStatusBadge(item.status)}</div>
                        </div>
                        <p className="text-sm text-muted-foreground hidden sm:block shrink-0">{formatDate(item.created_at)}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate(`/editor/${item.property_id}`)} disabled={!item.property_id}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleDownloadCreative(item)}><Download className="w-4 h-4" /></Button>
                          {item.exported_url && <ShareButton imageUrl={item.exported_url} caption={item.caption ?? undefined} filename={`${item.name}.jpg`} size="sm" variant="ghost" />}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="w-8 h-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/editor/${item.property_id}`)} disabled={!item.property_id}><Edit2 className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate({ id: item.id, source: item._source })}><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && filteredCreatives.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground">{searchQuery || activeTab !== "all" ? "Nenhum criativo encontrado" : "Nenhum criativo ainda"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{searchQuery || activeTab !== "all" ? "Tente ajustar os filtros" : "Publique seu primeiro imóvel para ver os criativos aqui"}</p>
                  {!searchQuery && activeTab === "all" && <Button className="mt-4" onClick={() => navigate("/upload")}>Criar primeiro criativo</Button>}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todos ({videos.length})</TabsTrigger>
              <TabsTrigger value="completed">Concluídos ({countVideosByStatus(["completed"])})</TabsTrigger>
              <TabsTrigger value="processing">Processando ({countVideosByStatus(["processing", "queued"])})</TabsTrigger>
              <TabsTrigger value="failed">Falhas ({countVideosByStatus(["failed"])})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {isLoading && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-4 space-y-3"><Skeleton className="aspect-video w-full rounded-lg" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>
                  ))}
                </div>
              )}

              {!isLoading && viewMode === "grid" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredVideos.map((item) => (
                    <Card key={item.id} className="group hover:shadow-soft transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                          {item.output_url ? (
                            <video src={item.output_url} className="w-full h-full object-cover" muted playsInline />
                          ) : (
                            <Clapperboard className="w-10 h-10 text-white/50" />
                          )}
                          <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => setPreviewVideo(item)}><Play className="w-4 h-4" /></Button>
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => handleDownloadVideo(item)}><Download className="w-4 h-4" /></Button>
                          </div>
                          <div className="absolute top-2 right-2"><Badge variant="outline" className="bg-black/40 text-white border-white/10">{item.duration_seconds}s</Badge></div>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h4 className="font-medium text-foreground line-clamp-1">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap"><Badge variant="outline" className="text-xs">{formatLabel(item.format)}</Badge><Badge variant="outline" className="text-xs capitalize">{item.style}</Badge>{getStatusBadge(item.status)}</div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.created_at)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="w-8 h-8 shrink-0"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewVideo(item)}><Play className="w-4 h-4 mr-2" />Preview</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadVideo(item)}><Download className="w-4 h-4 mr-2" />Baixar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && viewMode === "list" && (
                <div className="space-y-2">
                  {filteredVideos.map((item) => (
                    <Card key={item.id} className="hover:shadow-soft transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-24 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">{item.output_url ? <video src={item.output_url} className="w-full h-full object-cover" muted playsInline /> : <Film className="w-6 h-6 text-white/50" />}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap"><Badge variant="outline" className="text-xs">{formatLabel(item.format)}</Badge><Badge variant="outline" className="text-xs capitalize">{item.style}</Badge>{getStatusBadge(item.status)}</div>
                        </div>
                        <p className="text-sm text-muted-foreground hidden sm:block shrink-0">{formatDate(item.created_at)}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPreviewVideo(item)}><Play className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleDownloadVideo(item)}><Download className="w-4 h-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && filteredVideos.length === 0 && (
                <div className="text-center py-12">
                  <Film className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground">{searchQuery || activeTab !== "all" ? "Nenhum vídeo encontrado" : "Nenhum vídeo ainda"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{searchQuery || activeTab !== "all" ? "Tente ajustar os filtros" : "Gere seu primeiro vídeo para vê-lo aqui com preview e download."}</p>
                  {!searchQuery && activeTab === "all" && <Button className="mt-4" onClick={() => navigate("/video-creator")}><Film className="w-4 h-4 mr-2" />Criar primeiro vídeo</Button>}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            {previewVideo && (
              <>
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle>{previewVideo.title}</DialogTitle>
                  <DialogDescription>
                    {formatLabel(previewVideo.format)} · {previewVideo.duration_seconds}s · {previewVideo.resolution} · estilo {previewVideo.style}
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 pt-4">
                  {previewVideo.output_url ? (
                    <video src={previewVideo.output_url} controls autoPlay className="w-full rounded-xl bg-black max-h-[70vh]" />
                  ) : (
                    <div className="rounded-xl bg-muted p-16 text-center text-muted-foreground">Vídeo ainda não disponível.</div>
                  )}
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPreviewVideo(null)}>Fechar</Button>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleDownloadVideo(previewVideo)}>
                      <Download className="w-4 h-4 mr-2" />Baixar vídeo
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Library;
