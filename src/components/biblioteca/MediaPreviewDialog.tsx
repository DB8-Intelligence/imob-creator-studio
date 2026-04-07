/**
 * MediaPreviewDialog.tsx — Preview de mídia (imagem ou vídeo)
 *
 * Exibe asset em dialog com metadata visível + ações (download, reuse, delete).
 */
import { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, RefreshCw, Loader2, Image, Film, FileText } from "lucide-react";
import type { MediaItem } from "@/types/media-library";

interface MediaPreviewDialogProps {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (item: MediaItem) => void;
  onReuse?: (item: MediaItem) => void;
}

const TYPE_LABEL = { image: "Imagem", video: "Vídeo", post: "Post" } as const;
const TYPE_ICON = { image: Image, video: Film, post: FileText } as const;

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function MediaPreviewDialog({
  item, open, onOpenChange, onDelete, onReuse,
}: MediaPreviewDialogProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!item?.url) return;
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
    }
  }, [item]);

  if (!item) return null;

  const Icon = TYPE_ICON[item.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>Preview do asset {item.name}</DialogDescription>
        </DialogHeader>

        {/* Media area */}
        <div className="bg-black relative">
          {item.type === "video" && item.url ? (
            <video
              src={item.url}
              poster={item.previewUrl ?? undefined}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[50vh] object-contain"
            />
          ) : (item.url || item.previewUrl) ? (
            <img
              src={item.url || item.previewUrl!}
              alt={item.name}
              className="w-full max-h-[50vh] object-contain"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <Icon className="w-16 h-16 text-white/10" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0 gap-1">
              <Icon className="w-3 h-3" />{TYPE_LABEL[item.type]}
            </Badge>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {item.format && (
              <div>
                <p className="text-muted-foreground text-xs">Formato</p>
                <p className="font-medium">{item.format}</p>
              </div>
            )}
            {item.generationType && (
              <div>
                <p className="text-muted-foreground text-xs">Geração</p>
                <p className="font-medium">{item.generationType}</p>
              </div>
            )}
            {item.templateName && (
              <div>
                <p className="text-muted-foreground text-xs">Template</p>
                <p className="font-medium">{item.templateName}</p>
              </div>
            )}
            {item.presetId && (
              <div>
                <p className="text-muted-foreground text-xs">Preset</p>
                <p className="font-medium">{item.presetId}</p>
              </div>
            )}
            {item.aspectRatio && (
              <div>
                <p className="text-muted-foreground text-xs">Aspecto</p>
                <p className="font-medium">{item.aspectRatio}</p>
              </div>
            )}
            {item.fileSizeBytes && (
              <div>
                <p className="text-muted-foreground text-xs">Tamanho</p>
                <p className="font-medium">{formatBytes(item.fileSizeBytes)}</p>
              </div>
            )}
            {item.width && item.height && (
              <div>
                <p className="text-muted-foreground text-xs">Resolução</p>
                <p className="font-medium">{item.width}x{item.height}</p>
              </div>
            )}
            {item.engineId && (
              <div>
                <p className="text-muted-foreground text-xs">Engine</p>
                <p className="font-medium">{item.engineId}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button onClick={handleDownload} disabled={downloading || !item.url} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Baixar
            </Button>
            {onReuse && (
              <Button variant="outline" onClick={() => { onReuse(item); onOpenChange(false); }}>
                <RefreshCw className="w-4 h-4 mr-2" />Usar novamente
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive ml-auto"
                onClick={() => { onDelete(item); onOpenChange(false); }}
              >
                <Trash2 className="w-4 h-4 mr-2" />Excluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
