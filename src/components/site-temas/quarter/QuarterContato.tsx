import { Phone, Mail, MapPin } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function QuarterContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#FF5A3C";

  return (
    <section id="contato" className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            Contato
          </span>
          <h2 className="text-3xl font-bold text-[#071c1f] md:text-4xl">
            Entre em Contato
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#5C727D]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            Estamos prontos para ajudar voce a encontrar o imovel perfeito.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {site.whatsapp && (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm transition hover:shadow-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${primary}15` }}>
                <Phone className="h-7 w-7" style={{ color: primary }} />
              </div>
              <p className="font-bold text-[#071c1f]">WhatsApp</p>
              <p className="text-sm text-[#5C727D]">{site.whatsapp}</p>
            </div>
          )}
          {site.email_contato && (
            <a
              href={`mailto:${site.email_contato}`}
              className="flex flex-col items-center gap-4 rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm transition hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${primary}15` }}>
                <Mail className="h-7 w-7" style={{ color: primary }} />
              </div>
              <p className="font-bold text-[#071c1f]">E-mail</p>
              <p className="text-sm text-[#5C727D]">{site.email_contato}</p>
            </a>
          )}
          <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${primary}15` }}>
              <MapPin className="h-7 w-7" style={{ color: primary }} />
            </div>
            <p className="font-bold text-[#071c1f]">Endereco</p>
            <p className="text-sm text-[#5C727D]">Entre em contato para agendar uma visita</p>
          </div>
        </div>

        {/* WhatsApp CTA */}
        {site.whatsapp && (
          <div className="mt-12 text-center">
            <a
              href={whatsappLink(site.whatsapp, `Ola ${site.nome_completo}, vi seu site e gostaria de mais informacoes.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded px-8 py-4 text-base font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              <Phone className="h-5 w-5" />
              Falar pelo WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
