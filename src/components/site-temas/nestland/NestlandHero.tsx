import { Search } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function NestlandHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#b99755";

  return (
    <section className="relative bg-[#f7f4f1] px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            {site.logo_url && (
              <img src={site.logo_url} alt={site.nome_completo} className="mx-auto mb-6 h-12 object-contain md:mx-0" />
            )}
            <h1 className="mb-4 text-4xl font-bold uppercase leading-tight text-[#0f0f0f] md:text-5xl lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              {site.banner_hero_titulo || site.nome_completo}
            </h1>
            <p className="mb-8 max-w-lg text-base text-[#515151] md:text-lg">
              {site.banner_hero_subtitulo || "Encontre o imovel perfeito com atendimento exclusivo e personalizado."}
            </p>

            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg sm:flex-row">
              <select className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none">
                <option value="">Tipo de imovel</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
              <input
                type="text"
                placeholder="Cidade ou bairro..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
              />
              <button
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: primary }}
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
          </div>

          <div className="hidden w-full max-w-md md:block">
            {site.banner_hero_url ? (
              <img src={site.banner_hero_url} alt="Hero" className="rounded-3xl object-cover shadow-2xl" />
            ) : (
              <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-[#0f0f0f] to-[#b99755] shadow-2xl" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
