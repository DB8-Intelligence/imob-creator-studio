import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import {
  PLAN_RULES,
  PLAN_TIERS_ORDERED,
  CREDIT_COSTS,
  formatPrice,
  getOriginalYearlyPrice,
  type PlanTier,
  type BillingCycle,
} from "@/lib/plan-rules";
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Video,
  Image,
  Sofa,
  Hammer,
  PenTool,
  MapPin,
  Users,
  Tag,
} from "lucide-react";

// ─── Links do Kiwify por plano e ciclo ──────────────────────────────────────
// TODO: Substituir pelos links reais de pagamento Kiwify de cada plano
const KIWIFY_LINKS: Record<PlanTier, Record<BillingCycle, string>> = {
  starter: {
    monthly: "https://kiwify.com.br/starter-mensal",   // TODO: link real
    yearly: "https://kiwify.com.br/starter-anual",     // TODO: link real
  },
  standard: {
    monthly: "https://kiwify.com.br/standard-mensal",  // TODO: link real
    yearly: "https://kiwify.com.br/standard-anual",    // TODO: link real
  },
  plus: {
    monthly: "https://kiwify.com.br/plus-mensal",      // TODO: link real
    yearly: "https://kiwify.com.br/plus-anual",        // TODO: link real
  },
  premium: {
    monthly: "https://kiwify.com.br/premium-mensal",   // TODO: link real
    yearly: "https://kiwify.com.br/premium-anual",     // TODO: link real
  },
};

interface FeatureRow {
  label: string;
  icon: React.ReactNode;
  getValue: (tier: PlanTier) => string | boolean;
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    label: "Créditos mensais",
    icon: <Tag className="w-4 h-4" />,
    getValue: (t) => `${PLAN_RULES[t].monthlyCredits} créditos`,
  },
  {
    label: "Fotos por vídeo",
    icon: <Video className="w-4 h-4" />,
    getValue: (t) => `Até ${PLAN_RULES[t].features.maxPhotosPerVideo} fotos`,
  },
  {
    label: "Resolução de vídeo",
    icon: <Video className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.videoResolution,
  },
  {
    label: "Logo no vídeo",
    icon: <Image className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.videoLogo,
  },
  {
    label: "Texto overlay",
    icon: <PenTool className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.videoTextOverlay,
  },
  {
    label: "Melhoria de imagem (Upscale 2x)",
    icon: <Image className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.upscaleBasic,
  },
  {
    label: "Melhoria de imagem premium (Upscale premium)",
    icon: <Image className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.upscalePremium,
  },
  {
    label: "Mobiliar ambientes residencial",
    icon: <Sofa className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.stagingResidential,
  },
  {
    label: "Mobiliar ambientes comercial",
    icon: <Sofa className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.stagingCommercial,
  },
  {
    label: "Reformar e valorizar imóveis",
    icon: <Hammer className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.renovateProperty,
  },
  {
    label: "Render de esboços",
    icon: <PenTool className="w-4 h-4" />,
    getValue: (t) => PLAN_RULES[t].features.sketchRender,
  },
  {
    label: "Tipos de negócio em terreno vazio",
    icon: <MapPin className="w-4 h-4" />,
    getValue: (t) => {
      const v = PLAN_RULES[t].features.maxBusinessTypesEmptyLot;
      return v > 0 ? `Até ${v} tipo${v > 1 ? "s" : ""}` : false;
    },
  },
  {
    label: "Marcação de terreno",
    icon: <MapPin className="w-4 h-4" />,
    getValue: (t) => {
      if (PLAN_RULES[t].features.landMarking3D) return "Com animação 3D";
      return PLAN_RULES[t].features.landMarking;
    },
  },
  {
    label: "Usuários simultâneos",
    icon: <Users className="w-4 h-4" />,
    getValue: (t) => `${PLAN_RULES[t].features.maxConcurrentUsers} usuário${PLAN_RULES[t].features.maxConcurrentUsers > 1 ? "s" : ""}`,
  },
];

const PlansPage = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Transforme fotos em vídeos cinematográficos, mobile ambientes vazios e
            valorize seus imóveis com inteligência artificial.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4">
          <span
            className={`text-sm font-medium transition-colors ${
              billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Mensal
          </span>

          <button
            onClick={() =>
              setBillingCycle((c) => (c === "monthly" ? "yearly" : "monthly"))
            }
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
              billingCycle === "yearly" ? "bg-emerald-500" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${
                billingCycle === "yearly" ? "translate-x-7" : ""
              }`}
            />
          </button>

          <span
            className={`text-sm font-medium transition-colors ${
              billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Anual
          </span>

          {billingCycle === "yearly" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Tag className="w-3 h-3" />
              1 mês grátis
            </span>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLAN_TIERS_ORDERED.map((tier) => {
            const plan = PLAN_RULES[tier];
            const isPopular = plan.popular === true;
            const price =
              billingCycle === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;
            const originalYearly = getOriginalYearlyPrice(tier);

            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  isPopular
                    ? "border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                    : "border-border/40 bg-card hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-3 h-3" />
                      Mais escolhido
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h2 className="text-xl font-bold text-foreground text-center mt-2">
                  {plan.label}
                </h2>
                <p className="text-xs text-muted-foreground text-center mt-1 min-h-[2rem]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="text-center my-6">
                  {billingCycle === "yearly" && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        R$ {formatPrice(plan.monthlyPrice)}/mês
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        de R$ {formatPrice(originalYearly)}
                      </p>
                    </>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-5xl font-extrabold text-foreground">
                      {formatPrice(price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{billingCycle === "monthly" ? "mês" : "ano"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-xs text-emerald-400 font-medium mt-1">
                      1 mês grátis pagando anual
                    </p>
                  )}
                </div>

                {/* Feature list */}
                <ul className="space-y-2.5 flex-1">
                  {FEATURE_ROWS.map((row) => {
                    const value = row.getValue(tier);
                    const isEnabled = value !== false;
                    const displayText =
                      typeof value === "string" ? value : null;

                    return (
                      <li
                        key={row.label}
                        className={`flex items-start gap-2.5 text-sm ${
                          isEnabled
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {isEnabled ? (
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </span>
                        ) : (
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                            <X className="w-3 h-3 text-red-400" />
                          </span>
                        )}
                        <span>
                          {displayText || row.label}
                          {displayText && (
                            <span className="block text-xs text-muted-foreground">
                              {row.label}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <a
                  href={KIWIFY_LINKS[tier][billingCycle]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    isPopular
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {billingCycle === "yearly"
                    ? "Assinar e economizar"
                    : "Assinar agora"}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Credit costs table */}
        <div className="rounded-2xl border border-border/40 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Consumo de créditos por operação
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(CREDIT_COSTS).map(([key, cost]) => {
              const labels: Record<string, string> = {
                video_generation: "Geração de vídeo",
                virtual_staging: "Mobiliar ambientes",
                upscale_basic: "Upscale básico (2x)",
                upscale_premium: "Upscale premium",
                renovate_property: "Reformar e valorizar",
                sketch_render: "Render de esboços",
                land_marking: "Marcação de terreno",
                land_marking_3d: "Marcação 3D",
                empty_lot: "Visualização terreno vazio",
                creative_generation: "Gerar criativo",
                caption_generation: "Gerar legenda",
              };
              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-muted/50"
                >
                  <span className="text-sm text-foreground">
                    {labels[key] || key}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {cost} crédito{cost > 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal */}
        <p className="text-center text-xs text-muted-foreground">
          Ao clicar em "Assinar", você declara que leu e concorda com nossos{" "}
          <a href="/termos" className="underline hover:text-foreground">
            Termos de Uso
          </a>
          ,{" "}
          <a href="/termos" className="underline hover:text-foreground">
            Política de Privacidade
          </a>
          ,{" "}
          <a href="/termos" className="underline hover:text-foreground">
            Política de Reembolso
          </a>{" "}
          e{" "}
          <a href="/termos" className="underline hover:text-foreground">
            Política de Cancelamento
          </a>
          .
        </p>
      </div>
    </AppLayout>
  );
};

export default PlansPage;
