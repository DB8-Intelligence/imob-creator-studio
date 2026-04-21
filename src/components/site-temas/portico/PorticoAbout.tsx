import { Home, Calculator } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function PorticoAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1D4ED8";
  const secondary = site.cor_secundaria || "#64748B";

  return (
    <section id="sobre" className="bg-white px-5 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Quem somos */}
        <div className="mb-14 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Quem somos
            </p>
            <h2
              className="mb-5 text-3xl font-bold md:text-4xl"
              style={{ color: primary }}
            >
              {site.nome_completo || "Portal imobiliario regional"}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Conectamos corretores e clientes em um unico portal. Acesso rapido a um catalogo amplo de imoveis para venda, aluguel e temporada."}
            </p>
            <button
              className="rounded-md px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: primary }}
            >
              Saiba mais
            </button>
          </div>

          <div>
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="w-full rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex h-80 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
              >
                <Home className="h-20 w-20" style={{ color: primary, opacity: 0.3 }} />
              </div>
            )}
          </div>
        </div>

        {/* 2 cards de servico */}
        <div id="servicos" className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div
            className="rounded-md p-8 text-white"
            style={{ backgroundColor: primary }}
          >
            <Home className="mb-4 h-10 w-10 opacity-80" />
            <h3 className="mb-2 text-xl font-bold">Anuncie seu imovel</h3>
            <p className="mb-6 text-sm leading-relaxed text-white/80">
              Cadastre e divulgue seu imovel para milhares de interessados.
              Fotos profissionais e alcance amplificado.
            </p>
            <button className="rounded-md bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-900 transition hover:bg-gray-100">
              Cadastrar
            </button>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-8">
            <Calculator className="mb-4 h-10 w-10" style={{ color: primary }} />
            <h3
              className="mb-2 text-xl font-bold"
              style={{ color: primary }}
            >
              Financiamento
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              Simule e descubra as melhores condicoes para conquistar sua casa
              propria. Sem compromisso.
            </p>
            <button
              className="rounded-md px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:brightness-110"
              style={{ backgroundColor: primary }}
            >
              Simular agora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
