import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function BrisaDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#0284C7";

  const items =
    depoimentos.length > 0
      ? depoimentos.filter((d) => d.ativo)
      : [
          {
            id: "d1",
            nome_cliente: "Maria Silva",
            texto: "Excelente profissional! Encontrou o imovel perfeito para minha familia em tempo recorde.",
            avaliacao: 5,
            foto_url: "",
          },
          {
            id: "d2",
            nome_cliente: "Joao Pereira",
            texto: "Atendimento impecavel do inicio ao fim. Recomendo a todos que procuram um corretor de confianca.",
            avaliacao: 5,
            foto_url: "",
          },
          {
            id: "d3",
            nome_cliente: "Ana Costa",
            texto: "Profissionalismo e dedicacao. Fez toda a diferenca no processo de compra do nosso apartamento.",
            avaliacao: 4,
            foto_url: "",
          },
        ];

  return (
    <section className="px-4 py-16 md:px-8" style={{ backgroundColor: "#F0F9FF" }} id="depoimentos">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl font-['Plus_Jakarta_Sans',sans-serif]">
          O que dizem nossos clientes
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Depoimentos de quem ja realizou o sonho do imovel
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((dep) => (
            <div
              key={dep.id}
              className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
            >
              {/* Stars */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < (dep.avaliacao || 5) ? "#FACC15" : "transparent"}
                    stroke={i < (dep.avaliacao || 5) ? "#FACC15" : "#D1D5DB"}
                  />
                ))}
              </div>

              <p className="mb-4 text-sm leading-relaxed text-gray-600 italic">
                &ldquo;{dep.texto}&rdquo;
              </p>

              <div className="flex items-center gap-3">
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
                <span className="text-sm font-semibold text-gray-700">
                  {dep.nome_cliente}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
