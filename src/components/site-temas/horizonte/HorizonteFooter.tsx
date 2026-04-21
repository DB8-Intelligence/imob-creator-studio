import { Instagram, Facebook, Linkedin, Youtube, Phone, Mail, MapPin } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function HorizonteFooter({ site }: TemaProps) {
  const secondary = site.cor_secundaria || "#F39200";
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] px-4 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="mb-5 h-11 object-contain brightness-0 invert"
              />
            ) : (
              <div className="mb-5 text-2xl font-black uppercase text-white">
                {site.nome_completo || "HORIZONTE"}
              </div>
            )}
            <p className="text-sm leading-relaxed text-gray-400">
              {site.bio?.slice(0, 160) ||
                "Imobiliaria com mais de uma decada de experiencia conectando familias aos imoveis dos seus sonhos."}
            </p>
            {site.creci && (
              <p className="mt-4 text-xs text-gray-500">
                CRECI {site.creci}
              </p>
            )}
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Navegacao
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <a href="#inicio" className="hover:text-white">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#imoveis" className="hover:text-white">
                  Imoveis
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-white">
                  Servicos
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-white">
                  Institucional
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-white">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Contatos
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {site.telefone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{site.telefone}</span>
                </li>
              )}
              {site.whatsapp && site.whatsapp !== site.telefone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>WhatsApp: {site.whatsapp}</span>
                </li>
              )}
              {site.email_contato && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{site.email_contato}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>CRECI {site.creci || "XXXXX-XX"}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Siga-nos
            </h4>
            <div className="flex gap-2.5">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded transition hover:brightness-110"
                  style={{ backgroundColor: secondary }}
                >
                  <Instagram className="h-4 w-4 text-white" />
                </a>
              )}
              {site.facebook && (
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded bg-gray-800 transition hover:bg-gray-700"
                >
                  <Facebook className="h-4 w-4 text-white" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded bg-gray-800 transition hover:bg-gray-700"
                >
                  <Linkedin className="h-4 w-4 text-white" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded bg-gray-800 transition hover:bg-gray-700"
                >
                  <Youtube className="h-4 w-4 text-white" />
                </a>
              )}
            </div>

            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                Newsletter
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white outline-none focus:border-gray-500"
                />
                <button
                  className="rounded-md px-3 py-2 text-xs font-bold text-white transition hover:brightness-110"
                  style={{ backgroundColor: secondary }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-800 pt-6 text-xs text-gray-500 md:flex-row">
          <p>
            &copy; {ano} {site.nome_completo || "Horizonte"}. Todos os direitos
            reservados.
          </p>
          <p className="text-[10px] opacity-70">
            Desenvolvido com NexoImob AI
          </p>
        </div>
      </div>
    </footer>
  );
}
