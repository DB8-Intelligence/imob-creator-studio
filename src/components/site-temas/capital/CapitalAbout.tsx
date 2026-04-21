import { Award, Users, Home, TrendingUp } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function CapitalAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#CC0000";
  const secondary = site.cor_secundaria || "#002E5E";

  const stats = [
    { icon: Home, value: "500+", label: "Imoveis vendidos" },
    { icon: Users, value: "1.2k", label: "Clientes felizes" },
    {
      icon: Award,
      value: `${site.anos_experiencia || 10}+`,
      label: "Anos de experiencia",
    },
    { icon: TrendingUp, value: "98%", label: "Satisfacao" },
  ];

  return (
    <section id="sobre" className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <span
            className="mb-2 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Sobre o corretor
          </span>
          <h2
            className="mb-4 text-3xl font-extrabold md:text-4xl"
            style={{ color: secondary }}
          >
            {site.nome_completo || "Seu parceiro de confianca"}
          </h2>
          <p className="mb-6 text-base leading-relaxed text-gray-600">
            {site.bio ||
              "Corretor especializado em ajudar familias a encontrarem o imovel ideal com seguranca, transparencia e atendimento personalizado."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center"
              >
                <s.icon
                  className="mx-auto mb-2 h-6 w-6"
                  style={{ color: primary }}
                />
                <p
                  className="text-2xl font-extrabold"
                  style={{ color: secondary }}
                >
                  {s.value}
                </p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {site.foto_url ? (
            <img
              src={site.foto_url}
              alt={site.nome_completo}
              className="w-full rounded-lg object-cover shadow-xl"
            />
          ) : (
            <div
              className="flex h-96 w-full items-center justify-center rounded-lg shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`,
              }}
            >
              <Users className="h-24 w-24 text-white/30" />
            </div>
          )}
          <div
            className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-lg md:block"
            style={{
              border: `3px solid ${primary}`,
              zIndex: -1,
            }}
          />
        </div>
      </div>
    </section>
  );
}
