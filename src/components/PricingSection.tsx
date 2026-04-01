import { useState } from "react";
import { ArrowRight, Check, X, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  PLAN_RULES,
  PLAN_TIERS_ORDERED,
  CREDIT_COSTS,
  formatPrice,
  getOriginalYearlyPrice,
  type PlanTier,
  type BillingCycle,
} from "@/lib/plan-rules";

const FEATURE_LIST: { label: string; getValue: (t: PlanTier) => string | boolean }[] = [
  { label: "Créditos mensais", getValue: (t) => `${PLAN_RULES[t].monthlyCredits}` },
  { label: "Fotos por vídeo", getValue: (t) => `Até ${PLAN_RULES[t].features.maxPhotosPerVideo}` },
  { label: "Resolução de vídeo", getValue: (t) => PLAN_RULES[t].features.videoResolution },
  { label: "Mobiliar residencial", getValue: (t) => PLAN_RULES[t].features.stagingResidential },
  { label: "Mobiliar comercial", getValue: (t) => PLAN_RULES[t].features.stagingCommercial },
  { label: "Reformar imóveis", getValue: (t) => PLAN_RULES[t].features.renovateProperty },
  { label: "Render de esboços", getValue: (t) => PLAN_RULES[t].features.sketchRender },
  { label: "Terreno vazio", getValue: (t) => PLAN_RULES[t].features.maxBusinessTypesEmptyLot > 0 ? `${PLAN_RULES[t].features.maxBusinessTypesEmptyLot} tipo${PLAN_RULES[t].features.maxBusinessTypesEmptyLot > 1 ? "s" : ""}` : false },
  { label: "Demarcação de terreno", getValue: (t) => PLAN_RULES[t].features.landMarking },
  { label: "Demarcação 3D", getValue: (t) => PLAN_RULES[t].features.landMarking3D },
  { label: "Upscale premium", getValue: (t) => PLAN_RULES[t].features.upscalePremium },
  { label: "Usuários simultâneos", getValue: (t) => `${PLAN_RULES[t].features.maxConcurrentUsers}` },
];

const PricingSection = () => {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <section id="planos" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-5">
            <Tag className="w-3.5 h-3.5" />
            Planos e Preços
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
            Escolha o plano ideal para{" "}
            <span className="text-gradient">escalar sua operação</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Do corretor autônomo à imobiliária. Todos os serviços de IA incluídos.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${cycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
            Mensal
          </span>
          <button
            onClick={() => setCycle((c) => (c === "monthly" ? "yearly" : "monthly"))}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${cycle === "yearly" ? "bg-emerald-500" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${cycle === "yearly" ? "translate-x-7" : ""}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${cycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
            Anual
          </span>
          {cycle === "yearly" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">
              1 mês grátis
            </span>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto mb-16">
          {PLAN_TIERS_ORDERED.map((tier) => {
            const plan = PLAN_RULES[tier];
            const isPopular = plan.popular === true;
            const price = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const originalYearly = getOriginalYearlyPrice(tier);

            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  isPopular
                    ? "border-amber-500/40 bg-gradient-to-b from-amber-500/[0.08] to-transparent shadow-xl shadow-amber-500/10 scale-[1.02] ring-1 ring-amber-500/20"
                    : "border-border/40 bg-card hover:-translate-y-1 hover:shadow-lg"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/30">
                      <Sparkles className="w-3 h-3" />
                      Mais escolhido
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-foreground text-center mt-2">{plan.label}</h3>
                <p className="text-xs text-muted-foreground text-center mt-1 min-h-[2rem]">{plan.description}</p>

                {/* Price */}
                <div className="text-center my-6">
                  {cycle === "yearly" && (
                    <p className="text-xs text-muted-foreground line-through mb-1">
                      R$ {formatPrice(originalYearly)}
                    </p>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-4xl font-extrabold text-foreground">{formatPrice(price)}</span>
                    <span className="text-sm text-muted-foreground">/{cycle === "monthly" ? "mês" : "ano"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {plan.monthlyCredits} créditos/mês
                  </p>
                </div>

                {/* Feature list */}
                <ul className="space-y-2 flex-1 mb-6">
                  {FEATURE_LIST.map((row) => {
                    const value = row.getValue(tier);
                    const isEnabled = value !== false;
                    const displayText = typeof value === "string" ? value : null;

                    return (
                      <li key={row.label} className={`flex items-center gap-2.5 text-sm ${isEnabled ? "text-foreground" : "text-muted-foreground/40"}`}>
                        {isEnabled ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400/40 shrink-0" />
                        )}
                        <span>
                          {row.label}
                          {displayText && <span className="text-muted-foreground ml-1">({displayText})</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <Link
                  to="/auth"
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isPopular
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02]"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  Assinar {plan.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Credit costs */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-5 text-center">Consumo por operação</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(CREDIT_COSTS).map(([key, cost]) => {
              const labels: Record<string, string> = {
                video_generation: "Vídeo",
                virtual_staging: "Staging",
                upscale_basic: "Upscale",
                upscale_premium: "Upscale Pro",
                renovate_property: "Reforma",
                sketch_render: "Render",
                land_marking: "Demarcação",
                land_marking_3d: "Demarcação 3D",
                empty_lot: "Terreno",
                creative_generation: "Criativo",
                caption_generation: "Legenda",
              };
              return (
                <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 border border-border/30">
                  <span className="text-xs text-muted-foreground">{labels[key] || key}</span>
                  <span className="text-sm font-bold text-accent">{cost}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground/60 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Pagamento seguro via Kiwify · Cancele quando quiser
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
