import { Building2, Users, Award, TrendingUp } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

export default function UrbanoHero({ site, imoveis }: TemaProps) {
  const highlight = imoveis.find((i) => i.destaque) || imoveis[0];

  const stats = [
    { icon: Building2, value: `${imoveis.length || 50}+`, label: "Imoveis" },
    { icon: Users, value: "500+", label: "Clientes" },
    { icon: Award, value: site.anos_experiencia ? `${site.anos_experiencia}+` : "10+", label: "Anos" },
    { icon: TrendingUp, value: "98%", label: "Satisfacao" },
  ];

  return (
    <section className="bg-[#1F2937] px-4 py-16 text-white md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-center">
          {/* Left 50% */}
          <div className="flex-1">
            {site.logo_url && (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="mb-6 h-10 object-contain brightness-0 invert"
              />
            )}
            <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
              {site.banner_hero_titulo || site.nome_completo}
            </h1>
            <p className="mb-6 max-w-md text-base text-gray-300">
              {site.banner_hero_subtitulo ||
                "Consultoria imobiliaria especializada com foco em resultados e excelencia no atendimento."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#imoveis"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Ver Imoveis
              </a>
              <a
                href="#contato"
                className="rounded-lg border border-gray-500 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-white hover:text-white"
              >
                Falar com Corretor
              </a>
            </div>
          </div>

          {/* Right 50% - Property highlight */}
          <div className="flex-1">
            {highlight ? (
              <div className="overflow-hidden rounded-2xl bg-[#374151] shadow-2xl">
                <div className="relative h-52">
                  {highlight.foto_capa ? (
                    <img
                      src={highlight.foto_capa}
                      alt={highlight.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
                      <Building2 className="h-16 w-16 text-gray-500" />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded bg-[#64748B] px-3 py-1 text-xs font-semibold uppercase">
                    Destaque
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="mb-1 text-lg font-bold">{highlight.titulo}</h3>
                  <p className="text-2xl font-extrabold text-white">
                    {formatPrice(highlight.preco)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl bg-[#374151]">
                <Building2 className="h-20 w-20 text-gray-600" />
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-14 grid grid-cols-2 gap-4 border-t border-gray-700 pt-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto mb-2 h-6 w-6 text-[#64748B]" />
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
