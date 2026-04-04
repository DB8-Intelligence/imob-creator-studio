/**
 * TemplateCard — card visual rico para um template do catálogo.
 * Mostra preview (imagem real ou gradiente), badges, engine, crédito e CTA.
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Lock } from "lucide-react";
import type { CatalogTemplate, CreativeCategory } from "@/lib/creative-catalog";
import { CATEGORY_LABELS, STYLE_LABELS } from "@/lib/creative-catalog";

interface TemplateCardProps {
  template:   CatalogTemplate;
  selected?:  boolean;
  locked?:    boolean;
  onSelect:   (t: CatalogTemplate) => void;
}

const ASPECT_CLASS: Record<string, string> = {
  "1:1":    "aspect-square",
  "4:5":    "aspect-[4/5]",
  "9:16":   "aspect-[9/16]",
  "16:9":   "aspect-[16/9]",
  "1.91:1": "aspect-[1.91/1]",
};

export function TemplateCard({ template, selected, locked, onSelect }: TemplateCardProps) {
  const aspect = ASPECT_CLASS[template.aspect_ratio] ?? "aspect-square";

  return (
    <button
      type="button"
      onClick={() => !locked && onSelect(template)}
      className={cn(
        "group relative flex flex-col rounded-2xl border overflow-hidden text-left transition-all duration-200",
        selected
          ? "border-[var(--ds-cyan)] shadow-[0_0_0_2px_var(--ds-cyan)] scale-[1.02]"
          : "border-[var(--ds-border)] hover:border-[var(--ds-border-2)] hover:-translate-y-0.5 hover:shadow-md",
        locked && "opacity-60 cursor-not-allowed",
        "bg-[var(--ds-surface)]"
      )}
    >
      {/* Preview area */}
      <div className={cn("w-full overflow-hidden relative", aspect)}>
        {template.preview_image ? (
          <img
            src={template.preview_image}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <>
            <div className={cn("w-full h-full bg-gradient-to-br", template.preview_gradient)} />
            {/* Subtle texture overlay for gradient previews */}
            <div className="absolute inset-0 bg-black/10" />
          </>
        )}

        {/* Overlay badges — top left: status */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {template.is_new && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Novo
            </span>
          )}
          {template.is_popular && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
              🔥 Popular
            </span>
          )}
          {template.status === "beta" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
              Beta
            </span>
          )}
        </div>

        {/* Bottom-right: preview type badge */}
        <div className="absolute bottom-2 right-2">
          {template.preview_image ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[9px] font-semibold backdrop-blur-sm">
              <Sparkles className="w-2 h-2 text-emerald-400" />
              Exemplo real
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 text-white/70 text-[9px] font-medium backdrop-blur-sm">
              Modelo base
            </span>
          )}
        </div>

        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Lock className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--ds-fg)] leading-tight">
            {template.name}
          </p>
          <span className="flex items-center gap-0.5 text-[11px] text-[var(--ds-fg-muted)] shrink-0">
            <Zap className="w-3 h-3 text-amber-400" />
            {template.credit_cost}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[var(--ds-border)]">
            {CATEGORY_LABELS[template.category]}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[var(--ds-border)] text-[var(--ds-fg-muted)]">
            {STYLE_LABELS[template.visual_style]}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[var(--ds-border)] font-mono text-[var(--ds-fg-subtle)]">
            {template.aspect_ratio}
          </Badge>
        </div>
      </div>
    </button>
  );
}
