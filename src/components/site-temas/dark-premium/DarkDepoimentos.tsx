import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function DarkDepoimentos({ depoimentos }: TemaProps) {
  const gold = "#F59E0B";

  const items =
    depoimentos.length > 0
      ? depoimentos.filter((d) => d.ativo)
      : [
          {
            id: "d1",
            nome_cliente: "Eduardo Monteiro",
            texto: "Nao existe outro profissional no mercado que entenda tao bem o segmento de alto padrao. Impecavel.",
            avaliacao: 5,
            foto_url: "",
            tipo_negocio: "Compra - R$4.5M",
          },
          {
            id: "d2",
            nome_cliente: "Isabella Carvalho",
            texto: "Discricao, competencia e resultado. Vendeu nosso imovel acima do valor esperado.",
            avaliacao: 5,
            foto_url: "",
            tipo_negocio: "Venda - R$3.2M",
          },
          {
            id: "d3",
            nome_cliente: "Ricardo Almeida",
            texto: "Assessoria completa do inicio ao fim. Experiencia de compra premium como deveria ser.",
            avaliacao: 5,
            foto_url: "",
            tipo_negocio: "Compra - R$6.8M",
          },
        ];

  return (
    <section className="px-4 py-16 md:px-8" style={{ backgroundColor: "#0F172A" }} id="depoimentos">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-8 h-px w-16" style={{ backgroundColor: gold }} />
        <h2 className="mb-2 text-center text-2xl font-bold uppercase tracking-wider text-white md:text-3xl">
          Clientes Exclusivos
        </h2>
        <p className="mb-10 text-center text-sm text-gray-400">
          A confianca de quem busca o melhor
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((dep) => (
            <div
              key={dep.id}
              className="rounded-xl border p-6 transition hover:border-amber-500/50"
              style={{
                backgroundColor: "#1E293B",
                borderColor: "#334155",
              }}
            >
              {/* Gold quote marks */}
              <span
                className="mb-2 block text-4xl font-serif leading-none"
                style={{ color: gold }}
              >
                &ldquo;
              </span>

              <p className="mb-4 text-sm leading-relaxed text-gray-300">
                {dep.texto}
              </p>

              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    fill={i < (dep.avaliacao || 5) ? gold : "transparent"}
                    stroke={i < (dep.avaliacao || 5) ? gold : "#475569"}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 border-t border-gray-700 pt-4">
                {dep.foto_url ? (
                  <img
                    src={dep.foto_url}
                    alt={dep.nome_cliente}
                    className="h-10 w-10 rounded-full object-cover grayscale"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-black"
                    style={{ backgroundColor: gold }}
                  >
                    {dep.nome_cliente?.charAt(0) || "C"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {dep.nome_cliente}
                  </p>
                  {dep.tipo_negocio && (
                    <p className="text-xs" style={{ color: gold }}>
                      {dep.tipo_negocio}
                    </p>
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
