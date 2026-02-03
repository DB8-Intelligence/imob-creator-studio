import { Camera, Wand2, Share2, Sparkles, Layers, Zap } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Upload Simples",
    description: "Envie suas fotos de imóveis e deixe nossa tecnologia fazer a mágica.",
  },
  {
    icon: Wand2,
    title: "Edição Inteligente",
    description: "Ajuste automático de cores, iluminação e composição para fotos perfeitas.",
  },
  {
    icon: Layers,
    title: "Templates Premium",
    description: "Mais de 50 templates profissionais para apresentações impactantes.",
  },
  {
    icon: Sparkles,
    title: "Melhoria com IA",
    description: "Inteligência artificial que transforma fotos comuns em imagens extraordinárias.",
  },
  {
    icon: Zap,
    title: "Resultados Rápidos",
    description: "Gere materiais profissionais em segundos, não em horas.",
  },
  {
    icon: Share2,
    title: "Compartilhe Fácil",
    description: "Exporte em alta qualidade para redes sociais, portais e impressão.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="recursos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Recursos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Tudo que você precisa para{" "}
            <span className="text-gradient">destacar seus imóveis</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Ferramentas poderosas e intuitivas para criar materiais visuais profissionais 
            que vendem mais e mais rápido.
          </p>
        </div>

        {/* Features grid */}
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
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
