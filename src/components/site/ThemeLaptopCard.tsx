/**
 * ThemeLaptopCard — Preview visual de um tema de site em formato de laptop
 *
 * Inspirado nas mini-previews do Univen "Escolha o Modelo":
 * cada card mostra um laptop estilizado com uma representação abstrata
 * do layout do tema (navbar, hero com busca, grid de imóveis), aplicando
 * o gradient/paleta do tema nos elementos.
 *
 * Uso: seletor de tema dentro da tab Aparência do Meu Site.
 */
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface ThemeLaptopCardProps {
  themeKey: string;
  label: string;
  description: string;
  /** Classe Tailwind de gradient do hero (ex: "bg-gradient-to-r from-sky-400 to-cyan-300") */
  gradient: string;
  /** Cor sólida usada para acentos (buttons/CTA dentro do preview) */
  accentColor?: string;
  /** Se o tema está selecionado */
  isActive: boolean;
  /** Selecionar o tema */
  onSelect: () => void;
  /** Abrir preview fullscreen (opcional) */
  onPreview?: () => void;
  /** Tom de fundo do "desktop" atrás da tela — light/dark */
  surface?: "light" | "dark";
}

export function ThemeLaptopCard({
  themeKey,
  label,
  description,
  gradient,
  accentColor = "#002B5B",
  isActive,
  onSelect,
  onPreview,
  surface = "light",
}: ThemeLaptopCardProps) {
  const isDarkSurface = surface === "dark";

  return (
    <div className="flex flex-col items-center">
      {/* ─── Laptop frame ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onSelect}
        className={`
          group relative w-full rounded-t-xl border-2 transition-all
          ${isActive
            ? "border-[#002B5B] shadow-[0_6px_20px_rgba(0,43,91,0.15)]"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"}
        `}
        aria-pressed={isActive}
        aria-label={`Selecionar tema ${label}`}
      >
        {/* Badge "Ativo" */}
        {isActive && (
          <Badge className="absolute -right-2 -top-2 z-10 bg-[#002B5B] text-[10px] text-white shadow">
            Ativo
          </Badge>
        )}

        {/* Bisel superior (câmera) */}
        <div className="flex h-3 items-center justify-center rounded-t-[8px] bg-gray-800">
          <span className="h-1 w-1 rounded-full bg-gray-600" />
        </div>

        {/* Tela */}
        <div className={`p-1.5 ${isDarkSurface ? "bg-gray-900" : "bg-gray-100"}`}>
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-white"
            aria-hidden="true"
          >
            {/* Navbar fake */}
            <div className="flex h-4 items-center justify-between bg-white/90 px-2 backdrop-blur">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                <div className="h-1 w-6 rounded bg-gray-300" />
              </div>
              <div className="flex gap-1">
                <div className="h-1 w-3 rounded bg-gray-200" />
                <div className="h-1 w-3 rounded bg-gray-200" />
                <div className="h-1 w-3 rounded bg-gray-200" />
                <div className="h-1 w-4 rounded" style={{ backgroundColor: accentColor, opacity: 0.7 }} />
              </div>
            </div>

            {/* Hero com gradient do tema */}
            <div className={`relative flex h-[55%] items-center justify-center ${gradient}`}>
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <div className="h-1.5 w-16 rounded bg-white/80" />
                <div className="h-1 w-10 rounded bg-white/60" />
                {/* Barra de busca fake */}
                <div className="mt-1 flex h-2 items-center gap-0.5 rounded bg-white px-1 shadow-sm">
                  <div className="h-0.5 w-3 rounded bg-gray-300" />
                  <div className="h-0.5 w-3 rounded bg-gray-300" />
                  <div className="h-0.5 w-3 rounded bg-gray-300" />
                  <div
                    className="h-1 w-2 rounded"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              </div>
            </div>

            {/* Grid de imóveis */}
            <div className="grid h-[calc(45%-1rem)] grid-cols-3 gap-1 bg-gray-50 p-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-[3px] bg-white shadow-sm"
                >
                  <div className="h-1/2 bg-gray-300" />
                  <div className="flex flex-1 flex-col justify-between p-0.5">
                    <div className="h-0.5 w-3/4 rounded bg-gray-300" />
                    <div className="h-0.5 w-1/2 rounded" style={{ backgroundColor: accentColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé do laptop (onde ficam os alto-falantes) */}
        <div className={`h-1.5 ${isDarkSurface ? "bg-gray-900" : "bg-gray-200"}`} />
      </button>

      {/* Base/stand do laptop */}
      <div className="-mt-px h-1 w-[115%] rounded-b-[16px] bg-gradient-to-b from-gray-300 to-gray-100 shadow-sm" />

      {/* Label + descrição + ação */}
      <div className="mt-3 flex w-full flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="line-clamp-1 text-[11px] text-gray-500">{description}</p>
        {onPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#002B5B] opacity-70 transition-opacity hover:opacity-100"
          >
            <Eye className="h-3 w-3" />
            Ver preview completo
          </button>
        )}
      </div>
    </div>
  );
}

export default ThemeLaptopCard;
