import { Award, Building2, Users, TrendingUp } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function UrbanoAbout({ site }: TemaProps) {
  const stats = [
    { icon: Building2, value: "200+", label: "Imoveis negociados" },
    { icon: Users, value: "500+", label: "Clientes atendidos" },
    {
      icon: Award,
      value: site.anos_experiencia ? `${site.anos_experiencia}+` : "10+",
      label: "Anos de experiencia",
    },
    { icon: TrendingUp, value: "98%", label: "Satisfacao" },
  ];

  return (
    <section className="bg-[#1F2937] px-4 py-16 text-white md:px-8" id="sobre">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
          {/* Photo */}
          <div className="flex-shrink-0">
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="h-64 w-64 rounded-2xl object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-[#374151] text-5xl">
                {site.nome_completo?.charAt(0) || "C"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#64748B]">
              Sobre o Corretor
            </p>
            <h2 className="mb-2 text-2xl font-bold md:text-3xl">
              {site.nome_completo}
            </h2>

            {site.creci && (
              <p className="mb-4 flex items-center justify-center gap-1 text-sm text-gray-400 md:justify-start">
                <Award className="h-4 w-4" /> CRECI {site.creci}
              </p>
            )}

            {site.bio && (
              <p className="mb-8 leading-relaxed text-gray-300">{site.bio}</p>
            )}

            {site.especialidades?.length > 0 && (
              <div className="mb-8 flex flex-wrap justify-center gap-2 md:justify-start">
                {site.especialidades.map((esp) => (
                  <span
                    key={esp}
                    className="rounded-lg border border-gray-600 px-3 py-1 text-xs text-gray-300"
                  >
                    {esp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-[#374151] p-6 text-center"
            >
              <s.icon className="mx-auto mb-2 h-6 w-6 text-[#64748B]" />
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
