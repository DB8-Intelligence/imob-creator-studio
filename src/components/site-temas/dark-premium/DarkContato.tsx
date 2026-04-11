import { Phone, Mail, MessageCircle, Shield } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function DarkContato({ site, isPreview }: TemaProps) {
  const gold = "#F59E0B";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
  };

  return (
    <section className="px-4 py-16 md:px-8" style={{ backgroundColor: "#1E293B" }} id="contato">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-8 h-px w-16" style={{ backgroundColor: gold }} />
        <h2 className="mb-2 text-center text-2xl font-bold uppercase tracking-wider text-white md:text-3xl">
          Contato Exclusivo
        </h2>
        <p className="mb-10 text-center text-sm text-gray-400">
          Atendimento personalizado e discreto
        </p>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Seu nome"
              required
              className="w-full rounded-lg border px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition"
              style={{
                backgroundColor: "#0F172A",
                borderColor: "#334155",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = gold)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
            />
            <input
              type="tel"
              placeholder="Telefone"
              required
              className="w-full rounded-lg border px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition"
              style={{
                backgroundColor: "#0F172A",
                borderColor: "#334155",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = gold)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
            />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full rounded-lg border px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition"
              style={{
                backgroundColor: "#0F172A",
                borderColor: "#334155",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = gold)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
            />
            <select
              className="w-full rounded-lg border px-4 py-3 text-sm text-gray-400 outline-none transition"
              style={{
                backgroundColor: "#0F172A",
                borderColor: "#334155",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = gold)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
            >
              <option value="">Interesse</option>
              <option value="compra">Compra</option>
              <option value="aluguel">Aluguel</option>
              <option value="avaliacao">Avaliacao</option>
              <option value="outro">Outro</option>
            </select>
            <textarea
              placeholder="Mensagem"
              rows={4}
              className="w-full rounded-lg border px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition resize-none"
              style={{
                backgroundColor: "#0F172A",
                borderColor: "#334155",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = gold)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
            />
            <button
              type="submit"
              disabled={isPreview}
              className="w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: gold }}
            >
              Solicitar Atendimento
            </button>
          </form>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3 text-gray-400">
              <Shield className="h-5 w-5" style={{ color: gold }} />
              <p className="text-sm">Atendimento 100% sigiloso e personalizado</p>
            </div>

            {site.whatsapp && (
              <a
                href={whatsappLink(site.whatsapp, `Ola ${site.nome_completo}, vim pelo seu site exclusivo.`)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border p-4 transition hover:border-green-500/50"
                style={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                }}
              >
                <MessageCircle className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-white">WhatsApp</p>
                  <p className="text-sm text-gray-400">{site.whatsapp}</p>
                </div>
              </a>
            )}

            {site.telefone && (
              <a
                href={`tel:${site.telefone.replace(/\D/g, "")}`}
                className="flex items-center gap-3 rounded-xl border p-4 transition hover:border-amber-500/50"
                style={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                }}
              >
                <Phone className="h-6 w-6" style={{ color: gold }} />
                <div>
                  <p className="text-sm font-semibold text-white">Telefone</p>
                  <p className="text-sm text-gray-400">{site.telefone}</p>
                </div>
              </a>
            )}

            {site.email_contato && (
              <a
                href={`mailto:${site.email_contato}`}
                className="flex items-center gap-3 rounded-xl border p-4 transition hover:border-amber-500/50"
                style={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                }}
              >
                <Mail className="h-6 w-6" style={{ color: gold }} />
                <div>
                  <p className="text-sm font-semibold text-white">E-mail</p>
                  <p className="text-sm text-gray-400">{site.email_contato}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
