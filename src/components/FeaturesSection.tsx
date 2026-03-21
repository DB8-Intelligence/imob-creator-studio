import { Brush, Building2, CheckSquare, Sparkles, Workflow, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Velocidade para produzir",
    description: "Transforme imagem ou ideia em uma peça profissional em poucos minutos, sem travar sua operação criativa.",
  },
  {
    icon: Brush,
    title: "Design sem complexidade",
    description: "A IA assume a parte técnica do design para que você foque no conceito, na oferta e na conversão.",
  },
  {
    icon: Building2,
    title: "Especializado em imóveis",
    description: "Criado para corretores e imobiliárias que precisam de materiais visualmente fortes e comercialmente claros.",
  },
  {
    icon: Sparkles,
    title: "Criativo + copy + vídeo",
    description: "Vá além da arte: gere legendas, variações e vídeos imobiliários no mesmo ecossistema.",
  },
  {
    icon: CheckSquare,
    title: "Aprovação antes de publicar",
    description: "Revise, organize e valide o conteúdo antes da publicação, com mais controle e menos retrabalho.",
  },
  {
    icon: Workflow,
    title: "Dashboard e automação",
    description: "Centralize produção, biblioteca e operação em um painel que pode evoluir com eventos, workflows e integrações.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="recursos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Recursos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Tudo que você precisa para <span className="text-gradient">criar e escalar conteúdo imobiliário</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Mantenha a simplicidade que acelera a produção, mas com profundidade suficiente para operar branding, aprovação, vídeo e automação em um único sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent-gradient group-hover:shadow-glow transition-all duration-500">
                <feature.icon className="w-7 h-7 text-accent group-hover:text-primary transition-colors duration-500" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
