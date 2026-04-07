/**
 * SchedulePublicationDialog.tsx — Dialog de agendamento de publicação (DEV-28)
 *
 * Permite:
 * - Escolher canal (instagram, facebook, whatsapp, etc.)
 * - Definir data/hora
 * - Adicionar legenda opcional
 * - Publicar agora ou agendar
 *
 * Pode ser aberto de: feed, calendário, card de conteúdo.
 */
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Clock, Image, Video, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { PUBLICATION_CHANNELS } from "@/types/publication";
import type { PublicationChannel, SchedulePublicationInput } from "@/types/publication";
import type { ContentFeedItem } from "@/types/content-feed";

interface SchedulePublicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ContentFeedItem | null;
  onSchedule: (input: SchedulePublicationInput) => void;
  isScheduling?: boolean;
}

const TYPE_ICON = { post: Image, video: Video, text: Type } as const;

function defaultScheduleTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  // Format as datetime-local value
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SchedulePublicationDialog({
  open, onOpenChange, item, onSchedule, isScheduling,
}: SchedulePublicationDialogProps) {
  const [channel, setChannel] = useState<PublicationChannel>("instagram_feed");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleTime);
  const [caption, setCaption] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  function handleSubmit() {
    const input: SchedulePublicationInput = {
      asset_id: item?.id?.startsWith("creative-") ? null : (item?.id ?? null),
      content_feed_id: item?.id ?? null,
      channel,
      caption: caption.trim() || undefined,
      scheduled_at: publishNow ? new Date().toISOString() : new Date(scheduledAt).toISOString(),
    };
    onSchedule(input);
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setCaption("");
      setPublishNow(false);
      setScheduledAt(defaultScheduleTime());
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Publicação</DialogTitle>
          <DialogDescription>
            {item ? (
              <span className="inline-flex items-center gap-1.5">
                {item.type in TYPE_ICON && (() => {
                  const Icon = TYPE_ICON[item.type as keyof typeof TYPE_ICON];
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
                <span className="font-medium text-foreground">{item.name}</span>
              </span>
            ) : (
              "Escolha o canal e horário para publicar"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel selection */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Canal</label>
            <div className="grid grid-cols-2 gap-2">
              {PUBLICATION_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border text-sm text-left transition-colors",
                    channel === ch.id
                      ? "border-accent bg-accent/5 font-medium"
                      : "border-border hover:border-accent/30 text-muted-foreground"
                  )}
                >
                  <span>{ch.icon}</span>
                  <span className="truncate">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule mode */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Quando</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPublishNow(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-sm transition-colors",
                  !publishNow ? "border-accent bg-accent/5 font-medium" : "border-border text-muted-foreground hover:border-accent/30"
                )}
              >
                <Clock className="w-4 h-4" />Agendar
              </button>
              <button
                type="button"
                onClick={() => setPublishNow(true)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-sm transition-colors",
                  publishNow ? "border-accent bg-accent/5 font-medium" : "border-border text-muted-foreground hover:border-accent/30"
                )}
              >
                <Send className="w-4 h-4" />Publicar agora
              </button>
            </div>

            {!publishNow && (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="text-sm"
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Legenda (opcional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva uma legenda para a publicação..."
              className="w-full h-20 px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Preview info */}
          {item && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-muted/50">
              {item.previewUrl && (
                <img src={item.previewUrl} alt="" className="w-8 h-8 rounded object-cover" />
              )}
              <div>
                <p className="text-foreground font-medium">{item.name}</p>
                <p>{item.type === "post" ? "Post" : item.type === "video" ? "Vídeo" : "Texto"} &middot; {item.status}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={isScheduling}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isScheduling ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Agendando...</>
              ) : publishNow ? (
                <><Send className="w-4 h-4 mr-1" />Publicar agora</>
              ) : (
                <><Clock className="w-4 h-4 mr-1" />Agendar</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
