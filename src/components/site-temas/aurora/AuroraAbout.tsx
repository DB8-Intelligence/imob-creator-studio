import { Home, Calculator, Shield, Users, Key, Award } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function AuroraAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1A3A52";
  const secondary = site.cor_secundaria || "#F59E0B";

  // 6 icones de servico COM CORES distintas (signature "colorful icons break")
  const servicos = [
    { icon: Home, title: "Anuncie seu imovel", desc: "Divulgacao profissional com alcance.", color: "#EF4444" },
    { icon: Calculator, title: "Financiamento", desc: "Melhores taxas do mercado.", color: "#3B82F6" },
    { icon: Shield, title: "Assessoria juridica", desc: "Documentacao segura em cada etapa.", color: "#10B981" },
    { icon: Award, title: "Avaliacao gratuita", desc: "Descubra o valor real do seu imovel.", color: "#F59E0B" },
    { icon: Users, title: "Atendimento consultivo", desc: "Especialistas para te orientar.", color: "#8B5CF6" },
    { icon: Key, title: "Locacao segura", desc: "Garantia locaticia e tranquilidade.", color: "#EAB308" },
  ];

  return (
    <section id="sobre" className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Quem somos */}
        <div className="mb-20 grid gap-10 md:grid-cols-2 md:items-center">
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
              {site.nome_completo || "Imobiliaria moderna"}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Conectamos pessoas aos imoveis ideais com clareza, agilidade e tecnologia. Mais de uma decada atuando em toda a regiao com profissionalismo e transparencia."}
            </p>
            <button
              className="rounded-md px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: primary }}
            >
              Saiba mais
            </button>
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
                  background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
                }}
              >
                <Home className="h-20 w-20 text-white/40" />
              </div>
            )}
          </div>
        </div>

        {/* 6 servicos com icones coloridos (signature!) */}
        <div id="servicos">
          <div className="mb-10 text-center">
            <p
              className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Nossos servicos
            </p>
            <h3
              className="text-2xl font-bold md:text-3xl"
              style={{ color: primary }}
            >
              O que podemos fazer por voce
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {servicos.map((s) => (
              <div
                key={s.title}
                className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 transition hover:shadow-lg"
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition group-hover:scale-110"
                  style={{ backgroundColor: `${s.color}18` }}
                >
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <h4
                    className="mb-1 text-sm font-bold"
                    style={{ color: primary }}
                  >
                    {s.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-gray-500">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
