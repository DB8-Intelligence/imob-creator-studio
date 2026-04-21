import { useState } from "react";
import { Search, Globe, ChevronDown, Menu } from "lucide-react";
import type { TemaProps } from "../tipos";

type BuscaTab = "principal" | "codigo" | "avancada";

export default function PrismaHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0F172A";
  const secondary = site.cor_secundaria || "#3B82F6";
  const [tab, setTab] = useState<BuscaTab>("principal");

  return (
    <>
      {/* Navbar minimalista sticky */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="h-10 object-contain"
              />
            ) : (
              <div
                className="text-2xl font-bold tracking-tight"
                style={{ color: primary }}
              >
                {site.nome_completo || "Prisma"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-10 text-[13px] font-medium text-gray-700 lg:flex">
            <a href="#imoveis" className="transition hover:text-gray-900">
              Imoveis
            </a>
            <a href="#categorias" className="transition hover:text-gray-900">
              Categorias
            </a>
            <a href="#servicos" className="transition hover:text-gray-900">
              Servicos
            </a>
            <a href="#sobre" className="transition hover:text-gray-900">
              Institucional
            </a>
            <a href="#contato" className="transition hover:text-gray-900">
              Contato
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden items-center gap-1 text-xs text-gray-600 transition hover:text-gray-900 lg:flex">
              <Globe className="h-4 w-4" />
              PT-BR
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="lg:hidden">
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero minimalista com busca centralizada */}
      <section
        id="inicio"
        className="relative w-full overflow-hidden bg-white"
        style={{ minHeight: "600px" }}
      >
        {/* Imagem de fundo sutil */}
        {site.banner_hero_url ? (
          <div
            className="absolute inset-0"
            style={{
              background: `url(${site.banner_hero_url}) center/cover no-repeat`,
            }}
          >
            <div className="absolute inset-0 bg-white/85" />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${primary}08 0%, white 80%)`,
            }}
          />
        )}

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:py-28">
          <div className="mb-10 text-center">
            <h1
              className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
              style={{ color: primary }}
            >
              {site.banner_hero_titulo ||
                "Encontre o imovel ideal para voce"}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg">
              {site.banner_hero_subtitulo ||
                "Catalogo completo de imoveis residenciais, comerciais, temporada e lancamentos. Seja muito bem-vindo."}
            </p>
          </div>

          {/* Caixa de busca minimalista */}
          <div className="mx-auto w-full max-w-4xl">
            <div className="flex border-b border-gray-200">
              {[
                { key: "principal", label: "Busca principal" },
                { key: "codigo", label: "Busca por codigo" },
                { key: "avancada", label: "Busca avancada" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as BuscaTab)}
                  className="relative px-5 py-3 text-xs font-semibold uppercase tracking-wider transition"
                  style={{
                    color: tab === t.key ? primary : "#9CA3AF",
                  }}
                >
                  {t.label}
                  {tab === t.key && (
                    <span
                      className="absolute bottom-[-1px] left-0 h-[2px] w-full"
                      style={{ backgroundColor: primary }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-6">
              {tab === "codigo" ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Digite o codigo do imovel"
                    className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                  />
                  <button
                    className="rounded-md px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                    style={{ backgroundColor: primary }}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <select className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-500">
                    <option>Finalidade</option>
                    <option>Venda</option>
                    <option>Aluguel</option>
                    <option>Temporada</option>
                  </select>
                  <select className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-500">
                    <option>Tipo</option>
                    <option>Casa</option>
                    <option>Apartamento</option>
                    <option>Cobertura</option>
                    <option>Terreno</option>
                    <option>Comercial</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Cidade"
                    className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Bairro"
                    className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-500"
                  />
                  <button
                    className="flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                    style={{ backgroundColor: primary }}
                  >
                    <Search className="h-4 w-4" />
                    Buscar
                  </button>
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Confira todos os meus{" "}
              <a
                href="#imoveis"
                className="font-semibold underline"
                style={{ color: secondary }}
              >
                destaques de imoveis
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
