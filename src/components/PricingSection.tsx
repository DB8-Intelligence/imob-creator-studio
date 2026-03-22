import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star, Crown, Zap, Film, ToggleLeft, ToggleRight } from "lucide-react";
import { Link } from "react-router-dom";

type BillingCycle = "monthly" | "yearly";

const plans = {
  monthly: [
    {
      name: "Créditos",
      icon: Zap,
      badge: "Entrada",
      price: "R$ 197/mês",
      description: "Ideal para corretores que querem validar o fluxo com baixo volume e depois adicionar vídeo sob demanda.",
      features: [
        "Posts e reels sob demanda",
        "1 template personalizado",
        "Fluxo com aprovação manual",
        "Add-on opcional de vídeos IA",
      ],
      cta: "Começar agora",
      featured: false,
      footer: "Sem fidelidade · cancele quando quiser",
    },
    {
      name: "Pro",
      icon: Star,
      badge: "Mais escolhido",
      price: "R$ 497/mês",
      description: "Para quem quer gerar posts imobiliários com consistência, velocidade e já vender vídeos dentro da operação.",
      features: [
        "Templates ilimitados",
        "Histórico completo",
        "Fluxo dashboard → IA → aprovação",
        "Pacote de vídeos IA disponível no painel",
      ],
      cta: "Quero testar o Pro",
      featured: true,
      footer: "Vídeo Starter pode ser contratado como add-on",
    },
    {
      name: "VIP / Enterprise",
      icon: Crown,
      badge: "Imobiliárias",
      price: "A partir de R$ 1.497/mês",
      description: "Para times, multi-operação e clientes que precisam de vídeos, múltiplas marcas e estrutura de escala.",
      features: [
        "Múltiplas contas e workspaces",
        "Brand kit por cliente",
        "Vídeos IA em volume / 4K",
        "Suporte dedicado e roadmap consultivo",
      ],
      cta: "Falar com especialista",
      featured: false,
      footer: "Plano enterprise com implantação e personalização",
    },
  ],
  yearly: [
    {
      name: "Créditos",
      icon: Zap,
      badge: "1 mês grátis",
      price: "R$ 1.970/ano",
      description: "Entrada com economia anual para validar o fluxo e contratar add-ons quando necessário.",
      features: [
        "Posts e reels sob demanda",
        "1 template personalizado",
        "Fluxo com aprovação manual",
        "Add-on opcional de vídeos IA",
      ],
      cta: "Assinar anual",
      featured: false,
      footer: "Economia anual para operação inicial",
    },
    {
      name: "Pro",
      icon: Star,
      badge: "2 meses grátis",
      price: "R$ 4.970/ano",
      description: "Plano profissional com melhor custo para times que geram conteúdo toda semana e querem ativar vídeo IA.",
      features: [
        "Templates ilimitados",
        "Histórico completo",
        "Fluxo dashboard → IA → aprovação",
        "Pacote de vídeos IA disponível no painel",
      ],
      cta: "Garantir anual",
      featured: true,
      footer: "Melhor custo por operação e margem para upsell",
    },
    {
      name: "VIP / Enterprise",
      icon: Crown,
      badge: "Implantação estratégica",
      price: "Sob proposta anual",
      description: "Modelo enterprise para imobiliárias com alto volume, multi-tenant e oferta de vídeo em escala.",
      features: [
        "Múltiplas contas e workspaces",
        "Brand kit por cliente",
        "Vídeos IA em volume / 4K",
        "Suporte dedicado e roadmap consultivo",
      ],
      cta: "Montar proposta",
      featured: false,
      footer: "Contrato consultivo com escopo enterprise",
    },
  ],
} as const;

const videoAddOns = [
  "Vídeo Starter: 5 vídeos/mês em 1080p",
  "Vídeo Pro: 20 vídeos/mês em até 4K",
  "Enterprise: volume customizado + suporte dedicado",
];

const PricingSection = () => {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const activePlans = useMemo(() => plans[billing], [billing]);

  return (
    <section id="planos-criativos" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Planos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Estrutura para <span className="text-gradient">corretor, time e imobiliária</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o nível certo para começar e evolua com add-ons de vídeo, aprovação, biblioteca e operação escalável.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-soft">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {billing === "monthly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                billing === "yearly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {billing === "yearly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              Anual
            </button>
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-semibold">
              {billing === "yearly" ? "Economia ativa" : "1-2 meses grátis no anual"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activePlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={[
                  "rounded-3xl border p-8 shadow-soft transition-all duration-300",
                  plan.featured
                    ? "border-accent/40 bg-primary text-primary-foreground shadow-elevated scale-[1.01]"
                    : plan.name.includes("VIP")
                    ? "border-amber-400/30 bg-gradient-to-b from-card to-amber-500/5 hover:-translate-y-1 hover:shadow-elevated"
                    : "border-border/60 bg-card hover:-translate-y-1 hover:shadow-elevated",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={[
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      plan.featured
                        ? "bg-accent text-primary"
                        : plan.name.includes("VIP")
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-accent/10 text-accent",
                    ].join(" ")}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={[
                      "text-xs font-semibold px-3 py-1 rounded-full",
                      plan.featured
                        ? "bg-accent text-primary"
                        : plan.name.includes("VIP")
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-accent/10 text-accent",
                    ].join(" ")}
                  >
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
                    {billing === "monthly"
                      ? "Assinatura recorrente com opção de adicionar créditos de vídeo."
                      : "Cobrança anual com benefício comercial e melhor margem."}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 mt-0.5 text-accent" />
                      <span className={plan.featured ? "text-primary-foreground/85" : "text-foreground/80"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.featured && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Film className="w-4 h-4 text-accent" />
                      <p className="text-sm font-semibold">Add-ons de vídeo disponíveis</p>
                    </div>
                    <ul className="space-y-2 text-sm text-primary-foreground/70">
                      {videoAddOns.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button asChild variant={plan.featured ? "hero" : "default"} size="lg" className="w-full group">
                  <Link to="/auth">
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <p className={[
                  "text-xs text-center mt-3",
                  plan.featured ? "text-primary-foreground/50" : "text-muted-foreground/60",
                ].join(" ")}>
                  {plan.footer}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-10">
          Ao prosseguir, você concorda com os <a href="#" className="underline hover:text-muted-foreground">Termos de Uso</a>,{" "}
          <a href="#" className="underline hover:text-muted-foreground">Política de Privacidade</a> e{" "}
          <a href="#" className="underline hover:text-muted-foreground">Política de Cancelamento</a>.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
