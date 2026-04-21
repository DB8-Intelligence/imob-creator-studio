import { Star, Quote } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  { id: "d1", nome_cliente: "Clarissa Pedro", foto_url: "", texto: "Atendimento luminoso, me senti bem guiada do inicio ao fim. Encontrei meu lar dos sonhos.", avaliacao: 5, tipo_negocio: "Compra residencial" },
  { id: "d2", nome_cliente: "Alexandre Ramos", foto_url: "", texto: "Processo claro, sem surpresas. Equipe profissional, muito recomendada.", avaliacao: 5, tipo_negocio: "Compra alto padrao" },
  { id: "d3", nome_cliente: "Sofia Mendez", foto_url: "", texto: "Locacao rapida e segura. A documentacao toda foi cuidada com atencao.", avaliacao: 5, tipo_negocio: "Locacao" },
  { id: "d4", nome_cliente: "Paulo Coutinho", foto_url: "", texto: "Temporada maravilhosa. Tudo conforme combinado, sem qualquer problema.", avaliacao: 5, tipo_negocio: "Temporada" },
];

export default function AuroraDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#1A3A52";
  const secondary = site.cor_secundaria || "#F59E0B";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-gray-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
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
            O que dizem nossos clientes
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((d) => (
            <div
              key={d.id}
              className="relative rounded-lg bg-white p-6 shadow-sm"
            >
              <Quote
                className="absolute right-4 top-4 h-12 w-12 opacity-10"
                style={{ color: primary }}
              />

              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: d.avaliacao || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-current"
                    style={{ color: secondary }}
                  />
                ))}
              </div>

              <p className="mb-5 text-sm leading-relaxed text-gray-600">
                "{d.texto}"
              </p>

              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                {d.foto_url ? (
                  <img
                    src={d.foto_url}
                    alt={d.nome_cliente}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
                    }}
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
