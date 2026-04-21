import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function CapitalFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#CC0000";
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 px-4 py-10 text-gray-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="mb-4 h-10 object-contain brightness-0 invert"
              />
            ) : (
              <div
                className="mb-4 text-xl font-extrabold"
                style={{ color: primary }}
              >
                {site.nome_completo || "CAPITAL"}
              </div>
            )}
            <p className="text-xs leading-relaxed text-gray-400">
              {site.bio?.slice(0, 140) ||
                "Seu parceiro de confianca na compra, venda e aluguel de imoveis."}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-white">Institucional</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#sobre" className="hover:text-white">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#imoveis" className="hover:text-white">
                  Imoveis
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
            <h4 className="mb-3 text-sm font-bold text-white">Contato</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {site.telefone && <li>{site.telefone}</li>}
              {site.email_contato && <li>{site.email_contato}</li>}
              {site.creci && <li>CRECI {site.creci}</li>}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-white">Redes sociais</h4>
            <div className="flex gap-3">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:opacity-80"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:opacity-80"
                  style={{ backgroundColor: primary }}
                >
                  <Facebook className="h-4 w-4 text-white" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:opacity-80"
                  style={{ backgroundColor: primary }}
                >
                  <Linkedin className="h-4 w-4 text-white" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:opacity-80"
                  style={{ backgroundColor: primary }}
                >
                  <Youtube className="h-4 w-4 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>
            &copy; {ano} {site.nome_completo || "Capital"}. Todos os direitos
            reservados.
          </p>
          <p className="mt-1 text-[10px] opacity-70">
            Desenvolvido com NexoImob AI
          </p>
        </div>
      </div>
    </footer>
  );
}
