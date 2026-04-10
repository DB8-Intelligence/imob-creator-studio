import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePlanGate } from "@/hooks/usePlanGate";
import { PlanGateBanner } from "@/components/dashboard/PlanGateBanner";
import { supabase } from "@/integrations/supabase/client";
import type { VideoJob, VideoStatus } from "@/types/video";
import {
  ChevronLeft,
  Download,
  Share2,
  Send,
  Film,
  Clock,
  Image as ImageIcon,
  Calendar,
  RotateCcw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  VideoStatus,
  { label: string; color: string; pulse?: boolean }
> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600" },
  queued: {
    label: "Na fila",
    color: "bg-yellow-100 text-yellow-700",
    pulse: true,
  },
  processing: {
    label: "Processando...",
    color: "bg-blue-100 text-blue-700",
    pulse: true,
  },
  completed: { label: "Concluido", color: "bg-green-100 text-green-700" },
  failed: { label: "Falhou", color: "bg-red-100 text-red-700" },
};

const STYLE_LABELS: Record<string, string> = {
  cinematic: "Cinematic",
  moderno: "Moderno",
  luxury: "Luxury",
};

const FORMAT_LABELS: Record<string, string> = {
  reels: "Reels 9:16",
  feed: "Feed 1:1",
  youtube: "YouTube 16:9",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main Page ───────────────────────────────────────────────────────────────

const VideoPlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const { check } = usePlanGate();
  const canPublish = check.publish({ publicationsThisMonth: 0, channel: "instagram" }).allowed;

  // Fetch video job, auto-poll if processing/queued
  const {
    data: job,
    isLoading,
    isError,
  } = useQuery<VideoJob | null>({
    queryKey: ["dashboard-video-job", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("video_jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as VideoJob | null;
    },
    enabled: !!id && !!user,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "processing" || status === "queued") return 5000;
      return false;
    },
  });

  const handleRetry = async () => {
    if (!job) return;
    try {
      const { error } = await supabase
        .from("video_jobs")
        .update({ status: "queued" })
        .eq("id", job.id);
      if (error) throw error;
      toast({ title: "Video reenviado para a fila." });
    } catch (err: any) {
      toast({
        title: "Erro ao reenviar",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!job?.output_url) return;
    const text = encodeURIComponent(
      `Confira este video: ${job.title}\n${job.output_url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // ── Loading state ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <AppLayout>
        <div
          className="max-w-4xl mx-auto space-y-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────

  if (!job || isError) {
    return (
      <AppLayout>
        <div
          className="max-w-md mx-auto text-center py-20"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 mb-2">
            Video nao encontrado
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Este video pode ter sido removido ou o link esta incorreto.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/videos")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar para videos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div
        className="max-w-4xl mx-auto space-y-6"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard/videos")}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#002B5B] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para videos
        </button>

        {/* Title row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "#002B5B" }}
            >
              {job.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Criado em {formatDate(job.created_at)}
            </p>
          </div>
          <Badge
            className={cn(
              "text-xs font-semibold border-0 px-3 py-1",
              statusCfg.color,
              statusCfg.pulse && "animate-pulse"
            )}
          >
            {statusCfg.label}
          </Badge>
        </div>

        {/* ── COMPLETED: Video player ──────────────────────────────────── */}
        {job.status === "completed" && job.output_url && (
          <>
            <div className="rounded-2xl overflow-hidden bg-black shadow-xl">
              <video
                src={job.output_url}
                controls
                className="w-full max-h-[500px] object-contain"
                poster={job.thumbnail_url ?? undefined}
              />
            </div>

            {/* Info panel */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 text-sm">
                  <div className="flex items-start gap-2">
                    <Film className="w-4 h-4 text-[#002B5B] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Estilo</p>
                      <p className="font-medium text-gray-700">
                        {STYLE_LABELS[job.style] ?? job.style}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#002B5B] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Duracao</p>
                      <p className="font-medium text-gray-700">
                        {job.duration_seconds}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Film className="w-4 h-4 text-[#002B5B] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Formato</p>
                      <p className="font-medium text-gray-700">
                        {FORMAT_LABELS[job.format] ?? job.format}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ImageIcon className="w-4 h-4 text-[#002B5B] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Fotos</p>
                      <p className="font-medium text-gray-700">
                        {job.photos_count}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[#002B5B] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Criado em</p>
                      <p className="font-medium text-gray-700">
                        {formatDate(job.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <a
                href={job.output_url}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#002B5B" }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar MP4
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar WA
              </Button>
              {canPublish ? (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => toast({ title: "Publicação", description: "Conecte seu Instagram em Configurações para publicar" })}
                >
                  <Send className="h-4 w-4" />
                  Publicar no Instagram
                </Button>
              ) : (
                <PlanGateBanner module="videos" featureName="Publicar no Instagram" />
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/videos")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </div>
          </>
        )}

        {/* ── PROCESSING / QUEUED ──────────────────────────────────────── */}
        {(job.status === "processing" || job.status === "queued") && (
          <div className="space-y-6">
            {/* Skeleton video placeholder */}
            <div className="rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
              <div className="relative h-[350px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse" />
                <div className="relative z-10 text-center space-y-4">
                  <Loader2
                    className="w-14 h-14 mx-auto animate-spin"
                    style={{ color: "#002B5B" }}
                  />
                  <Badge
                    className={cn(
                      "text-sm font-semibold border-0 px-4 py-1.5",
                      statusCfg.color,
                      "animate-pulse"
                    )}
                  >
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Indeterminate progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: "#002B5B",
                  width: "35%",
                  animation: "indeterminate 1.5s ease-in-out infinite",
                }}
              />
            </div>
            <style>{`
              @keyframes indeterminate {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(200%); }
                100% { transform: translateX(-100%); }
              }
            `}</style>

            <div className="text-center">
              <p
                className="font-semibold text-lg"
                style={{ color: "#002B5B" }}
              >
                Seu video esta sendo criado
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Isso pode levar alguns minutos. A pagina atualiza automaticamente a cada 5 segundos.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/videos")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar para lista
              </Button>
            </div>
          </div>
        )}

        {/* ── FAILED ───────────────────────────────────────────────────── */}
        {job.status === "failed" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-red-50 border border-red-100 p-12 text-center">
              <AlertTriangle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <p className="font-semibold text-lg text-red-700 mb-1">
                Erro ao gerar video
              </p>
              <p className="text-sm text-red-500 mb-6">
                Ocorreu um problema durante o processamento. Voce pode tentar novamente.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleRetry}
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#002B5B" }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/videos")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── DRAFT (fallback) ─────────────────────────────────────────── */}
        {job.status === "draft" && (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-12 text-center">
            <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-gray-700 mb-1">
              Video em rascunho
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Este video ainda nao foi enviado para processamento.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/videos")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VideoPlayerPage;
