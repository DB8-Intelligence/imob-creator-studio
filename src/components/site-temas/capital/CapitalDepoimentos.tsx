import { Star, Quote } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  {
    id: "d1",
    nome_cliente: "Mariana Silva",
    foto_url: "",
    texto:
      "Atendimento excepcional. Encontrei o apartamento dos meus sonhos em menos de 30 dias.",
    avaliacao: 5,
    tipo_negocio: "Compra",
  },
  {
    id: "d2",
    nome_cliente: "Roberto Almeida",
    foto_url: "",
    texto:
      "Profissional serio e transparente. Recomendo para toda minha familia.",
    avaliacao: 5,
    tipo_negocio: "Venda",
  },
  {
    id: "d3",
    nome_cliente: "Juliana Costa",
    foto_url: "",
    texto:
      "Consegui alugar um imovel otimo em localizacao privilegiada. Muito obrigada!",
    avaliacao: 5,
    tipo_negocio: "Aluguel",
  },
];

export default function CapitalDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#CC0000";
  const secondary = site.cor_secundaria || "#002E5E";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section
      className="px-4 py-16 md:py-20"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span
            className="mb-2 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Depoimentos
          </span>
          <h2
            className="text-3xl font-extrabold md:text-4xl"
            style={{ color: secondary }}
          >
            O que dizem nossos clientes
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-16"
            style={{ backgroundColor: primary }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="relative rounded-lg bg-white p-6 shadow-md"
            >
              <Quote
                className="absolute right-4 top-4 h-10 w-10 opacity-10"
                style={{ color: primary }}
              />

              <div className="mb-4 flex">
                {Array.from({ length: d.avaliacao || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: "#FBBF24" }}
                  />
                ))}
              </div>

              <p className="mb-6 italic leading-relaxed text-gray-600">
                "{d.texto}"
              </p>

              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                {d.foto_url ? (
                  <img
                    src={d.foto_url}
                    alt={d.nome_cliente}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: secondary }}
                  >
                    {d.nome_cliente.charAt(0)}
                  </div>
                )}
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: secondary }}
                  >
                    {d.nome_cliente}
                  </p>
                  <p className="text-xs text-gray-500">{d.tipo_negocio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
