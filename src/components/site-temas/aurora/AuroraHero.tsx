import { Search, Phone, Mail, Globe, ChevronDown, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function AuroraHero({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1A3A52";
  const secondary = site.cor_secundaria || "#F59E0B";

  return (
    <>
      {/* Topbar cinza clara com contatos + idiomas */}
      <div className="hidden w-full border-b border-gray-200 bg-gray-50 text-[11px] text-gray-600 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-5">
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="h-10 object-contain"
              />
            ) : (
              <>
                <div
                  className="h-8 w-8 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
                  }}
                />
                <div
                  className="text-2xl font-extrabold tracking-tight"
                  style={{ color: primary }}
                >
                  {site.nome_completo || "Aurora"}
                </div>
              </>
            )}
          </div>

          <div className="hidden items-center gap-7 text-sm font-semibold text-gray-700 lg:flex">
            <a href="#imoveis" className="hover:opacity-70">Imoveis</a>
            <a href="#servicos" className="hover:opacity-70">Servicos</a>
            <a href="#sobre" className="hover:opacity-70">Institucional</a>
            <a href="#contato" className="hover:opacity-70">Contato</a>
          </div>

          <button className="lg:hidden">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Hero com slider (signature) + busca sobreposta */}
      <section
        id="inicio"
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "560px",
          background: site.banner_hero_url
            ? `url(${site.banner_hero_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primary} 0%, #2c5475 60%, ${secondary} 140%)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Setas do slider (visual apenas) */}
        <button
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Proximo"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center text-white md:py-24">
          <h1 className="mb-3 text-3xl font-extrabold leading-tight drop-shadow md:text-5xl lg:text-6xl">
            {site.banner_hero_titulo || "Encontre o imovel perfeito para voce"}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base text-white/90 drop-shadow md:text-lg">
            {site.banner_hero_subtitulo ||
              "Portfolio completo de imoveis para comprar, alugar ou passar as ferias."}
          </p>

          {/* Busca tripla simples — signature "triplo" do Lumine */}
          <div className="w-full max-w-4xl rounded-lg bg-white p-4 shadow-2xl md:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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
              </select>
              <input
                type="text"
                placeholder="Cidade ou bairro"
                className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-500"
              />
              <button
                className="flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                <Search className="h-4 w-4" />
                Ver imoveis
              </button>
            </div>
          </div>

          {/* Dots do slider */}
          <div className="mt-6 flex gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      </section>
    </>
  );
}
