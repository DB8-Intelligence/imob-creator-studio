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
  Gem,
  Sun,
  Mountain,
  Palmtree,
  Hotel,
  Landmark,
  Wheat,
  Coffee,
} from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

const demoItems = [
  { id: "1", titulo: "Casa contemporanea", preco: 2400000, tipo: "casa", finalidade: "venda", cidade: "Sao Paulo", bairro: "Jardim Europa", quartos: 4, banheiros: 4, area_total: 380, vagas: 4, foto_capa: "" },
  { id: "2", titulo: "Cobertura design", preco: 3200000, tipo: "cobertura", finalidade: "venda", cidade: "Sao Paulo", bairro: "Vila Nova Conceicao", quartos: 4, banheiros: 5, area_total: 320, vagas: 3, foto_capa: "" },
  { id: "3", titulo: "Apartamento autoral", preco: 1800000, tipo: "apartamento", finalidade: "venda", cidade: "Sao Paulo", bairro: "Pinheiros", quartos: 3, banheiros: 3, area_total: 180, vagas: 2, foto_capa: "" },
  { id: "4", titulo: "Casa pe na areia", preco: 4200000, tipo: "casa", finalidade: "venda", cidade: "Guaruja", bairro: "Jardim Acapulco", quartos: 5, banheiros: 5, area_total: 480, vagas: 5, foto_capa: "" },
  { id: "5", titulo: "Penthouse premium", preco: 8500, tipo: "cobertura", finalidade: "aluguel", cidade: "Sao Paulo", bairro: "Itaim Bibi", quartos: 3, banheiros: 4, area_total: 240, vagas: 3, foto_capa: "" },
  { id: "6", titulo: "Casa minimalista", preco: 1950000, tipo: "casa", finalidade: "venda", cidade: "Sao Paulo", bairro: "Alto de Pinheiros", quartos: 4, banheiros: 3, area_total: 280, vagas: 3, foto_capa: "" },
];

const categorias = [
  { icon: Home, label: "Residencial" },
  { icon: Building2, label: "Comercial" },
  { icon: Gem, label: "Alto padrao" },
  { icon: Hotel, label: "Hotelaria" },
  { icon: Landmark, label: "Condominio" },
  { icon: Waves, label: "Frente mar" },
  { icon: Mountain, label: "Serra" },
  { icon: Palmtree, label: "Praia" },
  { icon: Trees, label: "Rural" },
  { icon: Sun, label: "Temporada" },
  { icon: Wheat, label: "Investimento" },
  { icon: Coffee, label: "Boutique" },
];

export default function OnixImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#1A1A1A";
  const secondary = site.cor_secundaria || "#B8860B";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  return (
    <>
      {/* 12 categorias minimalistas */}
      <section
        id="categorias"
        className="bg-white px-6 py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div
              className="mx-auto mb-6 h-px w-12"
              style={{ backgroundColor: secondary }}
            />
            <p
              className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em]"
              style={{ color: secondary }}
            >
              Explore
            </p>
            <h2
              className="text-3xl font-light tracking-tight md:text-4xl"
              style={{ color: primary }}
            >
              Categorias de imoveis
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-8 md:grid-cols-6">
            {categorias.map((c) => (
              <button
                key={c.label}
                className="group flex flex-col items-center gap-3 transition"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full border transition group-hover:border-transparent"
                  style={{ borderColor: "#e5e7eb" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.borderColor = primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <c.icon
                    className="h-5 w-5 text-gray-700 transition group-hover:text-white"
                  />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-700">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Imoveis selecionados */}
      <section
        id="imoveis"
        className="px-6 py-20 md:py-24"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div
                className="mb-4 h-px w-12"
                style={{ backgroundColor: secondary }}
              />
              <p
                className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em]"
                style={{ color: secondary }}
              >
                Selecionados
              </p>
              <h2
                className="text-3xl font-light tracking-tight md:text-4xl"
                style={{ color: primary }}
              >
                Imoveis em destaque
              </h2>
            </div>
            <a
              href="#"
              className="hidden text-[11px] font-medium uppercase tracking-[0.3em] transition hover:opacity-60 md:inline-block"
              style={{ color: primary }}
            >
              Ver tudo &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 6).map((p) => (
              <article
                key={p.id}
                className="group cursor-pointer overflow-hidden bg-white"
              >
                <div className="relative h-72 overflow-hidden">
                  {p.foto_capa ? (
                    <img
                      src={p.foto_capa}
                      alt={p.titulo}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-5xl opacity-20">&#127970;</span>
                    </div>
                  )}
                  <div
                    className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 60%, rgba(26,26,26,0.6) 100%)",
                    }}
                  />
                  <span
                    className="absolute right-4 top-4 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.3em] text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {p.finalidade === "aluguel"
                      ? "Locacao"
                      : p.finalidade === "temporada"
                        ? "Temporada"
                        : "Venda"}
                  </span>
                </div>

                <div className="pt-5">
                  <p
                    className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em]"
                    style={{ color: secondary }}
                  >
                    {p.tipo}
                  </p>

                  <h3
                    className="mb-1 text-lg font-light tracking-tight"
                    style={{ color: primary }}
                  >
                    {p.titulo}
                  </h3>

                  <p className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {p.bairro && p.cidade
                      ? `${p.bairro}, ${p.cidade}`
                      : p.cidade || "Localizacao"}
                  </p>

                  <p
                    className="mb-4 text-2xl font-light tracking-tight"
                    style={{ color: primary }}
                  >
                    {formatPrice(p.preco)}
                    {(p.finalidade === "aluguel" || p.finalidade === "temporada") && (
                      <span className="text-xs font-normal text-gray-400">
                        {p.finalidade === "temporada" ? "/diaria" : "/mes"}
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-5 border-t border-gray-100 pt-4 text-[11px] text-gray-500">
                    {p.quartos > 0 && (
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5" /> {p.quartos}
                      </span>
                    )}
                    {p.banheiros > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Bath className="h-3.5 w-3.5" /> {p.banheiros}
                      </span>
                    )}
                    {p.area_total && (
                      <span className="flex items-center gap-1.5">
                        <Maximize className="h-3.5 w-3.5" /> {p.area_total}m²
                      </span>
                    )}
                    {p.vagas > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5" /> {p.vagas}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
