/**
 * ThemeLaptopCard — Preview visual de um tema de site em formato de laptop.
 *
 * Renderiza uma mini-mockup CSS que reproduz o DNA visual de cada tema:
 * paleta aplicada no hero, grid de imoveis, layout de busca etc.
 * A variante (`variant`) escolhe o layout interno que mais se aproxima
 * do tema real — portal com abas, minimalista com categorias, tricolor etc.
 */
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export type ThemeMockupVariant =
  | "classic" // default — hero gradient + 3 cards
  | "portal-tabs" // hero com abas de busca (capital, horizonte)
  | "minimalist-grid" // hero clean + grid de 18 pontinhos (prisma)
  | "multi-price" // 3 cores de preco nos cards (eixo)
  | "dark-premium" // navbar dark + acentos dourados (dark-premium, quarter)
  | "slider-hero" // hero com ponto indicador de slider (ortiz)
  | "serif-elegant"; // tipografia serifada + layout amplo (nestland, nexthm)

interface ThemeLaptopCardProps {
  themeKey: string;
  label: string;
  description: string;
  /** Classe Tailwind de gradient do hero (ex: "bg-gradient-to-r from-sky-400 to-cyan-300") */
  gradient: string;
  /** Cor solida usada para acentos (botoes/CTA dentro do preview) */
  accentColor?: string;
  /** Se o tema esta selecionado */
  isActive: boolean;
  /** Selecionar o tema */
  onSelect: () => void;
  /** Abrir preview fullscreen (opcional) */
  onPreview?: () => void;
  /** Tom de fundo do "desktop" atras da tela — light/dark */
  surface?: "light" | "dark";
  /** Variante de layout — escolhe o desenho da mini-mockup */
  variant?: ThemeMockupVariant;
}

/** Mapeia theme id -> variante visual (a mais proxima do tema real) */
export const THEME_VARIANT_MAP: Record<string, ThemeMockupVariant> = {
  brisa: "classic",
  urbano: "classic",
  litoral: "classic",
  "dark-premium": "dark-premium",
  nestland: "serif-elegant",
  nexthm: "serif-elegant",
  ortiz: "slider-hero",
  quarter: "dark-premium",
  rethouse: "classic",
  capital: "portal-tabs",
  horizonte: "portal-tabs",
  prisma: "minimalist-grid",
  eixo: "multi-price",
  vitrine: "minimalist-grid",
  onix: "serif-elegant",
  farol: "portal-tabs",
  aurora: "slider-hero",
  sereno: "serif-elegant",
  portico: "minimalist-grid",
};

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
  variant = "classic",
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
        aria-label={`Selecionar tema ${label}${isActive ? " (ativo)" : ""}`}
      >
        {isActive && (
          <Badge className="absolute -right-2 -top-2 z-10 bg-[#002B5B] text-[10px] text-white shadow">
            Ativo
          </Badge>
        )}

        {/* Bisel superior (camera) */}
        <div className="flex h-3 items-center justify-center rounded-t-[8px] bg-gray-800">
          <span className="h-1 w-1 rounded-full bg-gray-600" />
        </div>

        {/* Tela */}
        <div className={`p-1.5 ${isDarkSurface ? "bg-gray-900" : "bg-gray-100"}`}>
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-white"
            aria-hidden="true"
          >
            <MockupScene
              variant={variant}
              gradient={gradient}
              accentColor={accentColor}
            />
          </div>
        </div>

        <div className={`h-1.5 ${isDarkSurface ? "bg-gray-900" : "bg-gray-200"}`} />
      </button>

      {/* Base/stand do laptop */}
      <div className="-mt-px h-1 w-[115%] rounded-b-[16px] bg-gradient-to-b from-gray-300 to-gray-100 shadow-sm" />

      {/* Label + descricao + acao */}
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

/** Cena interna do laptop — muda conforme a variante */
function MockupScene({
  variant,
  gradient,
  accentColor,
}: {
  variant: ThemeMockupVariant;
  gradient: string;
  accentColor: string;
}) {
  const Navbar = (
    <div className="flex h-4 items-center justify-between bg-white/90 px-2 backdrop-blur">
      <div className="flex items-center gap-1">
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <div className="h-1 w-6 rounded bg-gray-300" />
      </div>
      <div className="flex gap-1">
        <div className="h-1 w-3 rounded bg-gray-200" />
        <div className="h-1 w-3 rounded bg-gray-200" />
        <div className="h-1 w-3 rounded bg-gray-200" />
        <div
          className="h-1 w-4 rounded"
          style={{ backgroundColor: accentColor, opacity: 0.7 }}
        />
      </div>
    </div>
  );

  // Portal Tabs — 3 abas de busca visiveis sobre a caixa
  if (variant === "portal-tabs") {
    return (
      <>
        {Navbar}
        <div
          className={`relative flex h-[55%] flex-col items-center justify-center gap-1 ${gradient}`}
        >
          <div className="h-1.5 w-20 rounded bg-white/85" />
          <div className="h-1 w-12 rounded bg-white/60" />

          <div className="mt-1.5 flex gap-0.5">
            <div
              className="h-1.5 w-6 rounded-t-[2px] bg-white shadow-sm"
              style={{ borderBottom: `1px solid ${accentColor}` }}
            />
            <div className="h-1.5 w-6 rounded-t-[2px] bg-white/40" />
            <div className="h-1.5 w-6 rounded-t-[2px] bg-white/40" />
          </div>
          <div className="flex h-2 items-center gap-0.5 rounded rounded-tl-none bg-white px-1 shadow-sm">
            <div className="h-0.5 w-3 rounded bg-gray-300" />
            <div className="h-0.5 w-3 rounded bg-gray-300" />
            <div className="h-0.5 w-3 rounded bg-gray-300" />
            <div
              className="h-1 w-2 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
        <ThreeCards accentColor={accentColor} />
      </>
    );
  }

  // Minimalist Grid — hero clean + grid de pontinhos
  if (variant === "minimalist-grid") {
    return (
      <>
        {Navbar}
        <div className="flex h-[40%] flex-col items-center justify-center gap-1 bg-white">
          <div className="h-1.5 w-24 rounded bg-gray-800" />
          <div className="h-1 w-14 rounded bg-gray-400" />
          <div className="mt-1 flex h-2 items-center gap-0.5 rounded border border-gray-200 bg-white px-1">
            <div className="h-0.5 w-3 rounded bg-gray-300" />
            <div className="h-0.5 w-3 rounded bg-gray-300" />
            <div
              className="h-1 w-2 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
        {/* Grid de 18 pontos */}
        <div className="grid h-[calc(60%-1rem)] grid-cols-6 grid-rows-3 gap-0.5 bg-gray-50 p-1.5">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm border border-gray-200 bg-white"
              style={{ borderColor: i % 5 === 0 ? accentColor : undefined }}
            />
          ))}
        </div>
      </>
    );
  }

  // Multi-Price — cards com 3 cores de preco diferentes
  if (variant === "multi-price") {
    return (
      <>
        {Navbar}
        <div
          className={`relative flex h-[50%] items-center justify-center ${gradient}`}
        >
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <div className="h-1.5 w-16 rounded bg-white/85" />
            <div className="h-1 w-10 rounded bg-white/60" />
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
        {/* Cards com precos tricolor */}
        <div className="grid h-[calc(50%-1rem)] grid-cols-3 gap-1 bg-gray-50 p-1.5">
          {[
            { badge: "#DC2626", price: "#DC2626" },
            { badge: "#2563EB", price: "#2563EB" },
            { badge: "#10B981", price: "#10B981" },
          ].map((c, i) => (
            <div
              key={i}
              className="relative flex flex-col overflow-hidden rounded-[3px] bg-white shadow-sm"
            >
              <div className="h-1/2 bg-gray-300">
                <div
                  className="m-0.5 inline-block h-1 w-4 rounded-sm"
                  style={{ backgroundColor: c.badge }}
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-0.5">
                <div className="h-0.5 w-3/4 rounded bg-gray-300" />
                <div
                  className="h-1 w-3/4 rounded"
                  style={{ backgroundColor: c.price }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Dark Premium — navbar escura + bordas douradas
  if (variant === "dark-premium") {
    return (
      <>
        <div className="flex h-4 items-center justify-between bg-gray-900 px-2">
          <div className="flex items-center gap-1">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-1 w-6 rounded bg-gray-600" />
          </div>
          <div className="flex gap-1">
            <div className="h-1 w-3 rounded bg-gray-700" />
            <div className="h-1 w-3 rounded bg-gray-700" />
            <div className="h-1 w-3 rounded bg-gray-700" />
            <div
              className="h-1 w-4 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
        <div
          className={`relative flex h-[55%] items-center justify-center ${gradient}`}
        >
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <div className="h-1.5 w-16 rounded bg-white/90" />
            <div className="h-1 w-10 rounded bg-white/60" />
            <div
              className="mt-1 h-2 w-14 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
        <div className="grid h-[calc(45%-1rem)] grid-cols-3 gap-1 bg-gray-900 p-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-[3px] bg-gray-800 shadow-sm"
              style={{ border: `0.5px solid ${accentColor}30` }}
            >
              <div className="h-1/2 bg-gray-700" />
              <div className="flex flex-1 flex-col justify-between p-0.5">
                <div className="h-0.5 w-3/4 rounded bg-gray-600" />
                <div
                  className="h-0.5 w-1/2 rounded"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Slider Hero — hero com indicadores de dots
  if (variant === "slider-hero") {
    return (
      <>
        {Navbar}
        <div
          className={`relative flex h-[60%] items-center justify-center ${gradient}`}
        >
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <div className="h-1.5 w-20 rounded bg-white/85" />
            <div className="h-1 w-12 rounded bg-white/60" />
            <div
              className="mt-1 h-2 w-12 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
          {/* Dots do slider */}
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
            <div className="h-0.5 w-2 rounded bg-white" />
            <div className="h-0.5 w-2 rounded bg-white/40" />
            <div className="h-0.5 w-2 rounded bg-white/40" />
          </div>
        </div>
        <ThreeCards accentColor={accentColor} />
      </>
    );
  }

  // Serif Elegant — hero com linha fina + titulo amplo
  if (variant === "serif-elegant") {
    return (
      <>
        {Navbar}
        <div
          className={`relative flex h-[60%] items-center justify-center ${gradient}`}
        >
          <div className="flex flex-col items-center gap-1.5 px-2 text-center">
            <div
              className="h-[1px] w-4"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-2 w-24 rounded-[1px] bg-white/90" />
            <div className="h-1 w-16 rounded bg-white/60" />
            <div
              className="h-[1px] w-4"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
        <div className="grid h-[calc(40%-1rem)] grid-cols-2 gap-1 bg-gray-50 p-1.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex overflow-hidden rounded-[3px] bg-white shadow-sm"
            >
              <div className="w-1/2 bg-gray-300" />
              <div className="flex flex-1 flex-col justify-center gap-0.5 p-1">
                <div className="h-0.5 w-3/4 rounded bg-gray-300" />
                <div
                  className="h-0.5 w-1/2 rounded"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Classic — layout original
  return (
    <>
      {Navbar}
      <div className={`relative flex h-[55%] items-center justify-center ${gradient}`}>
        <div className="flex flex-col items-center gap-1 px-2 text-center">
          <div className="h-1.5 w-16 rounded bg-white/80" />
          <div className="h-1 w-10 rounded bg-white/60" />
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
      <ThreeCards accentColor={accentColor} />
    </>
  );
}

function ThreeCards({ accentColor }: { accentColor: string }) {
  return (
    <div className="grid h-[calc(45%-1rem)] grid-cols-3 gap-1 bg-gray-50 p-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-[3px] bg-white shadow-sm"
        >
          <div className="h-1/2 bg-gray-300" />
          <div className="flex flex-1 flex-col justify-between p-0.5">
            <div className="h-0.5 w-3/4 rounded bg-gray-300" />
            <div
              className="h-0.5 w-1/2 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ThemeLaptopCard;
