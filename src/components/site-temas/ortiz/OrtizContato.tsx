import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function OrtizContato({ site, isPreview }: TemaProps) {
  const primary = site.cor_primaria || "#25a5de";
  const secondary = site.cor_secundaria || "#05344a";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
  };

  const contactCards = [
    {
      show: !!site.whatsapp,
      icon: MessageCircle,
      label: "WhatsApp",
      value: site.whatsapp,
      href: whatsappLink(
        site.whatsapp || "",
        `Ola ${site.nome_completo}, vim pelo seu site!`
      ),
      color: "#25D366",
      bgColor: "#25D36610",
    },
    {
      show: !!site.email_contato,
      icon: Mail,
      label: "E-mail",
      value: site.email_contato,
      href: `mailto:${site.email_contato}`,
      color: primary,
      bgColor: `${primary}10`,
    },
    {
      show: true,
      icon: MapPin,
      label: "Atendimento",
      value: "Presencial e online",
      href: undefined,
      color: secondary,
      bgColor: `${secondary}10`,
    },
  ].filter((c) => c.show);

  return (
    <section
      className="px-4 py-16 md:px-8"
      style={{ backgroundColor: "#f7f8fa" }}
      id="contato"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p
            className="mb-1 text-sm font-semibold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Contato
          </p>
          <h2
            className="text-2xl font-bold md:text-3xl"
            style={{ color: secondary }}
          >
            Fale Conosco
          </h2>
          <p className="mt-2 text-gray-500">
            Estamos prontos para ajudar voce a encontrar o imovel ideal
          </p>
        </div>

        {/* Contact cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {contactCards.map((card) => {
            const Wrapper = card.href ? "a" : "div";
            const wrapperProps = card.href
              ? { href: card.href, target: "_blank", rel: "noreferrer" }
              : {};
            return (
              <Wrapper
                key={card.label}
                {...(wrapperProps as any)}
                className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: secondary }}
                  >
                    {card.label}
                  </p>
                  <p className="text-sm text-gray-500">{card.value}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* Form */}
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md">
          <h3
            className="mb-6 text-center text-lg font-bold"
            style={{ color: secondary }}
          >
            Envie sua mensagem
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Seu nome"
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="tel"
                placeholder="Telefone"
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <input
              type="email"
              placeholder="E-mail"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
              <option value="">Interesse</option>
              <option value="compra">Compra</option>
              <option value="aluguel">Aluguel</option>
              <option value="avaliacao">Avaliacao de imovel</option>
              <option value="outro">Outro</option>
            </select>
            <textarea
              placeholder="Sua mensagem..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isPreview}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
