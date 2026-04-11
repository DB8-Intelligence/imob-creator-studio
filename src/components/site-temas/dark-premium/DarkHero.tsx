import { Search } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function DarkHero({ site }: TemaProps) {
  const gold = "#F59E0B";

  return (
    <section className="relative overflow-hidden px-4 py-20 text-center text-white md:py-28" style={{ backgroundColor: "#0F172A" }}>
      {site.banner_hero_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${site.banner_hero_url})` }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Gold decorative line */}
        <div className="mx-auto mb-8 h-px w-24" style={{ backgroundColor: gold }} />

        {site.logo_url && (
          <img
            src={site.logo_url}
            alt={site.nome_completo}
            className="mx-auto mb-6 h-14 object-contain"
          />
        )}

        <h1 className="mb-4 text-3xl font-bold uppercase leading-tight tracking-[0.15em] md:text-5xl">
          {site.banner_hero_titulo || site.nome_completo}
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-base md:text-lg" style={{ color: gold }}>
          {site.banner_hero_subtitulo ||
            "Imoveis exclusivos para clientes exigentes"}
        </p>

        {/* Gold decorative line */}
        <div className="mx-auto mb-10 h-px w-24" style={{ backgroundColor: gold }} />

        {/* Search Bar */}
        <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border p-4 sm:flex-row" style={{ borderColor: `${gold}33`, backgroundColor: "#1E293B" }}>
          <select
            className="flex-1 rounded-lg border px-4 py-3 text-sm text-gray-300 outline-none transition"
            style={{ backgroundColor: "#0F172A", borderColor: "#334155" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = gold)}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
          >
            <option value="">Tipo de imovel</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="cobertura">Cobertura</option>
            <option value="terreno">Terreno</option>
          </select>
          <input
            type="text"
            placeholder="Cidade ou bairro..."
            className="flex-1 rounded-lg border px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition"
            style={{ backgroundColor: "#0F172A", borderColor: "#334155" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = gold)}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
          />
          <button
            className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            style={{ backgroundColor: gold }}
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
}
