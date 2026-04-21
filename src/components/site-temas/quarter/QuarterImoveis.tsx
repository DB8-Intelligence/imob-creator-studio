import { Bed, Bath, Car, Maximize } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";
import { getImoveisCount } from "@/types/site";

export default function QuarterImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#FF5A3C";
  const items = imoveis.filter((i) => i.destaque).slice(0, getImoveisCount(site));
  if (!items.length) return null;

  return (
    <section id="imoveis" className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            Destaques
          </span>
          <h2 className="text-3xl font-bold text-[#071c1f] md:text-4xl">
            Imoveis em Destaque
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#5C727D]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            Selecao especial de propriedades com as melhores oportunidades do mercado.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((im) => (
            <div key={im.id} className="group overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={im.foto_capa || im.fotos?.[0] || "/samples/themes/property-1.jpg"}
                  alt={im.titulo}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span
                  className="absolute left-4 top-4 rounded px-3 py-1 text-xs font-bold uppercase text-white"
                  style={{ backgroundColor: primary }}
                >
                  {im.finalidade === "venda" ? "Venda" : im.finalidade === "aluguel" ? "Aluguel" : "Temporada"}
                </span>
              </div>
              <div className="p-5">
                <p className="mb-2 text-xl font-bold" style={{ color: primary }}>
                  {formatPrice(im.preco)}
                </p>
                <h3 className="mb-1 text-lg font-bold text-[#071c1f]">{im.titulo}</h3>
                <p className="mb-4 text-sm text-[#5C727D]">{im.bairro}, {im.cidade}</p>
                <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-[#5C727D]">
                  {im.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" /> {im.quartos} Quartos
                    </span>
                  )}
                  {im.banheiros > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" /> {im.banheiros} Banhos
                    </span>
                  )}
                  {im.vagas > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="h-4 w-4" /> {im.vagas} Vagas
                    </span>
                  )}
                  {im.area_total && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-4 w-4" /> {im.area_total}m²
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
