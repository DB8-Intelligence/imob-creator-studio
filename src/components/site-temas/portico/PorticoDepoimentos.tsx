import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  { id: "d1", nome_cliente: "Paula Carvalho", foto_url: "", texto: "Achei o apartamento em poucas buscas. Filtros muito uteis.", avaliacao: 5, tipo_negocio: "Compra" },
  { id: "d2", nome_cliente: "Lucas Barbosa", foto_url: "", texto: "Portal completo, catalogo amplo. Recomendo.", avaliacao: 5, tipo_negocio: "Locacao" },
  { id: "d3", nome_cliente: "Mariana Campos", foto_url: "", texto: "Atendimento agil e direto. Muito bom.", avaliacao: 5, tipo_negocio: "Venda" },
  { id: "d4", nome_cliente: "Daniel Reis", foto_url: "", texto: "Conseguimos alugar para temporada rapidamente. Nota 10.", avaliacao: 5, tipo_negocio: "Temporada" },
];

export default function PorticoDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#1D4ED8";
  const secondary = site.cor_secundaria || "#64748B";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-gray-50 px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Depoimentos
          </p>
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: primary }}
          >
            Clientes satisfeitos
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((d) => (
            <div
              key={d.id}
              className="rounded-md border border-gray-200 bg-white p-5"
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
              <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
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
