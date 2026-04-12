import { Star, Quote } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function OrtizDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#25a5de";
  const secondary = site.cor_secundaria || "#05344a";

  const items =
    depoimentos.length > 0
      ? depoimentos.filter((d) => d.ativo)
      : [
          {
            id: "d1",
            nome_cliente: "Carlos Mendes",
            texto:
              "Profissional excepcional! Toda a negociacao foi conduzida com transparencia e agilidade. Recomendo fortemente.",
            avaliacao: 5,
            tipo_negocio: "Compra",
            foto_url: "",
          },
          {
            id: "d2",
            nome_cliente: "Fernanda Lima",
            texto:
              "Encontrou exatamente o que eu procurava. Atendimento humanizado e muito profissional do inicio ao fim.",
            avaliacao: 5,
            tipo_negocio: "Compra",
            foto_url: "",
          },
          {
            id: "d3",
            nome_cliente: "Roberto Alves",
            texto:
              "Vendeu meu imovel em tempo recorde e pelo melhor valor de mercado. Experiencia impecavel.",
            avaliacao: 4,
            tipo_negocio: "Venda",
            foto_url: "",
          },
        ];

  return (
    <section className="px-4 py-16 md:px-8" id="depoimentos">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p
            className="mb-1 text-sm font-semibold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Depoimentos
          </p>
          <h2
            className="text-2xl font-bold md:text-3xl"
            style={{ color: secondary }}
          >
            O que dizem nossos clientes
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((dep) => (
            <div
              key={dep.id}
              className="relative rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              {/* Quote icon */}
              <Quote
                className="absolute right-5 top-5 h-8 w-8 opacity-10"
                style={{ color: primary }}
              />

              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < (dep.avaliacao || 5) ? "#FACC15" : "transparent"}
                    stroke={i < (dep.avaliacao || 5) ? "#FACC15" : "#D1D5DB"}
                  />
                ))}
              </div>

              <p className="mb-5 text-sm leading-relaxed text-gray-600">
                &ldquo;{dep.texto}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                {dep.foto_url ? (
                  <img
                    src={dep.foto_url}
                    alt={dep.nome_cliente}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {dep.nome_cliente?.charAt(0) || "C"}
                  </div>
                )}
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: secondary }}
                  >
                    {dep.nome_cliente}
                  </p>
                  {dep.tipo_negocio && (
                    <p className="text-xs text-gray-400">{dep.tipo_negocio}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
