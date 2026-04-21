import { Home, Calculator, Shield, Users, Key, Award } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function VitrineAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#0066CC";
  const secondary = site.cor_secundaria || "#059669";

  const servicos = [
    { icon: Home, title: "Anunciar imovel" },
    { icon: Calculator, title: "Financiamento" },
    { icon: Shield, title: "Seguro fianca" },
    { icon: Users, title: "Consultoria" },
    { icon: Key, title: "Locacao" },
    { icon: Award, title: "Avaliacao" },
  ];

  return (
    <section id="sobre" className="bg-gray-50 px-4 py-14 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p
              className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Quem somos
            </p>
            <h2
              className="mb-4 text-3xl font-extrabold md:text-4xl"
              style={{ color: primary }}
            >
              {site.nome_completo || "Imobiliaria completa"}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Conectamos pessoas aos imoveis dos seus sonhos. Atendemos todas as regioes com um catalogo amplo e atendimento dedicado em todas as etapas."}
            </p>

            <div className="flex gap-3">
              <button
                className="rounded-md px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                Conhecer mais
              </button>
              <button
                className="rounded-md border-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:text-white"
                style={{
                  borderColor: primary,
                  color: primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = primary;
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = primary;
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

        {/* 6 servicos */}
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
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <s.icon className="h-4 w-4" style={{ color: primary }} />
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
