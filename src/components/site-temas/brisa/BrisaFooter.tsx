import { MapPin, Phone, Mail } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function BrisaFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0284C7";

  return (
    <footer style={{ backgroundColor: primary }} className="px-4 py-12 text-white md:px-8">
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
            <h3 className="mb-3 text-lg font-bold">{site.nome_completo}</h3>
          )}
          <p className="text-sm leading-relaxed opacity-80">
            {site.bio
              ? site.bio.slice(0, 150) + (site.bio.length > 150 ? "..." : "")
              : "Seu corretor de confianca para encontrar o imovel ideal."}
          </p>
        </div>

        {/* Col 2: Links */}
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider opacity-70">
            Navegacao
          </h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <a href="#imoveis" className="transition hover:opacity-100">
                Imoveis
              </a>
            </li>
            <li>
              <a href="#sobre" className="transition hover:opacity-100">
                Sobre
              </a>
            </li>
            <li>
              <a href="#depoimentos" className="transition hover:opacity-100">
                Depoimentos
              </a>
            </li>
            <li>
              <a href="#contato" className="transition hover:opacity-100">
                Contato
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact */}
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider opacity-70">
            Contato
          </h4>
          <div className="space-y-2 text-sm opacity-80">
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition hover:opacity-100"
              >
                <Phone className="h-3.5 w-3.5" />
                {site.whatsapp}
              </a>
            )}
            {site.email_contato && (
              <a
                href={`mailto:${site.email_contato}`}
                className="flex items-center gap-2 transition hover:opacity-100"
              >
                <Mail className="h-3.5 w-3.5" />
                {site.email_contato}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/20 pt-6 text-center text-xs opacity-60">
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
