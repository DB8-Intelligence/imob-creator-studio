import type { FC } from "react";

export interface SiteThemeConfig {
  nome_empresa: string;
  whatsapp: string;
  email: string;
  cor_primaria: string;
  cor_secundaria?: string;
  properties: Array<{
    id: string;
    title: string;
    price: number | null;
    property_type: string | null;
    status: string | null;
  }>;
}

const TemaBreza: FC<{ config: SiteThemeConfig }> = ({ config }) => {
  const primary = config.cor_primaria || "#0EA5E9";

  return (
    <div className="min-h-full w-full bg-white font-['Nunito_Sans',sans-serif] text-gray-800">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: primary }}
      >
        <span className="text-lg font-bold text-white">
          {config.nome_empresa || "Minha Imobiliária"}
        </span>
        <a
          href={`https://wa.me/${config.whatsapp?.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ color: primary }}
        >
          WhatsApp
        </a>
      </header>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center px-6 py-16 text-center text-white"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, #38bdf8 100%)`,
        }}
      >
        <h1 className="mb-3 text-3xl font-extrabold leading-tight">
          {config.nome_empresa || "Minha Imobiliária"}
        </h1>
        <p className="max-w-md text-base opacity-90">
          Encontre o imóvel dos seus sonhos com a melhor assessoria do mercado.
        </p>
      </section>

      {/* Properties Grid */}
      <section className="px-6 py-10" style={{ backgroundColor: "#F5F0E8" }}>
        <h2 className="mb-6 text-center text-xl font-bold text-gray-700">
          Imóveis em Destaque
        </h2>
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4">
          {(config.properties.length > 0
            ? config.properties.slice(0, 6)
            : [
                { id: "1", title: "Apartamento Centro", price: 450000, property_type: "Apartamento", status: "available" },
                { id: "2", title: "Casa Jardim Europa", price: 820000, property_type: "Casa", status: "available" },
                { id: "3", title: "Sala Comercial", price: 320000, property_type: "Comercial", status: "available" },
              ]
          ).map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >
              <div
                className="h-32 w-full"
                style={{
                  background: `linear-gradient(135deg, ${primary}33 0%, ${primary}11 100%)`,
                }}
              />
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 truncate">
                  {p.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {p.property_type ?? "Imóvel"}
                </p>
                <p className="mt-1 text-sm font-bold" style={{ color: primary }}>
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
      <footer className="bg-gray-900 px-6 py-8 text-center text-sm text-gray-400">
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

export default TemaBreza;
