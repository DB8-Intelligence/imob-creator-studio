import { Phone, Mail, MapPin } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function NestlandContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#b99755";

  return (
    <section className="bg-[#f7f4f1] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            Contato
          </span>
          <h2 className="text-3xl font-bold text-[#0f0f0f] md:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Fale Conosco
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {site.whatsapp && (
            <a href={whatsappLink(site.whatsapp, `Ola ${site.nome_completo}, vi seu site e gostaria de mais informacoes.`)} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: primary }}>
                <Phone className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-[#0f0f0f]">WhatsApp</p>
              <p className="text-sm text-[#515151]">{site.whatsapp}</p>
            </a>
          )}
          {site.email_contato && (
            <a href={`mailto:${site.email_contato}`}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: primary }}>
                <Mail className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-[#0f0f0f]">E-mail</p>
              <p className="text-sm text-[#515151]">{site.email_contato}</p>
            </a>
          )}
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: primary }}>
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <p className="font-bold text-[#0f0f0f]">Endereco</p>
            <p className="text-center text-sm text-[#515151]">Entre em contato para visitar nossos imoveis</p>
          </div>
        </div>
      </div>
    </section>
  );
}
