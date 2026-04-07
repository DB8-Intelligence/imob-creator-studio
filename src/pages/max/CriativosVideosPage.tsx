/**
 * CriativosVideosPage.tsx — Galeria de vídeos (MAX) integrada com pipeline existente
 *
 * Reutiliza componentes do módulo de vídeo (VideoGalleryCard, VideoPlayerDialog)
 * dentro do contexto do hub de criativos.
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Palette, FileText, Video, LayoutGrid, Plus, Loader2, Film, Clock } from "lucide-react";
import { useVideoGallery } from "@/hooks/useVideoGallery";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { VideoGalleryCard } from "@/components/video/VideoGalleryCard";
import { VideoPlayerDialog } from "@/components/video/VideoPlayerDialog";
import type { VideoGalleryItem } from "@/hooks/useVideoGallery";

export default function CriativosVideosPage() {
  const navigate = useNavigate();
  const { workspaceId } = useWorkspaceContext();
  const { data: gallery, isLoading } = useVideoGallery(workspaceId);

  const [playerItem, setPlayerItem] = useState<VideoGalleryItem | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  const doneVideos = useMemo(() => (gallery ?? []).filter((v) => v.status === "done"), [gallery]);
  const processingVideos = useMemo(() => (gallery ?? []).filter((v) => v.status === "processing" || v.status === "pending"), [gallery]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Criativos</h1>
            <p className="text-sm text-muted-foreground">{doneVideos.length} vídeos prontos &middot; {processingVideos.length} em processamento</p>
          </div>
        </div>

        <Tabs defaultValue="videos">
          <TabsList>
            <TabsTrigger value="posts" className="gap-1.5" onClick={() => navigate("/criativos")}><FileText className="w-4 h-4" />Posts & Legendas</TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5"><Video className="w-4 h-4" />Vídeos</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5" onClick={() => navigate("/criativos/templates")}><LayoutGrid className="w-4 h-4" />Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-4 space-y-6">
            {/* Sub-tabs: Meus Vídeos | Em Processamento */}
            <Tabs defaultValue="prontos">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <TabsList>
                  <TabsTrigger value="prontos" className="gap-1.5"><Film className="w-3.5 h-3.5" />Meus Vídeos ({doneVideos.length})</TabsTrigger>
                  <TabsTrigger value="processando" className="gap-1.5">
                    <Clock className="w-3.5 h-3.5" />Em Processamento
                    {processingVideos.length > 0 && <Badge variant="secondary" className="text-[10px] ml-1">{processingVideos.length}</Badge>}
                  </TabsTrigger>
                </TabsList>
                <Button onClick={() => navigate("/video-creator")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" />Gerar Novo Vídeo
                </Button>
              </div>

              <TabsContent value="prontos" className="mt-4">
                {isLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-muted-foreground animate-spin" /></div>}
                {!isLoading && doneVideos.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                    <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-medium text-foreground">Nenhum vídeo gerado ainda</p>
                    <Button onClick={() => navigate("/video-creator")} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                      <Plus className="w-4 h-4 mr-2" />Criar primeiro vídeo
                    </Button>
                  </div>
                )}
                {!isLoading && doneVideos.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {doneVideos.map((item) => (
                      <VideoGalleryCard key={item.id} item={item}
                        onPreview={(i) => { setPlayerItem(i); setPlayerOpen(true); }}
                        onDownload={() => {}} onDelete={() => {}}
                        onReuse={() => navigate("/video-creator", { state: { prefill: true, templateId: item.templateId, presetId: item.presetId, moodId: item.moodId, format: item.format } })}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="processando" className="mt-4">
                {processingVideos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                    <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum vídeo em processamento.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {processingVideos.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                        <Loader2 className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{item.templateName ?? "Vídeo"}</p>
                          <p className="text-xs text-muted-foreground">{item.format} &middot; {item.duration ? `${item.duration}s` : ""}</p>
                        </div>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full animate-pulse w-3/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <VideoPlayerDialog item={playerItem} open={playerOpen} onOpenChange={setPlayerOpen} />
    </AppLayout>
  );
}
