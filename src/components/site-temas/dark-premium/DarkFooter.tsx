import { Phone, Mail, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function DarkFooter({ site }: TemaProps) {
  const gold = "#F59E0B";

  const socials = [
    { url: site.instagram, icon: Instagram, label: "Instagram" },
    { url: site.facebook, icon: Facebook, label: "Facebook" },
    { url: site.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: site.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <footer className="px-4 py-12 text-white md:px-8" style={{ backgroundColor: "#0F172A" }}>
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        {/* Col 1: Brand */}
        <div>
          {site.logo_url ? (
            <img
              src={site.logo_url}
              alt={site.nome_completo}
              className="mb-3 h-8 object-contain"
            />
          ) : (
            <h3 className="mb-3 text-lg font-bold uppercase tracking-wider">
              {site.nome_completo}
            </h3>
          )}
          <p className="text-sm leading-relaxed text-gray-400">
            {site.bio
              ? site.bio.slice(0, 120) + (site.bio.length > 120 ? "..." : "")
              : "Consultoria imobiliaria de alto padrao."}
          </p>
        </div>

        {/* Col 2: Links */}
        <div>
          <h4
            className="mb-3 text-sm font-bold uppercase tracking-wider"
            style={{ color: gold }}
          >
            Navegacao
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="#imoveis" className="transition" style={{ color: undefined }} onMouseEnter={(e) => (e.currentTarget.style.color = gold)} onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}>
                Portfolio
              </a>
            </li>
            <li>
              <a href="#sobre" className="transition" onMouseEnter={(e) => (e.currentTarget.style.color = gold)} onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}>
                Sobre
              </a>
            </li>
            <li>
              <a href="#depoimentos" className="transition" onMouseEnter={(e) => (e.currentTarget.style.color = gold)} onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}>
                Depoimentos
              </a>
            </li>
            <li>
              <a href="#contato" className="transition" onMouseEnter={(e) => (e.currentTarget.style.color = gold)} onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}>
                Contato
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact */}
        <div>
          <h4
            className="mb-3 text-sm font-bold uppercase tracking-wider"
            style={{ color: gold }}
          >
            Contato
          </h4>
          <div className="space-y-2 text-sm text-gray-400">
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition"
                onMouseEnter={(e) => (e.currentTarget.style.color = gold)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
              >
                <Phone className="h-3.5 w-3.5" /> {site.whatsapp}
              </a>
            )}
            {site.email_contato && (
              <a
                href={`mailto:${site.email_contato}`}
                className="flex items-center gap-2 transition"
                onMouseEnter={(e) => (e.currentTarget.style.color = gold)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
              >
                <Mail className="h-3.5 w-3.5" /> {site.email_contato}
              </a>
            )}
          </div>
        </div>

        {/* Col 4: Social */}
        <div>
          <h4
            className="mb-3 text-sm font-bold uppercase tracking-wider"
            style={{ color: gold }}
          >
            Social
          </h4>
          {socials.length > 0 ? (
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border p-2 text-gray-400 transition"
                  style={{ borderColor: "#334155" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = gold;
                    e.currentTarget.style.color = gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#334155";
                    e.currentTarget.style.color = "#9CA3AF";
                  }}
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Em breve</p>
          )}
        </div>
      </div>

      {/* Gold line separator */}
      <div className="mx-auto mt-10 max-w-6xl">
        <div className="h-px w-full" style={{ backgroundColor: `${gold}22` }} />
        <div className="pt-6 text-center text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {site.nome_completo}. Todos os
            direitos reservados.
          </p>
          <p className="mt-1">
            Site criado com{" "}
            <span className="font-semibold" style={{ color: gold }}>
              NexoImob AI
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
