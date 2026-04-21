import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { getImoveisCount } from "@/types/site";
import { formatPrice } from "../tipos";

const demoItems = [
  {
    id: "demo-1",
    titulo: "Apartamento 3 quartos - Centro",
    preco: 450000,
    tipo: "apartamento",
    finalidade: "venda",
    cidade: "Salvador",
    bairro: "Centro",
    quartos: 3,
    banheiros: 2,
    area_total: 95,
    vagas: 1,
    foto_capa: "",
  },
  {
    id: "demo-2",
    titulo: "Casa 4 quartos com piscina",
    preco: 890000,
    tipo: "casa",
    finalidade: "venda",
    cidade: "Salvador",
    bairro: "Pituba",
    quartos: 4,
    banheiros: 3,
    area_total: 280,
    vagas: 3,
    foto_capa: "",
  },
  {
    id: "demo-3",
    titulo: "Cobertura Duplex vista mar",
    preco: 1500000,
    tipo: "cobertura",
    finalidade: "venda",
    cidade: "Salvador",
    bairro: "Barra",
    quartos: 3,
    banheiros: 3,
    area_total: 180,
    vagas: 2,
    foto_capa: "",
  },
  {
    id: "demo-4",
    titulo: "Studio novo mobiliado",
    preco: 2500,
    tipo: "studio",
    finalidade: "aluguel",
    cidade: "Salvador",
    bairro: "Rio Vermelho",
    quartos: 1,
    banheiros: 1,
    area_total: 40,
    vagas: 1,
    foto_capa: "",
  },
  {
    id: "demo-5",
    titulo: "Terreno 500m2 condominio",
    preco: 320000,
    tipo: "terreno",
    finalidade: "venda",
    cidade: "Salvador",
    bairro: "Alphaville",
    quartos: 0,
    banheiros: 0,
    area_total: 500,
    vagas: 0,
    foto_capa: "",
  },
  {
    id: "demo-6",
    titulo: "Sala comercial prime",
    preco: 380000,
    tipo: "comercial",
    finalidade: "venda",
    cidade: "Salvador",
    bairro: "Caminho das Arvores",
    quartos: 0,
    banheiros: 1,
    area_total: 55,
    vagas: 2,
    foto_capa: "",
  },
];

export default function CapitalImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#CC0000";
  const secondary = site.cor_secundaria || "#002E5E";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  return (
    <section id="imoveis" className="bg-gray-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span
            className="mb-2 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Destaques
          </span>
          <h2
            className="text-3xl font-extrabold md:text-4xl"
            style={{ color: secondary }}
          >
            Imoveis em destaque
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-16"
            style={{ backgroundColor: primary }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, getImoveisCount(site)).map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-5xl opacity-40">&#127970;</span>
                  </div>
                )}
                <span
                  className="absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow"
                  style={{
                    backgroundColor:
                      p.finalidade === "aluguel" ? secondary : primary,
                  }}
                >
                  {p.finalidade === "aluguel" ? "Aluguel" : "Venda"}
                </span>
              </div>

              <div className="p-5">
                <p
                  className="mb-2 text-2xl font-extrabold"
                  style={{ color: primary }}
                >
                  {formatPrice(p.preco)}
                  {p.finalidade === "aluguel" && (
                    <span className="text-sm font-normal text-gray-500">
                      /mes
                    </span>
                  )}
                </p>

                <h3
                  className="mb-2 line-clamp-2 text-base font-bold"
                  style={{ color: secondary }}
                >
                  {p.titulo}
                </h3>

                <p className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade
                    ? `${p.bairro}, ${p.cidade}`
                    : p.cidade || "Localizacao"}
                </p>

                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-600">
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

        <div className="mt-10 text-center">
          <button
            className="rounded-md px-8 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
            style={{ backgroundColor: primary }}
          >
            Ver todos os imoveis
          </button>
        </div>
      </div>
    </section>
  );
}
