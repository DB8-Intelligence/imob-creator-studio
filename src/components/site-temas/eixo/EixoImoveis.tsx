import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

const demoItems = [
  {
    id: "demo-1",
    titulo: "Casa 4 suites Jardim Paulista",
    preco: 1150000,
    tipo: "casa",
    finalidade: "venda",
    cidade: "Indaiatuba",
    bairro: "Jardim Paulista",
    quartos: 4,
    banheiros: 4,
    area_total: 280,
    vagas: 3,
    foto_capa: "",
  },
  {
    id: "demo-2",
    titulo: "Apto 2 dormitorios Cambui",
    preco: 2800,
    tipo: "apartamento",
    finalidade: "aluguel",
    cidade: "Campinas",
    bairro: "Cambui",
    quartos: 2,
    banheiros: 1,
    area_total: 78,
    vagas: 1,
    foto_capa: "",
  },
  {
    id: "demo-3",
    titulo: "Casa pe na areia Riviera",
    preco: 1500,
    tipo: "casa",
    finalidade: "temporada",
    cidade: "Bertioga",
    bairro: "Riviera",
    quartos: 3,
    banheiros: 3,
    area_total: 180,
    vagas: 2,
    foto_capa: "",
  },
  {
    id: "demo-4",
    titulo: "Cobertura duplex Centro",
    preco: 1850000,
    tipo: "cobertura",
    finalidade: "venda",
    cidade: "Indaiatuba",
    bairro: "Centro",
    quartos: 4,
    banheiros: 4,
    area_total: 220,
    vagas: 2,
    foto_capa: "",
  },
];

const PRICE_COLORS = {
  venda: "#DC2626",
  aluguel: "#2563EB",
  temporada: "#10B981",
};

const BADGE_LABELS = {
  venda: "Venda",
  aluguel: "Locacao",
  temporada: "Temporada",
};

export default function EixoImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#1E40AF";
  const secondary = site.cor_secundaria || "#10B981";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  return (
    <section id="imoveis" className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2
              className="text-3xl font-extrabold tracking-tight md:text-4xl"
              style={{ color: primary }}
            >
              Destaques
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Selecao dos nossos melhores imoveis disponiveis
            </p>
          </div>

          {/* Legenda das cores de preco */}
          <div className="flex flex-wrap gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PRICE_COLORS.venda }}
              />
              <span className="text-gray-500">Venda</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PRICE_COLORS.aluguel }}
              />
              <span className="text-gray-500">Locacao</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PRICE_COLORS.temporada }}
              />
              <span className="text-gray-500">Temporada</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((p) => {
            const fin = p.finalidade as keyof typeof PRICE_COLORS;
            const priceColor = PRICE_COLORS[fin] || PRICE_COLORS.venda;
            const badgeLabel = BADGE_LABELS[fin] || "Venda";

            return (
              <article
                key={p.id}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {p.foto_capa ? (
                    <img
                      src={p.foto_capa}
                      alt={p.titulo}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <span className="text-4xl opacity-30">&#127970;</span>
                    </div>
                  )}
                  <span
                    className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow"
                    style={{ backgroundColor: priceColor }}
                  >
                    {badgeLabel}
                  </span>
                </div>

                <div className="p-5">
                  <p
                    className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: secondary }}
                  >
                    {p.tipo}
                  </p>
                  <h3
                    className="mb-2 line-clamp-1 text-sm font-bold"
                    style={{ color: primary }}
                  >
                    {p.bairro || p.titulo}
                  </h3>
                  <p className="mb-3 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {p.cidade || "Localizacao"}
                  </p>

                  <p
                    className="mb-4 text-xl font-extrabold tracking-tight"
                    style={{ color: priceColor }}
                  >
                    {p.finalidade === "aluguel" || p.finalidade === "temporada" ? (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        {badgeLabel}{" "}
                      </span>
                    ) : null}
                    {formatPrice(p.preco)}
                    {(p.finalidade === "aluguel" ||
                      p.finalidade === "temporada") && (
                      <span className="text-xs font-normal text-gray-500">
                        {p.finalidade === "temporada" ? "/diaria" : "/mes"}
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-[11px] text-gray-600">
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

                  <button
                    className="mt-4 w-full rounded-md py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:brightness-110"
                    style={{ backgroundColor: secondary }}
                  >
                    Veja mais
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
