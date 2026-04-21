import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function PrismaContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0F172A";
  const secondary = site.cor_secundaria || "#3B82F6";

  return (
    <section id="contato" className="bg-white px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-xs font-bold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Contato
          </p>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: primary }}
          >
            Vamos conversar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
            Estamos prontos para te ajudar a encontrar o imovel ideal ou a
            anunciar o seu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {site.telefone && (
            <a
              href={`tel:${site.telefone}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${primary}10` }}
              >
                <Phone className="h-5 w-5" style={{ color: primary }} />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Telefone
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: primary }}
              >
                {site.telefone}
              </p>
            </a>
          )}

          {site.whatsapp && (
            <a
              href={whatsappLink(site.whatsapp, "Ola! Vim do seu site.")}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                WhatsApp
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: primary }}
              >
                {site.whatsapp}
              </p>
            </a>
          )}

          {site.email_contato && (
            <a
              href={`mailto:${site.email_contato}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${secondary}15` }}
              >
                <Mail className="h-5 w-5" style={{ color: secondary }} />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                E-mail
              </p>
              <p
                className="break-all text-sm font-semibold"
                style={{ color: primary }}
              >
                {site.email_contato}
              </p>
            </a>
          )}

          <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${primary}10` }}
            >
              <MapPin className="h-5 w-5" style={{ color: primary }} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              CRECI
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: primary }}
            >
              {site.creci || "XXXXX-XX"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="mx-auto mt-12 max-w-3xl rounded-lg border border-gray-200 bg-white p-8">
          <h3
            className="mb-6 text-center text-xl font-bold"
            style={{ color: primary }}
          >
            Deixe sua mensagem
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Nome"
              className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
            />
            <input
              type="tel"
              placeholder="Telefone"
              className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
            />
            <input
              type="email"
              placeholder="E-mail"
              className="md:col-span-2 rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
            />
            <textarea
              placeholder="Mensagem"
              rows={4}
              className="md:col-span-2 resize-none rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-md py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110"
            style={{ backgroundColor: primary }}
          >
            Enviar mensagem
          </button>
        </form>
      </div>
    </section>
  );
}
