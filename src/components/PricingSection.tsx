import { ArrowRight, Zap, Star, Flame, Clock, Users, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "20 Créditos",
    badge: "Oferta Especial",
    badgeColor: "bg-amber-500 text-white",
    description: "Ideal para começar",
    criações: 20,
    price: "R$ 59",
    perUnit: "R$ 2,95/criação",
    highlight: null,
    promo: "Promoção por tempo limitado",
    users: "312 pessoas já usam",
    cta: "Começar a criar",
    featured: false,
  },
  {
    name: "50 Créditos",
    badge: "🔥 Mais Escolhido",
    badgeColor: "bg-accent text-primary",
    description: "Mais escolhido",
    criações: 50,
    price: "R$ 97",
    perUnit: "R$ 1,94/criação",
    highlight: "Economize R$ 50",
    promo: null,
    users: "523 pessoas já usam",
    cta: "🚀 Liberar criações",
    featured: true,
  },
  {
    name: "150 Créditos",
    badge: "Melhor custo-benefício",
    badgeColor: "bg-muted text-foreground",
    description: "Melhor custo-benefício",
    criações: 150,
    price: "R$ 197",
    perUnit: "R$ 1,31/criação",
    highlight: "Economize R$ 246",
    promo: null,
    users: "189 pessoas já usam",
    cta: "Liberar criações",
    featured: false,
  },
];

const PricingSection = () => {
  return (
    <section id="planos-criativos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Planos Criativos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Compre créditos para <span className="text-gradient">gerar seus criativos</span>
          </h2>
          <p className="text-muted-foreground text-base flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
            Créditos nunca expiram
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            Pagamento instantâneo via PIX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "relative rounded-3xl border p-7 flex flex-col transition-all duration-300",
                plan.featured
                  ? "border-accent/60 bg-primary text-primary-foreground shadow-[0_0_40px_rgba(var(--accent)/0.2)] scale-[1.03]"
                  : "border-border/60 bg-card hover:-translate-y-1 hover:shadow-elevated",
              ].join(" ")}
            >
              {/* Badge */}
              <div className="mb-5">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              </div>

              {/* Nome e descrição */}
              <h3 className={`font-display text-2xl font-bold mb-1 ${plan.featured ? "text-primary-foreground" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-5 ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              {/* Criações */}
              <div className="flex items-center gap-2 mb-5">
                <Zap className={`w-4 h-4 ${plan.featured ? "text-accent" : "text-accent"}`} />
                <span className={`font-semibold ${plan.featured ? "text-primary-foreground" : "text-foreground"}`}>
                  {plan.criações}
                </span>
                <span className={`text-sm ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  criações
                </span>
              </div>

              {/* Preço */}
              <div className="mb-2">
                <span className={`font-display text-4xl font-bold ${plan.featured ? "text-accent" : "text-foreground"}`}>
                  {plan.price}
                </span>
              </div>
              <p className={`text-sm mb-5 ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {plan.perUnit}
              </p>

              {/* Highlight / Promo */}
              {plan.highlight && (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 mb-4 text-center">
                  <span className="text-emerald-400 font-bold text-sm">{plan.highlight}</span>
                </div>
              )}
              {plan.promo && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 text-xs font-medium">{plan.promo}</span>
                </div>
              )}

              {/* Usuários */}
              <div className="flex items-center gap-1.5 mb-6">
                <Users className={`w-3.5 h-3.5 ${plan.featured ? "text-primary-foreground/50" : "text-muted-foreground/60"}`} />
                <span className={`text-xs ${plan.featured ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                  {plan.users}
                </span>
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Link
                  to="/auth"
                  className={[
                    "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                    plan.featured
                      ? "bg-accent-gradient text-primary shadow-glow hover:scale-105"
                      : "bg-foreground text-background hover:bg-foreground/90",
                  ].join(" ")}
                >
                  {plan.cta}
                  {!plan.featured && <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-10 text-muted-foreground/60 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Pagamento seguro via Kiwify
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
