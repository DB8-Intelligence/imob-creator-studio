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
  Baby,
  Dog,
  Wheat,
  Utensils,
} from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

const demoItems = [
  { id: "1", titulo: "Casa 4 suites", preco: 1200000, tipo: "casa", finalidade: "venda", cidade: "Campinas", bairro: "Cambui", quartos: 4, banheiros: 4, area_total: 280, vagas: 3, foto_capa: "" },
  { id: "2", titulo: "Apartamento 3 dorms", preco: 580000, tipo: "apartamento", finalidade: "venda", cidade: "Indaiatuba", bairro: "Centro", quartos: 3, banheiros: 2, area_total: 95, vagas: 2, foto_capa: "" },
  { id: "3", titulo: "Cobertura vista mar", preco: 1850000, tipo: "cobertura", finalidade: "venda", cidade: "Santos", bairro: "Gonzaga", quartos: 4, banheiros: 4, area_total: 220, vagas: 2, foto_capa: "" },
  { id: "4", titulo: "Casa temporada Riviera", preco: 1800, tipo: "casa", finalidade: "temporada", cidade: "Bertioga", bairro: "Riviera", quartos: 4, banheiros: 3, area_total: 210, vagas: 3, foto_capa: "" },
  { id: "5", titulo: "Studio mobiliado", preco: 2400, tipo: "studio", finalidade: "aluguel", cidade: "Campinas", bairro: "Centro", quartos: 1, banheiros: 1, area_total: 42, vagas: 1, foto_capa: "" },
  { id: "6", titulo: "Terreno condominio", preco: 380000, tipo: "terreno", finalidade: "venda", cidade: "Valinhos", bairro: "Alphaville", quartos: 0, banheiros: 0, area_total: 450, vagas: 0, foto_capa: "" },
];

const categorias = [
  { icon: Home, label: "Residencial" },
  { icon: Building2, label: "Comercial" },
  { icon: Waves, label: "Piscina" },
  { icon: Trees, label: "Rural" },
  { icon: Store, label: "Loja" },
  { icon: Landmark, label: "Condominio" },
  { icon: Warehouse, label: "Galpao" },
  { icon: Hotel, label: "Hotel" },
  { icon: Gem, label: "Alto padrao" },
  { icon: Sun, label: "Temporada" },
  { icon: Mountain, label: "Fazenda" },
  { icon: Palmtree, label: "Praia" },
  { icon: Baby, label: "Familia" },
  { icon: Dog, label: "Pet-friendly" },
  { icon: Wheat, label: "Investimento" },
  { icon: Utensils, label: "Gastronomia" },
];

const BADGE_COLOR = {
  venda: "#F97316",
  aluguel: "#0066CC",
  temporada: "#059669",
};

const BADGE_LABEL = {
  venda: "Venda",
  aluguel: "Aluguel",
  temporada: "Temporada",
};

export default function VitrineImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#0066CC";
  const secondary = site.cor_secundaria || "#059669";
  const priceColor = "#F97316";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  const renderSection = (title: string, subtitle: string, sliceStart: number, sliceEnd: number) => (
    <div className="mb-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2
            className="text-2xl font-extrabold md:text-3xl"
            style={{ color: primary }}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        <a
          href="#"
          className="hidden text-sm font-semibold md:block"
          style={{ color: secondary }}
        >
          Ver todos &rarr;
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.slice(sliceStart, sliceEnd).map((p) => {
          const fin = p.finalidade as keyof typeof BADGE_COLOR;
          return (
            <article
              key={p.id}
              className="group overflow-hidden rounded-md border border-gray-200 bg-white transition hover:shadow-lg"
            >
              <div className="relative h-40 overflow-hidden bg-gray-100 md:h-44">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-3xl opacity-30">&#127970;</span>
                  </div>
                )}
                <span
                  className="absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow"
                  style={{ backgroundColor: BADGE_COLOR[fin] || BADGE_COLOR.venda }}
                >
                  {BADGE_LABEL[fin] || "Venda"}
                </span>
              </div>

              <div className="p-3">
                <p
                  className="mb-1 text-base font-extrabold"
                  style={{ color: priceColor }}
                >
                  {formatPrice(p.preco)}
                  {(p.finalidade === "aluguel" || p.finalidade === "temporada") && (
                    <span className="text-[10px] font-normal text-gray-500">
                      {p.finalidade === "temporada" ? "/dia" : "/mes"}
                    </span>
                  )}
                </p>

                <h3 className="mb-1 line-clamp-1 text-xs font-bold text-gray-800">
                  {p.bairro || p.titulo}
                </h3>

                <p className="mb-2 flex items-center gap-1 text-[10px] text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {p.cidade}
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
  );

  return (
    <section id="imoveis" className="bg-white px-4 py-14 md:py-16">
      <div className="mx-auto max-w-7xl">
        {renderSection("Destaques de venda", "Imoveis em evidencia no momento", 0, 4)}
        {renderSection("Apartamentos selecionados", "Curadoria especial de apartamentos", 0, 4)}
        {renderSection("Para temporada", "Passe suas ferias em lugares incriveis", 2, 6)}

        {/* Grid de 16 categorias */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 md:p-8">
          <div className="mb-6 text-center">
            <h3
              className="text-xl font-bold md:text-2xl"
              style={{ color: primary }}
            >
              Navegue por categoria
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Encontre exatamente o que voce procura
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {categorias.map((c) => (
              <button
                key={c.label}
                className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white p-3 text-center transition hover:border-transparent hover:shadow"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = primary)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
              >
                <c.icon className="h-5 w-5" style={{ color: primary }} />
                <span className="text-[10px] font-semibold text-gray-700">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
