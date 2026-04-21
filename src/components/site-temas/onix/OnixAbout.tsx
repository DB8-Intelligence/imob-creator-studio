import { ArrowRight, Home } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function OnixAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1A1A1A";
  const secondary = site.cor_secundaria || "#B8860B";

  return (
    <section id="sobre" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="w-full object-cover grayscale"
              />
            ) : (
              <div
                className="flex h-96 w-full items-center justify-center"
                style={{ backgroundColor: "#F5F5F5" }}
              >
                <Home className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>

          <div className="order-1 md:order-2">
            <div
              className="mb-6 h-px w-12"
              style={{ backgroundColor: secondary }}
            />
            <p
              className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em]"
              style={{ color: secondary }}
            >
              Sobre nos
            </p>
            <h2
              className="mb-6 text-3xl font-light leading-tight tracking-tight md:text-4xl"
              style={{ color: primary }}
            >
              {site.nome_completo || "Conexoes especiais"}
            </h2>
            <p className="mb-4 text-base font-light leading-relaxed text-gray-600">
              {site.bio ||
                "Acreditamos na liberdade do espaco e no poder transformador de viver bem. Conectamos pessoas a imoveis especiais, com cuidado, atencao e refinamento em cada detalhe."}
            </p>
            <p className="mb-8 text-sm font-light leading-relaxed text-gray-500">
              Cada imovel da nossa selecao e escolhido a dedo, respeitando a
              singularidade de quem o procura.
            </p>

            <a
              href="#contato"
              className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] transition hover:gap-3"
              style={{ color: primary }}
            >
              Saiba mais <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
