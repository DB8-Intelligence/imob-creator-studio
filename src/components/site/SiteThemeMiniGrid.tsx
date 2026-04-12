/**
 * SiteThemeMiniGrid.tsx — Mini grid de temas de site para uso inline.
 * Exibe cards pequenos com gradiente de cada tema.
 * Ao clicar, abre o ThemePreviewModal com preview fullscreen.
 */
import { useState } from "react";
import { Eye } from "lucide-react";
import { TEMAS, type TemaCorr } from "@/types/site";
import ThemePreviewModal from "./ThemePreviewModal";

const THEME_GRADIENTS: Record<TemaCorr, string> = {
  brisa: "from-sky-400 to-cyan-300",
  urbano: "from-gray-800 to-orange-500",
  litoral: "from-[#002B5B] to-[#D4AF37]",
  "dark-premium": "from-[#1E3A8A] to-[#D4AF37]",
  hamilton: "from-[#003d4d] to-[#1685b6]",
  nestland: "from-[#0f0f0f] to-[#b99755]",
  nexthm: "from-[#122122] to-[#2c686b]",
  ortiz: "from-[#05344a] to-[#25a5de]",
  quarter: "from-[#071c1f] to-[#FF5A3C]",
  rethouse: "from-[#1a2b6b] to-[#3454d1]",
};

const NEW_THEMES = new Set<TemaCorr>(["nestland", "nexthm", "ortiz", "quarter", "rethouse"]);

export default function SiteThemeMiniGrid() {
  const [previewTheme, setPreviewTheme] = useState<typeof TEMAS[0] | null>(null);

  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {TEMAS.map((tema) => (
          <button
            key={tema.id}
            type="button"
            onClick={() => setPreviewTheme(tema)}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white transition-all hover:border-[#002B5B] hover:shadow-md"
          >
            {/* Gradient bar */}
            <div className={`relative h-14 w-full bg-gradient-to-br ${THEME_GRADIENTS[tema.id]}`}>
              {NEW_THEMES.has(tema.id) && (
                <span className="absolute right-1 top-1 rounded-full bg-[#059669] px-1.5 py-px text-[7px] font-bold text-white">
                  Novo
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </div>
            {/* Label */}
            <div className="px-1.5 py-1.5">
              <p className="truncate text-[9px] font-semibold text-[#0A1628] leading-tight">{tema.label}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-[#94A3B8]">
        Clique em um modelo para visualizar
      </p>

      {/* Preview Modal */}
      {previewTheme && (
        <ThemePreviewModal
          open={!!previewTheme}
          onClose={() => setPreviewTheme(null)}
          themeId={previewTheme.id}
          themeName={previewTheme.label}
        />
      )}
    </>
  );
}
