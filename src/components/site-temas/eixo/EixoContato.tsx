import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function EixoContato({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1E40AF";
  const secondary = site.cor_secundaria || "#10B981";

  return (
    <section id="contato" className="bg-gray-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Fale conosco
          </p>
          <h2
            className="text-3xl font-extrabold md:text-4xl"
            style={{ color: primary }}
          >
            Entre em contato
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3">
            {site.telefone && (
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <Phone className="h-4 w-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">
                    Vendas
                  </p>
                  <p className="text-sm font-bold" style={{ color: primary }}>
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
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${secondary}18` }}
                >
                  <MessageCircle
                    className="h-4 w-4"
                    style={{ color: secondary }}
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">
                    WhatsApp
                  </p>
                  <p className="text-sm font-bold" style={{ color: primary }}>
                    {site.whatsapp}
                  </p>
                </div>
              </a>
            )}

            {site.email_contato && (
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <Mail className="h-4 w-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">
                    E-mail
                  </p>
                  <p
                    className="break-all text-sm font-bold"
                    style={{ color: primary }}
                  >
                    {site.email_contato}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${primary}15` }}
              >
                <MapPin className="h-4 w-4" style={{ color: primary }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  CRECI
                </p>
                <p className="text-sm font-bold" style={{ color: primary }}>
                  {site.creci || "XXXXX-XX"}
                </p>
              </div>
            </div>
          </div>

          <form className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2 md:p-8">
            <h3
              className="mb-5 text-xl font-bold"
              style={{ color: primary }}
            >
              Envie sua mensagem
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
                <option>Interesse</option>
                <option>Comprar</option>
                <option>Alugar</option>
                <option>Temporada</option>
                <option>Vender meu imovel</option>
              </select>
              <textarea
                placeholder="Mensagem (opcional)"
                rows={4}
                className="resize-none rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500 md:col-span-2"
              />
            </div>

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition hover:brightness-110"
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
