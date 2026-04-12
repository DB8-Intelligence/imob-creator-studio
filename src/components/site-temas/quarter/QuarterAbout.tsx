import type { TemaProps } from "../tipos";

export default function QuarterAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#FF5A3C";

  return (
    <section id="sobre" className="bg-[#F2F6F7] px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        {/* Image */}
        <div className="relative">
          {site.foto_url ? (
            <img
              src={site.foto_url}
              alt={site.nome_completo}
              className="h-[420px] w-full rounded-lg object-cover shadow-xl"
            />
          ) : (
            <div className="h-[420px] w-full rounded-lg bg-gradient-to-br from-[#071c1f] to-[#0B2C3D] shadow-xl" />
          )}
          {/* Accent bar */}
          <div
            className="absolute -bottom-3 -right-3 hidden h-full w-full rounded-lg border-4 md:block"
            style={{ borderColor: primary, zIndex: -1 }}
          />
        </div>

        {/* Text */}
        <div>
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            Sobre Nos
          </span>
          <h2 className="mb-6 text-3xl font-bold text-[#071c1f] md:text-4xl">
            {site.nome_completo}
          </h2>
          <p className="mb-6 leading-relaxed text-[#5C727D]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            {site.bio || "Com vasta experiencia no mercado imobiliario, oferecemos atendimento profissional e personalizado para ajudar voce a encontrar a propriedade perfeita."}
          </p>
          {site.creci && (
            <p className="mb-8 text-sm font-semibold text-[#5C727D]">CRECI: {site.creci}</p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-bold" style={{ color: primary }}>
                {site.anos_experiencia || "10"}+
              </p>
              <p className="mt-1 text-xs text-[#5C727D]">Anos de experiencia</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-bold" style={{ color: primary }}>500+</p>
              <p className="mt-1 text-xs text-[#5C727D]">Imoveis negociados</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-bold" style={{ color: primary }}>98%</p>
              <p className="mt-1 text-xs text-[#5C727D]">Clientes satisfeitos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
