import { useState } from "react";
import { Check, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { Link } from "react-router-dom";

type Billing = "monthly" | "yearly";

interface VideoPlan {
  name: string;
  badge: string | null;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  resolution: string;
  credits: string;
  features: string[];
  featured: boolean;
  ctaHref: string;
}

const VIDEO_PLANS: VideoPlan[] = [
  {
    name: "Standard",
    badge: null,
    description: "Ideal para pequenos imóveis e anúncios simples.",
    priceMonthly: "R$ 297",
    priceYearly: "R$ 2.970",
    resolution: "720p",
    credits: "300 créditos",
    features: ["Até 10 fotos por vídeo", "Resolução 720p", "Logo + texto overlay incluído"],
    featured: false,
    ctaHref: "/video-plans",
  },
  {
    name: "Plus",
    badge: "Mais escolhido",
    description: "O mais escolhido pelos corretores.",
    priceMonthly: "R$ 497",
    priceYearly: "R$ 4.970",
    resolution: "1080p",
    credits: "600 créditos",
    features: ["Até 15 fotos por vídeo", "Resolução 1080p Full HD", "Logo + texto overlay incluído"],
    featured: true,
    ctaHref: "/video-plans",
  },
  {
    name: "Premium",
    badge: null,
    description: "Para imobiliárias de alto padrão e lançamentos premium.",
    priceMonthly: "R$ 1.697",
    priceYearly: "R$ 16.970",
    resolution: "4k",
    credits: "800 créditos",
    features: ["Até 20 fotos por vídeo", "Resolução 4K Ultra HD", "Logo + texto overlay incluído", "Renderização prioritária"],
    featured: false,
    ctaHref: "/video-plans",
  },
];

interface VideoPricingCardsProps {
  /** dark = seção com fundo escuro (landing); light = fundo claro (dashboard) */
  variant?: "dark" | "light";
}

const VideoPricingCards = ({ variant = "light" }: VideoPricingCardsProps) => {
  const [billing, setBilling] = useState<Billing>("monthly");

  const isDark = variant === "dark";

  const textMain = isDark ? "text-primary-foreground" : "text-foreground";
  const textSub = isDark ? "text-primary-foreground/60" : "text-muted-foreground";
  const cardBase = isDark ? "border-primary-foreground/15 bg-primary-foreground/5" : "border-border/60 bg-card";
  const cardFeatured = isDark ? "border-accent/50 bg-white/5 scale-[1.03] shadow-glow" : "border-accent/50 bg-primary text-primary-foreground scale-[1.03] shadow-xl";

  return (
    <div className="space-y-8">
      {/* Toggle Mensal / Anual */}
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-sm ${isDark ? "border-primary-foreground/15 bg-primary-foreground/5" : "border-border bg-card"}`}>
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${billing === "monthly" ? (isDark ? "bg-accent text-primary" : "bg-primary text-primary-foreground") : textSub}`}
          >
            {billing === "monthly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${billing === "yearly" ? "bg-emerald-500 text-white" : textSub}`}
          >
            {billing === "yearly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Anual
          </button>
          <span className="rounded-full bg-emerald-500/15 text-emerald-500 px-3 py-1 text-xs font-semibold">
            1 mês grátis
          </span>
        </div>
      </div>

      {/* Badge Mais escolhido (acima dos cards) */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold">
          ✦ Mais escolhido
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {VIDEO_PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
          const period = billing === "monthly" ? "/mês" : "/ano";
          const isFeatured = plan.featured;

          return (
            <div
              key={plan.name}
              className={`rounded-3xl border p-7 flex flex-col transition-all duration-300 ${isFeatured ? cardFeatured : cardBase}`}
            >
              {/* Nome e descrição */}
              <h3 className={`font-display text-2xl font-bold mb-1 ${isFeatured && !isDark ? "text-primary-foreground" : textMain}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-5 ${isFeatured && !isDark ? "text-primary-foreground/70" : textSub}`}>
                {plan.description}
              </p>

              {/* Preço */}
              <div className="mb-5">
                <span className={`text-sm ${isFeatured && !isDark ? "text-primary-foreground/70" : textSub}`}>R$ </span>
                <span className={`font-display text-4xl font-bold ${isFeatured && !isDark ? "text-primary-foreground" : textMain}`}>
                  {price.replace("R$ ", "")}
                </span>
                <span className={`text-sm ${isFeatured && !isDark ? "text-primary-foreground/60" : textSub}`}>{period}</span>
              </div>

              {/* Resolução */}
              <div className={`rounded-xl p-3 mb-3 border text-center ${isFeatured && !isDark ? "bg-white/10 border-white/15" : isDark ? "bg-primary-foreground/10 border-primary-foreground/10" : "bg-muted/40 border-border/60"}`}>
                <p className={`text-2xl font-bold ${isFeatured && !isDark ? "text-primary-foreground" : textMain}`}>{plan.resolution}</p>
                <p className={`text-xs mt-0.5 ${isFeatured && !isDark ? "text-primary-foreground/60" : textSub}`}>resolução</p>
              </div>

              {/* Créditos */}
              <div className="rounded-xl p-3 mb-5 bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-emerald-500">{plan.credits}</p>
                <p className="text-xs text-emerald-600/70 mt-0.5">incluídos por mês</p>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className={`text-sm ${isFeatured && !isDark ? "text-primary-foreground/85" : textSub}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={plan.ctaHref}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  isFeatured
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : isDark
                    ? "bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                Assinar agora
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Legal */}
      <p className={`text-center text-xs ${textSub} max-w-2xl mx-auto leading-relaxed`}>
        Ao clicar em "Assinar", você declara que leu e concorda com nossos{" "}
        <Link to="/termos" className="underline hover:text-accent transition-colors">Termos de Uso</Link>,{" "}
        <Link to="/termos" className="underline hover:text-accent transition-colors">Política de Privacidade</Link>,{" "}
        <Link to="/termos" className="underline hover:text-accent transition-colors">Política de Reembolso</Link> e{" "}
        <Link to="/termos" className="underline hover:text-accent transition-colors">Política de Cancelamento</Link>.
      </p>
    </div>
  );
};

export default VideoPricingCards;
