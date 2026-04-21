import { MapPin, BedDouble, Bath, Maximize, Car, Heart } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

const demoItems = [
  { id: "1", titulo: "Casa com jardim amplo", preco: 890000, tipo: "casa", finalidade: "venda", cidade: "Atibaia", bairro: "Condominio Figueira", quartos: 4, banheiros: 3, area_total: 320, vagas: 4, foto_capa: "" },
  { id: "2", titulo: "Chacara contato natureza", preco: 1250000, tipo: "rural", finalidade: "venda", cidade: "Sao Roque", bairro: "Bairro dos Guedes", quartos: 4, banheiros: 3, area_total: 1500, vagas: 4, foto_capa: "" },
  { id: "3", titulo: "Apto area verde", preco: 680000, tipo: "apartamento", finalidade: "venda", cidade: "Campinas", bairro: "Parque das Andorinhas", quartos: 3, banheiros: 2, area_total: 110, vagas: 2, foto_capa: "" },
  { id: "4", titulo: "Casa pe na areia", preco: 1500, tipo: "casa", finalidade: "temporada", cidade: "Guaruja", bairro: "Praia do Tombo", quartos: 4, banheiros: 3, area_total: 210, vagas: 3, foto_capa: "" },
  { id: "5", titulo: "Studio sustentavel", preco: 2400, tipo: "studio", finalidade: "aluguel", cidade: "Campinas", bairro: "Cambui", quartos: 1, banheiros: 1, area_total: 42, vagas: 1, foto_capa: "" },
  { id: "6", titulo: "Casa com horta e pomar", preco: 1180000, tipo: "casa", finalidade: "venda", cidade: "Valinhos", bairro: "Santa Claudia", quartos: 4, banheiros: 3, area_total: 380, vagas: 4, foto_capa: "" },
];

export default function SerenoImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#065F46";
  const secondary = site.cor_secundaria || "#D4A574";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  return (
    <section id="imoveis" className="bg-[#FAFAF7] px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div
            className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: `${primary}12`,
              color: primary,
            }}
          >
            Selecionados
          </div>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: primary }}
          >
            Imoveis para viver bem
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
            Uma selecao especial de imoveis com natureza, conforto e conexao com
            o que importa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-xl"
            >
              <div className="relative h-60 overflow-hidden bg-gray-100">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${primary}20 0%, ${secondary}25 100%)`,
                    }}
                  >
                    <span className="text-5xl opacity-30">&#127795;</span>
                  </div>
                )}

                {/* Badge arredondado */}
                <span
                  className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  {p.finalidade === "aluguel"
                    ? "Locacao"
                    : p.finalidade === "temporada"
                      ? "Temporada"
                      : "Venda"}
                </span>

                {/* Botao favorito */}
                <button
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 transition hover:bg-white"
                  aria-label="Favoritar"
                >
                  <Heart className="h-4 w-4 text-gray-400 transition hover:fill-rose-400 hover:text-rose-400" />
                </button>
              </div>

              <div className="p-5">
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: secondary }}
                >
                  {p.tipo}
                </p>
                <h3
                  className="mb-2 line-clamp-1 text-base font-bold"
                  style={{ color: primary }}
                >
                  {p.titulo}
                </h3>
                <p className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade ? `${p.bairro}, ${p.cidade}` : p.cidade}
                </p>

                <p
                  className="mb-5 text-2xl font-bold tracking-tight"
                  style={{ color: primary }}
                >
                  {formatPrice(p.preco)}
                  {(p.finalidade === "aluguel" || p.finalidade === "temporada") && (
                    <span className="text-xs font-normal text-gray-500">
                      {p.finalidade === "temporada" ? "/diaria" : "/mes"}
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-600">
                  {p.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" /> {p.quartos}
                    </span>
                  )}
                  {p.banheiros > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {p.banheiros}
                    </span>
                  )}
                  {p.area_total && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5" /> {p.area_total}m²
                    </span>
                  )}
                  {p.vagas > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="h-3.5 w-3.5" /> {p.vagas}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
