import { Search } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function BrisaHero({ site }: TemaProps) {
  return (
    <section
      className="relative px-4 py-20 text-center text-white md:py-28"
      style={{
        background: `linear-gradient(135deg, ${site.cor_primaria || "#0284C7"} 0%, #38BDF8 100%)`,
      }}
    >
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

        <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl font-['Plus_Jakarta_Sans',sans-serif]">
          {site.banner_hero_titulo || `${site.nome_completo}`}
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base opacity-90 md:text-lg">
          {site.banner_hero_subtitulo ||
            "Encontre o imovel dos seus sonhos com a melhor assessoria do mercado."}
        </p>

        {/* Search Bar */}
        <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur-md sm:flex-row">
          <select className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 outline-none">
            <option value="">Tipo de imovel</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
            <option value="cobertura">Cobertura</option>
          </select>
          <input
            type="text"
            placeholder="Cidade ou bairro..."
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 outline-none"
          />
          <button
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: site.cor_primaria || "#0284C7" }}
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
}
