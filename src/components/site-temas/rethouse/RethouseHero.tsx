import { Search } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function RethouseHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#3454d1";
  const secondary = site.cor_secundaria || "#1a2b6b";

  return (
    <section
      className="relative min-h-[600px] px-4 py-24 md:py-32"
      style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)` }}
    >
      {site.banner_hero_url && (
        <img
          src={site.banner_hero_url}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-30"
        />
      )}

      <div className="relative z-10 mx-auto max-w-5xl text-center text-white">
        {site.logo_url && (
          <img
            src={site.logo_url}
            alt={site.nome_completo}
            className="mx-auto mb-8 h-14 object-contain brightness-0 invert"
          />
        )}

        <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
          {site.banner_hero_titulo || "Encontre o Imovel dos Seus Sonhos"}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base text-white/80 md:text-lg">
          {site.banner_hero_subtitulo ||
            "As melhores opcoes de imoveis para compra, venda e aluguel na sua cidade."}
        </p>

        <div className="mx-auto max-w-3xl rounded-2xl bg-white/10 p-3 backdrop-blur-md md:p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select className="flex-1 rounded-xl border-0 bg-white px-4 py-3.5 text-sm text-gray-700 shadow-sm outline-none">
              <option value="">Tipo de imovel</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
            <input
              type="text"
              placeholder="Cidade, bairro ou regiao..."
              className="flex-[2] rounded-xl border-0 bg-white px-4 py-3.5 text-sm text-gray-700 shadow-sm outline-none"
            />
            <button
              className="flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
              style={{ backgroundColor: primary }}
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
