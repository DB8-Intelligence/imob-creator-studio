import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function FarolFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0099CC";
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-[#1F2937] px-4 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="mb-5 h-10 object-contain brightness-0 invert"
              />
            ) : (
              <div className="mb-5 text-2xl font-extrabold text-white">
                {site.nome_completo || "Farol"}
              </div>
            )}
            <p className="text-sm leading-relaxed text-gray-400">
              {site.bio?.slice(0, 140) ||
                "Guiando voce ao imovel ideal com transparencia, agilidade e atendimento consultivo em toda a regiao."}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Localizacao
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>CRECI {site.creci || "XXXXX-XX"}</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Contatos
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {site.telefone && <li>Vendas: {site.telefone}</li>}
              {site.whatsapp && site.whatsapp !== site.telefone && (
                <li>Locacao: {site.whatsapp}</li>
              )}
              {site.email_contato && <li>{site.email_contato}</li>}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Siga-nos
            </h4>
            <div className="flex gap-2">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:brightness-110"
                  style={{ backgroundColor: primary }}
                >
                  <Instagram className="h-4 w-4 text-white" />
                </a>
              )}
              {site.facebook && (
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 transition hover:bg-gray-600"
                >
                  <Facebook className="h-4 w-4 text-white" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 transition hover:bg-gray-600"
                >
                  <Linkedin className="h-4 w-4 text-white" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 transition hover:bg-gray-600"
                >
                  <Youtube className="h-4 w-4 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-700 pt-6 text-xs text-gray-500 md:flex-row">
          <p>&copy; {ano} {site.nome_completo || "Farol"}. Todos os direitos reservados.</p>
          <p className="opacity-70">Desenvolvido com NexoImob AI</p>
        </div>
      </div>
    </footer>
  );
}
