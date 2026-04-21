import { ArrowRight, Home, Calculator } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function PrismaAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0F172A";
  const secondary = site.cor_secundaria || "#3B82F6";

  return (
    <section id="sobre" className="bg-white px-4 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Quem somos */}
        <div className="mb-16 grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Quem somos
            </p>
            <h2
              className="mb-5 text-3xl font-bold leading-tight tracking-tight md:text-4xl"
              style={{ color: primary }}
            >
              {site.nome_completo || "Imobiliaria de confianca"}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Uma plataforma completa para quem busca imovel para comprar, alugar ou passar temporada. Atendimento consultivo e transparente em cada etapa."}
            </p>
            <button
              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
              style={{ color: secondary }}
            >
              Saiba mais <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div>
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="w-full rounded-lg object-cover shadow-md"
              />
            ) : (
              <div
                className="flex h-80 w-full items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${primary}12 0%, ${secondary}15 100%)`,
                }}
              >
                <Home className="h-20 w-20" style={{ color: primary, opacity: 0.3 }} />
              </div>
            )}
          </div>
        </div>

        {/* Servicos em 2 cards */}
        <div id="servicos" className="mt-20">
          <div className="mb-10 text-center">
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Nossos servicos
            </p>
            <h3
              className="text-2xl font-bold md:text-3xl"
              style={{ color: primary }}
            >
              Como podemos te ajudar
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              className="rounded-lg p-8 text-white"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`,
              }}
            >
              <Home className="mb-4 h-10 w-10 opacity-80" />
              <h4 className="mb-3 text-xl font-bold">Anuncie seu imovel</h4>
              <p className="mb-6 text-sm leading-relaxed text-white/80">
                Cadastre seu imovel na nossa plataforma e alcance milhares de
                interessados. Divulgacao profissional com fotos de qualidade.
              </p>
              <button className="rounded-md bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-900 transition hover:bg-gray-100">
                Quero anunciar
              </button>
            </div>

            <div
              className="rounded-lg p-8"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <Calculator
                className="mb-4 h-10 w-10"
                style={{ color: secondary }}
              />
              <h4
                className="mb-3 text-xl font-bold"
                style={{ color: primary }}
              >
                Simule financiamento
              </h4>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                Calcule as melhores condicoes de financiamento com as
                principais instituicoes do mercado. Rapido e sem compromisso.
              </p>
              <button
                className="rounded-md px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:brightness-110"
                style={{ backgroundColor: secondary }}
              >
                Simular agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
