import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star, Crown, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Créditos",
    icon: Zap,
    badge: "Entrada",
    price: "Sob consulta",
    description: "Ideal para corretores que querem validar o fluxo com baixo volume.",
    features: [
      "Publicação no Instagram",
      "1 template personalizado",
      "Geração sob demanda",
      "Fluxo com aprovação manual",
    ],
    cta: "Começar agora",
    featured: false,
  },
  {
    name: "Pro",
    icon: Star,
    badge: "Mais escolhido",
    price: "Escala profissional",
    description: "Para quem quer gerar posts imobiliários com consistência e velocidade.",
    features: [
      "Templates ilimitados",
      "Histórico completo",
      "Suporte prioritário",
      "Fluxo WhatsApp → IA → aprovação",
    ],
    cta: "Quero testar o Pro",
    featured: true,
  },
  {
    name: "VIP",
    icon: Crown,
    badge: "Operação avançada",
    price: "Sob medida",
    description: "Para imobiliárias e operações que querem automação, volume e evolução SaaS.",
    features: [
      "Agendamento de posts",
      "Múltiplas contas Instagram",
      "White-label em evolução",
      "Base para estrutura multi-tenant",
    ],
    cta: "Falar sobre implantação",
    featured: false,
  },
];

const PricingSection = () => {
  return (
    <section id="precos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Planos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Estrutura para <span className="text-gradient">corretor, time e imobiliária</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o nível certo para começar e evolua para uma operação imobiliária com conteúdo automatizado,
            aprovação e escala.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={[
                  "rounded-3xl border p-8 shadow-soft transition-all duration-300",
                  plan.featured
                    ? "border-accent/40 bg-primary text-primary-foreground shadow-elevated scale-[1.01]"
                    : "border-border/60 bg-card hover:-translate-y-1 hover:shadow-elevated",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    plan.featured ? "bg-accent text-primary" : "bg-accent/10 text-accent"
                  ].join(" ")}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={[
                    "text-xs font-semibold px-3 py-1 rounded-full",
                    plan.featured ? "bg-accent text-primary" : "bg-accent/10 text-accent"
                  ].join(" ")}>
                    {plan.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={plan.featured ? "text-primary-foreground/75 mb-6" : "text-muted-foreground mb-6"}>
                  {plan.description}
                </p>

                <div className="mb-8">
                  <p className="font-display text-3xl font-bold">{plan.price}</p>
                  <p className={plan.featured ? "text-primary-foreground/60 text-sm mt-2" : "text-muted-foreground text-sm mt-2"}>
                    Plano consultivo para a fase atual do produto.
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={plan.featured ? "w-5 h-5 mt-0.5 text-accent" : "w-5 h-5 mt-0.5 text-accent"} />
                      <span className={plan.featured ? "text-primary-foreground/85" : "text-foreground/80"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant={plan.featured ? "hero" : "default"} size="lg" className="w-full group">
                  <Link to="/auth">
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
