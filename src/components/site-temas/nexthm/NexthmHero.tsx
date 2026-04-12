import { Search } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function NexthmHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#2c686b";
  const secondary = site.cor_secundaria || "#f8c251";

  return (
    <section
      className="relative px-4 py-24 md:py-36"
      style={{ background: `linear-gradient(135deg, #122122 0%, ${primary} 100%)` }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 right-10 h-60 w-60 rounded-full blur-3xl" style={{ backgroundColor: secondary }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {site.logo_url && (
          <img
            src={site.logo_url}
            alt={site.nome_completo}
            className="mx-auto mb-8 h-14 object-contain brightness-0 invert"
          />
        )}

        <h1
          className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {site.banner_hero_titulo || site.nome_completo}
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base text-white/70 md:text-lg">
          {site.banner_hero_subtitulo ||
            "Descubra imoveis exclusivos em localizacoes privilegiadas, cercados pela natureza."}
        </p>

        <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md sm:flex-row">
          <select className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50">
            <option value="" className="text-[#0f393b]">Tipo de imovel</option>
            <option value="apartamento" className="text-[#0f393b]">Apartamento</option>
            <option value="casa" className="text-[#0f393b]">Casa</option>
            <option value="terreno" className="text-[#0f393b]">Terreno</option>
            <option value="comercial" className="text-[#0f393b]">Comercial</option>
          </select>
          <input
            type="text"
            placeholder="Cidade ou bairro..."
            className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50"
          />
          <button
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#122122] transition hover:brightness-110"
            style={{ backgroundColor: secondary }}
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
}
