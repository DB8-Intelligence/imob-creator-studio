import { Search, Phone, Mail, Globe, MessageCircle, Menu, ChevronDown } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function VitrineHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0066CC";
  const secondary = site.cor_secundaria || "#059669";

  return (
    <>
      {/* Topbar cinza clara com idiomas */}
      <div className="hidden w-full border-b border-gray-100 bg-gray-50 text-[11px] text-gray-600 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-4">
            {site.telefone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {site.telefone}
              </span>
            )}
            {site.email_contato && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {site.email_contato}
              </span>
            )}
          </div>
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

      {/* Navbar branca sticky */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="h-11 object-contain"
              />
            ) : (
              <div
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: primary }}
              >
                {site.nome_completo || "Vitrine"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-6 text-sm font-semibold text-gray-700 lg:flex">
            <a href="#imoveis" className="hover:opacity-70">Imoveis</a>
            <a href="#servicos" className="hover:opacity-70">Servicos</a>
            <a href="#sobre" className="hover:opacity-70">Institucional</a>
            <a href="#contato" className="hover:opacity-70">Contato</a>
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp, "Ola! Vim do seu site.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                style={{ backgroundColor: secondary }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Fale no WhatsApp
              </a>
            )}
          </div>

          <button className="lg:hidden">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Hero compacto (sem imagem grande, foco na busca) */}
      <section
        id="inicio"
        className="relative w-full"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="mb-8 max-w-3xl text-white">
            <h1 className="mb-3 text-3xl font-extrabold leading-tight md:text-5xl">
              {site.banner_hero_titulo ||
                "Conectamos pessoas a imoveis"}
            </h1>
            <p className="text-base text-white/90 md:text-lg">
              {site.banner_hero_subtitulo ||
                "Catalogo completo com imoveis para compra, aluguel, temporada e lancamentos."}
            </p>
          </div>

          {/* Busca ampla com 5 campos + codigo */}
          <div className="rounded-lg bg-white p-5 shadow-2xl">
            <div className="mb-3 flex gap-3 border-b border-gray-100 pb-3 text-xs">
              <a
                href="#principal"
                className="rounded-sm border-b-2 px-3 py-1 font-bold"
                style={{ borderColor: primary, color: primary }}
              >
                Principal
              </a>
              <a
                href="#codigo"
                className="rounded-sm px-3 py-1 font-medium text-gray-500 hover:text-gray-700"
              >
                Por codigo
              </a>
              <a
                href="#avancada"
                className="rounded-sm px-3 py-1 font-medium text-gray-500 hover:text-gray-700"
              >
                Avancada
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              <select className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-gray-500">
                <option>Regiao</option>
                <option>Interior SP</option>
                <option>Litoral</option>
              </select>
              <select className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-gray-500">
                <option>Finalidade</option>
                <option>Venda</option>
                <option>Aluguel</option>
                <option>Temporada</option>
              </select>
              <select className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-gray-500">
                <option>Tipo</option>
                <option>Casa</option>
                <option>Apartamento</option>
                <option>Terreno</option>
                <option>Comercial</option>
              </select>
              <input
                type="text"
                placeholder="Cidade"
                className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-gray-500"
              />
              <input
                type="text"
                placeholder="Bairro"
                className="rounded-md border border-gray-300 bg-white px-2 py-2.5 text-xs text-gray-700 outline-none focus:border-gray-500"
              />
              <button
                className="flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                <Search className="h-3.5 w-3.5" />
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot flutuante (visual apenas - sem logica) */}
      <div
        className="fixed bottom-6 right-6 z-30 hidden md:block"
        aria-hidden="true"
      >
        <button
          className="flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold text-white shadow-xl transition hover:brightness-110"
          style={{ backgroundColor: secondary }}
        >
          <MessageCircle className="h-4 w-4" />
          Corretor online
        </button>
      </div>
    </>
  );
}
