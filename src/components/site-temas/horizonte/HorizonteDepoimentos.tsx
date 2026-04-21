import { Star, Quote } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  {
    id: "d1",
    nome_cliente: "Andressa Moraes",
    foto_url: "",
    texto:
      "Experiencia impecavel. O corretor entendeu exatamente o que eu precisava e encontrou o apartamento perfeito para minha familia.",
    avaliacao: 5,
    tipo_negocio: "Compra",
  },
  {
    id: "d2",
    nome_cliente: "Carlos Eduardo",
    foto_url: "",
    texto:
      "Atendimento diferenciado, muito profissional. Recomendo a todos que querem segurança na hora de comprar ou vender imovel.",
    avaliacao: 5,
    tipo_negocio: "Venda",
  },
  {
    id: "d3",
    nome_cliente: "Patricia Nunes",
    foto_url: "",
    texto:
      "Processo transparente do inicio ao fim. Me senti muito bem assessorada e consegui fechar um otimo negocio.",
    avaliacao: 5,
    tipo_negocio: "Locacao",
  },
];

export default function HorizonteDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#1E3A5F";
  const secondary = site.cor_secundaria || "#F39200";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span
            className="mb-2 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Depoimentos
          </span>
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: primary }}
          >
            O que nossos clientes dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="relative rounded-lg border border-gray-100 bg-gray-50 p-6"
            >
              <Quote
                className="absolute right-4 top-4 h-12 w-12 opacity-10"
                style={{ color: secondary }}
              />

              <div className="mb-4 flex">
                {Array.from({ length: d.avaliacao || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: secondary }}
                  />
                ))}
              </div>

              <p className="mb-6 leading-relaxed text-gray-600">
                "{d.texto}"
              </p>

              <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                {d.foto_url ? (
                  <img
                    src={d.foto_url}
                    alt={d.nome_cliente}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {d.nome_cliente.charAt(0)}
                  </div>
                )}
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: primary }}
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
