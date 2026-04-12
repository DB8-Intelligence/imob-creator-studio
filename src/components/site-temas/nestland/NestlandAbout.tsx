import type { TemaProps } from "../tipos";

export default function NestlandAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#b99755";

  return (
    <section className="bg-[#f7f4f1] px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            Sobre Nos
          </span>
          <h2 className="mb-6 text-3xl font-bold text-[#0f0f0f] md:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            {site.nome_completo}
          </h2>
          <p className="mb-6 leading-relaxed text-[#515151]">
            {site.bio || "Com anos de experiencia no mercado imobiliario, oferecemos atendimento personalizado e as melhores oportunidades para voce encontrar o imovel dos seus sonhos."}
          </p>
          {site.creci && (
            <p className="text-sm font-semibold text-[#777]">CRECI: {site.creci}</p>
          )}
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: primary }}>{site.anos_experiencia || "10"}+</p>
              <p className="mt-1 text-xs text-[#777]">Anos de experiencia</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: primary }}>500+</p>
              <p className="mt-1 text-xs text-[#777]">Imoveis vendidos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: primary }}>98%</p>
              <p className="mt-1 text-xs text-[#777]">Clientes satisfeitos</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          {site.foto_url ? (
            <img src={site.foto_url} alt={site.nome_completo} className="h-80 w-80 rounded-3xl object-cover shadow-xl" />
          ) : (
            <div className="h-80 w-80 rounded-3xl bg-gradient-to-br from-[#0f0f0f] to-[#b99755] shadow-xl" />
          )}
        </div>
      </div>
    </section>
  );
}
