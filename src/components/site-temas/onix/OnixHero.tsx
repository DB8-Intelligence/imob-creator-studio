import { Search, Instagram, Youtube, Globe, ChevronDown, Menu } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function OnixHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1A1A1A";
  const secondary = site.cor_secundaria || "#B8860B";

  return (
    <>
      {/* Topbar minima preto com idiomas + redes */}
      <div
        className="hidden w-full text-[10px] uppercase tracking-widest text-white/70 lg:block"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-5">
            <span>CRECI {site.creci || "XXXXX"}</span>
            {site.email_contato && <span>{site.email_contato}</span>}
          </div>
          <div className="flex items-center gap-4">
            {site.instagram && (
              <a href={site.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                <Instagram className="h-3 w-3" />
              </a>
            )}
            {site.youtube && (
              <a href={site.youtube} target="_blank" rel="noreferrer" className="hover:text-white">
                <Youtube className="h-3 w-3" />
              </a>
            )}
            <span className="ml-2 flex items-center gap-1 border-l border-white/20 pl-3">
              <Globe className="h-3 w-3" />
              PT
              <ChevronDown className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Navbar branca minimalista */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="h-10 object-contain"
              />
            ) : (
              <div
                className="text-2xl font-light uppercase tracking-[0.3em]"
                style={{ color: primary }}
              >
                {site.nome_completo || "Onix"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-10 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-700 lg:flex">
            <a href="#imoveis" className="hover:text-gray-900">
              Imoveis
            </a>
            <a href="#categorias" className="hover:text-gray-900">
              Categorias
            </a>
            <a href="#sobre" className="hover:text-gray-900">
              Sobre
            </a>
            <a href="#contato" className="hover:text-gray-900">
              Contato
            </a>
          </div>

          <button className="lg:hidden">
            <Menu className="h-6 w-6 text-gray-900" />
          </button>
        </div>
      </nav>

      {/* Hero minimalista — espaco generoso, sem imagem dramatica */}
      <section
        id="inicio"
        className="relative w-full bg-white"
        style={{ minHeight: "640px" }}
      >
        {site.banner_hero_url && (
          <div
            className="absolute inset-0"
            style={{
              background: `url(${site.banner_hero_url}) center/cover no-repeat`,
            }}
          >
            <div className="absolute inset-0 bg-white/75" />
          </div>
        )}

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-32 text-center">
          {/* Linha decorativa fina */}
          <div
            className="mb-8 h-px w-12"
            style={{ backgroundColor: secondary }}
          />

          <p
            className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em]"
            style={{ color: secondary }}
          >
            Imoveis especiais
          </p>

          <h1
            className="mb-6 text-4xl font-light leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: primary }}
          >
            {site.banner_hero_titulo ||
              "Encontre o imovel perfeito para voce"}
          </h1>

          <p className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-gray-500">
            {site.banner_hero_subtitulo ||
              "Conectamos pessoas a imoveis especiais. Acreditamos na liberdade do espaco."}
          </p>

          {/* Linha decorativa */}
          <div
            className="mb-12 h-px w-12"
            style={{ backgroundColor: secondary }}
          />

          {/* Busca minimalista — campos sem moldura, separados por linhas */}
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-1 gap-0 border-t border-gray-200 md:grid-cols-5">
              <div className="border-b border-gray-200 px-4 py-4 text-left md:border-b-0 md:border-r">
                <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Finalidade
                </p>
                <select className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none">
                  <option>Venda</option>
                  <option>Aluguel</option>
                  <option>Temporada</option>
                </select>
              </div>
              <div className="border-b border-gray-200 px-4 py-4 text-left md:border-b-0 md:border-r">
                <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Tipo
                </p>
                <select className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none">
                  <option>Todos</option>
                  <option>Casa</option>
                  <option>Apartamento</option>
                  <option>Cobertura</option>
                </select>
              </div>
              <div className="border-b border-gray-200 px-4 py-4 text-left md:border-b-0 md:border-r">
                <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Cidade
                </p>
                <input
                  type="text"
                  placeholder="Qualquer"
                  className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="border-b border-gray-200 px-4 py-4 text-left md:border-b-0 md:border-r">
                <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Bairro
                </p>
                <input
                  type="text"
                  placeholder="Qualquer"
                  className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                className="flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition hover:brightness-125"
                style={{ backgroundColor: primary }}
              >
                <Search className="h-3.5 w-3.5" />
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
