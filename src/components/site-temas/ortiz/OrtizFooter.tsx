import { Phone, Mail, MapPin } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function OrtizFooter({ site }: TemaProps) {
  const secondary = site.cor_secundaria || "#05344a";

  return (
    <footer style={{ backgroundColor: secondary }} className="px-4 py-14 text-white md:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        {/* Col 1: Brand */}
        <div className="md:col-span-1">
          {site.logo_url ? (
            <img
              src={site.logo_url}
              alt={site.nome_completo}
              className="mb-4 h-10 object-contain brightness-0 invert"
            />
          ) : (
            <h3 className="mb-4 text-lg font-bold">{site.nome_completo}</h3>
          )}
          <p className="text-sm leading-relaxed opacity-70">
            {site.bio
              ? site.bio.slice(0, 120) + (site.bio.length > 120 ? "..." : "")
              : "Seu corretor de confianca para encontrar o imovel ideal."}
          </p>
          {site.creci && (
            <p className="mt-3 text-xs opacity-50">CRECI {site.creci}</p>
          )}
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider opacity-50">
            Navegacao
          </h4>
          <ul className="space-y-2 text-sm opacity-70">
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

        {/* Col 3: Services */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider opacity-50">
            Servicos
          </h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li>Compra de imoveis</li>
            <li>Venda de imoveis</li>
            <li>Aluguel</li>
            <li>Avaliacao de mercado</li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider opacity-50">
            Contato
          </h4>
          <div className="space-y-3 text-sm opacity-70">
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition hover:opacity-100"
              >
                <Phone className="h-4 w-4" />
                {site.whatsapp}
              </a>
            )}
            {site.email_contato && (
              <a
                href={`mailto:${site.email_contato}`}
                className="flex items-center gap-2 transition hover:opacity-100"
              >
                <Mail className="h-4 w-4" />
                {site.email_contato}
              </a>
            )}
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Atendimento presencial e online
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-12 max-w-6xl border-t border-white/15 pt-6 text-center text-xs opacity-50">
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
