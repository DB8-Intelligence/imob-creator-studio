/**
 * FormatPicker — seletor de formatos de criativo com seleção múltipla (máx. 3).
 * Cada card mostra aspect-ratio visual + dimensões. Borda azul + check ao selecionar.
 */
import { cn } from "@/lib/utils";
import { Check, Square, RectangleVertical, Smartphone, RectangleHorizontal } from "lucide-react";

export type FormatId = "1:1" | "4:5" | "9:16" | "16:9";

interface FormatOption {
  id: FormatId;
  label: string;
  sublabel: string;
  dimensions: string;
  icon: React.ReactNode;
  aspectClass: string;
}

const FORMATS: FormatOption[] = [
  {
    id: "1:1",
    label: "Quadrado",
    sublabel: "1:1",
    dimensions: "1080 x 1080",
    icon: <Square className="w-5 h-5" />,
    aspectClass: "aspect-square w-10",
  },
  {
    id: "4:5",
    label: "Feed",
    sublabel: "4:5",
    dimensions: "1080 x 1350",
    icon: <RectangleVertical className="w-5 h-5" />,
    aspectClass: "aspect-[4/5] w-9",
  },
  {
    id: "9:16",
    label: "Stories",
    sublabel: "9:16",
    dimensions: "1080 x 1920",
    icon: <Smartphone className="w-5 h-5" />,
    aspectClass: "aspect-[9/16] w-7",
  },
  {
    id: "16:9",
    label: "Paisagem",
    sublabel: "16:9",
    dimensions: "1920 x 1080",
    icon: <RectangleHorizontal className="w-5 h-5" />,
    aspectClass: "aspect-[16/9] w-12",
  },
];

const MAX_SELECTION = 3;

interface FormatPickerProps {
  selected: FormatId[];
  onChange: (formats: FormatId[]) => void;
}

export function FormatPicker({ selected, onChange }: FormatPickerProps) {
  const toggle = (id: FormatId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((f) => f !== id));
    } else if (selected.length < MAX_SELECTION) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FORMATS.map((fmt) => {
          const isSelected = selected.includes(fmt.id);
          const isDisabled = !isSelected && selected.length >= MAX_SELECTION;

          return (
            <button
              key={fmt.id}
              type="button"
              onClick={() => !isDisabled && toggle(fmt.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                isSelected
                  ? "border-[var(--ds-cyan)] bg-[rgba(0,242,255,0.06)] shadow-[0_0_0_1px_var(--ds-cyan)]"
                  : "border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--ds-border-2)]",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {/* Check badge */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--ds-cyan)] flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </span>
              )}

              {/* Aspect ratio visual preview */}
              <div className={cn(
                "rounded border-2 border-dashed",
                isSelected
                  ? "border-[var(--ds-cyan)]"
                  : "border-[var(--ds-border-2)]",
                fmt.aspectClass
              )} />

              {/* Labels */}
              <div className="text-center">
                <p className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-[var(--ds-fg)]" : "text-[var(--ds-fg-muted)]"
                )}>
                  {fmt.label}
                </p>
                <p className="text-[11px] text-[var(--ds-fg-subtle)] font-mono">
                  {fmt.sublabel} — {fmt.dimensions}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[var(--ds-fg-muted)]">
          {selected.length === 0
            ? "Selecione ao menos 1 formato"
            : `${selected.length} formato${selected.length > 1 ? "s" : ""} selecionado${selected.length > 1 ? "s" : ""}`}
          <span className="text-[var(--ds-fg-subtle)]"> (1 credito por formato)</span>
        </p>
        {selected.length >= MAX_SELECTION && (
          <span className="text-[10px] text-amber-400 font-medium">Max. {MAX_SELECTION}</span>
        )}
      </div>
    </div>
  );
}
