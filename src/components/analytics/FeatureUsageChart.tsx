import { useRef, useEffect } from "react";
import type { FeatureUsageRow } from "@/services/analytics/attributionQueries";

interface FeatureDef {
  event:    string;
  label:    string;
  category: string;
}

const FEATURE_DEFS: FeatureDef[] = [
  { event: "creative_generated",  label: "Gerar Criativo",       category: "Criativos"    },
  { event: "template_used",       label: "Templates",            category: "Criativos"    },
  { event: "editor_opened",       label: "Editor",               category: "Criativos"    },
  { event: "library_viewed",      label: "Biblioteca",           category: "Criativos"    },
  { event: "upscale_used",        label: "Upscale",              category: "Ferramentas"  },
  { event: "reverse_prompt_used", label: "Reverse Prompt Lab",   category: "Ferramentas"  },
  { event: "video_creator_used",  label: "Criar Vídeo",          category: "Vídeos IA"    },
  { event: "image_restoration_used",label: "Mobiliar Ambientes",   category: "IA Imobiliária" },
  { event: "renovate_used",       label: "Reformar Imóvel",      category: "IA Imobiliária" },
  { event: "sketch_render_used",  label: "Render de Esboços",    category: "IA Imobiliária" },
  { event: "ai_agents_used",      label: "Agentes IA",           category: "Ferramentas"  },
];

const CATEGORY_COLOR: Record<string, string> = {
  "Criativos":       "bg-accent",
  "Vídeos IA":       "bg-violet-500",
  "IA Imobiliária":  "bg-sky-500",
  "Ferramentas":     "bg-emerald-500",
};

interface BarRowProps {
  label:    string;
  count:    number;
  maxCount: number;
  color:    string;
}

function BarRow({ label, count, maxCount, color }: BarRowProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

  useEffect(() => {
    barRef.current?.style.setProperty("--bar-pct", `${pct}%`);
  }, [pct]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-36 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div ref={barRef} className={`feature-bar-fill h-full rounded-full ${color}`} />
      </div>
      <span className="text-xs font-medium text-foreground w-8 text-right">{count}</span>
    </div>
  );
}

interface FeatureUsageChartProps {
  data:    FeatureUsageRow[];
  window?: "last_7d" | "last_30d";
}

export function FeatureUsageChart({ data, window = "last_30d" }: FeatureUsageChartProps) {
  const rows = FEATURE_DEFS.map((def) => {
    const row = data.find((r) => r.event_type === def.event);
    return { ...def, count: row?.[window] ?? 0 };
  }).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  if (rows.every((r) => r.count === 0)) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Nenhum dado de uso ainda.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <BarRow
          key={row.event}
          label={row.label}
          count={row.count}
          maxCount={maxCount}
          color={CATEGORY_COLOR[row.category] ?? "bg-muted-foreground"}
        />
      ))}
    </div>
  );
}
