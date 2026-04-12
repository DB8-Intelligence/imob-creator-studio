import { MapPin, Bed, Bath, Car, Maximize } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

export default function OrtizImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#25a5de";
  const secondary = site.cor_secundaria || "#05344a";

  const items =
    imoveis.length > 0
      ? imoveis
      : ([
          {
            id: "demo-1",
            titulo: "Apartamento Vista Mar",
            preco: 580000,
            tipo: "apartamento",
            finalidade: "venda",
            cidade: "Santos",
            bairro: "Gonzaga",
            quartos: 3,
            banheiros: 2,
            area_total: 110,
            vagas: 2,
            foto_capa: "",
            fotos: [],
            destaque: true,
          },
          {
            id: "demo-2",
            titulo: "Casa Alto Padrao",
            preco: 1250000,
            tipo: "casa",
            finalidade: "venda",
            cidade: "Santos",
            bairro: "Boqueirão",
            quartos: 4,
            banheiros: 3,
            area_total: 220,
            vagas: 3,
            foto_capa: "",
            fotos: [],
            destaque: true,
          },
          {
            id: "demo-3",
            titulo: "Cobertura Duplex",
            preco: 4500,
            tipo: "cobertura",
            finalidade: "aluguel",
            cidade: "Santos",
            bairro: "Pompeia",
            quartos: 2,
            banheiros: 1,
            area_total: 85,
            vagas: 1,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
        ] as any[]);

  return (
    <section className="px-4 pt-24 pb-16 md:px-8" id="imoveis">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-1 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            Portfolio
          </p>
          <h2 className="text-2xl font-bold md:text-3xl" style={{ color: secondary }}>
            Imoveis Disponiveis
          </h2>
          <p className="mt-2 text-gray-500">
            Selecao exclusiva de imoveis para voce
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Photo */}
              <div className="relative h-56 w-full overflow-hidden">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${secondary}22 0%, ${primary}22 100%)`,
                    }}
                  >
                    <span className="text-5xl opacity-20">&#127968;</span>
                  </div>
                )}

                {/* Badge */}
                <span
                  className="absolute left-0 top-4 rounded-r-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow"
                  style={{
                    backgroundColor:
                      p.finalidade === "aluguel" ? "#10B981" : primary,
                  }}
                >
                  {p.finalidade === "aluguel" ? "Aluguel" : "Venda"}
                </span>

                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                  <p className="text-lg font-bold text-white">
                    {formatPrice(p.preco)}
                    {p.finalidade === "aluguel" && (
                      <span className="text-sm font-normal opacity-80">/mes</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="mb-1 truncate text-base font-bold" style={{ color: "#252525" }}>
                  {p.titulo}
                </h3>
                <p className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade
                    ? `${p.bairro}, ${p.cidade}`
                    : p.cidade || "Localizacao"}
                </p>

                {/* Features row */}
                <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  {p.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" style={{ color: primary }} />
                      {p.quartos}
                    </span>
                  )}
                  {p.banheiros > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" style={{ color: primary }} />
                      {p.banheiros}
                    </span>
                  )}
                  {p.vagas > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="h-4 w-4" style={{ color: primary }} />
                      {p.vagas}
                    </span>
                  )}
                  {p.area_total && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-4 w-4" style={{ color: primary }} />
                      {p.area_total}m²
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
