import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  {
    id: "d1",
    nome_cliente: "Amanda Freitas",
    foto_url: "",
    texto: "Vendi meu apartamento em 45 dias. Equipe super atenciosa e profissional.",
    avaliacao: 5,
    tipo_negocio: "Venda",
  },
  {
    id: "d2",
    nome_cliente: "Jose Carlos",
    foto_url: "",
    texto: "Aluguei minha casa com total seguranca. Documentacao toda resolvida.",
    avaliacao: 5,
    tipo_negocio: "Locacao",
  },
  {
    id: "d3",
    nome_cliente: "Beatriz Silveira",
    foto_url: "",
    texto: "Temporada perfeita em Bertioga. Imovel exatamente como descrito no anuncio.",
    avaliacao: 5,
    tipo_negocio: "Temporada",
  },
];

export default function EixoDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#1E40AF";
  const secondary = site.cor_secundaria || "#10B981";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-white px-4 py-16 md:py-20">
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
            O que nossos clientes dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-6"
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
