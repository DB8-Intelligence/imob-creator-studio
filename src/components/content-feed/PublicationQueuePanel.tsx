/**
 * PublicationQueuePanel.tsx — Painel da fila de publicação (DEV-29)
 *
 * Lista items na publication_queue com:
 * - Status visual (queued/publishing/published/error/cancelled)
 * - Canal + data agendada
 * - Ações: cancelar, retry, publicar agora
 * - Logs expandíveis
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send, Clock, CheckCircle, AlertCircle, XCircle, Loader2,
  RefreshCw, Trash2, ChevronDown, ChevronUp, Zap, Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicationQueueItem, PublicationLog, PublicationStatus } from "@/types/publication";
import { PUBLICATION_CHANNELS, PUBLICATION_STATUS_CFG } from "@/types/publication";

interface PublicationQueuePanelProps {
  queue: PublicationQueueItem[];
  getLogsForItem: (id: string) => PublicationLog[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onPublishNow: (id: string) => void;
}

const STATUS_ICON: Record<PublicationStatus, typeof Clock> = {
  queued: Clock,
  publishing: Loader2,
  published: CheckCircle,
  error: AlertCircle,
  cancelled: XCircle,
};

const LOG_ACTION_LABEL: Record<string, string> = {
  created: "Criado",
  scheduled: "Agendado",
  publish_started: "Publicação iniciada",
  publish_success: "Publicado",
  publish_error: "Erro na publicação",
  retry: "Retry",
  cancelled: "Cancelado",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 0) {
    const futureH = Math.floor(Math.abs(diff) / 3600000);
    if (futureH < 24) return `em ${futureH}h`;
    return `em ${Math.floor(futureH / 24)}d`;
  }
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function PublicationQueuePanel({
  queue, getLogsForItem, onCancel, onRetry, onPublishNow,
}: PublicationQueuePanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (queue.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <Send className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma publicação na fila.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {queue.map((item) => {
        const statusCfg = PUBLICATION_STATUS_CFG[item.status];
        const StatusIcon = STATUS_ICON[item.status];
        const channelCfg = PUBLICATION_CHANNELS.find((c) => c.id === item.channel);
        const isExpanded = expandedId === item.id;
        const logs = getLogsForItem(item.id);

        return (
          <div key={item.id} className="rounded-xl border border-border p-3 space-y-2">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                <span className="text-base">{channelCfg?.icon ?? "📤"}</span>
                <StatusIcon className={cn("w-4 h-4", statusCfg.color, item.status === "publishing" && "animate-spin")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{channelCfg?.label ?? item.channel}</span>
                  <Badge variant="secondary" className={cn("text-[10px]", statusCfg.color)}>{statusCfg.label}</Badge>
                  {item.retry_count > 0 && (
                    <Badge variant="outline" className="text-[10px] text-amber-500">Retry {item.retry_count}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.scheduled_at ? `Agendado: ${new Date(item.scheduled_at).toLocaleString("pt-BR")}` : "Sem agendamento"}
                  {item.published_at && ` · Publicado: ${new Date(item.published_at).toLocaleString("pt-BR")}`}
                </p>
                {item.caption && (
                  <p className="text-xs text-foreground mt-1 line-clamp-2">{item.caption}</p>
                )}
                {item.error_message && (
                  <p className="text-[10px] text-red-500 mt-1 truncate" title={item.error_message}>{item.error_message}</p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(item.created_at)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 pl-8">
              {item.status === "queued" && (
                <>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => onPublishNow(item.id)}>
                    <Zap className="w-2.5 h-2.5" />Publicar agora
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-destructive" onClick={() => onCancel(item.id)}>
                    <Ban className="w-2.5 h-2.5" />Cancelar
                  </Button>
                </>
              )}
              {item.status === "error" && item.retry_count < 3 && (
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => onRetry(item.id)}>
                  <RefreshCw className="w-2.5 h-2.5" />Tentar novamente
                </Button>
              )}
              {item.status === "cancelled" && (
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => onRetry(item.id)}>
                  <RefreshCw className="w-2.5 h-2.5" />Reagendar
                </Button>
              )}

              {/* Logs toggle */}
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {logs.length} log{logs.length > 1 ? "s" : ""}
                </button>
              )}
            </div>

            {/* Logs */}
            {isExpanded && logs.length > 0 && (
              <div className="pl-8 space-y-1 pt-1 border-t border-border mt-1">
                {logs.map((log) => {
                  const logStatusCfg = PUBLICATION_STATUS_CFG[log.status] ?? { color: "text-zinc-400" };
                  return (
                    <div key={log.id} className="flex items-center gap-2 text-[10px]">
                      <span className={cn("font-medium", logStatusCfg.color)}>
                        {LOG_ACTION_LABEL[log.action] ?? log.action}
                      </span>
                      {log.payload && (log.payload as Record<string, unknown>).error && (
                        <span className="text-red-500 truncate max-w-[200px]">
                          {String((log.payload as Record<string, unknown>).error)}
                        </span>
                      )}
                      <span className="text-muted-foreground ml-auto">
                        {new Date(log.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
