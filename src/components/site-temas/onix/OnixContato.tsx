import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function OnixContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1A1A1A";
  const secondary = site.cor_secundaria || "#B8860B";

  return (
    <section id="contato" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div
            className="mx-auto mb-6 h-px w-12"
            style={{ backgroundColor: secondary }}
          />
          <p
            className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em]"
            style={{ color: secondary }}
          >
            Contato
          </p>
          <h2
            className="text-3xl font-light tracking-tight md:text-4xl"
            style={{ color: primary }}
          >
            Vamos conversar
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm font-light text-gray-500">
            Fale com nosso time. Atendimento personalizado, discreto e a sua
            disposicao.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Contatos */}
          <div className="space-y-8">
            {site.telefone && (
              <div className="flex items-start gap-5">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center border"
                  style={{ borderColor: primary }}
                >
                  <Phone className="h-4 w-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">
                    Telefone
                  </p>
                  <p className="text-base" style={{ color: primary }}>
                    {site.telefone}
                  </p>
                </div>
              </div>
            )}

            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp, "Ola! Vim do seu site.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-5 transition hover:opacity-70"
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center border"
                  style={{ borderColor: primary }}
                >
                  <MessageCircle className="h-4 w-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">
                    WhatsApp
                  </p>
                  <p className="text-base" style={{ color: primary }}>
                    {site.whatsapp}
                  </p>
                </div>
              </a>
            )}

            {site.email_contato && (
              <div className="flex items-start gap-5">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center border"
                  style={{ borderColor: primary }}
                >
                  <Mail className="h-4 w-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">
                    E-mail
                  </p>
                  <p
                    className="break-all text-base"
                    style={{ color: primary }}
                  >
                    {site.email_contato}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-5">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center border"
                style={{ borderColor: primary }}
              >
                <MapPin className="h-4 w-4" style={{ color: primary }} />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">
                  CRECI
                </p>
                <p className="text-base" style={{ color: primary }}>
                  {site.creci || "XXXXX-XX"}
                </p>
              </div>
            </div>
          </div>

          {/* Form minimalista */}
          <form className="space-y-6">
            <div>
              <label
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400"
              >
                Nome
              </label>
              <input
                type="text"
                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm font-light outline-none transition focus:border-gray-900"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400"
              >
                E-mail
              </label>
              <input
                type="email"
                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm font-light outline-none transition focus:border-gray-900"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400"
              >
                Telefone
              </label>
              <input
                type="tel"
                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm font-light outline-none transition focus:border-gray-900"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400"
              >
                Mensagem
              </label>
              <textarea
                rows={3}
                className="w-full resize-none border-b border-gray-300 bg-transparent py-2 text-sm font-light outline-none transition focus:border-gray-900"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 text-[11px] font-medium uppercase tracking-[0.4em] text-white transition hover:brightness-125"
              style={{ backgroundColor: primary }}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
