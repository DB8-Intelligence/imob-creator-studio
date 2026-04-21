import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { getImoveisCount } from "@/types/site";
import { formatPrice } from "../tipos";

const demoItems = [
  {
    id: "demo-1",
    titulo: "Casa alto padrao 4 suites",
    preco: 1250000,
    tipo: "casa",
    finalidade: "venda",
    cidade: "Indaiatuba",
    bairro: "Jardim Valenca",
    quartos: 4,
    banheiros: 4,
    area_total: 320,
    vagas: 4,
    foto_capa: "",
  },
  {
    id: "demo-2",
    titulo: "Apartamento 3 dorms com lazer",
    preco: 680000,
    tipo: "apartamento",
    finalidade: "venda",
    cidade: "Indaiatuba",
    bairro: "Centro",
    quartos: 3,
    banheiros: 2,
    area_total: 110,
    vagas: 2,
    foto_capa: "",
  },
  {
    id: "demo-3",
    titulo: "Cobertura duplex com rooftop",
    preco: 1850000,
    tipo: "cobertura",
    finalidade: "venda",
    cidade: "Indaiatuba",
    bairro: "Cidade Nova",
    quartos: 4,
    banheiros: 4,
    area_total: 280,
    vagas: 3,
    foto_capa: "",
  },
  {
    id: "demo-4",
    titulo: "Casa terrea aconchegante",
    preco: 3500,
    tipo: "casa",
    finalidade: "aluguel",
    cidade: "Itu",
    bairro: "Vila Independencia",
    quartos: 3,
    banheiros: 2,
    area_total: 180,
    vagas: 2,
    foto_capa: "",
  },
  {
    id: "demo-5",
    titulo: "Terreno condominio fechado",
    preco: 420000,
    tipo: "terreno",
    finalidade: "venda",
    cidade: "Salto",
    bairro: "Terras de Sao Pedro",
    quartos: 0,
    banheiros: 0,
    area_total: 450,
    vagas: 0,
    foto_capa: "",
  },
  {
    id: "demo-6",
    titulo: "Sala comercial avenida",
    preco: 4500,
    tipo: "comercial",
    finalidade: "aluguel",
    cidade: "Indaiatuba",
    bairro: "Centro",
    quartos: 0,
    banheiros: 1,
    area_total: 65,
    vagas: 2,
    foto_capa: "",
  },
];

export default function HorizonteImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#1E3A5F";
  const secondary = site.cor_secundaria || "#F39200";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  return (
    <section id="imoveis" className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <span
              className="mb-1 inline-block text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Selecionados
            </span>
            <h2
              className="text-3xl font-bold md:text-4xl"
              style={{ color: primary }}
            >
              Destaques de venda
            </h2>
          </div>
          <a
            href="#"
            className="text-sm font-semibold transition hover:opacity-80"
            style={{ color: secondary }}
          >
            Ver todos &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, getImoveisCount(site)).map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-md border border-gray-200 bg-white transition hover:shadow-lg"
            >
              <div className="relative h-56 overflow-hidden">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-5xl opacity-40">&#127970;</span>
                  </div>
                )}
                <span
                  className="absolute left-0 top-4 rounded-r-md px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow"
                  style={{
                    backgroundColor:
                      p.finalidade === "aluguel" ? primary : secondary,
                  }}
                >
                  {p.finalidade === "aluguel" ? "Aluguel" : "Venda"}
                </span>
              </div>

              <div className="p-5">
                <h3
                  className="mb-1 line-clamp-1 text-base font-bold"
                  style={{ color: primary }}
                >
                  {p.titulo}
                </h3>

                <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade
                    ? `${p.bairro} - ${p.cidade}`
                    : p.cidade || "Localizacao"}
                </p>

                <p
                  className="mb-4 text-xl font-extrabold"
                  style={{ color: secondary }}
                >
                  {formatPrice(p.preco)}
                  {p.finalidade === "aluguel" && (
                    <span className="text-xs font-normal text-gray-500">
                      /mes
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-600">
                  {p.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" /> {p.quartos}{" "}
                      {p.quartos > 1 ? "quartos" : "quarto"}
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
                  className="mt-4 w-full rounded-md border py-2 text-xs font-bold uppercase tracking-wider transition hover:text-white"
                  style={{
                    borderColor: primary,
                    color: primary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = primary;
                  }}
                >
                  Ver imovel
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Smart Tags / Bairros */}
        <div className="mt-16 rounded-lg bg-gray-50 p-6 md:p-8">
          <h3
            className="mb-4 text-center text-lg font-bold"
            style={{ color: primary }}
          >
            Imoveis por bairro
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Centro",
              "Jardim Valenca",
              "Cidade Nova",
              "Vila Independencia",
              "Terras de Sao Pedro",
              "Jardim Pau Preto",
              "Caminho das Arvores",
            ].map((b) => (
              <span
                key={b}
                className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-transparent hover:text-white"
                style={{}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = secondary;
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#4B5563";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
