/**
 * MediaCard.tsx — Card unificado da Biblioteca de Mídia
 *
 * Exibe qualquer MediaItem (image, video, post) com:
 * - Thumbnail com tipo visual
 * - Status badge (processando, erro, draft)
 * - Ações: preview, download, excluir, reutilizar (DEV-25)
 */
import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play, Download, Trash2, Eye, Loader2, AlertCircle, Clock,
  Image, Film, FileText, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types/media-library";

interface MediaCardProps {
  item: MediaItem;
  onPreview: (item: MediaItem) => void;
  onDownload: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  onReuse: (item: MediaItem) => void;
}

const TYPE_CONFIG = {
  image: { icon: Image, color: "text-blue-500", bg: "from-blue-900/80 to-blue-950" },
  video: { icon: Film, color: "text-violet-500", bg: "from-violet-900/80 to-violet-950" },
  post:  { icon: FileText, color: "text-pink-500", bg: "from-pink-900/80 to-pink-950" },
} as const;

const STATUS_BADGE = {
  done:       null,
  processing: { label: "Processando", cls: "bg-amber-500/15 text-amber-500" },
  pending:    { label: "Na fila",     cls: "bg-blue-500/15 text-blue-500" },
  error:      { label: "Erro",        cls: "bg-red-500/15 text-red-500" },
  draft:      { label: "Rascunho",    cls: "bg-zinc-500/15 text-zinc-400" },
} as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatSize(bytes: number | null): string | null {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function MediaCard({ item, onPreview, onDownload, onDelete, onReuse }: MediaCardProps) {
  const [downloading, setDownloading] = useState(false);
  const typeCfg = TYPE_CONFIG[item.type];
  const TypeIcon = typeCfg.icon;
  const statusBadge = STATUS_BADGE[item.status];
  const isDone = item.status === "done" || item.status === "draft";
  const hasUrl = Boolean(item.url);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.url) return;
    setDownloading(true);
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(item.url, "_blank");
    } finally {
      setDownloading(false);
      onDownload(item);
    }
  }, [item, onDownload]);

  return (
    <Card className="overflow-hidden group hover:-translate-y-0.5 transition-all hover:shadow-md">
      {/* Thumbnail */}
      <button
        className="relative aspect-square w-full cursor-pointer"
        onClick={() => isDone && hasUrl ? onPreview(item) : undefined}
        disabled={!isDone || !hasUrl}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br flex items-center justify-center", typeCfg.bg)}>
          {item.previewUrl ? (
            <img src={item.previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : item.url && item.type === "image" ? (
            <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <TypeIcon className="w-10 h-10 text-white/20" />
          )}
        </div>

        {/* Play overlay (videos) */}
        {item.type === "video" && isDone && hasUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {(item.status === "processing" || item.status === "pending") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
        )}

        {/* Error overlay */}
        {item.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
        )}

        {/* Top-left: status */}
        {statusBadge && (
          <div className="absolute top-1.5 left-1.5">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1", statusBadge.cls)}>
              {item.status === "processing" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
              {item.status === "pending" && <Clock className="w-2.5 h-2.5" />}
              {statusBadge.label}
            </span>
          </div>
        )}

        {/* Top-right: type badge */}
        <div className="absolute top-1.5 right-1.5">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-black/40 text-white backdrop-blur-sm inline-flex items-center gap-1")}>
            <TypeIcon className="w-2.5 h-2.5" />
            {item.type === "image" ? "Imagem" : item.type === "video" ? "Vídeo" : "Post"}
          </span>
        </div>

        {/* Bottom-right: format */}
        {item.format && (
          <div className="absolute bottom-1.5 right-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-white/80 backdrop-blur-sm">
              {item.format}
            </span>
          </div>
        )}
      </button>

      {/* Info */}
      <CardContent className="p-2.5">
        <p className="text-xs font-medium text-foreground truncate" title={item.name}>{item.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-muted-foreground">{formatSize(item.fileSizeBytes) ?? item.generationType ?? "—"}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-1 mt-2">
          {isDone && hasUrl ? (
            <>
              <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7 px-2" onClick={() => onPreview(item)}>
                <Eye className="w-3 h-3 mr-1" />Preview
              </Button>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" title="Baixar" onClick={handleDownload} disabled={downloading}>
                {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              </Button>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" title="Usar novamente" onClick={() => onReuse(item)}>
                <MoreHorizontal className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Excluir" onClick={() => onDelete(item)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          ) : item.status === "error" ? (
            <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7" onClick={() => onReuse(item)}>
              Tentar novamente
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7" disabled>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />Processando
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
