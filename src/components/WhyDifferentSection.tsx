import { Badge } from "@/components/ui/badge";
import { Brain, Building2, CheckCircle2, Workflow } from "lucide-react";

const differentiators = [
  {
    icon: Building2,
    title: "Feito para o mercado imobiliário",
    description:
      "O sistema nasce para corretores e imobiliárias: imóveis, campanhas, captação, autoridade e operação comercial real.",
  },
  {
    icon: Brain,
    title: "Não é só imagem",
    description:
      "Gere criativo, copy, variações e vídeo no mesmo fluxo — sem depender de ferramentas soltas ou trabalho manual fragmentado.",
  },
  {
    icon: CheckCircle2,
    title: "Brand kit + aprovação",
    description:
      "Padronize marca por cliente e revise tudo antes de publicar, com uma operação mais segura e profissional.",
  },
  {
    icon: Workflow,
    title: "Dashboard + automação",
    description:
      "A produção acontece no painel e a automação roda por trás com n8n, storage, biblioteca e eventos operacionais.",
  },
];

const WhyDifferentSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/10">Por que é diferente</Badge>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Mais que um gerador visual: <span className="text-gradient">uma operação criativa imobiliária</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enquanto geradores genéricos vendem rapidez, o ImobCreatorAI combina velocidade com especialização, branding, vídeo, aprovação e automação real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {differentiators.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
