import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  { id: "d1", nome_cliente: "Paula Ribeiro", foto_url: "", texto: "Atendimento otimo e catalogo com muitas opcoes. Encontrei em poucos dias.", avaliacao: 5, tipo_negocio: "Compra" },
  { id: "d2", nome_cliente: "Marcos Silva", foto_url: "", texto: "Super rapido na locacao. Recomendo muito pra quem busca agilidade.", avaliacao: 5, tipo_negocio: "Aluguel" },
  { id: "d3", nome_cliente: "Roberta Leao", foto_url: "", texto: "Temporada maravilhosa, tudo conforme combinado. Voltarei.", avaliacao: 5, tipo_negocio: "Temporada" },
  { id: "d4", nome_cliente: "Felipe Mendes", foto_url: "", texto: "Vendi minha casa em 2 meses. Corretor atencioso e competente.", avaliacao: 5, tipo_negocio: "Venda" },
  { id: "d5", nome_cliente: "Ana Beatriz", foto_url: "", texto: "Me ajudaram a simular o financiamento e encontrar a melhor taxa.", avaliacao: 5, tipo_negocio: "Financiamento" },
  { id: "d6", nome_cliente: "Carlos Daniel", foto_url: "", texto: "Documentacao perfeita, processo rapido, sem surpresas.", avaliacao: 5, tipo_negocio: "Compra" },
];

export default function VitrineDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#0066CC";
  const secondary = site.cor_secundaria || "#059669";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-white px-4 py-14 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Depoimentos
          </p>
          <h2
            className="text-3xl font-extrabold md:text-4xl"
            style={{ color: primary }}
          >
            Mais de mil clientes satisfeitos
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-5"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: d.avaliacao || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-current"
                    style={{ color: "#FBBF24" }}
                  />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                "{d.texto}"
              </p>
              <div className="flex items-center gap-2 border-t border-gray-200 pt-3">
                {d.foto_url ? (
                  <img
                    src={d.foto_url}
                    alt={d.nome_cliente}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {d.nome_cliente.charAt(0)}
                  </div>
                )}
                <div>
                  <p
                    className="text-xs font-bold"
                    style={{ color: primary }}
                  >
                    {d.nome_cliente}
                  </p>
                  <p className="text-[10px] text-gray-500">{d.tipo_negocio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
