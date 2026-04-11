import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import type { TemaProps } from "../tipos";
import { whatsappLink } from "../tipos";

export default function UrbanoContato({ site, isPreview }: TemaProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
  };

  return (
    <section className="px-4 py-16 md:px-8" id="contato">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl shadow-lg md:flex">
          {/* Dark form side */}
          <div className="bg-[#1F2937] p-8 text-white md:w-1/2">
            <h2 className="mb-2 text-2xl font-bold">Entre em Contato</h2>
            <p className="mb-6 text-sm text-gray-400">
              Preencha o formulario e retornaremos em breve
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Seu nome"
                required
                className="w-full rounded-lg border border-gray-600 bg-[#374151] px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-[#64748B]"
              />
              <input
                type="tel"
                placeholder="Telefone"
                required
                className="w-full rounded-lg border border-gray-600 bg-[#374151] px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-[#64748B]"
              />
              <input
                type="email"
                placeholder="E-mail"
                className="w-full rounded-lg border border-gray-600 bg-[#374151] px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-[#64748B]"
              />
              <select className="w-full rounded-lg border border-gray-600 bg-[#374151] px-4 py-3 text-sm text-gray-400 outline-none transition focus:border-[#64748B]">
                <option value="">Interesse</option>
                <option value="compra">Compra</option>
                <option value="aluguel">Aluguel</option>
                <option value="avaliacao">Avaliacao</option>
                <option value="outro">Outro</option>
              </select>
              <textarea
                placeholder="Mensagem"
                rows={3}
                className="w-full rounded-lg border border-gray-600 bg-[#374151] px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-[#64748B] resize-none"
              />
              <button
                type="submit"
                disabled={isPreview}
                className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </div>

          {/* Light info side */}
          <div className="flex flex-col justify-center bg-[#F9FAFB] p-8 md:w-1/2">
            <h3 className="mb-6 text-lg font-bold text-gray-800">
              Informacoes de Contato
            </h3>

            <div className="space-y-5">
              {site.whatsapp && (
                <a
                  href={whatsappLink(site.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-gray-600 transition hover:text-gray-900"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">{site.whatsapp}</span>
                </a>
              )}
              {site.telefone && (
                <a
                  href={`tel:${site.telefone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-gray-600 transition hover:text-gray-900"
                >
                  <Phone className="h-5 w-5 text-[#64748B]" />
                  <span className="text-sm">{site.telefone}</span>
                </a>
              )}
              {site.email_contato && (
                <a
                  href={`mailto:${site.email_contato}`}
                  className="flex items-center gap-3 text-gray-600 transition hover:text-gray-900"
                >
                  <Mail className="h-5 w-5 text-[#64748B]" />
                  <span className="text-sm">{site.email_contato}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
