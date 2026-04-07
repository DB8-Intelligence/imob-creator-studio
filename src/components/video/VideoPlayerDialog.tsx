/**
 * VideoPlayerDialog.tsx
 *
 * Player de vídeo em dialog com:
 * - Preview inline com play/pause
 * - Poster/thumbnail quando disponível
 * - Metadados visíveis (template, preset, mood, duração, formato)
 * - Download via fetch + blob (não window.open)
 * - Compatível com mobile
 */
import { useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Download,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVideoTemplate } from "@/lib/video-templates";
import { getVisualPreset } from "@/lib/video-visual-presets";
import { getMusicMood } from "@/lib/video-music-moods";
import type { VideoGalleryItem } from "@/hooks/useVideoGallery";

interface VideoPlayerDialogProps {
  item: VideoGalleryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReuse?: (item: VideoGalleryItem) => void;
  onDelete?: (item: VideoGalleryItem) => void;
}

const FORMAT_LABEL: Record<string, string> = {
  reels: "Reels 9:16",
  feed: "Feed 1:1",
  youtube: "YouTube 16:9",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VideoPlayerDialog({
  item,
  open,
  onOpenChange,
  onReuse,
  onDelete,
}: VideoPlayerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!item?.assetUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(item.assetUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${item.format ?? "reels"}-${item.duration ?? 30}s.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(item.assetUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }, [item]);

  if (!item) return null;

  const template = item.templateId ? getVideoTemplate(item.templateId) : null;
  const preset = item.presetId ? getVisualPreset(item.presetId) : null;
  const mood = item.moodId ? getMusicMood(item.moodId) : null;

  const hasVideo = item.status === "done" && item.assetUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            {template ? `${template.icon} ${template.name}` : "Video"}
            {item.format && (
              <Badge variant="outline" className="text-[10px]">
                {FORMAT_LABEL[item.format] ?? item.format}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Player area */}
        <div className="relative bg-black">
          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                src={item.assetUrl}
                poster={item.previewUrl ?? undefined}
                className="w-full max-h-[60vh] object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                playsInline
                preload="metadata"
              />
              {/* Play/Pause overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-opacity",
                    isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </div>
              </button>
            </>
          ) : item.status === "processing" || item.status === "pending" ? (
            <div className="aspect-video flex flex-col items-center justify-center gap-3 text-white/60">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm font-medium">
                {item.status === "processing" ? "Renderizando..." : "Na fila..."}
              </p>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center gap-3 text-white/40">
              <X className="w-10 h-10" />
              <p className="text-sm font-medium">Erro na geração</p>
            </div>
          )}
        </div>

        {/* Metadata + actions */}
        <div className="p-4 space-y-4">
          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5">
            {template && (
              <Badge variant="secondary" className="text-[10px]">
                {template.icon} {template.name}
              </Badge>
            )}
            {preset && (
              <Badge variant="secondary" className="text-[10px]">
                {preset.icon} {preset.name}
              </Badge>
            )}
            {mood && (
              <Badge variant="secondary" className="text-[10px]">
                {mood.icon} {mood.name}
              </Badge>
            )}
            {item.duration && (
              <Badge variant="outline" className="text-[10px]">
                {item.duration}s
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                item.status === "done" && "border-emerald-500/40 text-emerald-600",
                item.status === "processing" && "border-amber-500/40 text-amber-600",
                item.status === "pending" && "border-blue-500/40 text-blue-600",
                item.status === "error" && "border-red-500/40 text-red-600"
              )}
            >
              {item.status === "done"
                ? "Concluído"
                : item.status === "processing"
                ? "Processando"
                : item.status === "pending"
                ? "Na fila"
                : "Erro"}
            </Badge>
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {hasVideo && (
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                size="sm"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                )}
                Baixar
              </Button>
            )}
            {onReuse && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReuse(item)}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Usar novamente
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
