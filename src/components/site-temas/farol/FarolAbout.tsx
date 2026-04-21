import { Home, Calculator, Shield, Award, Users, Key } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function FarolAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0099CC";
  const secondary = site.cor_secundaria || "#0D9488";

  const servicos = [
    { icon: Home, title: "Anuncie seu imovel" },
    { icon: Calculator, title: "Financiamento" },
    { icon: Key, title: "Locacao segura" },
    { icon: Shield, title: "Assessoria juridica" },
    { icon: Users, title: "Atendimento consultivo" },
    { icon: Award, title: "Avaliacao gratuita" },
  ];

  return (
    <section id="sobre" className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
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
              {site.nome_completo || "Imobiliaria regional de confianca"}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Somos especialistas em conectar familias aos imoveis ideais. Mais de uma decada operando com transparencia, agilidade e atendimento consultivo em toda a regiao."}
            </p>
            <div className="flex gap-3">
              <button
                className="rounded-md px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                Saiba mais
              </button>
              <button
                className="rounded-md border-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:text-white"
                style={{ borderColor: secondary, color: secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = secondary;
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = secondary;
                }}
              >
                Fale conosco
              </button>
            </div>
          </div>

          <div>
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="w-full rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-80 items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${primary}15 0%, ${secondary}20 100%)`,
                }}
              >
                <Home className="h-20 w-20" style={{ color: primary, opacity: 0.4 }} />
              </div>
            )}
          </div>
        </div>

        <div id="servicos">
          <h3
            className="mb-8 text-center text-2xl font-bold"
            style={{ color: primary }}
          >
            Nossos servicos
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {servicos.map((s) => (
              <div
                key={s.title}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-5 text-center transition hover:shadow-md"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${secondary}15` }}
                >
                  <s.icon className="h-5 w-5" style={{ color: secondary }} />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
