import type { TemaProps } from "../tipos";

const demoDepoimentos = [
  { id: "d1", nome_cliente: "Helena Vasconcellos", foto_url: "", texto: "Atencao aos detalhes que faz toda a diferenca. Encontrei o lar dos meus sonhos.", avaliacao: 5, tipo_negocio: "Compra residencial" },
  { id: "d2", nome_cliente: "Lucas Toledo", foto_url: "", texto: "Profissionais refinados, processo elegante. Toda a sofisticacao que esperava.", avaliacao: 5, tipo_negocio: "Compra alto padrao" },
  { id: "d3", nome_cliente: "Cristina Almeida", foto_url: "", texto: "Discricao e atendimento sob medida. Cada conversa foi uma experiencia.", avaliacao: 5, tipo_negocio: "Locacao premium" },
];

export default function OnixDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#1A1A1A";
  const secondary = site.cor_secundaria || "#B8860B";
  const items = depoimentos.length > 0 ? depoimentos : (demoDepoimentos as any[]);

  return (
    <section className="px-6 py-24" style={{ backgroundColor: "#FAFAFA" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div
            className="mx-auto mb-6 h-px w-12"
            style={{ backgroundColor: secondary }}
          />
          <p
            className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em]"
            style={{ color: secondary }}
          >
            Depoimentos
          </p>
          <h2
            className="text-3xl font-light tracking-tight md:text-4xl"
            style={{ color: primary }}
          >
            O que nossos clientes dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {items.slice(0, 3).map((d) => (
            <div key={d.id} className="text-center">
              <div
                className="mx-auto mb-6 text-5xl font-serif leading-none"
                style={{ color: secondary, lineHeight: 0.5 }}
              >
                "
              </div>

              <p className="mb-8 text-sm font-light leading-relaxed text-gray-600">
                {d.texto}
              </p>

              <div
                className="mx-auto mb-4 h-px w-8"
                style={{ backgroundColor: secondary }}
              />

              <p
                className="text-sm font-medium tracking-wide"
                style={{ color: primary }}
              >
                {d.nome_cliente}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-400">
                {d.tipo_negocio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
