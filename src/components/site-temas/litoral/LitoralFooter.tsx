import { Phone, Mail, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function LitoralFooter({ site }: TemaProps) {
  const tealDark = "#134E4A";

  const socials = [
    { url: site.instagram, icon: Instagram, label: "Instagram" },
    { url: site.facebook, icon: Facebook, label: "Facebook" },
    { url: site.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: site.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <footer style={{ backgroundColor: tealDark }} className="px-4 py-12 text-white md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {/* Col 1: Logo + Bio */}
        <div>
          {site.logo_url ? (
            <img
              src={site.logo_url}
              alt={site.nome_completo}
              className="mb-3 h-10 object-contain brightness-0 invert"
            />
          ) : (
            <h3 className="mb-3 text-lg font-bold font-['Playfair_Display',serif]">
              {site.nome_completo}
            </h3>
          )}
          <p className="text-sm leading-relaxed opacity-70">
            {site.bio
              ? site.bio.slice(0, 150) + (site.bio.length > 150 ? "..." : "")
              : "Especialista em imoveis no litoral. Seu paraiso esta mais perto do que voce imagina."}
          </p>
        </div>

        {/* Col 2: Links */}
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-teal-300">
            Navegacao
          </h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><a href="#imoveis" className="transition hover:text-teal-200 hover:opacity-100">Imoveis</a></li>
            <li><a href="#sobre" className="transition hover:text-teal-200 hover:opacity-100">Sobre</a></li>
            <li><a href="#depoimentos" className="transition hover:text-teal-200 hover:opacity-100">Depoimentos</a></li>
            <li><a href="#contato" className="transition hover:text-teal-200 hover:opacity-100">Contato</a></li>
          </ul>
        </div>

        {/* Col 3: Contact + Social */}
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-teal-300">
            Contato
          </h4>
          <div className="space-y-2 text-sm opacity-70">
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition hover:opacity-100"
              >
                <Phone className="h-3.5 w-3.5" /> {site.whatsapp}
              </a>
            )}
            {site.email_contato && (
              <a
                href={`mailto:${site.email_contato}`}
                className="flex items-center gap-2 transition hover:opacity-100"
              >
                <Mail className="h-3.5 w-3.5" /> {site.email_contato}
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-4 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-xs opacity-50">
        <p>
          &copy; {new Date().getFullYear()} {site.nome_completo}. Todos os
          direitos reservados.
        </p>
        <p className="mt-1">
          Site criado com{" "}
          <span className="font-semibold">NexoImob AI</span>
        </p>
      </div>
    </footer>
  );
}
