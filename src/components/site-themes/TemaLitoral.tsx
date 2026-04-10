import type { FC } from "react";
import type { SiteThemeConfig } from "./TemaBreza";

const TemaLitoral: FC<{ config: SiteThemeConfig }> = ({ config }) => {
  const navy = "#002B5B";
  const gold = "#D4AF37";

  return (
    <div className="min-h-full w-full bg-white font-['Plus_Jakarta_Sans',sans-serif] text-gray-800">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-5"
        style={{ backgroundColor: navy }}
      >
        <span className="text-lg font-bold tracking-wide" style={{ color: gold }}>
          {config.nome_empresa || "Minha Imobiliária"}
        </span>
        <a
          href={`https://wa.me/${config.whatsapp?.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{
            borderColor: gold,
            color: gold,
            backgroundColor: "transparent",
          }}
        >
          Fale Conosco
        </a>
      </header>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center px-6 py-20 text-center"
        style={{ backgroundColor: navy }}
      >
        <div
          className="mb-4 h-px w-20"
          style={{ backgroundColor: gold }}
        />
        <h1
          className="mb-3 text-3xl font-extrabold leading-tight tracking-wide font-['Cormorant_Garamond']"
          style={{ color: gold }}
        >
          {config.nome_empresa || "Minha Imobiliária"}
        </h1>
        <p className="max-w-lg text-base text-blue-200">
          Exclusividade e sofisticação em cada detalhe. Encontre imóveis de alto padrão no litoral.
        </p>
        <div
          className="mt-4 h-px w-20"
          style={{ backgroundColor: gold }}
        />
      </section>

      {/* Properties Grid */}
      <section className="bg-gray-50 px-6 py-12">
        <h2
          className="mb-8 text-center text-xl font-bold font-['Cormorant_Garamond']"
          style={{ color: navy }}
        >
          Imóveis Exclusivos
        </h2>
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-5">
          {(config.properties.length > 0
            ? config.properties.slice(0, 6)
            : [
                { id: "1", title: "Villa Beira-Mar", price: 2800000, property_type: "Casa", status: "available" },
                { id: "2", title: "Penthouse Frente Mar", price: 3500000, property_type: "Cobertura", status: "available" },
                { id: "3", title: "Bangalô Exclusivo", price: 1900000, property_type: "Casa", status: "available" },
              ]
          ).map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="h-36 w-full"
                style={{
                  background: `linear-gradient(135deg, ${navy}22 0%, ${gold}22 100%)`,
                }}
              />
              <div className="p-4">
                <h3
                  className="text-sm font-bold truncate font-['Cormorant_Garamond']"
                  style={{ color: navy }}
                >
                  {p.title}
                </h3>
                <p className="mt-1 text-xs text-gray-400 uppercase tracking-wide">
                  {p.property_type ?? "Imóvel"}
                </p>
                <p
                  className="mt-2 text-base font-bold"
                  style={{ color: gold }}
                >
                  {p.price
                    ? `R$ ${p.price.toLocaleString("pt-BR")}`
                    : "Sob consulta"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center text-sm"
        style={{ backgroundColor: navy }}
      >
        <p className="font-semibold" style={{ color: gold }}>
          {config.nome_empresa || "Minha Imobiliária"}
        </p>
        <p className="mt-1 text-blue-200">
          {config.whatsapp && `WhatsApp: ${config.whatsapp}`}
          {config.whatsapp && config.email && " | "}
          {config.email && config.email}
        </p>
        <p className="mt-3 text-xs text-blue-300 opacity-60">
          Powered by NexoImobAI
        </p>
      </footer>
    </div>
  );
};

export default TemaLitoral;
