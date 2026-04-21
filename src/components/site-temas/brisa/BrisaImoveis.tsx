import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { getImoveisCount } from "@/types/site";
import { formatPrice } from "../tipos";

export default function BrisaImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#0284C7";

  const items =
    imoveis.length > 0
      ? imoveis
      : ([
          {
            id: "demo-1",
            titulo: "Apartamento Centro",
            preco: 450000,
            tipo: "apartamento",
            finalidade: "venda",
            cidade: "Florianopolis",
            bairro: "Centro",
            quartos: 3,
            banheiros: 2,
            area_total: 95,
            vagas: 1,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
          {
            id: "demo-2",
            titulo: "Casa Jardim Europa",
            preco: 820000,
            tipo: "casa",
            finalidade: "venda",
            cidade: "Florianopolis",
            bairro: "Jardim Europa",
            quartos: 4,
            banheiros: 3,
            area_total: 180,
            vagas: 2,
            foto_capa: "",
            fotos: [],
            destaque: true,
          },
          {
            id: "demo-3",
            titulo: "Sala Comercial",
            preco: 320000,
            tipo: "comercial",
            finalidade: "aluguel",
            cidade: "Florianopolis",
            bairro: "Trindade",
            quartos: 0,
            banheiros: 1,
            area_total: 60,
            vagas: 1,
            foto_capa: "",
            fotos: [],
            destaque: false,
          },
        ] as any[]);

  return (
    <section className="px-4 py-16 md:px-8" id="imoveis">
      <div className="mx-auto max-w-6xl">
        <h2
          className="mb-2 text-center text-2xl font-bold md:text-3xl font-['Plus_Jakarta_Sans',sans-serif]"
          style={{ color: "#1E293B" }}
        >
          Imoveis Disponiveis
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Confira nossas melhores opcoes selecionadas para voce
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, getImoveisCount(site)).map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-xl"
            >
              {/* Photo */}
              <div className="relative h-52 w-full overflow-hidden">
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
                      background: `linear-gradient(135deg, ${primary}33 0%, ${primary}11 100%)`,
                    }}
                  >
                    <span className="text-4xl opacity-30">&#127968;</span>
                  </div>
                )}

                {/* Badge */}
                <span
                  className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase text-white"
                  style={{
                    backgroundColor:
                      p.finalidade === "aluguel" ? "#10B981" : primary,
                  }}
                >
                  {p.finalidade === "aluguel" ? "Aluguel" : "Venda"}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <p
                  className="mb-1 text-xl font-bold"
                  style={{ color: primary }}
                >
                  {formatPrice(p.preco)}
                </p>
                <h3 className="mb-2 truncate text-base font-semibold text-gray-800">
                  {p.titulo}
                </h3>
                <p className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade
                    ? `${p.bairro}, ${p.cidade}`
                    : p.cidade || "Localizacao"}
                </p>

                {/* Features row */}
                <div className="flex flex-wrap gap-3 border-t pt-3 text-xs text-gray-500">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
