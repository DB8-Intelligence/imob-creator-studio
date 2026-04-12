import type { TemaProps } from "../tipos";

export default function RethouseAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#3454d1";

  return (
    <section className="bg-[#f5f7fa] px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div className="flex justify-center">
          {site.foto_url ? (
            <img
              src={site.foto_url}
              alt={site.nome_completo}
              className="h-80 w-80 rounded-2xl object-cover shadow-xl"
            />
          ) : (
            <div
              className="h-80 w-80 rounded-2xl shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${site.cor_secundaria || "#1a2b6b"}, ${primary})`,
              }}
            />
          )}
        </div>

        <div>
          <span
            className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Sobre Nos
          </span>
          <h2 className="mb-6 text-3xl font-bold text-[#333] md:text-4xl">
            {site.nome_completo}
          </h2>
          <p className="mb-6 leading-relaxed text-gray-600">
            {site.bio ||
              "Com anos de experiencia no mercado imobiliario, oferecemos atendimento personalizado e as melhores oportunidades para voce encontrar o imovel dos seus sonhos."}
          </p>
          {site.creci && (
            <p className="mb-6 text-sm font-semibold text-gray-500">CRECI: {site.creci}</p>
          )}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-extrabold" style={{ color: primary }}>
                {site.anos_experiencia || "10"}+
              </p>
              <p className="mt-1 text-xs text-gray-500">Anos de experiencia</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold" style={{ color: primary }}>
                500+
              </p>
              <p className="mt-1 text-xs text-gray-500">Imoveis vendidos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold" style={{ color: primary }}>
                98%
              </p>
              <p className="mt-1 text-xs text-gray-500">Clientes satisfeitos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
