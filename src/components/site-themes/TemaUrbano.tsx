import type { FC } from "react";
import type { SiteThemeConfig } from "./TemaBreza";

const TemaUrbano: FC<{ config: SiteThemeConfig }> = ({ config }) => {
  const primary = config.cor_primaria || "#1F2937";
  const accent = "#F97316";

  return (
    <div className="min-h-full w-full bg-gray-950 font-['Plus_Jakarta_Sans',sans-serif] text-white">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: primary }}
      >
        <span className="text-lg font-bold tracking-wide text-white">
          {config.nome_empresa || "Minha Imobiliária"}
        </span>
        <a
          href={`https://wa.me/${config.whatsapp?.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ backgroundColor: accent }}
        >
          WhatsApp
        </a>
      </header>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center px-6 py-16 text-center"
        style={{
          background: `linear-gradient(180deg, ${primary} 0%, #111827 100%)`,
        }}
      >
        <h1 className="mb-3 text-3xl font-extrabold uppercase tracking-wider text-white">
          {config.nome_empresa || "Minha Imobiliária"}
        </h1>
        <p className="max-w-md text-base text-gray-400">
          Imóveis selecionados para quem busca qualidade e localização.
        </p>
        <div className="mt-1 h-1 w-16 rounded" style={{ backgroundColor: accent }} />
      </section>

      {/* Properties Grid */}
      <section className="bg-gray-900 px-6 py-10">
        <h2 className="mb-6 text-center text-xl font-bold text-white">
          Portfólio
        </h2>
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4">
          {(config.properties.length > 0
            ? config.properties.slice(0, 6)
            : [
                { id: "1", title: "Loft Industrial", price: 680000, property_type: "Loft", status: "available" },
                { id: "2", title: "Cobertura Duplex", price: 1250000, property_type: "Cobertura", status: "available" },
                { id: "3", title: "Studio Design", price: 390000, property_type: "Studio", status: "available" },
              ]
          ).map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-lg border border-gray-800 bg-gray-800 transition hover:border-orange-500"
            >
              <div
                className="h-32 w-full transition group-hover:opacity-80"
                style={{
                  background: `linear-gradient(135deg, ${primary}88 0%, #37415166 100%)`,
                }}
              />
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate">
                  {p.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {p.property_type ?? "Imóvel"}
                </p>
                <p
                  className="mt-1 text-sm font-bold"
                  style={{ color: accent }}
                >
                  {p.price
                    ? `R$ ${p.price.toLocaleString("pt-BR")}`
                    : "Consulte"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center text-sm text-gray-500"
        style={{ backgroundColor: primary }}
      >
        <p className="font-semibold text-white">
          {config.nome_empresa || "Minha Imobiliária"}
        </p>
        <p className="mt-1">
          {config.whatsapp && `WhatsApp: ${config.whatsapp}`}
          {config.whatsapp && config.email && " | "}
          {config.email && config.email}
        </p>
        <p className="mt-3 text-xs opacity-60">
          Powered by NexoImobAI
        </p>
      </footer>
    </div>
  );
};

export default TemaUrbano;
