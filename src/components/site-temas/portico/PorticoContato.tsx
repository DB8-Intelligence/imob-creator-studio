import { Phone, Mail, MessageCircle, MapPin, Send } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function PorticoContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1D4ED8";
  const secondary = site.cor_secundaria || "#64748B";

  return (
    <section id="contato" className="bg-white px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Contato
          </p>
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: primary }}
          >
            Entre em contato
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {site.telefone && (
            <a
              href={`tel:${site.telefone}`}
              className="flex flex-col items-center gap-2 rounded-md border border-gray-200 bg-white p-5 text-center transition hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Phone className="h-4 w-4" style={{ color: primary }} />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Telefone
              </p>
              <p className="text-sm font-bold" style={{ color: primary }}>
                {site.telefone}
              </p>
            </a>
          )}

          {site.whatsapp && (
            <a
              href={whatsappLink(site.whatsapp, "Ola! Vim do seu site.")}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 rounded-md border border-gray-200 bg-white p-5 text-center transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-50">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                WhatsApp
              </p>
              <p className="text-sm font-bold" style={{ color: primary }}>
                {site.whatsapp}
              </p>
            </a>
          )}

          {site.email_contato && (
            <a
              href={`mailto:${site.email_contato}`}
              className="flex flex-col items-center gap-2 rounded-md border border-gray-200 bg-white p-5 text-center transition hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Mail className="h-4 w-4" style={{ color: primary }} />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                E-mail
              </p>
              <p className="break-all text-sm font-bold" style={{ color: primary }}>
                {site.email_contato}
              </p>
            </a>
          )}

          <div className="flex flex-col items-center gap-2 rounded-md border border-gray-200 bg-white p-5 text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded"
              style={{ backgroundColor: `${primary}15` }}
            >
              <MapPin className="h-4 w-4" style={{ color: primary }} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              CRECI
            </p>
            <p className="text-sm font-bold" style={{ color: primary }}>
              {site.creci || "XXXXX-XX"}
            </p>
          </div>
        </div>

        <form className="mx-auto mt-10 max-w-3xl rounded-md border border-gray-200 bg-white p-6">
          <h3
            className="mb-5 text-center text-lg font-bold"
            style={{ color: primary }}
          >
            Envie sua mensagem
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Nome"
              className="rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            />
            <input
              type="tel"
              placeholder="Telefone"
              className="rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            />
            <input
              type="email"
              placeholder="E-mail"
              className="rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 md:col-span-2"
            />
            <textarea
              placeholder="Mensagem"
              rows={3}
              className="resize-none rounded-md border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 md:col-span-2"
            />
          </div>

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition hover:brightness-110"
            style={{ backgroundColor: primary }}
          >
            <Send className="h-4 w-4" />
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
}
