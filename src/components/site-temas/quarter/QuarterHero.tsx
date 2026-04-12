import { Search, Mail, Phone, Facebook, Instagram } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function QuarterHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#FF5A3C";
  const secondary = site.cor_secundaria || "#0B2C3D";

  return (
    <>
      {/* Topbar */}
      <div className="bg-[#0B2C3D] px-4 py-2 text-xs text-gray-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            {site.email_contato && (
              <a href={`mailto:${site.email_contato}`} className="flex items-center gap-1.5 transition hover:text-white">
                <Mail className="h-3 w-3" />
                {site.email_contato}
              </a>
            )}
            {site.whatsapp && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {site.whatsapp}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="transition hover:text-white"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" className="transition hover:text-white"><Instagram className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {site.logo_url ? (
            <img src={site.logo_url} alt={site.nome_completo} className="h-10 object-contain" />
          ) : (
            <span className="text-xl font-bold text-[#071c1f]">{site.nome_completo}</span>
          )}
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#5C727D] md:flex">
            <a href="#imoveis" className="transition hover:text-[#071c1f]">Imoveis</a>
            <a href="#sobre" className="transition hover:text-[#071c1f]">Sobre</a>
            <a href="#depoimentos" className="transition hover:text-[#071c1f]">Depoimentos</a>
            <a href="#contato" className="transition hover:text-[#071c1f]">Contato</a>
          </nav>
          <a
            href="#contato"
            className="rounded px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            Fale Conosco
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex min-h-[520px] items-center justify-center px-4 py-20 md:min-h-[600px] md:py-28"
        style={{ background: `linear-gradient(135deg, #071c1f 0%, ${secondary} 100%)` }}
      >
        {site.banner_hero_url && (
          <img
            src={site.banner_hero_url}
            alt="Hero"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        )}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {site.banner_hero_titulo || "Encontre o Imovel Ideal"}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base text-gray-300 md:text-lg" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            {site.banner_hero_subtitulo || "Descubra as melhores oportunidades com atendimento profissional e dedicado."}
          </p>

          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg bg-white p-4 shadow-xl sm:flex-row">
            <select className="flex-1 rounded border border-gray-200 bg-white px-4 py-3 text-sm text-[#5C727D] outline-none">
              <option value="">Tipo de imovel</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
            <input
              type="text"
              placeholder="Cidade ou bairro..."
              className="flex-1 rounded border border-gray-200 bg-white px-4 py-3 text-sm text-[#5C727D] outline-none"
            />
            <button
              className="flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
