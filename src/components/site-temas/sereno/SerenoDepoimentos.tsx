import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  { id: "d1", nome_cliente: "Iara Nascimento", foto_url: "", texto: "Encontrei exatamente o lar tranquilo que buscava. Atendimento humanizado do inicio ao fim.", avaliacao: 5, tipo_negocio: "Compra" },
  { id: "d2", nome_cliente: "Andre Ferraz", foto_url: "", texto: "Consegui alugar uma chacara perfeita para nossos fins de semana em familia.", avaliacao: 5, tipo_negocio: "Locacao" },
  { id: "d3", nome_cliente: "Renata Azevedo", foto_url: "", texto: "Profissionais atenciosos, que realmente se importam com o bem-estar do cliente.", avaliacao: 5, tipo_negocio: "Venda" },
];

export default function SerenoDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#065F46";
  const secondary = site.cor_secundaria || "#D4A574";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-[#FAFAF7] px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div
            className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: `${primary}12`,
              color: primary,
            }}
          >
            Depoimentos
          </div>
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: primary }}
          >
            Historias de serenidade
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="rounded-3xl bg-white p-7 shadow-sm"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: d.avaliacao || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: secondary }}
                  />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                "{d.texto}"
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
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
                  <p className="text-sm font-bold" style={{ color: primary }}>
                    {d.nome_cliente}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    {d.tipo_negocio}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
