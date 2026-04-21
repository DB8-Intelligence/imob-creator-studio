import { Phone, Mail, MapPin, MessageCircle, Send, Leaf } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function SerenoContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#065F46";
  const secondary = site.cor_secundaria || "#D4A574";

  return (
    <section id="contato" className="bg-white px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div
            className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: `${primary}12`,
              color: primary,
            }}
          >
            <Leaf className="h-3 w-3" />
            Contato
          </div>
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: primary }}
          >
            Vamos conversar
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500">
            Estamos aqui para ajudar voce a encontrar seu refugio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {site.telefone && (
            <a
              href={`tel:${site.telefone}`}
              className="flex flex-col items-center gap-3 rounded-3xl bg-[#FAFAF7] p-6 text-center transition hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Phone className="h-5 w-5" style={{ color: primary }} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
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
              className="flex flex-col items-center gap-3 rounded-3xl bg-[#FAFAF7] p-6 text-center transition hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${secondary}25` }}
              >
                <MessageCircle className="h-5 w-5" style={{ color: secondary }} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
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
              className="flex flex-col items-center gap-3 rounded-3xl bg-[#FAFAF7] p-6 text-center transition hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Mail className="h-5 w-5" style={{ color: primary }} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                E-mail
              </p>
              <p className="break-all text-sm font-bold" style={{ color: primary }}>
                {site.email_contato}
              </p>
            </a>
          )}

          <div className="flex flex-col items-center gap-3 rounded-3xl bg-[#FAFAF7] p-6 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${primary}15` }}
            >
              <MapPin className="h-5 w-5" style={{ color: primary }} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              CRECI
            </p>
            <p className="text-sm font-bold" style={{ color: primary }}>
              {site.creci || "XXXXX-XX"}
            </p>
          </div>
        </div>

        <form className="mx-auto mt-10 max-w-3xl rounded-3xl bg-[#FAFAF7] p-8">
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
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
            <input
              type="tel"
              placeholder="Telefone"
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
            <input
              type="email"
              placeholder="E-mail"
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 md:col-span-2"
            />
            <textarea
              placeholder="O que voce procura?"
              rows={4}
              className="resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 md:col-span-2"
            />
          </div>

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition hover:brightness-110"
            style={{ backgroundColor: primary }}
          >
            <Send className="h-4 w-4" />
            Enviar mensagem
          </button>
        </form>
      </div>
    </section>
  );
}
