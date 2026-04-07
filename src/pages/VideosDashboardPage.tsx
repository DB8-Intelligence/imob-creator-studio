import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { checkBeforeDownload, checkBeforeReuse } from "@/modules/monetization";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useVideoModuleOverview } from "@/hooks/useVideoModule";
import { useVideoGallery, useDeleteVideoAsset } from "@/hooks/useVideoGallery";
import type { VideoGalleryItem } from "@/hooks/useVideoGallery";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { getVideoPlanRule, resolveVideoPlanTier } from "@/lib/video-plan-rules";
import { useToast } from "@/hooks/use-toast";
import { VideoGalleryCard } from "@/components/video/VideoGalleryCard";
import { VideoPlayerDialog } from "@/components/video/VideoPlayerDialog";
import {
  Film,
  Plus,
  Clock,
  TrendingUp,
  Zap,
  Lock,
  Crown,
  Star,
  ChevronRight,
  Palette,
  CreditCard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoTemplateId } from "@/lib/video-templates";
import type { VisualPresetId } from "@/lib/video-visual-presets";
import type { MusicMoodId } from "@/lib/video-music-moods";

// ── Plan Gate ────────────────────────────────────────────────────────────���────
const PlanGate = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-9 h-9 text-accent" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        Módulo de Vídeo disponível no Pro e VIP
      </h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Gere vídeos profissionais para Reels, Feed e YouTube com limites claros por plano, duração e resolução.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
        <div className="rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">Pro</span>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>20 vídeos/mês</li>
            <li>4K Ultra HD</li>
            <li>3 estilos visuais</li>
            <li>Reels, Feed e YouTube</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-foreground">VIP</span>
            <Badge className="bg-amber-500/10 text-amber-600 text-xs">Ilimitado</Badge>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>Vídeos ilimitados</li>
            <li>4K garantido</li>
            <li>Todos os formatos</li>
            <li>Suporte dedicado</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/plano")}>
          Ver planos e fazer upgrade
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/video-plans")}>
          <CreditCard className="w-4 h-4 mr-2" />
          Ver preços do módulo vídeo
        </Button>
      </div>
    </div>
  );
};

// ── Filter tabs ───────────────────────────────────────────────────���──────────
type FilterTab = "all" | "reels" | "feed" | "youtube" | "processing" | "error";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "reels", label: "Reels 9:16" },
  { id: "feed", label: "Feed 1:1" },
  { id: "youtube", label: "YouTube 16:9" },
  { id: "processing", label: "Em progresso" },
  { id: "error", label: "Com erro" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const VideosDashboardPage = () => {
  const { data: plan } = useUserPlan();
  const { workspaceId } = useWorkspaceContext();
  const { data: overview } = useVideoModuleOverview(workspaceId);
  const { data: gallery, isLoading: galleryLoading } = useVideoGallery(workspaceId);
  const deleteAssetMutation = useDeleteVideoAsset(workspaceId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [playerItem, setPlayerItem] = useState<VideoGalleryItem | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<VideoGalleryItem | null>(null);

  const hasVideoAccess = plan?.user_plan === "pro" || plan?.user_plan === "vip";

  if (plan && !hasVideoAccess) {
    return (
      <AppLayout>
        <PlanGate />
      </AppLayout>
    );
  }

  const videos = gallery ?? [];
  const activeAddonType = resolveVideoPlanTier(overview?.addOn?.addon_type ?? (plan?.user_plan === "vip" ? "premium" : plan?.user_plan === "pro" ? "plus" : "standard"));
  const planRule = getVideoPlanRule(activeAddonType);
  const videoLimit = overview?.addOn?.credits_total ?? planRule.monthlyCredits;
  const videosUsed = overview?.addOn?.credits_used ?? videos.filter((v) => v.status === "done").length;
  const pct = videoLimit ? Math.min((videosUsed / videoLimit) * 100, 100) : 0;
  const maxDurationLabel = `${planRule.maxDurationSeconds}s`;
  const maxPhotosLabel = `${planRule.maxUploadImages} fotos`;

  // Apply filter
  const filtered = useMemo(() => {
    switch (activeTab) {
      case "reels":
      case "feed":
      case "youtube":
        return videos.filter((v) => v.format === activeTab);
      case "processing":
        return videos.filter((v) => v.status === "processing" || v.status === "pending");
      case "error":
        return videos.filter((v) => v.status === "error");
      default:
        return videos;
    }
  }, [videos, activeTab]);

  // ── Handlers ───────────────���────────────────────────────────────��─────────

  const handlePreview = (item: VideoGalleryItem) => {
    setPlayerItem(item);
    setPlayerOpen(true);
  };

  const handleDownload = () => {
    // ── Monetization: control point (before download) ─────────────
    const downloadCheck = checkBeforeDownload({ plan: activeAddonType });
    if (!downloadCheck.allowed) {
      toast({ title: "Download bloqueado", description: downloadCheck.reason, variant: "destructive" });
      return;
    }
    // Actual download is handled inside the card/dialog
  };

  const handleReuse = (item: VideoGalleryItem) => {
    // ── Monetization: control point (before reuse) ────────────────
    const reuseCheck = checkBeforeReuse({ plan: activeAddonType });
    if (!reuseCheck.allowed) {
      toast({ title: "Reuso bloqueado", description: reuseCheck.reason, variant: "destructive" });
      return;
    }
    setPlayerOpen(false);
    // Navigate to video-creator with prefill state
    const meta = item.jobMetadata ?? {};
    navigate("/video-creator", {
      state: {
        prefill: true,
        templateId: item.templateId ?? undefined,
        presetId: item.presetId ?? undefined,
        moodId: item.moodId ?? undefined,
        format: item.format ?? undefined,
        aspectRatio: item.aspectRatio ?? undefined,
        propertyId: item.propertyId ?? undefined,
        imageUrls: item.imageUrls ?? undefined,
        // pass job metadata for extra context
        metadata: meta,
      } satisfies VideoCreatorPrefill,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      await deleteAssetMutation.mutateAsync(deleteItem.assetId);
      toast({ title: "Vídeo excluído" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
    setDeleteItem(null);
  };

  const handleDeleteRequest = (item: VideoGalleryItem) => {
    setPlayerOpen(false);
    setDeleteItem(item);
  };

  // ── Count badges ─────────────────────────���────────────────────────────────
  const processingCount = videos.filter((v) => v.status === "processing" || v.status === "pending").length;
  const errorCount = videos.filter((v) => v.status === "error").length;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Galeria de Vídeos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus vídeos gerados, faça download e reutilize configurações.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/video-styles")}>
              <Palette className="w-4 h-4 mr-2" />
              Ver estilos
            </Button>
            <Button
              size="sm"
              disabled={videoLimit !== null && videosUsed >= videoLimit}
              className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
              onClick={() => navigate("/video-creator")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar vídeo
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quota */}
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Film className="w-4 h-4 text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">Vídeos este mês</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {videosUsed}
                {videoLimit ? (
                  <span className="text-lg text-muted-foreground font-normal">/{videoLimit}</span>
                ) : (
                  <span className="text-lg text-amber-500 font-normal ml-1">&infin;</span>
                )}
              </p>
              {videoLimit && (
                <div className="mt-3 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-amber-500" : "bg-accent")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {`${Math.max((videoLimit ?? 0) - videosUsed, 0)} créditos restantes`}
              </p>
            </CardContent>
          </Card>

          {[
            { icon: Clock, label: "Total na galeria", value: `${videos.length} vídeos`, sub: `${videos.filter((v) => v.status === "done").length} concluídos` },
            { icon: TrendingUp, label: "Capacidade atual", value: maxDurationLabel, sub: maxPhotosLabel },
            { icon: Zap, label: "Qualidade máxima", value: activeAddonType === "enterprise" ? "4K Ultra HD" : activeAddonType === "pro" ? "Full HD" : "HD / 1080p", sub: "disponível no plano atual" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Film,
              title: "Criar novo vídeo",
              desc: "Sobe fotos, escolhe estilo e gera em < 3 min",
              href: "/video-creator",
              accent: true,
            },
            {
              icon: Palette,
              title: "Catálogo de estilos",
              desc: "Cinematic, Moderno e Luxury com preview visual",
              href: "/video-styles",
              accent: false,
            },
            {
              icon: CreditCard,
              title: "Planos de vídeo",
              desc: "Ver add-ons, upgrade e volume enterprise",
              href: "/video-plans",
              accent: false,
            },
          ].map((a) => (
            <Link key={a.href} to={a.href}>
              <div
                className={cn(
                  "rounded-2xl border p-5 h-full transition-all hover:-translate-y-0.5 hover:shadow-md",
                  a.accent
                    ? "border-accent/40 bg-accent/5 hover:bg-accent/10"
                    : "border-border bg-card hover:bg-muted/50"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", a.accent ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
                  <a.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-foreground">{a.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Gallery */}
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-foreground">Vídeos</h2>
            <div className="flex gap-1 flex-wrap">
              {FILTER_TABS.map((t) => {
                const count =
                  t.id === "processing" ? processingCount :
                  t.id === "error" ? errorCount : 0;
                // Hide processing/error tabs if count is 0
                if ((t.id === "processing" || t.id === "error") && count === 0) return null;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1",
                      activeTab === t.id
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.label}
                    {count > 0 && (
                      <span className="bg-white/20 rounded-full px-1.5 text-[10px]">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading state */}
          {galleryLoading && (
            <div className="rounded-2xl border border-border p-16 text-center">
              <Loader2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando galeria...</p>
            </div>
          )}

          {/* Empty state */}
          {!galleryLoading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center">
              <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-medium text-foreground">
                {activeTab === "all"
                  ? "Nenhum vídeo gerado ainda"
                  : activeTab === "processing"
                  ? "Nenhum vídeo em processamento"
                  : activeTab === "error"
                  ? "Nenhum vídeo com erro"
                  : `Nenhum vídeo no formato ${activeTab}`}
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                {activeTab === "all"
                  ? "Crie seu primeiro vídeo imobiliário com IA em menos de 3 minutos."
                  : "Altere o filtro ou crie um novo vídeo."}
              </p>
              {activeTab === "all" && (
                <Button onClick={() => navigate("/video-creator")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro vídeo
                </Button>
              )}
            </div>
          )}

          {/* Grid */}
          {!galleryLoading && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <VideoGalleryCard
                  key={item.id}
                  item={item}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                  onDelete={handleDeleteRequest}
                  onReuse={handleReuse}
                />
              ))}

              {/* Create new card */}
              <button
                onClick={() => navigate("/video-creator")}
                className="rounded-2xl border-2 border-dashed border-border hover:border-accent/50 p-8 flex flex-col items-center justify-center gap-3 text-center transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Criar novo vídeo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fotos &rarr; Estilo &rarr; 4K pronto</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Player dialog */}
      <VideoPlayerDialog
        item={playerItem}
        open={playerOpen}
        onOpenChange={setPlayerOpen}
        onReuse={handleReuse}
        onDelete={handleDeleteRequest}
      />

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(deleteItem)} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vídeo?</AlertDialogTitle>
            <AlertDialogDescription>
              O vídeo será removido permanentemente da sua galeria. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

// ── Prefill type (exported for VideoCreatorPage) ────────────────────────────
export interface VideoCreatorPrefill {
  prefill: true;
  templateId?: VideoTemplateId;
  presetId?: VisualPresetId;
  moodId?: MusicMoodId;
  format?: "reels" | "feed" | "youtube";
  aspectRatio?: string;
  propertyId?: string;
  imageUrls?: string[];
  metadata?: Record<string, unknown>;
}

export default VideosDashboardPage;
