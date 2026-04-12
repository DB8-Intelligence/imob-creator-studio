import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function QuarterFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#FF5A3C";

  return (
    <footer className="bg-[#071c1f] px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            {site.logo_url ? (
              <img src={site.logo_url} alt={site.nome_completo} className="mb-4 h-10 object-contain brightness-0 invert" />
            ) : (
              <p className="mb-4 text-xl font-bold">{site.nome_completo}</p>
            )}
            <p className="text-sm leading-relaxed text-gray-400" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
              {site.bio?.slice(0, 140) || "Especialista em imoveis com atendimento profissional e personalizado."}
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded bg-white/10 transition hover:bg-white/20">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded bg-white/10 transition hover:bg-white/20">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
              Navegacao
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="transition hover:text-white">Inicio</a></li>
              <li><a href="#imoveis" className="transition hover:text-white">Imoveis</a></li>
              <li><a href="#sobre" className="transition hover:text-white">Sobre</a></li>
              <li><a href="#depoimentos" className="transition hover:text-white">Depoimentos</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
              Servicos
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Compra de imoveis</li>
              <li>Venda de imoveis</li>
              <li>Locacao</li>
              <li>Consultoria</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
              Contato
            </p>
            <ul className="space-y-3 text-sm text-gray-400">
              {site.whatsapp && (
                <li>
                  <a
                    href={whatsappLink(site.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition hover:text-white"
                  >
                    <Phone className="h-4 w-4" /> {site.whatsapp}
                  </a>
                </li>
              )}
              {site.email_contato && (
                <li>
                  <a href={`mailto:${site.email_contato}`} className="flex items-center gap-2 transition hover:text-white">
                    <Mail className="h-4 w-4" /> {site.email_contato}
                  </a>
                </li>
              )}
              {site.creci && <li>CRECI: {site.creci}</li>}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} {site.nome_completo}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
