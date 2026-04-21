import { Search, Globe, ChevronDown, Menu } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function PorticoHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1D4ED8";
  const secondary = site.cor_secundaria || "#64748B";

  return (
    <>
      {/* Topbar minima com idiomas */}
      <div className="hidden w-full border-b border-gray-100 bg-gray-50 text-[11px] text-gray-600 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end px-5 py-1.5">
          <div className="flex items-center gap-3">
            <span>CRECI {site.creci || "XXXXX"}</span>
            <span className="opacity-50">|</span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              PT-BR
              <ChevronDown className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Navbar branca limpa */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="h-10 object-contain"
              />
            ) : (
              <div
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: primary }}
              >
                {site.nome_completo || "Portico"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-8 text-sm font-semibold text-gray-700 lg:flex">
            <a href="#imoveis" className="hover:opacity-70">Imoveis</a>
            <a href="#categorias" className="hover:opacity-70">Categorias</a>
            <a href="#servicos" className="hover:opacity-70">Servicos</a>
            <a href="#sobre" className="hover:opacity-70">Institucional</a>
            <a href="#contato" className="hover:opacity-70">Contato</a>
          </div>

          <button className="lg:hidden">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Hero ultra-minimalista — fundo branco puro, busca centralizada */}
      <section
        id="inicio"
        className="relative w-full overflow-hidden bg-white"
      >
        {site.banner_hero_url && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `url(${site.banner_hero_url}) center/cover no-repeat`,
            }}
          />
        )}

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-28 text-center md:py-36">
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: secondary }}
          >
            Portal imobiliario
          </p>
          <h1
            className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ color: primary }}
          >
            {site.banner_hero_titulo || "Seu futuro imovel esta aqui"}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base text-gray-500">
            {site.banner_hero_subtitulo ||
              "Acesse um catalogo amplo de imoveis para venda, aluguel e temporada em toda a regiao."}
          </p>

          {/* Busca simples — foco absoluto */}
          <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
            <div className="grid grid-cols-1 gap-1 md:grid-cols-5">
              <select className="rounded-md bg-white px-3 py-3 text-sm text-gray-700 outline-none hover:bg-gray-50">
                <option>Finalidade</option>
                <option>Venda</option>
                <option>Aluguel</option>
                <option>Temporada</option>
              </select>
              <select className="rounded-md bg-white px-3 py-3 text-sm text-gray-700 outline-none hover:bg-gray-50">
                <option>Tipo</option>
                <option>Casa</option>
                <option>Apartamento</option>
                <option>Terreno</option>
                <option>Comercial</option>
              </select>
              <input
                type="text"
                placeholder="Cidade"
                className="rounded-md bg-white px-3 py-3 text-sm text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
              />
              <input
                type="text"
                placeholder="Bairro"
                className="rounded-md bg-white px-3 py-3 text-sm text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
              />
              <button
                className="flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-3 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">
              Busca por codigo
            </a>
            <span className="opacity-50">|</span>
            <a href="#" className="hover:text-gray-700">
              Busca avancada
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
