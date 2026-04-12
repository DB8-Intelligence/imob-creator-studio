import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function NestlandDepoimentos({ depoimentos }: TemaProps) {
  const items = depoimentos.filter((d) => d.ativo).slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest text-[#b99755]">
            Depoimentos
          </span>
          <h2 className="text-3xl font-bold text-[#0f0f0f] md:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            O que nossos clientes dizem
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((d) => (
            <div key={d.id} className="rounded-2xl bg-[#f7f4f1] p-6 shadow-sm">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: d.avaliacao }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#b99755] text-[#b99755]" />
                ))}
              </div>
              <p className="mb-4 italic text-[#515151]">"{d.texto}"</p>
              <div className="flex items-center gap-3">
                {d.foto_url && (
                  <img src={d.foto_url} alt={d.nome_cliente} className="h-10 w-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-bold text-[#0f0f0f]">{d.nome_cliente}</p>
                  <p className="text-xs text-[#777]">{d.tipo_negocio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
