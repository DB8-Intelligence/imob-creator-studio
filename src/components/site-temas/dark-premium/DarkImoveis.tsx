import { MapPin, BedDouble, Bath, Maximize, Car, Crown } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

export default function DarkImoveis({ site, imoveis }: TemaProps) {
  const gold = "#F59E0B";
  const navy = "#1E3A8A";

  const items =
    imoveis.length > 0
      ? imoveis
      : ([
          {
            id: "demo-1",
            titulo: "Cobertura Duplex Vista Mar",
            preco: 2800000,
            tipo: "cobertura",
            finalidade: "venda",
            cidade: "Sao Paulo",
            bairro: "Jardins",
            quartos: 4,
            suites: 4,
            banheiros: 5,
            area_total: 380,
            vagas: 4,
            foto_capa: "",
            fotos: [],
            destaque: true,
          },
          {
            id: "demo-2",
            titulo: "Penthouse Alto Padrao",
            preco: 4500000,
            tipo: "apartamento",
            finalidade: "venda",
            cidade: "Sao Paulo",
            bairro: "Vila Nova Conceicao",
            quartos: 5,
            suites: 5,
            banheiros: 6,
            area_total: 520,
            vagas: 5,
            foto_capa: "",
            fotos: [],
            destaque: true,
          },
          {
            id: "demo-3",
            titulo: "Mansao Alphaville",
            preco: 6200000,
            tipo: "casa",
            finalidade: "venda",
            cidade: "Barueri",
            bairro: "Alphaville",
            quartos: 6,
            suites: 6,
            banheiros: 8,
            area_total: 850,
            vagas: 6,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
        ] as any[]);

  return (
    <section className="px-4 py-16 md:px-8" style={{ backgroundColor: "#0F172A" }} id="imoveis">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-8 h-px w-16" style={{ backgroundColor: gold }} />
        <h2 className="mb-2 text-center text-2xl font-bold uppercase tracking-wider text-white md:text-3xl">
          Portfolio Exclusivo
        </h2>
        <p className="mb-10 text-center text-sm text-gray-400">
          Selecao curada de imoveis de alto padrao
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl transition hover:ring-1"
              style={{ backgroundColor: "#1E293B", "--tw-ring-color": gold } as any}
            >
              {/* Photo */}
              <div className="relative h-56 w-full overflow-hidden">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
                    <span className="text-5xl opacity-20">&#127984;</span>
                  </div>
                )}

                {/* Destaque badge */}
                {p.destaque && (
                  <span
                    className="absolute left-3 top-3 flex items-center gap-1 rounded px-3 py-1 text-xs font-bold uppercase text-black"
                    style={{ backgroundColor: gold }}
                  >
                    <Crown className="h-3 w-3" /> EXCLUSIVO
                  </span>
                )}

                {/* Finalidade badge */}
                <span
                  className="absolute right-3 top-3 rounded px-2 py-1 text-xs font-semibold uppercase"
                  style={{
                    backgroundColor: navy,
                    color: "white",
                  }}
                >
                  {p.finalidade === "aluguel" ? "Aluguel" : "Venda"}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="mb-2 truncate text-base font-semibold text-white">
                  {p.titulo}
                </h3>
                <p className="mb-3 flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade
                    ? `${p.bairro}, ${p.cidade}`
                    : p.cidade || "Localizacao"}
                </p>

                <p className="mb-4 text-xl font-extrabold" style={{ color: gold }}>
                  {formatPrice(p.preco)}
                </p>

                <div className="flex flex-wrap gap-3 border-t border-gray-700 pt-3 text-xs text-gray-400">
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
