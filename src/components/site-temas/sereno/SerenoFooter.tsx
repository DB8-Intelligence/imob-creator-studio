import { Instagram, Facebook, Linkedin, Youtube, Leaf } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function SerenoFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#065F46";
  const secondary = site.cor_secundaria || "#D4A574";
  const ano = new Date().getFullYear();

  return (
    <footer
      className="px-5 py-14 text-white/80"
      style={{ backgroundColor: primary }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
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
                  <Leaf className="h-6 w-6 text-white" />
                  <div className="text-xl font-bold text-white">
                    {site.nome_completo || "Sereno"}
                  </div>
                </>
              )}
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {site.bio?.slice(0, 140) ||
                "Mais que imoveis, refugios. Conectamos voce a lugares de tranquilidade, natureza e bem-estar."}
            </p>
          </div>

          <div>
            <h4
              className="mb-4 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Navegacao
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#imoveis" className="hover:text-white">Imoveis</a></li>
              <li><a href="#sobre" className="hover:text-white">Sobre</a></li>
              <li><a href="#contato" className="hover:text-white">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Contato
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
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
              className="mb-4 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Siga-nos
            </h4>
            <div className="flex gap-2">
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {site.facebook && (
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {site.youtube && (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-[11px] text-white/50 md:flex-row">
          <p>&copy; {ano} {site.nome_completo || "Sereno"}. Todos os direitos reservados.</p>
          <p className="opacity-70">Desenvolvido com NexoImob AI</p>
        </div>
      </div>
    </footer>
  );
}
