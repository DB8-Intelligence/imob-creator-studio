import { useState } from "react";
import { Search, Phone, Mail, MessageCircle, Menu } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

type Cat = "imoveis" | "empreendimentos" | "condominios";

export default function EixoHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1E40AF";
  const secondary = site.cor_secundaria || "#10B981";
  const [tab, setTab] = useState<Cat>("imoveis");

  return (
    <>
      {/* Topbar navy com contatos + login */}
      <div
        className="hidden w-full text-xs text-white md:block"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-5">
            {site.telefone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                Vendas: {site.telefone}
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
            <a href="#login" className="opacity-80 hover:opacity-100">
              Area do cliente
            </a>
            <span className="opacity-60">|</span>
            <span>CRECI {site.creci || "XXXXX"}</span>
          </div>
        </div>
      </div>

      {/* Navbar branca sticky */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-sm">
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
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: primary }}
              >
                {site.nome_completo || "Eixo"}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-7 text-sm font-semibold text-gray-700 lg:flex">
            <a href="#imoveis" className="transition hover:opacity-70">
              Imoveis
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

      {/* Hero com imagem + overlay + busca em abas */}
      <section
        id="inicio"
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "600px",
          background: site.banner_hero_url
            ? `url(${site.banner_hero_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primary} 0%, #1e3a8a 100%)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.65) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="mb-12 max-w-3xl text-white">
            <h1 className="mb-4 text-3xl font-extrabold leading-tight drop-shadow md:text-5xl lg:text-6xl">
              {site.banner_hero_titulo ||
                "Seu maior sonho tem um endereco"}
            </h1>
            <p className="text-base text-white/90 drop-shadow md:text-lg">
              {site.banner_hero_subtitulo ||
                "Imoveis para comprar, alugar e temporada. Encontre o ideal em minutos."}
            </p>
          </div>

          {/* Busca com abas categoria */}
          <div className="w-full max-w-5xl">
            <div className="flex gap-1">
              {([
                { key: "imoveis", label: "Imoveis" },
                { key: "empreendimentos", label: "Empreendimentos" },
                { key: "condominios", label: "Condominios" },
              ] as { key: Cat; label: string }[]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="rounded-t-md px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
                  style={{
                    backgroundColor:
                      tab === t.key ? "white" : "rgba(255,255,255,0.2)",
                    color: tab === t.key ? primary : "white",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="rounded-b-lg rounded-tr-lg bg-white p-5 shadow-2xl">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <select className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-500">
                  <option>Finalidade</option>
                  <option>Venda</option>
                  <option>Aluguel</option>
                  <option>Temporada</option>
                </select>
                <select className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-500">
                  <option>Tipo do imovel</option>
                  <option>Casa</option>
                  <option>Apartamento</option>
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
                  className="flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-110"
                  style={{ backgroundColor: secondary }}
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
              </div>

              <div className="mt-3 flex justify-center gap-4 text-xs text-gray-500">
                <a href="#" className="hover:text-gray-700">
                  Busca por codigo
                </a>
                <span className="opacity-50">|</span>
                <a href="#" className="hover:text-gray-700">
                  Busca avancada
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
