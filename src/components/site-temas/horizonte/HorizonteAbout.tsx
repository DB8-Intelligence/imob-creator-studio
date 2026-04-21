import { Home, Users, Shield, Handshake } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function HorizonteAbout({ site }: TemaProps) {
  const primary = site.cor_primaria || "#1E3A5F";
  const secondary = site.cor_secundaria || "#F39200";

  const servicos = [
    {
      icon: Home,
      title: "Anunciar seu imovel",
      desc: "Cadastre seu imovel conosco e alcance milhares de compradores.",
    },
    {
      icon: Handshake,
      title: "Financiamento",
      desc: "Te ajudamos a conquistar a casa propria com as melhores taxas.",
    },
    {
      icon: Shield,
      title: "Assessoria juridica",
      desc: "Processo transparente com suporte em toda documentacao.",
    },
    {
      icon: Users,
      title: "Atendimento consultivo",
      desc: "Corretores experientes ao seu lado em cada etapa da negociacao.",
    },
  ];

  return (
    <section id="sobre" className="bg-gray-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span
              className="mb-2 inline-block text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Quem somos
            </span>
            <h2
              className="mb-5 text-3xl font-bold leading-tight md:text-4xl"
              style={{ color: primary }}
            >
              {site.nome_completo || "Horizonte Imobiliaria"}
            </h2>
            <p className="mb-4 text-base leading-relaxed text-gray-600">
              {site.bio ||
                "Somos especialistas em conectar familias aos seus imoveis dos sonhos. Ha mais de 10 anos atuando com serios, transparencia e dedicacao total aos nossos clientes."}
            </p>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              Atuamos com venda, locacao e administracao de imoveis residenciais
              e comerciais, sempre com atendimento personalizado para cada
              perfil de cliente.
            </p>
            <button
              className="rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: primary }}
            >
              Saiba mais
            </button>
          </div>

          <div className="relative">
            {site.foto_url ? (
              <img
                src={site.foto_url}
                alt={site.nome_completo}
                className="w-full rounded-lg object-cover shadow-xl"
              />
            ) : (
              <div
                className="flex h-96 w-full items-center justify-center rounded-lg shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${primary} 0%, #2d5a8a 100%)`,
                }}
              >
                <Home className="h-24 w-24 text-white/30" />
              </div>
            )}
          </div>
        </div>

        {/* Servicos */}
        <div id="servicos" className="mt-16">
          <div className="mb-10 text-center">
            <span
              className="mb-2 inline-block text-xs font-bold uppercase tracking-widest"
              style={{ color: secondary }}
            >
              Servicos
            </span>
            <h3
              className="text-2xl font-bold md:text-3xl"
              style={{ color: primary }}
            >
              O que fazemos por voce
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {servicos.map((s) => (
              <div
                key={s.title}
                className="rounded-lg border border-gray-200 bg-white p-6 text-center transition hover:shadow-md"
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${secondary}20` }}
                >
                  <s.icon
                    className="h-6 w-6"
                    style={{ color: secondary }}
                  />
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
