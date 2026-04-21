import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function EixoFooter({ site }: TemaProps) {
  const secondary = site.cor_secundaria || "#10B981";
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] px-4 py-12 text-gray-300">
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
              <div className="mb-5 text-2xl font-extrabold uppercase text-white">
                {site.nome_completo || "EIXO"}
              </div>
            )}
            <p className="text-sm leading-relaxed text-gray-400">
              {site.bio?.slice(0, 140) ||
                "Imobiliaria regional com foco em transparencia, agilidade e atendimento consultivo."}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Nossos contatos
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {site.telefone && <li>Vendas: {site.telefone}</li>}
              {site.whatsapp && site.whatsapp !== site.telefone && (
                <li>Locacao: {site.whatsapp}</li>
              )}
              {site.email_contato && <li>{site.email_contato}</li>}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <a href="#sobre" className="hover:text-white">
                  Quem somos
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-white">
                  Servicos
                </a>
              </li>
              <li>
                <a href="#imoveis" className="hover:text-white">
                  Imoveis
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-white">
                  Fale conosco
                </a>
              </li>
              <li>CRECI {site.creci || "XXXXX-XX"}</li>
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700"
                >
                  <Facebook className="h-4 w-4 text-white" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700"
                >
                  <Linkedin className="h-4 w-4 text-white" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700"
                >
                  <Youtube className="h-4 w-4 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-800 pt-6 text-xs text-gray-500 md:flex-row">
          <p>
            &copy; {ano} {site.nome_completo || "Eixo"}. Todos os direitos
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
