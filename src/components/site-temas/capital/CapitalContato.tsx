import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function CapitalContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#CC0000";
  const secondary = site.cor_secundaria || "#002E5E";

  return (
    <section
      id="contato"
      className="px-4 py-16 md:py-20"
      style={{ backgroundColor: secondary }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span
            className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-white/70"
          >
            Contato
          </span>
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Fale comigo agora
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-16"
            style={{ backgroundColor: primary }}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {site.telefone && (
              <div className="flex items-start gap-4 rounded-lg bg-white/5 p-4 text-white">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: primary }}
                >
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60">
                    Telefone
                  </p>
                  <p className="text-base font-semibold">{site.telefone}</p>
                </div>
              </div>
            )}

            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp, "Ola! Vim do seu site.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 rounded-lg bg-white/5 p-4 text-white transition hover:bg-white/10"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60">
                    WhatsApp
                  </p>
                  <p className="text-base font-semibold">{site.whatsapp}</p>
                </div>
              </a>
            )}

            {site.email_contato && (
              <div className="flex items-start gap-4 rounded-lg bg-white/5 p-4 text-white">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: primary }}
                >
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60">
                    E-mail
                  </p>
                  <p className="text-base font-semibold">
                    {site.email_contato}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 rounded-lg bg-white/5 p-4 text-white">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: primary }}
              >
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">
                  CRECI
                </p>
                <p className="text-base font-semibold">
                  {site.creci || "XXXXX-XX"}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario simples */}
          <form className="rounded-lg bg-white p-6 shadow-xl">
            <h3
              className="mb-4 text-xl font-bold"
              style={{ color: secondary }}
            >
              Envie uma mensagem
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
              <input
                type="email"
                placeholder="E-mail"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
              <textarea
                placeholder="Mensagem"
                rows={4}
                className="w-full resize-none rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />

              <button
                type="submit"
                className="w-full rounded-md py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                Enviar mensagem
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
