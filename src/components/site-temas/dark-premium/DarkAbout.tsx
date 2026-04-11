import { Award, Building2, Users, TrendingUp, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function DarkAbout({ site }: TemaProps) {
  const gold = "#F59E0B";

  const stats = [
    { icon: Building2, value: "300+", label: "Imoveis negociados" },
    { icon: Users, value: "1000+", label: "Clientes premium" },
    {
      icon: Award,
      value: site.anos_experiencia ? `${site.anos_experiencia}+` : "15+",
      label: "Anos de experiencia",
    },
    { icon: TrendingUp, value: "R$2B+", label: "Volume transacionado" },
  ];

  const socials = [
    { url: site.instagram, icon: Instagram, label: "Instagram" },
    { url: site.facebook, icon: Facebook, label: "Facebook" },
    { url: site.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: site.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <section className="px-4 py-16 text-white md:px-8" style={{ backgroundColor: "#1E293B" }} id="sobre">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
          {/* Photo - grayscale */}
          <div className="flex-shrink-0">
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="h-64 w-64 rounded-xl object-cover shadow-2xl grayscale transition hover:grayscale-0"
                style={{ border: `2px solid ${gold}` }}
              />
            ) : (
              <div
                className="flex h-64 w-64 items-center justify-center rounded-xl text-5xl"
                style={{ backgroundColor: "#0F172A", border: `2px solid ${gold}` }}
              >
                {site.nome_completo?.charAt(0) || "C"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4 h-px w-16 md:mx-0 mx-auto" style={{ backgroundColor: gold }} />
            <h2 className="mb-1 text-2xl font-bold uppercase tracking-wider md:text-3xl">
              {site.nome_completo}
            </h2>

            {site.creci && (
              <p className="mb-4 flex items-center justify-center gap-1 text-sm md:justify-start" style={{ color: gold }}>
                <Award className="h-4 w-4" /> CRECI {site.creci}
              </p>
            )}

            {site.bio && (
              <p className="mb-6 leading-relaxed text-gray-300">{site.bio}</p>
            )}

            {site.especialidades?.length > 0 && (
              <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
                {site.especialidades.map((esp) => (
                  <span
                    key={esp}
                    className="rounded border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: gold, color: gold }}
                  >
                    {esp}
                  </span>
                ))}
              </div>
            )}

            {socials.length > 0 && (
              <div className="flex justify-center gap-3 md:justify-start">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border p-2 transition hover:bg-amber-500/10"
                    style={{ borderColor: `${gold}44`, color: gold }}
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gold stats */}
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-6 text-center"
              style={{ backgroundColor: "#0F172A" }}
            >
              <s.icon className="mx-auto mb-2 h-6 w-6" style={{ color: gold }} />
              <p className="text-2xl font-extrabold" style={{ color: gold }}>
                {s.value}
              </p>
              <p className="mt-1 text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
