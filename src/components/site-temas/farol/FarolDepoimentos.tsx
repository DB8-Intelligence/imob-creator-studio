import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  { id: "d1", nome_cliente: "Tatiane Moraes", foto_url: "", texto: "Atendimento muito profissional. Encontrei o apartamento ideal em pouco tempo.", avaliacao: 5, tipo_negocio: "Compra" },
  { id: "d2", nome_cliente: "Rafael Macedo", foto_url: "", texto: "Vendi meu imovel com agilidade e seguranca. Recomendo muito.", avaliacao: 5, tipo_negocio: "Venda" },
  { id: "d3", nome_cliente: "Livia Correia", foto_url: "", texto: "Temporada perfeita. Tudo conforme combinado, imovel otimo.", avaliacao: 5, tipo_negocio: "Temporada" },
];

export default function FarolDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#0099CC";
  const secondary = site.cor_secundaria || "#0D9488";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-gray-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
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
            Clientes satisfeitos
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
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
              <p className="mb-5 leading-relaxed text-gray-600">
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
