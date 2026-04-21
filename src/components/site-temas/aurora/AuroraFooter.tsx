import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function AuroraFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1A3A52";
  const secondary = site.cor_secundaria || "#F59E0B";
  const ano = new Date().getFullYear();

  return (
    <footer
      className="px-4 py-12 text-gray-300"
      style={{ backgroundColor: primary }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-5 flex items-center gap-2">
              {site.logo_url ? (
                <img
                  src={site.logo_url}
                  alt={site.nome_completo}
                  className="h-10 object-contain brightness-0 invert"
                />
              ) : (
                <>
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, white 0%, ${secondary} 100%)`,
                    }}
                  />
                  <div className="text-xl font-extrabold text-white">
                    {site.nome_completo || "Aurora"}
                  </div>
                </>
              )}
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {site.bio?.slice(0, 140) ||
                "Conectamos pessoas aos imoveis ideais com clareza, agilidade e tecnologia."}
            </p>
            <div className="mt-5 flex gap-2">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {site.facebook && (
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Contatos
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              {site.telefone && <li>Vendas: {site.telefone}</li>}
              {site.whatsapp && site.whatsapp !== site.telefone && (
                <li>Locacao: {site.whatsapp}</li>
              )}
              {site.email_contato && <li>{site.email_contato}</li>}
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Onde estamos
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>CRECI {site.creci || "XXXXX-XX"}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <p>&copy; {ano} {site.nome_completo || "Aurora"}. Todos os direitos reservados.</p>
          <p className="opacity-70">Desenvolvido com NexoImob AI</p>
        </div>
      </div>
    </footer>
  );
}
