import { Search } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function LitoralHero({ site }: TemaProps) {
  const sand = "#D97706";
  const teal = "#0D9488";

  return (
    <section className="relative overflow-hidden px-4 py-20 text-center text-white md:py-28">
      {/* Warm gradient bg */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${sand} 0%, #F59E0B 40%, #FB923C 100%)`,
        }}
      />

      {site.banner_hero_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${site.banner_hero_url})` }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-3xl">
        {site.logo_url && (
          <img
            src={site.logo_url}
            alt={site.nome_completo}
            className="mx-auto mb-6 h-16 object-contain"
          />
        )}

        <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl font-['Playfair_Display',serif]">
          {site.banner_hero_titulo || site.nome_completo}
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base opacity-90 md:text-lg">
          {site.banner_hero_subtitulo ||
            "Descubra o paraiso que voce merece. Imoveis exclusivos a beira-mar."}
        </p>

        {/* Search Bar */}
        <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-white/20 p-4 backdrop-blur-md sm:flex-row">
          <select className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 outline-none">
            <option value="">Tipo de imovel</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa de praia</option>
            <option value="terreno">Terreno</option>
            <option value="cobertura">Cobertura</option>
          </select>
          <input
            type="text"
            placeholder="Praia ou cidade..."
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 outline-none"
          />
          <button
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: teal }}
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>

      {/* Wave SVG at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 55C960 40 1056 20 1152 15C1248 10 1344 20 1392 25L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
