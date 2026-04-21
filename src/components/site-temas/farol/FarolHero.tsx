import { useState } from "react";
import { Search, Phone, Mail, MessageCircle, Menu, Building2, Landmark, Sparkles } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

type Modo = "principal" | "codigo" | "avancada";

export default function FarolHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0099CC";
  const secondary = site.cor_secundaria || "#0D9488";
  const [modo, setModo] = useState<Modo>("principal");

  return (
    <>
      {/* Topbar ciano com contatos + WhatsApp */}
      <div
        className="hidden w-full text-xs text-white md:block"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-5">
            {site.telefone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {site.telefone}
              </span>
            )}
            {site.email_contato && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {site.email_contato}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#area-cliente" className="opacity-80 hover:opacity-100">
              Area do cliente
            </a>
            <span className="opacity-60">|</span>
            <span>CRECI {site.creci || "XXXXX"}</span>
          </div>
        </div>
      </div>

      {/* Navbar branca */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
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
                {site.nome_completo || "Farol"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-6 text-sm font-semibold text-gray-700 lg:flex">
            <a href="#imoveis" className="hover:opacity-70">Imoveis</a>
            <a href="#servicos" className="hover:opacity-70">Servicos</a>
            <a href="#sobre" className="hover:opacity-70">Sobre</a>
            <a href="#contato" className="hover:opacity-70">Contato</a>
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp, "Ola! Vim do seu site.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                style={{ backgroundColor: secondary }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            )}
          </div>

          <button className="lg:hidden">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Hero clean — branco, foco na frase + busca */}
      <section
        id="inicio"
        className="relative w-full overflow-hidden bg-white"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, ${primary}15 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-10 text-center">
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Imobiliaria regional
            </p>
            <h1
              className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl"
              style={{ color: primary }}
            >
              {site.banner_hero_titulo ||
                "Um lugar para construir sua historia"}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg">
              {site.banner_hero_subtitulo ||
                "Catalogo completo de imoveis para comprar, alugar e veranear. Encontre o ideal em minutos."}
            </p>
          </div>

          {/* Busca com 3 modos */}
          <div className="mx-auto max-w-5xl">
            <div className="flex gap-0 border-b border-gray-200">
              {[
                { key: "principal", label: "Busca principal" },
                { key: "codigo", label: "Por codigo" },
                { key: "avancada", label: "Avancada" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setModo(m.key as Modo)}
                  className="relative px-5 py-3 text-xs font-bold uppercase tracking-wider transition"
                  style={{
                    color: modo === m.key ? primary : "#9CA3AF",
                  }}
                >
                  {m.label}
                  {modo === m.key && (
                    <span
                      className="absolute bottom-[-1px] left-0 h-[2px] w-full"
                      style={{ backgroundColor: primary }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-5 shadow-lg">
              {modo === "codigo" ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Codigo do imovel"
                    className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                  />
                  <button
                    className="rounded-md px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
                    style={{ backgroundColor: primary }}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <select className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-500">
                    <option>Finalidade</option>
                    <option>Venda</option>
                    <option>Aluguel</option>
                    <option>Temporada</option>
                  </select>
                  <select className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-500">
                    <option>Tipo</option>
                    <option>Casa</option>
                    <option>Apartamento</option>
                    <option>Terreno</option>
                    <option>Comercial</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Cidade"
                    className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Bairro"
                    className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-500"
                  />
                  <button
                    className="flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-110"
                    style={{ backgroundColor: secondary }}
                  >
                    <Search className="h-4 w-4" />
                    Buscar
                  </button>
                </div>
              )}
            </div>

            {/* Chips de categoria rapida — diferencial do Farol */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { icon: Building2, label: "Empreendimentos" },
                { icon: Landmark, label: "Condominios" },
                { icon: Sparkles, label: "Lancamentos" },
              ].map((c) => (
                <button
                  key={c.label}
                  className="flex items-center gap-1.5 rounded-full border-2 border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.borderColor = primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <c.icon className="h-3.5 w-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
