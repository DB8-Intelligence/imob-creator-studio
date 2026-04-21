import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Car,
  Home,
  Building2,
  Waves,
  Dog,
  Trees,
  Store,
  Landmark,
  Warehouse,
  Hotel,
  Factory,
  Gem,
  Sun,
  Mountain,
  Tent,
  Palmtree,
  Flame,
  Utensils,
  Baby,
  Wheat,
} from "lucide-react";
import type { TemaProps } from "../tipos";
import { getImoveisCount } from "@/types/site";
import { formatPrice } from "../tipos";

const demoItems = [
  {
    id: "demo-1",
    titulo: "Casa alto padrao com piscina",
    preco: 1290000,
    tipo: "casa",
    finalidade: "venda",
    cidade: "Indaiatuba",
    bairro: "Jardim Paulista",
    quartos: 4,
    banheiros: 4,
    area_total: 340,
    vagas: 4,
    foto_capa: "",
  },
  {
    id: "demo-2",
    titulo: "Apartamento 3 dormitorios",
    preco: 720000,
    tipo: "apartamento",
    finalidade: "venda",
    cidade: "Campinas",
    bairro: "Cambui",
    quartos: 3,
    banheiros: 2,
    area_total: 115,
    vagas: 2,
    foto_capa: "",
  },
  {
    id: "demo-3",
    titulo: "Cobertura duplex mobiliada",
    preco: 2100000,
    tipo: "cobertura",
    finalidade: "venda",
    cidade: "Campinas",
    bairro: "Nova Campinas",
    quartos: 4,
    banheiros: 4,
    area_total: 310,
    vagas: 3,
    foto_capa: "",
  },
  {
    id: "demo-4",
    titulo: "Casa para temporada beira-mar",
    preco: 1200,
    tipo: "casa",
    finalidade: "temporada",
    cidade: "Bertioga",
    bairro: "Riviera",
    quartos: 4,
    banheiros: 3,
    area_total: 250,
    vagas: 3,
    foto_capa: "",
  },
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
  { icon: Factory, label: "Industrial" },
  { icon: Gem, label: "Alto padrao" },
  { icon: Sun, label: "Temporada" },
  { icon: Mountain, label: "Fazenda" },
  { icon: Tent, label: "Chacara" },
  { icon: Palmtree, label: "Pe na areia" },
  { icon: Flame, label: "Oportunidade" },
  { icon: Utensils, label: "Gastronomia" },
  { icon: Baby, label: "Para familia" },
];

export default function PrismaImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#0F172A";
  const secondary = site.cor_secundaria || "#3B82F6";
  const precoDestaque = "#DC2626";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  return (
    <>
      {/* Destaques de venda */}
      <section id="imoveis" className="bg-white px-4 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-3 text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: primary }}
            >
              Destaques de venda
            </h2>
            <p className="text-sm text-gray-500">
              Selecao especial de imoveis para voce conhecer
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {items.slice(0, getImoveisCount(site)).map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-lg bg-white transition hover:-translate-y-1 hover:shadow-xl"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {p.foto_capa ? (
                    <img
                      src={p.foto_capa}
                      alt={p.titulo}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-4xl opacity-30">&#127970;</span>
                    </div>
                  )}
                  <span
                    className="absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {p.finalidade === "aluguel"
                      ? "Locacao"
                      : p.finalidade === "temporada"
                        ? "Temporada"
                        : "Venda"}
                  </span>
                </div>

                <div className="p-5">
                  <p
                    className="mb-2 text-xl font-extrabold tracking-tight"
                    style={{ color: precoDestaque }}
                  >
                    {formatPrice(p.preco)}
                    {(p.finalidade === "aluguel" ||
                      p.finalidade === "temporada") && (
                      <span className="text-xs font-normal text-gray-500">
                        {p.finalidade === "temporada" ? "/diaria" : "/mes"}
                      </span>
                    )}
                  </p>

                  <p
                    className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: secondary }}
                  >
                    {p.tipo}
                  </p>

                  <h3
                    className="mb-2 line-clamp-2 text-sm font-bold leading-snug"
                    style={{ color: primary }}
                  >
                    {p.bairro && p.cidade
                      ? `${p.bairro} - ${p.cidade}`
                      : p.titulo}
                  </h3>

                  <p className="mb-4 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {p.cidade || "Localizacao"}
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
                    style={{ backgroundColor: primary }}
                  >
                    Saiba mais
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de 18 categorias */}
      <section
        id="categorias"
        className="bg-gray-50 px-4 py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-3 text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: primary }}
            >
              Categorias de imoveis
            </h2>
            <p className="text-sm text-gray-500">
              Navegue rapidamente pelo tipo de imovel que procura
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {categorias.map((c) => (
              <button
                key={c.label}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-transparent hover:shadow-md"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                <c.icon
                  className="h-6 w-6"
                  style={{ color: secondary }}
                />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: primary }}
                >
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
