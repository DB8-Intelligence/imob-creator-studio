import { Award, Home, Users, Clock } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function OrtizAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#25a5de";
  const secondary = site.cor_secundaria || "#05344a";

  const stats = [
    {
      icon: Clock,
      value: site.anos_experiencia > 0 ? `${site.anos_experiencia}+` : "10+",
      label: "Anos de experiencia",
    },
    { icon: Home, value: "500+", label: "Imoveis negociados" },
    { icon: Users, value: "300+", label: "Clientes atendidos" },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16 md:px-8" id="sobre">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          {/* Photo */}
          <div className="flex-shrink-0">
            {site.foto_url ? (
              <div className="relative">
                <img
                  src={site.foto_url}
                  alt={site.nome_completo}
                  className="h-72 w-72 rounded-lg object-cover shadow-lg"
                />
                <div
                  className="absolute -bottom-3 -right-3 h-72 w-72 rounded-lg border-2"
                  style={{ borderColor: primary }}
                />
              </div>
            ) : (
              <div
                className="flex h-72 w-72 items-center justify-center rounded-lg text-6xl font-bold text-white shadow-lg"
                style={{ backgroundColor: secondary }}
              >
                {site.nome_completo?.charAt(0) || "O"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Sobre
            </p>
            <h2
              className="mb-2 text-2xl font-bold md:text-3xl"
              style={{ color: secondary }}
            >
              {site.nome_completo}
            </h2>

            {site.creci && (
              <p className="mb-4 flex items-center justify-center gap-1.5 text-sm text-gray-500 md:justify-start">
                <Award className="h-4 w-4" style={{ color: primary }} /> CRECI{" "}
                {site.creci}
              </p>
            )}

            {site.bio && (
              <p className="mb-8 leading-relaxed text-gray-600">{site.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-white p-4 text-center shadow-sm"
                >
                  <s.icon
                    className="mx-auto mb-2 h-6 w-6"
                    style={{ color: primary }}
                  />
                  <p
                    className="text-xl font-bold"
                    style={{ color: secondary }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
