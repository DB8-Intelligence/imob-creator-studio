import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function VitrineFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0066CC";
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-10 text-gray-600">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                {site.nome_completo || "Vitrine"}
              </div>
            )}
            <p className="text-xs leading-relaxed text-gray-500">
              {site.bio?.slice(0, 140) ||
                "Catalogo completo de imoveis. Venda, aluguel, temporada e lancamentos com atendimento consultivo."}
            </p>
          </div>

          <div>
            <h4
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Contato
            </h4>
            <ul className="space-y-1.5 text-xs">
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
              className="mb-3 text-xs font-bold uppercase tracking-widest"
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
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 transition hover:border-transparent hover:text-white"
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
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 transition hover:border-transparent hover:text-white"
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
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 transition hover:border-transparent hover:text-white"
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
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 transition hover:border-transparent hover:text-white"
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

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gray-200 pt-5 text-[10px] text-gray-500 md:flex-row">
          <p>&copy; {ano} {site.nome_completo || "Vitrine"}. Todos os direitos reservados.</p>
          <p className="opacity-70">Desenvolvido com NexoImob AI</p>
        </div>
      </div>
    </footer>
  );
}
