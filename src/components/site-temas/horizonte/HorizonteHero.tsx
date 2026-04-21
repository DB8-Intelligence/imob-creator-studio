import { useState } from "react";
import { Search, Phone, Mail, Instagram, Facebook, Youtube, ChevronDown, Menu } from "lucide-react";
import type { TemaProps } from "../tipos";

type Finalidade = "comprar" | "alugar" | "temporada";

export default function HorizonteHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1E3A5F";
  const secondary = site.cor_secundaria || "#F39200";
  const [finalidade, setFinalidade] = useState<Finalidade>("comprar");

  return (
    <>
      {/* Topbar superior com contatos + redes + idioma */}
      <div
        className="hidden w-full text-xs text-white lg:block"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-5">
            {site.telefone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {site.telefone}
              </span>
            )}
            {site.email_contato && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> {site.email_contato}
              </span>
            )}
            {site.creci && <span>CRECI {site.creci}</span>}
          </div>
          <div className="flex items-center gap-3">
            {site.instagram && (
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                className="opacity-80 hover:opacity-100"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {site.facebook && (
              <a
                href={site.facebook}
                target="_blank"
                rel="noreferrer"
                className="opacity-80 hover:opacity-100"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {site.youtube && (
              <a
                href={site.youtube}
                target="_blank"
                rel="noreferrer"
                className="opacity-80 hover:opacity-100"
              >
                <Youtube className="h-4 w-4" />
              </a>
            )}
            <span className="ml-3 flex items-center gap-1 border-l border-white/20 pl-3 opacity-80">
              PT-BR <ChevronDown className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Navbar principal branca */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="h-11 object-contain"
              />
            ) : (
              <div
                className="text-2xl font-black uppercase tracking-tight"
                style={{ color: primary }}
              >
                {site.nome_completo || "HORIZONTE"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-8 text-sm font-semibold text-gray-700 lg:flex">
            <a href="#inicio" className="transition hover:opacity-70">
              Inicio
            </a>
            <a
              href="#imoveis"
              className="flex items-center gap-1 transition hover:opacity-70"
            >
              Imoveis <ChevronDown className="h-3 w-3" />
            </a>
            <a href="#servicos" className="transition hover:opacity-70">
              Servicos
            </a>
            <a href="#sobre" className="transition hover:opacity-70">
              Institucional
            </a>
            <a href="#contato" className="transition hover:opacity-70">
              Contato
            </a>
            <button
              className="ml-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: secondary }}
            >
              Cadastre seu imovel
            </button>
          </div>

          <button className="lg:hidden">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Hero com imagem + busca */}
      <section
        id="inicio"
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "620px",
          background: site.banner_hero_url
            ? `url(${site.banner_hero_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primary} 0%, #2d5a8a 100%)`,
        }}
      >
        {/* Overlay escuro para legibilidade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center text-white md:py-32">
          <h1 className="mb-4 text-3xl font-bold leading-tight drop-shadow-lg md:text-5xl lg:text-6xl">
            {site.banner_hero_titulo ||
              "Um lugar para construir sua historia"}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base text-white/90 drop-shadow md:text-lg">
            {site.banner_hero_subtitulo ||
              "Encontre o imovel ideal para comprar, alugar ou passar as ferias."}
          </p>

          {/* Caixa de busca principal */}
          <div className="w-full max-w-4xl">
            {/* Abas de finalidade */}
            <div className="mb-0 flex gap-1">
              {(["comprar", "alugar", "temporada"] as Finalidade[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFinalidade(f)}
                  className="rounded-t-md px-6 py-3 text-sm font-bold capitalize transition"
                  style={{
                    backgroundColor: finalidade === f ? "white" : "rgba(255,255,255,0.25)",
                    color: finalidade === f ? primary : "white",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Caixa de filtros */}
            <div className="rounded-b-lg rounded-tr-lg bg-white p-5 shadow-2xl md:p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <select className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400">
                  <option>Tipo do imovel</option>
                  <option>Apartamento</option>
                  <option>Casa</option>
                  <option>Cobertura</option>
                  <option>Terreno</option>
                  <option>Comercial</option>
                </select>
                <input
                  type="text"
                  placeholder="Cidade"
                  className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
                />
                <input
                  type="text"
                  placeholder="Bairro"
                  className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
                />
                <button
                  className="flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-110"
                  style={{ backgroundColor: secondary }}
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex gap-4 text-gray-500">
                  <a href="#" className="hover:text-gray-700">
                    Busca por codigo
                  </a>
                  <a href="#" className="hover:text-gray-700">
                    Busca avancada
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-[10px] uppercase tracking-wider">
                    Tags rapidas:
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5">Familia</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5">Piscina</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5">Praia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
