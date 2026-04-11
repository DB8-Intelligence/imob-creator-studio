import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

export default function LitoralImoveis({ site, imoveis }: TemaProps) {
  const teal = "#0D9488";
  const coral = "#FB923C";

  const items =
    imoveis.length > 0
      ? imoveis
      : ([
          {
            id: "demo-1",
            titulo: "Casa Beira Mar",
            preco: 980000,
            tipo: "casa",
            finalidade: "venda",
            cidade: "Balneario Camboriu",
            bairro: "Praia Central",
            quartos: 4,
            banheiros: 3,
            area_total: 200,
            vagas: 2,
            foto_capa: "",
            fotos: [],
            destaque: true,
          },
          {
            id: "demo-2",
            titulo: "Apto Frente Mar",
            preco: 750000,
            tipo: "apartamento",
            finalidade: "venda",
            cidade: "Florianopolis",
            bairro: "Jurere",
            quartos: 3,
            banheiros: 2,
            area_total: 120,
            vagas: 2,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
          {
            id: "demo-3",
            titulo: "Chalé Temporada",
            preco: 350,
            tipo: "casa",
            finalidade: "temporada",
            cidade: "Garopaba",
            bairro: "Praia do Rosa",
            quartos: 2,
            banheiros: 1,
            area_total: 80,
            vagas: 1,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
        ] as any[]);

  return (
    <section className="px-4 py-16 md:px-8" id="imoveis">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl font-['Playfair_Display',serif]">
          Imoveis Disponiveis
        </h2>
        <p className="mb-10 text-center text-gray-500">
          As melhores opcoes no litoral para voce
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-xl"
            >
              {/* Photo with price overlay */}
              <div className="relative h-56 w-full overflow-hidden">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, #FED7AA 0%, #FBBF24 100%)`,
                    }}
                  >
                    <span className="text-5xl opacity-40">&#127965;</span>
                  </div>
                )}

                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
                  <p className="text-xl font-extrabold text-white">
                    {formatPrice(p.preco)}
                    {p.finalidade === "temporada" && (
                      <span className="text-sm font-normal opacity-80">
                        /diaria
                      </span>
                    )}
                    {p.finalidade === "aluguel" && (
                      <span className="text-sm font-normal opacity-80">
                        /mes
                      </span>
                    )}
                  </p>
                </div>

                {/* Badge */}
                <span
                  className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase text-white"
                  style={{
                    backgroundColor:
                      p.finalidade === "temporada"
                        ? teal
                        : p.finalidade === "aluguel"
                          ? coral
                          : "#D97706",
                  }}
                >
                  {p.finalidade === "temporada"
                    ? "Temporada"
                    : p.finalidade === "aluguel"
                      ? "Aluguel"
                      : "Venda"}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="mb-2 truncate text-base font-bold text-gray-800">
                  {p.titulo}
                </h3>
                <p className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" style={{ color: teal }} />
                  {p.bairro && p.cidade
                    ? `${p.bairro}, ${p.cidade}`
                    : p.cidade || "Litoral"}
                </p>

                <div className="flex flex-wrap gap-3 border-t pt-3 text-xs text-gray-500">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
