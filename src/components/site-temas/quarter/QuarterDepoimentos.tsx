import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function QuarterDepoimentos({ site, depoimentos }: TemaProps) {
  const primary = site.cor_primaria || "#FF5A3C";
  const items = depoimentos.filter((d) => d.ativo).slice(0, 3);
  if (!items.length) return null;

  return (
    <section id="depoimentos" className="bg-[#F2F6F7] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            Depoimentos
          </span>
          <h2 className="text-3xl font-bold text-[#071c1f] md:text-4xl">
            O que nossos clientes dizem
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((d) => (
            <div key={d.id} className="rounded-lg bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: d.avaliacao }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" style={{ fill: primary, color: primary }} />
                ))}
              </div>
              <p className="mb-6 leading-relaxed text-[#5C727D]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
                "{d.texto}"
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                {d.foto_url ? (
                  <img src={d.foto_url} alt={d.nome_cliente} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#071c1f] text-sm font-bold text-white">
                    {d.nome_cliente.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-[#071c1f]">{d.nome_cliente}</p>
                  <p className="text-xs text-[#5C727D]">{d.tipo_negocio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
