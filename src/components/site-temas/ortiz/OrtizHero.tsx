import { useState } from "react";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

export default function OrtizHero({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#25a5de";
  const secondary = site.cor_secundaria || "#05344a";

  const slides =
    imoveis.length > 0
      ? imoveis.filter((p) => p.destaque || p.foto_capa).slice(0, 5)
      : [];

  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? Math.max(slides.length - 1, 0) : c - 1));
  const next = () => setCurrent((c) => (c >= slides.length - 1 ? 0 : c + 1));

  const activeSlide = slides[current];

  return (
    <section className="relative min-h-[520px] md:min-h-[600px] overflow-hidden">
      {/* Background: slide image or gradient */}
      {activeSlide?.foto_capa ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${activeSlide.foto_capa})` }}
        />
      ) : site.banner_hero_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${site.banner_hero_url})` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)` }}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        {site.logo_url ? (
          <img
            src={site.logo_url}
            alt={site.nome_completo}
            className="h-10 object-contain brightness-0 invert"
          />
        ) : (
          <span className="text-xl font-bold text-white tracking-tight">
            {site.nome_completo}
          </span>
        )}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#imoveis" className="transition hover:text-white">Imoveis</a>
          <a href="#sobre" className="transition hover:text-white">Sobre</a>
          <a href="#depoimentos" className="transition hover:text-white">Depoimentos</a>
          <a href="#contato" className="transition hover:text-white">Contato</a>
        </nav>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-end px-6 pb-28 pt-16 md:px-12 md:pb-32 md:pt-20">
        <div className="mx-auto w-full max-w-6xl">
          {activeSlide ? (
            <div className="transition-all duration-500">
              {activeSlide.finalidade && (
                <span
                  className="mb-3 inline-block rounded px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: primary }}
                >
                  {activeSlide.finalidade === "aluguel" ? "Aluguel" : "Venda"}
                </span>
              )}
              <h1 className="mb-2 text-3xl font-bold text-white md:text-5xl leading-tight max-w-2xl">
                {activeSlide.titulo}
              </h1>
              {(activeSlide.bairro || activeSlide.cidade) && (
                <p className="mb-3 flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  {activeSlide.bairro && activeSlide.cidade
                    ? `${activeSlide.bairro}, ${activeSlide.cidade}`
                    : activeSlide.cidade || activeSlide.bairro}
                </p>
              )}
              <p className="text-2xl font-bold md:text-3xl" style={{ color: primary }}>
                {formatPrice(activeSlide.preco)}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl leading-tight max-w-2xl">
                {site.banner_hero_titulo || site.nome_completo}
              </h1>
              <p className="max-w-xl text-base text-white/80 md:text-lg">
                {site.banner_hero_subtitulo ||
                  "Encontre o imovel ideal com atendimento personalizado e seguranca."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slider Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-32 right-6 z-10 flex gap-2 md:bottom-36 md:right-12">
          <button
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1/2">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-xl sm:flex-row sm:items-center">
            <select className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 outline-none">
              <option value="">Tipo de imovel</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
            <input
              type="text"
              placeholder="Cidade ou bairro..."
              className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 outline-none"
            />
            <select className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 outline-none">
              <option value="">Finalidade</option>
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>
            <button
              className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
