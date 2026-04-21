import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function PorticoFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1D4ED8";
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white px-5 py-10 text-gray-600">
      <div className="mx-auto max-w-7xl">
        {/* 2 colunas simples — signature Portale */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="mb-4 h-10 object-contain"
              />
            ) : (
              <div
                className="mb-4 text-xl font-extrabold"
                style={{ color: primary }}
              >
                {site.nome_completo || "Portico"}
              </div>
            )}
            <p className="mb-4 text-xs leading-relaxed text-gray-500">
              {site.bio?.slice(0, 180) ||
                "Portal imobiliario regional. Acesso rapido a um catalogo amplo de imoveis para compra, aluguel e temporada."}
            </p>
            <p className="text-[11px] text-gray-400">
              CRECI {site.creci || "XXXXX-XX"}
            </p>
          </div>

          <div className="md:text-right">
            <div className="space-y-1 text-sm">
              {site.telefone && <p>Vendas: {site.telefone}</p>}
              {site.whatsapp && site.whatsapp !== site.telefone && (
                <p>WhatsApp: {site.whatsapp}</p>
              )}
              {site.email_contato && <p>{site.email_contato}</p>}
            </div>

            <div className="mt-4 flex gap-2 md:justify-end">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-600 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.borderColor = primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Instagram className="h-3.5 w-3.5" />
                </a>
              )}
              {site.facebook && (
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-600 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.borderColor = primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-600 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.borderColor = primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-600 transition hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.borderColor = primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <Youtube className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-[10px] text-gray-400">
          <div className="flex flex-col items-center justify-between gap-1 md:flex-row">
            <p>&copy; {ano} {site.nome_completo || "Portico"}. Todos os direitos reservados.</p>
            <p className="opacity-70">Desenvolvido com NexoImob AI</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
