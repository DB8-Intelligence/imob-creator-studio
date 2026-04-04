import { useState } from "react";
import { Check, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { KIWIFY_VIDEO_LINKS } from "@/lib/kiwify-links";

type Billing = "monthly" | "yearly";

const VIDEO_PLANS = [
  {
    id: "standard",
    name: "Standard",
    badge: null,
    description: "Ideal para pequenos imóveis e anúncios simples.",
    priceMonthly: "297",
    priceYearly: "2.970",
    resolution: "720p",
    credits: "300",
    features: ["Até 10 fotos por vídeo", "Resolução 720p", "Logo + texto overlay incluído"],
    featured: false,
    ctaLabel: "Assinar agora",
  },
  {
    id: "plus",
    name: "Plus",
    badge: "🔥 Mais Escolhido",
    description: "O mais escolhido pelos corretores.",
    priceMonthly: "497",
    priceYearly: "4.970",
    resolution: "1080p",
    credits: "600",
    features: ["Até 15 fotos por vídeo", "Resolução 1080p Full HD", "Logo + texto overlay incluído"],
    featured: true,
    ctaLabel: "🚀 Assinar agora",
  },
  {
    id: "premium",
    name: "Premium",
    badge: null,
    description: "Para imobiliárias de alto padrão e lançamentos premium.",
    priceMonthly: "1.697",
    priceYearly: "16.970",
    resolution: "4k",
    credits: "800",
    features: ["Até 20 fotos por vídeo", "Resolução 4K Ultra HD", "Logo + texto overlay incluído", "Renderização prioritária"],
    featured: false,
    ctaLabel: "Assinar agora",
  },
];

interface VideoPricingCardsProps {
  variant?: "dark" | "light";
}

const VideoPricingCards = ({ variant = "light" }: VideoPricingCardsProps) => {
  const [billing, setBilling] = useState<Billing>("monthly");
  const isDark = variant === "dark";

  return (
    <div className="space-y-8">

      {/* Toggle Mensal / Anual */}
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${isDark ? "border-white/10 bg-white/5" : "border-border bg-card shadow-sm"}`}>
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              billing === "monthly"
                ? "bg-amber-400 text-gray-900 font-bold"
                : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billing === "monthly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              billing === "yearly"
                ? "bg-amber-400 text-gray-900 font-bold"
                : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billing === "yearly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Anual
          </button>
          <span className="rounded-full bg-emerald-500/15 text-emerald-500 px-3 py-1 text-xs font-semibold whitespace-nowrap">
            1 mês grátis
          </span>
        </div>
      </div>

      {/* Badge flutuante acima do card destaque */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold shadow-lg">
          ✦ Mais escolhido
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {VIDEO_PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
          const period = billing === "monthly" ? "/mês" : "/ano";
          const isFeatured = plan.featured;
          const kiwifyHref = KIWIFY_VIDEO_LINKS[plan.id as keyof typeof KIWIFY_VIDEO_LINKS][billing];

          return (
            <div
              key={plan.name}
              className={[
                "rounded-3xl border p-7 flex flex-col transition-all duration-300",
                isFeatured
                  ? "border-amber-400/40 bg-gray-900 scale-[1.03] shadow-[0_0_40px_rgba(251,191,36,0.15)]"
                  : isDark
                    ? "border-white/10 bg-white/5 hover:-translate-y-1"
                    : "border-border/60 bg-card hover:-translate-y-1 hover:shadow-md",
              ].join(" ")}
            >
              {/* Badge no topo do card */}
              {plan.badge && (
                <span className="inline-block self-start px-3 py-1 rounded-full bg-amber-400 text-gray-900 text-xs font-bold mb-4">
                  {plan.badge}
                </span>
              )}

              {/* Nome e descrição */}
              <h3 className={`font-display text-2xl font-bold mb-1 ${isFeatured ? "text-white" : isDark ? "text-white" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-5 ${isFeatured ? "text-white/60" : isDark ? "text-white/50" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              {/* Preço */}
              <div className="flex items-baseline gap-1 mb-5">
                <span className={`text-sm ${isFeatured ? "text-white/70" : isDark ? "text-white/60" : "text-muted-foreground"}`}>R$</span>
                <span className={`font-display text-4xl font-bold ${isFeatured ? "text-amber-400" : isDark ? "text-white" : "text-foreground"}`}>
                  {price}
                </span>
                <span className={`text-sm ${isFeatured ? "text-white/60" : isDark ? "text-white/50" : "text-muted-foreground"}`}>{period}</span>
              </div>

              {/* Box Resolução */}
              <div className={`rounded-xl p-3 mb-3 text-center ${isDark || isFeatured ? "bg-white/5 border border-white/10" : "bg-muted/50 border border-border/60"}`}>
                <p className={`text-2xl font-bold ${isDark || isFeatured ? "text-white" : "text-foreground"}`}>{plan.resolution}</p>
                <p className={`text-xs mt-0.5 ${isDark || isFeatured ? "text-white/50" : "text-muted-foreground"}`}>resolução</p>
              </div>

              {/* Box Créditos */}
              <div className="rounded-xl p-3 mb-5 bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-emerald-400">{plan.credits} créditos</p>
                <p className="text-xs text-emerald-600/80 mt-0.5">incluídos por mês</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className={`text-sm ${isFeatured ? "text-white/80" : isDark ? "text-white/60" : "text-muted-foreground"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={kiwifyHref}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                  isFeatured
                    ? "bg-amber-400 text-gray-900 hover:bg-amber-300 hover:scale-105"
                    : isDark
                      ? "bg-white/10 text-white border border-white/15 hover:bg-white/20"
                      : "bg-gray-900 text-white hover:bg-gray-800",
                ].join(" ")}
              >
                {plan.ctaLabel}
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Footer legal */}
      <p className={`text-center text-xs max-w-2xl mx-auto leading-relaxed ${isDark ? "text-white/30" : "text-muted-foreground/60"}`}>
        Ao clicar em "Assinar", você declara que leu e concorda com nossos{" "}
        <a href="/termos" className="underline hover:text-amber-400 transition-colors">Termos de Uso</a>,{" "}
        <a href="/termos" className="underline hover:text-amber-400 transition-colors">Política de Privacidade</a>,{" "}
        <a href="/termos" className="underline hover:text-amber-400 transition-colors">Política de Reembolso</a> e{" "}
        <a href="/termos" className="underline hover:text-amber-400 transition-colors">Política de Cancelamento</a>.
      </p>
    </div>
  );
};

export default VideoPricingCards;
