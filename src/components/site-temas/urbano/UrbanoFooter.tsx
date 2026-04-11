import { Phone, Mail, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function UrbanoFooter({ site }: TemaProps) {
  const socials = [
    { url: site.instagram, icon: Instagram, label: "Instagram" },
    { url: site.facebook, icon: Facebook, label: "Facebook" },
    { url: site.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: site.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-[#111827] px-4 py-12 text-white md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        {/* Col 1: Brand */}
        <div>
          {site.logo_url ? (
            <img
              src={site.logo_url}
              alt={site.nome_completo}
              className="mb-3 h-8 object-contain brightness-0 invert"
            />
          ) : (
            <h3 className="mb-3 text-lg font-bold">{site.nome_completo}</h3>
          )}
          <p className="text-sm leading-relaxed text-gray-400">
            {site.bio
              ? site.bio.slice(0, 120) + (site.bio.length > 120 ? "..." : "")
              : "Consultoria imobiliaria especializada."}
          </p>
        </div>

        {/* Col 2: Links */}
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
            Navegacao
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#imoveis" className="transition hover:text-white">Imoveis</a></li>
            <li><a href="#sobre" className="transition hover:text-white">Sobre</a></li>
            <li><a href="#depoimentos" className="transition hover:text-white">Depoimentos</a></li>
            <li><a href="#contato" className="transition hover:text-white">Contato</a></li>
          </ul>
        </div>

        {/* Col 3: Contato */}
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
            Contato
          </h4>
          <div className="space-y-2 text-sm text-gray-400">
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition hover:text-white"
              >
                <Phone className="h-3.5 w-3.5" /> {site.whatsapp}
              </a>
            )}
            {site.email_contato && (
              <a
                href={`mailto:${site.email_contato}`}
                className="flex items-center gap-2 transition hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" /> {site.email_contato}
              </a>
            )}
          </div>
        </div>

        {/* Col 4: Social */}
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
            Redes Sociais
          </h4>
          {socials.length > 0 ? (
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[#1F2937] p-2.5 text-gray-400 transition hover:text-white"
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

      <div className="mx-auto mt-10 max-w-6xl border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} {site.nome_completo}. Todos os
          direitos reservados.
        </p>
        <p className="mt-1">
          Site criado com <span className="font-semibold text-gray-400">NexoImob AI</span>
        </p>
      </div>
    </footer>
  );
}
