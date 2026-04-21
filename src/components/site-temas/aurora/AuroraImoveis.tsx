import { MapPin, BedDouble, Bath, Maximize, Car } from "lucide-react";
import type { TemaProps } from "../tipos";
import { formatPrice } from "../tipos";

const demoItems = [
  { id: "1", titulo: "Casa com piscina", preco: 850000, tipo: "casa", finalidade: "venda", cidade: "Indaiatuba", bairro: "Chacara Belvedere", quartos: 4, banheiros: 3, area_total: 230, vagas: 3, foto_capa: "" },
  { id: "2", titulo: "Apto 3 dorms mobiliado", preco: 520000, tipo: "apartamento", finalidade: "venda", cidade: "Campinas", bairro: "Cambui", quartos: 3, banheiros: 2, area_total: 95, vagas: 2, foto_capa: "" },
  { id: "3", titulo: "Cobertura premium", preco: 1850000, tipo: "cobertura", finalidade: "venda", cidade: "Campinas", bairro: "Jardim Guanabara", quartos: 4, banheiros: 4, area_total: 250, vagas: 3, foto_capa: "" },
  { id: "4", titulo: "Casa ferias litoral", preco: 1400, tipo: "casa", finalidade: "temporada", cidade: "Guaruja", bairro: "Enseada", quartos: 4, banheiros: 3, area_total: 210, vagas: 3, foto_capa: "" },
  { id: "5", titulo: "Studio moderno", preco: 2400, tipo: "studio", finalidade: "aluguel", cidade: "Campinas", bairro: "Centro", quartos: 1, banheiros: 1, area_total: 40, vagas: 1, foto_capa: "" },
  { id: "6", titulo: "Terreno condominio", preco: 380000, tipo: "terreno", finalidade: "venda", cidade: "Sumare", bairro: "Matao", quartos: 0, banheiros: 0, area_total: 450, vagas: 0, foto_capa: "" },
  { id: "7", titulo: "Apto 2 dorms vista", preco: 420000, tipo: "apartamento", finalidade: "venda", cidade: "Itu", bairro: "Centro", quartos: 2, banheiros: 1, area_total: 72, vagas: 1, foto_capa: "" },
  { id: "8", titulo: "Casa terrea familia", preco: 680000, tipo: "casa", finalidade: "venda", cidade: "Indaiatuba", bairro: "Jardim America", quartos: 3, banheiros: 2, area_total: 180, vagas: 2, foto_capa: "" },
];

export default function AuroraImoveis({ site, imoveis }: TemaProps) {
  const primary = site.cor_primaria || "#1A3A52";
  const secondary = site.cor_secundaria || "#F59E0B";
  const items = imoveis.length > 0 ? imoveis : (demoItems as any[]);

  const renderSection = (title: string, subtitle: string, sliceStart: number, sliceEnd: number, tone: "light" | "gray" = "light") => (
    <section className={`px-4 py-14 ${tone === "gray" ? "bg-gray-50" : "bg-white"}`}>
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
            className="hidden text-sm font-semibold transition hover:underline md:block"
            style={{ color: primary }}
          >
            Ver todos &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.slice(sliceStart, sliceEnd).map((p) => (
            <article
              key={p.id}
              className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-xl"
            >
              {/* Foto */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                {p.foto_capa ? (
                  <img
                    src={p.foto_capa}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-4xl opacity-30">&#127970;</span>
                  </div>
                )}

                {/* Gradient + preco overlay (SIGNATURE do Aurora) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)",
                  }}
                />

                {/* Badge tipo no topo */}
                <span
                  className="absolute left-3 top-3 rounded-sm bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  {p.finalidade === "aluguel"
                    ? "Locacao"
                    : p.finalidade === "temporada"
                      ? "Temporada"
                      : "Venda"}
                </span>

                {/* Preco na parte inferior sobre a imagem */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p
                    className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/80"
                  >
                    {p.tipo}
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight drop-shadow">
                    {formatPrice(p.preco)}
                    {(p.finalidade === "aluguel" || p.finalidade === "temporada") && (
                      <span className="text-xs font-normal opacity-80">
                        {p.finalidade === "temporada" ? "/diaria" : "/mes"}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Info abaixo */}
              <div className="p-4">
                <h3
                  className="mb-1 line-clamp-1 text-sm font-bold"
                  style={{ color: primary }}
                >
                  {p.titulo}
                </h3>
                <p className="mb-3 flex items-center gap-1 text-[11px] text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {p.bairro && p.cidade ? `${p.bairro}, ${p.cidade}` : p.cidade}
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
      {renderSection("Destaques de venda", "Selecionados", 0, 4, "light")}
      {renderSection("Apartamentos selecionados", "Curadoria", 1, 5, "gray")}
      {renderSection("Lancamentos", "Em construcao", 4, 8, "light")}
    </div>
  );
}
