/**
 * VideoGalleryCard.tsx
 *
 * Card da galeria de vídeos com:
 * - Thumbnail/poster real ou gradient fallback
 * - Badges: formato, preset, mood, duração, status
 * - Ações: preview, download, excluir, usar novamente
 * - Estados visuais: processing, done, error
 */
import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVideoTemplate } from "@/lib/video-templates";
import { getVisualPreset } from "@/lib/video-visual-presets";
import { getMusicMood } from "@/lib/video-music-moods";
import type { VideoGalleryItem } from "@/hooks/useVideoGallery";

interface VideoGalleryCardProps {
  item: VideoGalleryItem;
  onPreview: (item: VideoGalleryItem) => void;
  onDownload: (item: VideoGalleryItem) => void;
  onDelete: (item: VideoGalleryItem) => void;
  onReuse: (item: VideoGalleryItem) => void;
}

const FORMAT_LABEL: Record<string, string> = {
  reels: "Reels 9:16",
  feed: "Feed 1:1",
  youtube: "YouTube 16:9",
};
const FORMAT_COLOR: Record<string, string> = {
  reels: "bg-rose-500/15 text-rose-400",
  feed: "bg-violet-500/15 text-violet-400",
  youtube: "bg-red-500/15 text-red-400",
};

const STATUS_CONFIG = {
  done: { label: "Concluído", color: "bg-emerald-500/15 text-emerald-500", icon: null },
  processing: { label: "Processando", color: "bg-amber-500/15 text-amber-500", icon: Loader2 },
  pending: { label: "Na fila", color: "bg-blue-500/15 text-blue-500", icon: Clock },
  error: { label: "Erro", color: "bg-red-500/15 text-red-500", icon: AlertCircle },
} as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  return `${days} dias atrás`;
}

// Gradient fallback based on preset
function getGradient(presetId: string | null): string {
  switch (presetId) {
    case "luxury":
      return "from-amber-900 to-amber-950";
    case "fast_sales":
      return "from-zinc-800 to-zinc-900";
    default:
      return "from-slate-800 to-slate-900";
  }
}

export function VideoGalleryCard({
  item,
  onPreview,
  onDownload,
  onDelete,
  onReuse,
}: VideoGalleryCardProps) {
  const [downloading, setDownloading] = useState(false);

  const template = item.templateId ? getVideoTemplate(item.templateId) : null;
  const preset = item.presetId ? getVisualPreset(item.presetId) : null;
  const mood = item.moodId ? getMusicMood(item.moodId) : null;
  const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.done;
  const isDone = item.status === "done";
  const hasUrl = Boolean(item.assetUrl);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.assetUrl) return;
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
      window.open(item.assetUrl, "_blank");
    } finally {
      setDownloading(false);
      onDownload(item);
    }
  }, [item, onDownload]);

  return (
    <Card className="overflow-hidden group hover:-translate-y-0.5 transition-all hover:shadow-md">
      {/* Thumbnail / poster */}
      <button
        className="relative aspect-video w-full bg-gradient-to-br cursor-pointer"
        onClick={() => isDone && hasUrl ? onPreview(item) : undefined}
        disabled={!isDone || !hasUrl}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br", getGradient(item.presetId))}>
          {item.previewUrl && (
            <img
              src={item.previewUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Play overlay */}
        {isDone && hasUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {(item.status === "processing" || item.status === "pending") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Error overlay */}
        {item.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          {item.format && (
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", FORMAT_COLOR[item.format] ?? "bg-muted text-muted-foreground")}>
              {FORMAT_LABEL[item.format] ?? item.format}
            </span>
          )}
          {preset && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/10 text-white backdrop-blur-sm">
              {preset.icon} {preset.name}
            </span>
          )}
        </div>

        {/* Duration badge */}
        {item.duration && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {item.duration}s
            </span>
          </div>
        )}

        {/* Status badge (non-done) */}
        {item.status !== "done" && (
          <div className="absolute top-2 left-2">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1", statusCfg.color)}>
              {statusCfg.icon && <statusCfg.icon className="w-3 h-3 animate-spin" />}
              {statusCfg.label}
            </span>
          </div>
        )}
      </button>

      {/* Info */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-medium text-foreground text-sm line-clamp-1">
            {template ? `${template.icon} ${template.name}` : item.templateName ?? "Vídeo"}
          </p>
          {mood && (
            <span className="text-xs text-muted-foreground flex-shrink-0">{mood.icon}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>

        {/* Actions */}
        <div className="flex gap-1.5 mt-3">
          {isDone && hasUrl ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-8"
                onClick={() => onPreview(item)}
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1" />
                )}
                Baixar
              </Button>
            </>
          ) : item.status === "error" ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8"
              onClick={() => onReuse(item)}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Tentar novamente
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8"
              disabled
            >
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              Processando...
            </Button>
          )}

          {/* Reuse + delete dropdown using simple buttons for now */}
          {isDone && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Usar novamente"
                onClick={() => onReuse(item)}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Excluir"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
