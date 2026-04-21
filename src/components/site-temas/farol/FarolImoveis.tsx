import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

const demoItems = [
  { id: "1", titulo: "Casa 4 suites em condominio", preco: 1250000, tipo: "casa", finalidade: "venda", cidade: "Sao Jose dos Campos", bairro: "Jardim Aquarius", quartos: 4, banheiros: 4, area_total: 280, vagas: 4, foto_capa: "" },
  { id: "2", titulo: "Apartamento 3 dorms vista", preco: 680000, tipo: "apartamento", finalidade: "venda", cidade: "Sao Jose dos Campos", bairro: "Vila Ema", quartos: 3, banheiros: 2, area_total: 95, vagas: 2, foto_capa: "" },
  { id: "3", titulo: "Cobertura duplex mobiliada", preco: 1980000, tipo: "cobertura", finalidade: "venda", cidade: "Campinas", bairro: "Cambui", quartos: 4, banheiros: 4, area_total: 260, vagas: 3, foto_capa: "" },
  { id: "4", titulo: "Casa para temporada litoral", preco: 1500, tipo: "casa", finalidade: "temporada", cidade: "Guaruja", bairro: "Enseada", quartos: 4, banheiros: 3, area_total: 210, vagas: 3, foto_capa: "" },
  { id: "5", titulo: "Studio mobiliado", preco: 2400, tipo: "studio", finalidade: "aluguel", cidade: "Campinas", bairro: "Centro", quartos: 1, banheiros: 1, area_total: 42, vagas: 1, foto_capa: "" },
  { id: "6", titulo: "Terreno em condominio", preco: 380000, tipo: "terreno", finalidade: "venda", cidade: "Valinhos", bairro: "Alphaville", quartos: 0, banheiros: 0, area_total: 450, vagas: 0, foto_capa: "" },
];

export default function FarolImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#0099CC";
  const secondary = site.cor_secundaria || "#0D9488";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  const renderSection = (title: string, subtitle: string, sliceStart: number, sliceEnd: number, tone: "light" | "gray" = "light") => (
    <section
      className={`px-4 py-16 ${tone === "gray" ? "bg-gray-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p
              className="mb-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              {subtitle}
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight md:text-4xl"
              style={{ color: primary }}
            >
              {title}
            </h2>
          </div>
          <a
            href="#"
            className="hidden text-sm font-semibold md:block"
            style={{ color: secondary }}
          >
            Ver todos &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(sliceStart, sliceEnd).map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
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
                  className="absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow"
                  style={{ backgroundColor: primary }}
                >
                  {p.finalidade === "aluguel"
                    ? "Locacao"
                    : p.finalidade === "temporada"
                      ? "Temporada"
                      : "Venda"}
                </span>

                {/* Overlay hover com "Ver imovel" */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                >
                  <button
                    className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow"
                    style={{ backgroundColor: secondary }}
                  >
                    Ver imovel
                  </button>
                </div>
              </div>

              <div className="p-5">
                <p
                  className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: secondary }}
                >
                  {p.tipo}
                </p>
                <h3
                  className="mb-2 line-clamp-1 text-sm font-bold"
                  style={{ color: primary }}
                >
                  {p.titulo}
                </h3>
                <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.bairro && p.cidade ? `${p.bairro}, ${p.cidade}` : p.cidade}
                </p>

                <p
                  className="mb-4 text-xl font-extrabold tracking-tight"
                  style={{ color: secondary }}
                >
                  {formatPrice(p.preco)}
                  {(p.finalidade === "aluguel" || p.finalidade === "temporada") && (
                    <span className="text-xs font-normal text-gray-500">
                      {p.finalidade === "temporada" ? "/diaria" : "/mes"}
                    </span>
                  )}
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div id="imoveis">
      {renderSection("Oportunidades de lancamentos", "Novidades", 0, 3, "gray")}
      {renderSection("Destaques de venda", "Selecionados", 0, 6, "light")}
      {renderSection("Para temporada", "Ferias em lugares incriveis", 2, 5, "gray")}
    </div>
  );
}
