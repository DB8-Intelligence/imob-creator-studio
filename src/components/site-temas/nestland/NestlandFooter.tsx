import type { TemaProps } from "../tipos";

export default function NestlandFooter({ site }: TemaProps) {
  return (
    <footer className="bg-[#0f0f0f] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            {site.logo_url ? (
              <img src={site.logo_url} alt={site.nome_completo} className="mb-4 h-10 object-contain brightness-0 invert" />
            ) : (
              <p className="mb-4 text-xl font-bold">{site.nome_completo}</p>
            )}
            <p className="text-sm leading-relaxed text-gray-400">
              {site.bio?.slice(0, 120) || "Especialista em imoveis com atendimento personalizado."}
            </p>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#b99755]">Links</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Inicio</li>
              <li>Imoveis</li>
              <li>Sobre</li>
              <li>Contato</li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#b99755]">Contato</p>
            <ul className="space-y-2 text-sm text-gray-400">
              {site.whatsapp && <li>{site.whatsapp}</li>}
              {site.email_contato && <li>{site.email_contato}</li>}
              {site.creci && <li>CRECI: {site.creci}</li>}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} {site.nome_completo}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
