import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function OnixFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1A1A1A";
  const secondary = site.cor_secundaria || "#B8860B";
  const ano = new Date().getFullYear();

  return (
    <footer
      className="px-6 py-14 text-white/70"
      style={{ backgroundColor: primary }}
    >
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
              <div className="mb-5 text-2xl font-light uppercase tracking-[0.3em] text-white">
                {site.nome_completo || "Onix"}
              </div>
            )}
            <p className="text-xs font-light leading-relaxed">
              {site.bio?.slice(0, 140) ||
                "Conectamos pessoas a imoveis especiais. Refinamento, discricao e atencao em cada detalhe."}
            </p>
            <div
              className="mt-5 h-px w-12"
              style={{ backgroundColor: secondary }}
            />
          </div>

          <div>
            <h4
              className="mb-4 text-[10px] font-medium uppercase tracking-[0.4em]"
              style={{ color: secondary }}
            >
              Navegacao
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li><a href="#imoveis" className="hover:text-white">Imoveis</a></li>
              <li><a href="#categorias" className="hover:text-white">Categorias</a></li>
              <li><a href="#sobre" className="hover:text-white">Sobre</a></li>
              <li><a href="#contato" className="hover:text-white">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-[10px] font-medium uppercase tracking-[0.4em]"
              style={{ color: secondary }}
            >
              Contato
            </h4>
            <ul className="space-y-2 text-xs font-light">
              {site.telefone && <li>{site.telefone}</li>}
              {site.whatsapp && site.whatsapp !== site.telefone && (
                <li>WhatsApp: {site.whatsapp}</li>
              )}
              {site.email_contato && <li>{site.email_contato}</li>}
              <li>CRECI {site.creci || "XXXXX-XX"}</li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-[10px] font-medium uppercase tracking-[0.4em]"
              style={{ color: secondary }}
            >
              Siga-nos
            </h4>
            <div className="flex gap-3">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {site.facebook && (
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-[10px] uppercase tracking-widest text-white/40 md:flex-row">
          <p>&copy; {ano} {site.nome_completo || "Onix"}</p>
          <p>Desenvolvido com NexoImob AI</p>
        </div>
      </div>
    </footer>
  );
}
