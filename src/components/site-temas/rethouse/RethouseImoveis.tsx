import { Bed, Bath, Car, Maximize } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

export default function RethouseImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#3454d1";
  const items = imoveis.filter((i) => i.destaque).slice(0, 6);
  if (!items.length) return null;

  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span
            className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Imoveis em Destaque
          </span>
          <h2 className="text-3xl font-bold text-[#333] md:text-4xl">
            Encontre Seu Proximo Lar
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((im) => (
            <div
              key={im.id}
              className="group overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={im.foto_capa || im.fotos?.[0] || "/samples/themes/property-1.jpg"}
                  alt={im.titulo}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: primary }}
                >
                  {im.finalidade === "venda"
                    ? "Venda"
                    : im.finalidade === "aluguel"
                    ? "Aluguel"
                    : "Temporada"}
                </span>
                <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {im.cidade}
                </span>
              </div>
              <div className="p-5">
                <h3 className="mb-1 text-lg font-bold text-[#333]">{im.titulo}</h3>
                <p className="mb-3 text-sm text-gray-500">
                  {im.bairro}, {im.cidade}
                </p>
                <p className="mb-4 text-xl font-extrabold" style={{ color: primary }}>
                  {formatPrice(im.preco)}
                </p>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  {im.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {im.quartos}
                    </span>
                  )}
                  {im.banheiros > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {im.banheiros}
                    </span>
                  )}
                  {im.vagas > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="h-3.5 w-3.5" /> {im.vagas}
                    </span>
                  )}
                  {im.area_total && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5" /> {im.area_total}m²
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
