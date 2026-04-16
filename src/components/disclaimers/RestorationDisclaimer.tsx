/**
 * Visual disclaimers para fotos restauradas com IA.
 * Compliance legal: indicar claramente fotos processadas.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Badge sobreposto na imagem ──────────────────────────────────────────────

export function RestorationBadge({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "compact" | "transparent";
}) {
  const styles: Record<string, string> = {
    default: "bg-blue-600 text-white border-blue-500",
    compact: "bg-blue-500/90 text-white border-blue-400/50 text-[10px] px-1.5 py-0.5",
    transparent: "bg-black/60 text-white border-white/10 backdrop-blur-sm",
  };

  return (
    <Badge
      className={cn(
        "absolute top-2 right-2 z-10 font-medium shadow-sm border",
        styles[variant],
        className,
      )}
    >
      <Sparkles className="w-3 h-3 mr-1" />
      Foto Restaurada
    </Badge>
  );
}

// ── Badge com tooltip explicativo ───────────────────────────────────────────

export function RestorationBadgeWithTooltip({
  className,
  position = "top-right",
}: {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const pos: Record<string, string> = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className={cn(
            "absolute z-10 cursor-help shadow-lg font-medium",
            "bg-blue-600 text-white border-blue-500",
            pos[position],
            className,
          )}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          IA Restaurada
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-64">
        <p className="text-sm">
          Esta foto foi processada com IA para restauracao e melhoria de qualidade
          (denoise + upscale). A imagem original permanece inalterada no sistema.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

// ── Container de imagem com disclaimer integrado ────────────────────────────

export function ImageWithRestorationDisclaimer({
  src,
  alt,
  isRestored,
  originalSrc,
  className,
  badgeVariant = "default",
  showToggle = false,
}: {
  src: string;
  alt: string;
  isRestored: boolean;
  originalSrc?: string;
  className?: string;
  badgeVariant?: "default" | "compact" | "transparent";
  showToggle?: boolean;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const currentSrc = showToggle && showOriginal && originalSrc ? originalSrc : src;

  return (
    <div className={cn("relative", className)}>
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
      />

      {isRestored && !showOriginal && (
        <RestorationBadge variant={badgeVariant} />
      )}

      {showToggle && originalSrc && (
        <div className="absolute bottom-2 left-2 z-10">
          <Badge
            className="bg-black/60 text-white border-white/10 backdrop-blur-sm cursor-pointer hover:bg-black/80 transition-colors"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? "Ver Restaurada" : "Ver Original"}
          </Badge>
        </div>
      )}
    </div>
  );
}

// ── Banner informativo para paginas com multiplas fotos ──────────────────────

export function RestorationInfoBanner({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm",
        className,
      )}
    >
      <Info className="w-4 h-4 text-blue-600 shrink-0" />
      <span>
        {count === 1
          ? "Esta foto foi processada com IA para restauracao e melhoria de qualidade."
          : `${count} fotos foram processadas com IA para restauracao e melhoria de qualidade.`}
      </span>
    </div>
  );
}
