import type { TemaProps } from "../tipos";

export default function NexthmAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#2c686b";
  const secondary = site.cor_secundaria || "#f8c251";

  return (
    <section className="bg-[#f5fafa] px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <span
            className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Quem Somos
          </span>
          <h2
            className="mb-6 text-3xl font-bold text-[#0f393b] md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {site.nome_completo}
          </h2>
          <p className="mb-6 leading-relaxed text-[#214747]">
            {site.bio ||
              "Com anos de experiencia no mercado imobiliario, oferecemos atendimento personalizado e as melhores oportunidades para voce encontrar o imovel dos seus sonhos."}
          </p>
          {site.creci && (
            <p className="text-sm font-semibold text-[#214747]/60">CRECI: {site.creci}</p>
          )}

          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: primary }}>
                {site.anos_experiencia || "10"}+
              </p>
              <p className="mt-1 text-xs text-[#214747]/60">Anos de experiencia</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: secondary }}>
                500+
              </p>
              <p className="mt-1 text-xs text-[#214747]/60">Imoveis negociados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: primary }}>
                98%
              </p>
              <p className="mt-1 text-xs text-[#214747]/60">Clientes satisfeitos</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          {site.foto_url ? (
            <img
              src={site.foto_url}
              alt={site.nome_completo}
              className="h-80 w-80 rounded-3xl object-cover shadow-xl ring-4 ring-white"
            />
          ) : (
            <div
              className="h-80 w-80 rounded-3xl shadow-xl"
              style={{ background: `linear-gradient(135deg, #122122 0%, ${primary} 100%)` }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
