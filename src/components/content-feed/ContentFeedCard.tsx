/**
 * ContentFeedCard.tsx — Card do feed de conteúdo (DEV-27)
 *
 * Exibe item com: tipo, origem, template, status, data, thumbnail.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Video, Type, Bot, User, Loader2, CheckCircle,
  Clock, AlertCircle, Eye, Image, Send, CalendarPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentFeedItem } from "@/types/content-feed";
import type { PublicationStatus } from "@/types/publication";
import { PUBLICATION_STATUS_CFG } from "@/types/publication";

interface ContentFeedCardProps {
  item: ContentFeedItem;
  compact?: boolean;
  onSchedule?: (item: ContentFeedItem) => void;
  publicationStatus?: PublicationStatus | null;
  publicationChannel?: string | null;
}

const TYPE_CFG = {
  post:  { icon: Image, label: "Post", color: "text-blue-500", bg: "bg-blue-500/10" },
  video: { icon: Video, label: "Vídeo", color: "text-violet-500", bg: "bg-violet-500/10" },
  text:  { icon: Type, label: "Texto", color: "text-amber-500", bg: "bg-amber-500/10" },
} as const;

const STATUS_CFG = {
  scheduled:         { label: "Agendado",    color: "text-blue-500",    icon: Clock },
  processing:        { label: "Processando", color: "text-amber-500",   icon: Loader2 },
  done:              { label: "Concluído",   color: "text-emerald-500", icon: CheckCircle },
  error:             { label: "Erro",        color: "text-red-500",     icon: AlertCircle },
  ready_to_publish:  { label: "Pronto",      color: "text-cyan-500",    icon: Eye },
} as const;

const ORIGIN_CFG = {
  manual:     { icon: User, label: "Manual", color: "text-zinc-400" },
  automation: { icon: Bot,  label: "Automação", color: "text-accent" },
} as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 0) return formatFuture(iso);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatFuture(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `em ${hours}h`;
  const days = Math.floor(hours / 24);
  return `em ${days}d`;
}

export function ContentFeedCard({ item, compact, onSchedule, publicationStatus, publicationChannel }: ContentFeedCardProps) {
  const typeCfg = TYPE_CFG[item.type];
  const statusCfg = STATUS_CFG[item.status];
  const originCfg = ORIGIN_CFG[item.origin];
  const TypeIcon = typeCfg.icon;
  const StatusIcon = statusCfg.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", typeCfg.bg)}>
          <TypeIcon className={cn("w-3.5 h-3.5", typeCfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
          <div className="flex items-center gap-1.5">
            <StatusIcon className={cn("w-2.5 h-2.5", statusCfg.color, item.status === "processing" && "animate-spin")} />
            <span className={cn("text-[10px]", statusCfg.color)}>{statusCfg.label}</span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(item.scheduledAt ?? item.createdAt)}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-border hover:border-accent/30 transition-colors">
      {/* Thumbnail */}
      <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0", typeCfg.bg)}>
        {item.previewUrl ? (
          <img src={item.previewUrl} alt="" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <TypeIcon className={cn("w-6 h-6", typeCfg.color)} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
          <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
            {timeAgo(item.scheduledAt ?? item.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Status */}
          <Badge variant="secondary" className={cn("text-[10px] gap-1", statusCfg.color)}>
            <StatusIcon className={cn("w-2.5 h-2.5", item.status === "processing" && "animate-spin")} />
            {statusCfg.label}
          </Badge>

          {/* Type */}
          <Badge variant="outline" className="text-[10px]">{typeCfg.label}</Badge>

          {/* Origin */}
          <span className={cn("text-[10px] inline-flex items-center gap-0.5", originCfg.color)}>
            <originCfg.icon className="w-2.5 h-2.5" />{originCfg.label}
          </span>

          {/* Template */}
          {item.templateName && (
            <span className="text-[10px] text-muted-foreground">{item.templateName}</span>
          )}

          {/* Platform */}
          {item.platform && (
            <Badge variant="outline" className="text-[10px]">{item.platform}</Badge>
          )}
        </div>

        {/* Publication status */}
        {publicationStatus && (
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="outline" className={cn("text-[10px]", PUBLICATION_STATUS_CFG[publicationStatus]?.color)}>
              <Send className="w-2 h-2 mr-0.5" />
              {PUBLICATION_STATUS_CFG[publicationStatus]?.label}
            </Badge>
            {publicationChannel && <span className="text-[10px] text-muted-foreground">{publicationChannel}</span>}
          </div>
        )}

        {/* Error */}
        {item.error && (
          <p className="text-[10px] text-red-500 mt-1 truncate" title={item.error}>{item.error}</p>
        )}

        {/* Schedule action */}
        {onSchedule && (item.status === "done" || item.status === "ready_to_publish") && !publicationStatus && (
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-7 text-[10px] gap-1"
            onClick={(e) => { e.stopPropagation(); onSchedule(item); }}
          >
            <CalendarPlus className="w-3 h-3" />Agendar publicação
          </Button>
        )}
      </div>
    </div>
  );
}
