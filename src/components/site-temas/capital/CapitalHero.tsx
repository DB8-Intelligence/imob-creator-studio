import { useState } from "react";
import { Search, Phone, Mail, Menu } from "lucide-react";
import type { TemaProps } from "../tipos";

type BuscaTab = "comprar" | "alugar" | "temporada";

export default function CapitalHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#CC0000";
  const secondary = site.cor_secundaria || "#002E5E";
  const [tab, setTab] = useState<BuscaTab>("comprar");

  return (
    <>
      {/* Top bar navy estreita */}
      <div
        className="w-full text-xs text-white"
        style={{ backgroundColor: secondary }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            {site.telefone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {site.telefone}
              </span>
            )}
            {site.email_contato && (
              <span className="hidden items-center gap-1.5 sm:flex">
                <Mail className="h-3 w-3" /> {site.email_contato}
              </span>
            )}
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span>CRECI {site.creci || "XXXXX"}</span>
          </div>
        </div>
      </div>

      {/* Navbar branca com logo */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
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
                {site.nome_completo || "CAPITAL"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-7 text-sm font-semibold text-gray-700 md:flex">
            <a href="#inicio" className="hover:text-[color:var(--capital-red)]">
              Inicio
            </a>
            <a href="#imoveis" className="hover:text-[color:var(--capital-red)]">
              Imoveis
            </a>
            <a href="#sobre" className="hover:text-[color:var(--capital-red)]">
              Sobre
            </a>
            <a href="#contato" className="hover:text-[color:var(--capital-red)]">
              Contato
            </a>
            <button
              className="rounded-md px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: primary }}
            >
              Anuncie
            </button>
          </div>

          <button className="md:hidden">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Hero principal */}
      <section
        id="inicio"
        className="relative min-h-[560px] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`,
        }}
      >
        {site.banner_hero_url && (
          <img
            src={site.banner_hero_url}
            alt="Hero"
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          />
        )}

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center text-white md:py-28">
          <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            {site.banner_hero_titulo || "Encontre o imovel perfeito para voce"}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base text-white/90 md:text-lg">
            {site.banner_hero_subtitulo ||
              "Os melhores imoveis da regiao, selecionados especialmente para a sua familia."}
          </p>

          {/* Search box com tabs */}
          <div className="mx-auto max-w-4xl">
            <div className="flex gap-1">
              {(["comprar", "alugar", "temporada"] as BuscaTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="rounded-t-lg px-6 py-2.5 text-sm font-bold capitalize transition"
                  style={{
                    backgroundColor: tab === t ? "white" : "rgba(255,255,255,0.25)",
                    color: tab === t ? primary : "white",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="rounded-b-xl rounded-tr-xl bg-white p-4 shadow-xl md:p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <select className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400">
                  <option>Tipo de imovel</option>
                  <option>Apartamento</option>
                  <option>Casa</option>
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
                  className="flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
                  style={{ backgroundColor: primary }}
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
