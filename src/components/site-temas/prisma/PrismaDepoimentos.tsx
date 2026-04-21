import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  {
    id: "d1",
    nome_cliente: "Fernanda Lima",
    foto_url: "",
    texto:
      "Processo muito tranquilo e transparente. O corretor foi super atento em todas as etapas.",
    avaliacao: 5,
    tipo_negocio: "Compra de apartamento",
  },
  {
    id: "d2",
    nome_cliente: "Rodrigo Martins",
    foto_url: "",
    texto:
      "Consegui alugar um imovel otimo em poucos dias. Recomendo muito, atendimento de primeira.",
    avaliacao: 5,
    tipo_negocio: "Locacao residencial",
  },
  {
    id: "d3",
    nome_cliente: "Camila Rocha",
    foto_url: "",
    texto:
      "Vender o imovel foi muito mais rapido do que imaginei. Profissionais dedicados e competentes.",
    avaliacao: 5,
    tipo_negocio: "Venda de casa",
  },
  {
    id: "d4",
    nome_cliente: "Bruno Santos",
    foto_url: "",
    texto:
      "Equipe prestativa, respondeu todas as duvidas com clareza. Voltarei a fazer negocio com certeza.",
    avaliacao: 5,
    tipo_negocio: "Compra comercial",
  },
];

export default function PrismaDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#0F172A";
  const secondary = site.cor_secundaria || "#3B82F6";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="bg-gray-50 px-4 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-xs font-bold uppercase tracking-widest"
            style={{ color: secondary }}
          >
            Depoimentos
          </p>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: primary }}
          >
            O que nossos clientes dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: d.avaliacao || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-current"
                    style={{ color: "#FBBF24" }}
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
                  <p className="text-[11px] text-gray-500">{d.tipo_negocio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
