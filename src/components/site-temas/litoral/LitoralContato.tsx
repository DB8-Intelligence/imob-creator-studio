import { Phone, Mail, MessageCircle, Instagram, Facebook, Linkedin } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function LitoralContato({ site, isPreview }: TemaProps) {
  const teal = "#0D9488";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
  };

  const socials = [
    { url: site.instagram, icon: Instagram, label: "Instagram" },
    { url: site.facebook, icon: Facebook, label: "Facebook" },
    { url: site.linkedin, icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => s.url);

  return (
    <section className="px-4 py-16 md:px-8" id="contato">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl font-['Playfair_Display',serif]">
          Fale Conosco
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Seu imovel no litoral esta mais perto do que voce imagina
        </p>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Seu nome"
              required
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition"
              style={{ borderColor: "transparent" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = teal)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            <input
              type="tel"
              placeholder="Telefone"
              required
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition"
              onFocus={(e) => (e.currentTarget.style.borderColor = teal)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition"
              onFocus={(e) => (e.currentTarget.style.borderColor = teal)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            <select
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-500 outline-none transition"
              onFocus={(e) => (e.currentTarget.style.borderColor = teal)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            >
              <option value="">Interesse</option>
              <option value="compra">Compra</option>
              <option value="aluguel">Aluguel</option>
              <option value="temporada">Temporada</option>
              <option value="outro">Outro</option>
            </select>
            <textarea
              placeholder="Mensagem"
              rows={4}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition resize-none"
              onFocus={(e) => (e.currentTarget.style.borderColor = teal)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            <button
              type="submit"
              disabled={isPreview}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: teal }}
            >
              Enviar Mensagem
            </button>
          </form>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-6">
            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp, `Ola ${site.nome_completo}, vim pelo seu site!`)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 transition hover:bg-green-100"
              >
                <MessageCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">WhatsApp</p>
                  <p className="text-sm text-gray-500">{site.whatsapp}</p>
                </div>
              </a>
            )}

            {site.telefone && (
              <a
                href={`tel:${site.telefone.replace(/\D/g, "")}`}
                className="flex items-center gap-3 rounded-2xl p-4 transition hover:bg-orange-50"
                style={{ backgroundColor: "#FFF7ED" }}
              >
                <Phone className="h-6 w-6" style={{ color: "#D97706" }} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Telefone</p>
                  <p className="text-sm text-gray-500">{site.telefone}</p>
                </div>
              </a>
            )}

            {site.email_contato && (
              <a
                href={`mailto:${site.email_contato}`}
                className="flex items-center gap-3 rounded-2xl p-4 transition"
                style={{ backgroundColor: "#F0FDFA" }}
              >
                <Mail className="h-6 w-6" style={{ color: teal }} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">E-mail</p>
                  <p className="text-sm text-gray-500">{site.email_contato}</p>
                </div>
              </a>
            )}

            {socials.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full p-3 text-white transition hover:opacity-80"
                    style={{ backgroundColor: "#D97706" }}
                    aria-label={s.label}
                  >
                    <s.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
