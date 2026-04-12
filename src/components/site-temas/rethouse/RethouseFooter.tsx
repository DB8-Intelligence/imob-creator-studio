import type { TemaProps } from "../tipos";

export default function RethouseFooter({ site }: TemaProps) {
  const primary = site.cor_primaria || "#3454d1";

  return (
    <footer className="bg-[#1a2b6b] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            {site.logo_url ? (
              <img
                src={site.logo_url}
                alt={site.nome_completo}
                className="mb-4 h-10 object-contain brightness-0 invert"
              />
            ) : (
              <p className="mb-4 text-xl font-bold">{site.nome_completo}</p>
            )}
            <p className="text-sm leading-relaxed text-blue-200/70">
              {site.bio?.slice(0, 120) ||
                "Especialista em imoveis com atendimento personalizado."}
            </p>
          </div>

          <div>
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Links
            </p>
            <ul className="space-y-2 text-sm text-blue-200/70">
              <li className="cursor-pointer transition hover:text-white">Inicio</li>
              <li className="cursor-pointer transition hover:text-white">Imoveis</li>
              <li className="cursor-pointer transition hover:text-white">Sobre</li>
              <li className="cursor-pointer transition hover:text-white">Contato</li>
            </ul>
          </div>

          <div>
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Contato
            </p>
            <ul className="space-y-2 text-sm text-blue-200/70">
              {site.whatsapp && <li>{site.whatsapp}</li>}
              {site.email_contato && <li>{site.email_contato}</li>}
              {site.creci && <li>CRECI: {site.creci}</li>}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-blue-200/50">
          &copy; {new Date().getFullYear()} {site.nome_completo}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
