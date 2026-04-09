import {
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { Creative } from "@/hooks/useCreativesGallery";

const STATUS_CONFIG: Record<
  Creative["status"],
  { label: string; color: string; icon: LucideIcon | null }
> = {
  generating: { label: "Gerando...", color: "bg-blue-100 text-blue-700", icon: null },
  ready: { label: "Pronto", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  approved: { label: "Aprovado", color: "bg-purple-100 text-purple-700", icon: CheckCircle2 },
  scheduled: { label: "Agendado", color: "bg-orange-100 text-orange-700", icon: Calendar },
  published: { label: "Publicado", color: "bg-green-100 text-green-700", icon: Send },
  expired: { label: "Expirado", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

interface CreativeCardProps {
  creative: Creative;
  formatCount: number;
  timeLeft: string;
  onClick: () => void;
}

export function CreativeCard({
  creative,
  formatCount,
  timeLeft,
  onClick,
}: CreativeCardProps) {
  const cfg = STATUS_CONFIG[creative.status];
  const Icon = cfg.icon;
  const thumbnail =
    creative.format_feed ?? creative.format_story ?? creative.format_square;
  const expiring = timeLeft.includes("min") || timeLeft === "Expirado";

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={creative.template_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Gerando...
          </div>
        )}
        {formatCount > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
            {formatCount} {formatCount === 1 ? "formato" : "formatos"}
          </div>
        )}
        <div
          className={`absolute top-2 left-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.color}`}
        >
          {Icon && <Icon className="h-3 w-3" />}
          {cfg.label}
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium text-gray-800 truncate">
          {creative.template_name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {new Date(creative.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div
            className={`flex items-center gap-1 text-xs ${expiring ? "text-red-500" : "text-gray-400"}`}
          >
            <Clock className="h-3 w-3" />
            {timeLeft}
          </div>
        </div>
      </div>
    </div>
  );
}
