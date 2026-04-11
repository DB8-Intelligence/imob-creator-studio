import { Award, Anchor, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function LitoralAbout({ site }: TemaProps) {
  const sand = "#D97706";
  const teal = "#0D9488";

  const socials = [
    { url: site.instagram, icon: Instagram, label: "Instagram" },
    { url: site.facebook, icon: Facebook, label: "Facebook" },
    { url: site.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: site.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <section
      className="px-4 py-16 md:px-8"
      style={{ backgroundColor: "#FFFBEB" }}
      id="sobre"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:gap-16">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <Anchor
            className="absolute -left-4 -top-4 h-8 w-8 rotate-[-15deg] opacity-30"
            style={{ color: sand }}
          />
          {site.foto_url ? (
            <img
              src={site.foto_url}
              alt={site.nome_completo}
              className="h-56 w-56 rounded-3xl border-4 object-cover shadow-lg"
              style={{ borderColor: sand }}
            />
          ) : (
            <div
              className="flex h-56 w-56 items-center justify-center rounded-3xl text-5xl text-white"
              style={{ backgroundColor: sand }}
            >
              {site.nome_completo?.charAt(0) || "C"}
            </div>
          )}
          <Anchor
            className="absolute -bottom-3 -right-3 h-6 w-6 rotate-[15deg] opacity-20"
            style={{ color: teal }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="mb-1 text-2xl font-bold text-gray-800 md:text-3xl font-['Playfair_Display',serif]">
            {site.nome_completo}
          </h2>

          {site.creci && (
            <p className="mb-4 flex items-center justify-center gap-1 text-sm text-gray-500 md:justify-start">
              <Award className="h-4 w-4" style={{ color: sand }} /> CRECI{" "}
              {site.creci}
            </p>
          )}

          {site.bio && (
            <p className="mb-6 leading-relaxed text-gray-600">{site.bio}</p>
          )}

          {/* Stats */}
          <div className="mb-6 flex flex-wrap justify-center gap-6 md:justify-start">
            {site.anos_experiencia > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: teal }}>
                  {site.anos_experiencia}+
                </p>
                <p className="text-xs text-gray-500">Anos no litoral</p>
              </div>
            )}
          </div>

          {/* Especialidades */}
          {site.especialidades?.length > 0 && (
            <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
              {site.especialidades.map((esp) => (
                <span
                  key={esp}
                  className="rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: teal }}
                >
                  {esp}
                </span>
              ))}
            </div>
          )}

          {/* Social */}
          {socials.length > 0 && (
            <div className="flex justify-center gap-3 md:justify-start">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full p-2 text-white transition hover:opacity-80"
                  style={{ backgroundColor: sand }}
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
