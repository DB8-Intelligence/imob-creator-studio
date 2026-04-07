/**
 * LeadTimelineItem.tsx — Item da timeline de atividades do lead
 *
 * Cada item: ícone colorido + descrição + data + resultado + próximo passo + usuário
 * Linha vertical conectando os itens.
 */
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_TYPE_CONFIG,
  RESULTADO_CONFIG,
  type LeadActivity,
} from "@/types/lead";
import { cn } from "@/lib/utils";

interface LeadTimelineItemProps {
  activity: LeadActivity;
  isLast: boolean;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) +
    " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return formatDateTime(iso);
}

export function LeadTimelineItem({ activity, isLast }: LeadTimelineItemProps) {
  const config = ACTIVITY_TYPE_CONFIG[activity.tipo] ?? ACTIVITY_TYPE_CONFIG.outro;
  const resultado = activity.resultado ? RESULTADO_CONFIG[activity.resultado] : null;

  return (
    <div className="flex gap-3 relative">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border" />
      )}

      {/* Icon circle */}
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10", config.iconBg)}>
        <span className="text-sm">{config.emoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        {/* Header row: type + time */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-semibold", config.color)}>{config.label}</span>
          {resultado && (
            <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5", resultado.color)}>
              {resultado.emoji} {resultado.label}
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground ml-auto flex-shrink-0">
            {relativeTime(activity.created_at)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground mt-1 leading-relaxed">{activity.descricao}</p>

        {/* Next step */}
        {activity.proximo_passo && (
          <div className="mt-2 rounded-lg bg-accent/5 border border-accent/10 px-3 py-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Próximo passo</p>
            <p className="text-xs text-foreground">{activity.proximo_passo}</p>
          </div>
        )}

        {/* User + full timestamp */}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          {activity.usuario_nome && <span>{activity.usuario_nome}</span>}
          <span>&middot;</span>
          <span>{formatDateTime(activity.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
