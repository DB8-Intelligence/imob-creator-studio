import { Brain, Building2, CheckCircle2, Workflow, Shield, Zap } from "lucide-react";

const differentiators = [
  {
    icon: Building2,
    title: "Feito para o mercado imobiliário",
    description: "Todos os serviços são especializados em imóveis: decoração, vídeos, terrenos, reformas e artes com copy otimizada.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Brain,
    title: "IA de ponta: Gemini + Veo 3.1",
    description: "Usamos os modelos mais avançados do Google para gerar imagens, vídeos e edições com qualidade profissional.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Zap,
    title: "8 serviços em 1 plataforma",
    description: "Criativos, vídeos, staging, reforma, render, terreno vazio, demarcação e upscale — tudo integrado.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: CheckCircle2,
    title: "Brand kit + aprovação",
    description: "Padronize marca por cliente e revise tudo antes de publicar com uma operação segura e profissional.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Workflow,
    title: "Dashboard + automação",
    description: "Produção no painel com biblioteca, eventos operacionais e automação via n8n integrada.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Controle por planos",
    description: "Sistema de créditos e features por plano. Cada operação consome créditos proporcionais à complexidade.",
    color: "from-cyan-500 to-blue-500",
  },
];

const WhyDifferentSection = () => {
  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-5">
            Por que somos diferentes
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Mais que um gerador visual:{" "}
            <span className="text-gradient">uma operação criativa completa</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enquanto geradores genéricos vendem rapidez, o DB8 Intelligence combina IA de ponta com especialização imobiliária.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {differentiators.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-border/40 bg-card p-7 hover:border-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
