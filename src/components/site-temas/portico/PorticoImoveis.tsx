import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Car,
  Home,
  Building2,
  Waves,
  Trees,
  Store,
  Landmark,
  Warehouse,
  Hotel,
  Gem,
  Sun,
  Mountain,
  Palmtree,
  Dog,
  Wheat,
  Tent,
} from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

const demoItems = [
  { id: "1", titulo: "Casa 4 suites", preco: 980000, tipo: "casa", finalidade: "venda", cidade: "Indaiatuba", bairro: "Jardim Paulista", quartos: 4, banheiros: 4, area_total: 280, vagas: 3, foto_capa: "" },
  { id: "2", titulo: "Apto 3 dorms", preco: 520000, tipo: "apartamento", finalidade: "venda", cidade: "Campinas", bairro: "Cambui", quartos: 3, banheiros: 2, area_total: 95, vagas: 2, foto_capa: "" },
  { id: "3", titulo: "Cobertura duplex", preco: 1850000, tipo: "cobertura", finalidade: "venda", cidade: "Campinas", bairro: "Nova Campinas", quartos: 4, banheiros: 4, area_total: 250, vagas: 3, foto_capa: "" },
  { id: "4", titulo: "Studio mobiliado", preco: 2800, tipo: "studio", finalidade: "aluguel", cidade: "Itu", bairro: "Centro", quartos: 1, banheiros: 1, area_total: 42, vagas: 1, foto_capa: "" },
  { id: "5", titulo: "Casa pe na areia", preco: 1500, tipo: "casa", finalidade: "temporada", cidade: "Guaruja", bairro: "Enseada", quartos: 4, banheiros: 3, area_total: 210, vagas: 3, foto_capa: "" },
  { id: "6", titulo: "Terreno condominio", preco: 380000, tipo: "terreno", finalidade: "venda", cidade: "Valinhos", bairro: "Alphaville", quartos: 0, banheiros: 0, area_total: 450, vagas: 0, foto_capa: "" },
  { id: "7", titulo: "Apto compacto", preco: 380000, tipo: "apartamento", finalidade: "venda", cidade: "Sumare", bairro: "Centro", quartos: 2, banheiros: 1, area_total: 60, vagas: 1, foto_capa: "" },
  { id: "8", titulo: "Casa terrea", preco: 680000, tipo: "casa", finalidade: "venda", cidade: "Indaiatuba", bairro: "Jardim America", quartos: 3, banheiros: 2, area_total: 180, vagas: 2, foto_capa: "" },
];

const categorias = [
  { icon: Home, label: "Residencial" },
  { icon: Building2, label: "Comercial" },
  { icon: Waves, label: "Com piscina" },
  { icon: Dog, label: "Pet friendly" },
  { icon: Trees, label: "Rural" },
  { icon: Store, label: "Loja" },
  { icon: Landmark, label: "Condominio" },
  { icon: Warehouse, label: "Galpao" },
  { icon: Hotel, label: "Hotel" },
  { icon: Gem, label: "Alto padrao" },
  { icon: Sun, label: "Temporada" },
  { icon: Mountain, label: "Fazenda" },
  { icon: Tent, label: "Chacara" },
  { icon: Palmtree, label: "Litoral" },
  { icon: Wheat, label: "Investimento" },
];

const BADGE_COLOR = {
  venda: "#1D4ED8",
  aluguel: "#059669",
  temporada: "#D97706",
};

const BADGE_LABEL = {
  venda: "Venda",
  aluguel: "Aluguel",
  temporada: "Temporada",
};

export default function PorticoImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#1D4ED8";
  const secondary = site.cor_secundaria || "#64748B";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  return (
    <>
      {/* Destaques — grade DENSA 4 colunas (signature marketplace) */}
      <section id="imoveis" className="bg-white px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between border-b border-gray-200 pb-4">
            <div>
              <h2
                className="text-2xl font-bold md:text-3xl"
                style={{ color: primary }}
              >
                Destaques de imoveis
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {items.length}+ imoveis disponiveis agora
              </p>
            </div>
            <a
              href="#"
              className="text-sm font-semibold"
              style={{ color: primary }}
            >
              Ver todos &rarr;
            </a>
          </div>

          {/* Grade densa 4 colunas */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.slice(0, 8).map((p) => {
              const fin = p.finalidade as keyof typeof BADGE_COLOR;
              return (
                <article
                  key={p.id}
                  className="group overflow-hidden rounded-md border border-gray-200 bg-white transition hover:border-gray-400 hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {p.foto_capa ? (
                      <img
                        src={p.foto_capa}
                        alt={p.titulo}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-3xl opacity-30">&#127970;</span>
                      </div>
                    )}
                    <span
                      className="absolute left-2 top-2 rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
                      style={{
                        backgroundColor:
                          BADGE_COLOR[fin] || BADGE_COLOR.venda,
                      }}
                    >
                      {BADGE_LABEL[fin] || "Venda"}
                    </span>
                  </div>

                  <div className="p-3">
                    <p
                      className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400"
                    >
                      {p.tipo}
                    </p>
                    <h3
                      className="mb-1 line-clamp-1 text-sm font-bold"
                      style={{ color: primary }}
                    >
                      {p.bairro || p.titulo}
                    </h3>
                    <p className="mb-2 flex items-center gap-1 text-[10px] text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {p.cidade}
                    </p>
                    <p
                      className="mb-3 text-lg font-extrabold"
                      style={{ color: primary }}
                    >
                      {formatPrice(p.preco)}
                      {(p.finalidade === "aluguel" || p.finalidade === "temporada") && (
                        <span className="text-[10px] font-normal text-gray-500">
                          {p.finalidade === "temporada" ? "/dia" : "/mes"}
                        </span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 text-[10px] text-gray-600">
                      {p.quartos > 0 && (
                        <span className="flex items-center gap-0.5">
                          <BedDouble className="h-3 w-3" /> {p.quartos}
                        </span>
                      )}
                      {p.banheiros > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Bath className="h-3 w-3" /> {p.banheiros}
                        </span>
                      )}
                      {p.area_total && (
                        <span className="flex items-center gap-0.5">
                          <Maximize className="h-3 w-3" /> {p.area_total}m²
                        </span>
                      )}
                      {p.vagas > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Car className="h-3 w-3" /> {p.vagas}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 15 categorias em grid */}
      <section
        id="categorias"
        className="bg-gray-50 px-5 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2
              className="text-2xl font-bold md:text-3xl"
              style={{ color: primary }}
            >
              Categorias de imoveis
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Navegue por tipo de imovel
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
            {categorias.map((c) => (
              <button
                key={c.label}
                className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 bg-white p-4 text-center transition hover:border-transparent hover:text-white"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = primary;
                  e.currentTarget.style.borderColor = primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                <c.icon className="h-5 w-5 transition" style={{ color: secondary }} />
                <span className="text-[10px] font-semibold text-gray-700">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
