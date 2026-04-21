import { Home, Calculator, Key, Users } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function EixoAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1E40AF";
  const secondary = site.cor_secundaria || "#10B981";

  const servicos = [
    {
      icon: Home,
      title: "Anuncie seu imovel",
      desc: "Divulgamos seu imovel com fotos profissionais e alcance amplificado.",
    },
    {
      icon: Calculator,
      title: "Financiamento",
      desc: "Parceiros com as melhores taxas do mercado para voce conquistar sua casa.",
    },
    {
      icon: Key,
      title: "Locacao segura",
      desc: "Toda documentacao cuidada, garantia locaticia e tranquilidade.",
    },
    {
      icon: Users,
      title: "Avaliacao gratuita",
      desc: "Avaliamos seu imovel com metodologia comparativa de mercado.",
    },
  ];

  return (
    <section id="sobre" className="bg-gray-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Sobre */}
        <div className="mb-16 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p
              className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Quem somos
            </p>
            <h2
              className="mb-5 text-3xl font-extrabold leading-tight md:text-4xl"
              style={{ color: primary }}
            >
              {site.nome_completo || "Imobiliaria regional"}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Operamos com transparencia e agilidade em toda a regiao. Mais de uma decada conectando familias aos imoveis que representam seu maior sonho."}
            </p>
            <button
              className="rounded-md px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: secondary }}
            >
              Saiba mais
            </button>
          </div>

          <div className="relative">
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="w-full rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-80 w-full items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${primary}15 0%, ${secondary}25 100%)`,
                }}
              >
                <Home
                  className="h-20 w-20"
                  style={{ color: primary, opacity: 0.4 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Servicos */}
        <div id="servicos">
          <div className="mb-10 text-center">
            <p
              className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Servicos
            </p>
            <h3
              className="text-2xl font-bold md:text-3xl"
              style={{ color: primary }}
            >
              O que fazemos por voce
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {servicos.map((s) => (
              <div
                key={s.title}
                className="rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:shadow-md"
              >
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${secondary}18` }}
                >
                  <s.icon className="h-5 w-5" style={{ color: secondary }} />
                </div>
                <h4
                  className="mb-2 text-sm font-bold"
                  style={{ color: primary }}
                >
                  {s.title}
                </h4>
                <p className="text-xs leading-relaxed text-gray-500">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
