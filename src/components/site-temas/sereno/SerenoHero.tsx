import { Search, Phone, Mail, MessageCircle, Menu, Leaf } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function SerenoHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#065F46";
  const secondary = site.cor_secundaria || "#D4A574";

  return (
    <>
      {/* Topbar minima verde escuro */}
      <div
        className="hidden w-full text-[11px] text-white/80 md:block"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2">
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
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
            <Leaf className="h-3 w-3" style={{ color: secondary }} />
            <span>Seu refugio ideal</span>
          </div>
        </div>
      </div>

      {/* Navbar clara sticky */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-[#FAFAF7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="h-11 object-contain"
              />
            ) : (
              <>
                <Leaf className="h-6 w-6" style={{ color: primary }} />
                <div
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: primary }}
                >
                  {site.nome_completo || "Sereno"}
                </div>
              </>
            )}
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-700 lg:flex">
            <a href="#imoveis" className="hover:opacity-70">Imoveis</a>
            <a href="#servicos" className="hover:opacity-70">Servicos</a>
            <a href="#sobre" className="hover:opacity-70">Sobre</a>
            <a href="#contato" className="hover:opacity-70">Contato</a>
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp, "Ola! Vim do seu site.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                style={{ backgroundColor: primary }}
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

      {/* Hero wellness — gradient verde sutil + blob organico */}
      <section
        id="inicio"
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "620px",
          background: site.banner_hero_url
            ? `url(${site.banner_hero_url}) center/cover no-repeat`
            : `linear-gradient(180deg, #FAFAF7 0%, ${primary}15 50%, ${secondary}10 100%)`,
        }}
      >
        {/* Blob decorativo verde (signature wellness) */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${primary}20` }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${secondary}20` }}
        />

        {site.banner_hero_url && (
          <div className="absolute inset-0 bg-white/70" />
        )}

        <div className="relative z-10 mx-auto max-w-5xl px-5 py-24 text-center md:py-32">
          <div
            className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: `${primary}12`,
              color: primary,
            }}
          >
            <Leaf className="h-3 w-3" />
            Imoveis com bem-estar
          </div>

          <h1
            className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: primary }}
          >
            {site.banner_hero_titulo || "Encontre seu refugio ideal"}
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {site.banner_hero_subtitulo ||
              "Imoveis para voce viver com tranquilidade, conforto e conexao com a natureza."}
          </p>

          {/* Busca com bordas generosas (cozy) */}
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-5 shadow-xl md:p-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <select className="rounded-2xl border border-gray-200 bg-[#FAFAF7] px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400">
                <option>Finalidade</option>
                <option>Venda</option>
                <option>Aluguel</option>
                <option>Temporada</option>
              </select>
              <select className="rounded-2xl border border-gray-200 bg-[#FAFAF7] px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400">
                <option>Tipo</option>
                <option>Casa</option>
                <option>Apartamento</option>
                <option>Chacara</option>
                <option>Terreno</option>
              </select>
              <input
                type="text"
                placeholder="Cidade"
                className="rounded-2xl border border-gray-200 bg-[#FAFAF7] px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
              />
              <input
                type="text"
                placeholder="Bairro"
                className="rounded-2xl border border-gray-200 bg-[#FAFAF7] px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
              />
              <button
                className="flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
          </div>

          {/* Tags rapidas — signature wellness */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "Com jardim",
              "Pe na areia",
              "Contato natureza",
              "Pet friendly",
              "Area de lazer",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border px-4 py-1.5 text-xs font-medium transition hover:border-transparent hover:text-white"
                style={{
                  borderColor: `${primary}30`,
                  color: primary,
                  backgroundColor: "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = primary;
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.color = primary;
                  e.currentTarget.style.borderColor = `${primary}30`;
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
