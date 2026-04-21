import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function PrismaFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0F172A";
  const secondary = site.cor_secundaria || "#3B82F6";
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-14 text-gray-600">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="mb-5 h-10 object-contain"
              />
            ) : (
              <div
                className="mb-5 text-xl font-bold"
                style={{ color: primary }}
              >
                {site.nome_completo || "Prisma"}
              </div>
            )}
            <p className="text-sm leading-relaxed text-gray-500">
              {site.bio?.slice(0, 140) ||
                "Uma plataforma completa para quem busca imovel para comprar, alugar ou passar temporada."}
            </p>
          </div>

          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Navegacao
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#imoveis" className="hover:text-gray-900">
                  Imoveis
                </a>
              </li>
              <li>
                <a href="#categorias" className="hover:text-gray-900">
                  Categorias
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-gray-900">
                  Servicos
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-gray-900">
                  Institucional
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-gray-900">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Contatos
            </h4>
            <ul className="space-y-2.5 text-sm">
              {site.telefone && <li>Vendas: {site.telefone}</li>}
              {site.whatsapp && site.whatsapp !== site.telefone && (
                <li>WhatsApp: {site.whatsapp}</li>
              )}
              {site.email_contato && <li>{site.email_contato}</li>}
              <li>CRECI {site.creci || "XXXXX-XX"}</li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Siga-nos
            </h4>
            <div className="flex gap-2">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = secondary;
                    e.currentTarget.style.borderColor = secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {site.facebook && (
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = secondary;
                    e.currentTarget.style.borderColor = secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = secondary;
                    e.currentTarget.style.borderColor = secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = secondary;
                    e.currentTarget.style.borderColor = secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-gray-200 pt-6 text-xs text-gray-500 md:flex-row">
          <p>
            &copy; {ano} {site.nome_completo || "Prisma"}. Todos os direitos
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
