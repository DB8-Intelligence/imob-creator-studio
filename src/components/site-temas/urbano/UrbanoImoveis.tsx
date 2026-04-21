import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { getImoveisCount } from "@/types/site";
import { formatPrice } from "../tipos";

export default function UrbanoImoveis({ site, imoveis }: TemaProps) {
  const items =
    imoveis.length > 0
      ? imoveis
      : ([
          {
            id: "demo-1",
            titulo: "Apartamento Batel",
            preco: 650000,
            tipo: "apartamento",
            finalidade: "venda",
            cidade: "Curitiba",
            bairro: "Batel",
            quartos: 3,
            banheiros: 2,
            area_total: 110,
            vagas: 2,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
          {
            id: "demo-2",
            titulo: "Cobertura Duplex",
            preco: 1250000,
            tipo: "cobertura",
            finalidade: "venda",
            cidade: "Curitiba",
            bairro: "Agua Verde",
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
            titulo: "Studio Centro Historico",
            preco: 2800,
            tipo: "studio",
            finalidade: "aluguel",
            cidade: "Curitiba",
            bairro: "Centro",
            quartos: 1,
            banheiros: 1,
            area_total: 38,
            vagas: 0,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
        ] as any[]);

  return (
    <section className="bg-[#F9FAFB] px-4 py-16 md:px-8" id="imoveis">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
          Imoveis Disponiveis
        </h2>
        <p className="mb-10 text-gray-500">
          Lista completa de oportunidades selecionadas
        </p>

        <div className="space-y-4">
          {items.slice(0, getImoveisCount(site)).map((p) => (
            <div
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md sm:flex-row"
              style={{ borderLeft: "4px solid transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderLeftColor = "#64748B")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderLeftColor = "transparent")
              }
            >
              {/* Photo */}
              <div className="relative h-48 w-full flex-shrink-0 overflow-hidden sm:h-auto sm:w-72">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full min-h-[12rem] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-4xl opacity-30">&#127970;</span>
                  </div>
                )}
                <span
                  className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-semibold uppercase text-white ${
                    p.finalidade === "aluguel" ? "bg-emerald-600" : "bg-[#374151]"
                  }`}
                >
                  {p.finalidade === "aluguel" ? "Aluguel" : "Venda"}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-center p-5">
                <h3 className="mb-1 text-lg font-bold text-gray-800">
                  {p.titulo}
                </h3>
                <p className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade
                    ? `${p.bairro}, ${p.cidade}`
                    : p.cidade || "Localizacao"}
                </p>

                <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  {p.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" /> {p.quartos} quartos
                    </span>
                  )}
                  {p.banheiros > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {p.banheiros} ban.
                    </span>
                  )}
                  {p.area_total && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5" /> {p.area_total}m²
                    </span>
                  )}
                  {p.vagas > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="h-3.5 w-3.5" /> {p.vagas} vaga
                      {p.vagas > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <p className="text-xl font-extrabold text-[#374151]">
                  {formatPrice(p.preco)}
                  {p.finalidade === "aluguel" && (
                    <span className="text-sm font-normal text-gray-400">
                      /mes
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
