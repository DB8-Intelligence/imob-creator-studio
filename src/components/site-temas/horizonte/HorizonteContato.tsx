import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function HorizonteContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1E3A5F";
  const secondary = site.cor_secundaria || "#F39200";

  return (
    <section id="contato" className="bg-gray-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span
            className="mb-2 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Fale conosco
          </span>
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: primary }}
          >
            Entre em contato
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Info de contato */}
          <div className="space-y-4">
            {site.telefone && (
              <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <Phone className="h-5 w-5" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Telefone
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: primary }}
                  >
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
                className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    WhatsApp
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: primary }}
                  >
                    {site.whatsapp}
                  </p>
                </div>
              </a>
            )}

            {site.email_contato && (
              <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${secondary}20` }}
                >
                  <Mail className="h-5 w-5" style={{ color: secondary }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    E-mail
                  </p>
                  <p
                    className="text-base font-bold break-all"
                    style={{ color: primary }}
                  >
                    {site.email_contato}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${primary}15` }}
              >
                <MapPin className="h-5 w-5" style={{ color: primary }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  CRECI
                </p>
                <p className="text-base font-bold" style={{ color: primary }}>
                  {site.creci || "XXXXX-XX"}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form className="col-span-2 rounded-lg border border-gray-200 bg-white p-6 md:p-8">
            <h3
              className="mb-5 text-xl font-bold"
              style={{ color: primary }}
            >
              Envie uma mensagem
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Nome completo"
                className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
              />
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
              />
              <input
                type="email"
                placeholder="E-mail"
                className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500 md:col-span-2"
              />
              <select className="rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-600 outline-none focus:border-gray-500 md:col-span-2">
                <option>Qual seu interesse?</option>
                <option>Comprar imovel</option>
                <option>Alugar imovel</option>
                <option>Vender imovel</option>
                <option>Temporada</option>
                <option>Avaliacao de imovel</option>
              </select>
              <textarea
                placeholder="Mensagem (opcional)"
                rows={4}
                className="resize-none rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500 md:col-span-2"
              />
            </div>

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: secondary }}
            >
              <Send className="h-4 w-4" />
              Enviar mensagem
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
