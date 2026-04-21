import { Leaf, Trees, Sun, Sparkles, Home, Heart } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function SerenoAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#065F46";
  const secondary = site.cor_secundaria || "#D4A574";

  // Valores/servicos com foco em bem-estar (diferencial)
  const valores = [
    { icon: Leaf, title: "Conexao natureza", desc: "Imoveis com areas verdes e integrados ao entorno." },
    { icon: Home, title: "Refugio", desc: "Espacos que acolhem e trazem calma no dia a dia." },
    { icon: Sun, title: "Iluminacao natural", desc: "Projetos que priorizam ventilacao e luz solar." },
    { icon: Heart, title: "Bem-estar", desc: "Atendimento consultivo focado no seu estilo de vida." },
    { icon: Trees, title: "Sustentabilidade", desc: "Opcoes que respeitam o meio ambiente." },
    { icon: Sparkles, title: "Curadoria", desc: "Selecao feita a mao, imovel por imovel." },
  ];

  return (
    <section id="sobre" className="bg-white px-5 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Quem somos */}
        <div className="mb-20 grid gap-12 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="w-full rounded-3xl object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-96 items-center justify-center rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${primary}15 0%, ${secondary}25 100%)`,
                }}
              >
                <Leaf className="h-24 w-24" style={{ color: primary, opacity: 0.4 }} />
              </div>
            )}
          </div>

          <div className="order-1 md:order-2">
            <div
              className="mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: `${primary}12`,
                color: primary,
              }}
            >
              <Leaf className="h-3 w-3" />
              Sobre nos
            </div>
            <h2
              className="mb-5 text-3xl font-bold leading-tight md:text-4xl"
              style={{ color: primary }}
            >
              {site.nome_completo || "Mais que imoveis. Refugios."}
            </h2>
            <p className="mb-4 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Acreditamos que um lar e muito mais que quatro paredes. E o lugar onde voce descansa, respira e se reconecta com o que importa."}
            </p>
            <p className="mb-8 text-sm leading-relaxed text-gray-500">
              Selecionamos imoveis com atencao ao bem-estar, a natureza e a
              serenidade que voce merece.
            </p>
            <button
              className="rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: primary }}
            >
              Nossa historia
            </button>
          </div>
        </div>

        {/* Valores / servicos wellness (signature) */}
        <div id="servicos">
          <div className="mb-10 text-center">
            <h3
              className="text-2xl font-bold md:text-3xl"
              style={{ color: primary }}
            >
              Nossos valores
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {valores.map((v) => (
              <div
                key={v.title}
                className="rounded-3xl bg-[#FAFAF7] p-7 transition hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <v.icon className="h-5 w-5" style={{ color: primary }} />
                </div>
                <h4
                  className="mb-2 text-base font-bold"
                  style={{ color: primary }}
                >
                  {v.title}
                </h4>
                <p className="text-sm leading-relaxed text-gray-500">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
