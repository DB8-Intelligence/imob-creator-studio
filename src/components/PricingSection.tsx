import { useState } from "react";
import { ArrowRight, Check, X, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PLAN_RULES,
  PLAN_TIERS_ORDERED,
  CREDIT_COSTS,
  formatPrice,
  getOriginalYearlyPrice,
  type PlanTier,
  type BillingCycle,
} from "@/lib/plan-rules";
import { SectionHeader } from "./public/SectionHeader";
import { ProofBadge } from "./public/ProofBadge";
import { StaggerChildren, fadeUpVariants } from "./public/Animations";

const FEATURE_LIST: { label: string; getValue: (t: PlanTier) => string | boolean }[] = [
  { label: "Créditos mensais",     getValue: (t) => `${PLAN_RULES[t].monthlyCredits}` },
  { label: "Fotos por vídeo",      getValue: (t) => `Até ${PLAN_RULES[t].features.maxPhotosPerVideo}` },
  { label: "Resolução de vídeo",   getValue: (t) => PLAN_RULES[t].features.videoResolution },
  { label: "Mobiliar residencial", getValue: (t) => PLAN_RULES[t].features.stagingResidential },
  { label: "Mobiliar comercial",   getValue: (t) => PLAN_RULES[t].features.stagingCommercial },
  { label: "Reformar imóveis",     getValue: (t) => PLAN_RULES[t].features.renovateProperty },
  { label: "Render de esboços",    getValue: (t) => PLAN_RULES[t].features.sketchRender },
  { label: "Terreno vazio",        getValue: (t) => PLAN_RULES[t].features.maxBusinessTypesEmptyLot > 0 ? `${PLAN_RULES[t].features.maxBusinessTypesEmptyLot} tipo${PLAN_RULES[t].features.maxBusinessTypesEmptyLot > 1 ? "s" : ""}` : false },
  { label: "Demarcação de terreno",getValue: (t) => PLAN_RULES[t].features.landMarking },
  { label: "Demarcação 3D",        getValue: (t) => PLAN_RULES[t].features.landMarking3D },
  { label: "Upscale premium",      getValue: (t) => PLAN_RULES[t].features.upscalePremium },
  { label: "Usuários simultâneos", getValue: (t) => `${PLAN_RULES[t].features.maxConcurrentUsers}` },
];

const CREDIT_LABELS: Record<string, string> = {
  video_generation:   "Vídeo",
  virtual_staging:    "Staging",
  upscale_basic:      "Upscale",
  upscale_premium:    "Upscale Pro",
  renovate_property:  "Reforma",
  sketch_render:      "Render",
  land_marking:       "Demarcação",
  land_marking_3d:    "Demarcação 3D",
  empty_lot:          "Terreno",
  creative_generation:"Criativo",
  caption_generation: "Legenda",
};

const PricingSection = () => {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <section id="planos" className="section-py section-px bg-section-dark relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[rgba(212,175,55,0.04)] rounded-full blur-[150px] pointer-events-none" />

      <div className="section-container relative">
        <SectionHeader
          badge={
            <ProofBadge variant="gold" icon={<Tag className="w-3.5 h-3.5" />}>
              Planos e Preços
            </ProofBadge>
          }
          title={<>Escolha o plano ideal para <span className="text-gold">escalar sua operação</span></>}
          subtitle="Do corretor autônomo à imobiliária. Todos os serviços de IA incluídos."
          className="mb-8"
        />

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${cycle === "monthly" ? "text-[var(--ds-fg)]" : "text-[var(--ds-fg-muted)]"}`}>Mensal</span>
          <button
            onClick={() => setCycle((c) => (c === "monthly" ? "yearly" : "monthly"))}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${cycle === "yearly" ? "bg-[#34D399]" : "bg-[var(--ds-border-2)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${cycle === "yearly" ? "translate-x-7" : ""}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${cycle === "yearly" ? "text-[var(--ds-fg)]" : "text-[var(--ds-fg-muted)]"}`}>Anual</span>
          {cycle === "yearly" && (
            <span className="badge-pill badge-green text-xs">1 mês grátis</span>
          )}
        </div>

        {/* Plan cards */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto mb-16">
          {PLAN_TIERS_ORDERED.map((tier) => {
            const plan      = PLAN_RULES[tier];
            const isPopular = plan.popular === true;
            const price     = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const origYearly = getOriginalYearlyPrice(tier);

            return (
              <motion.div
                key={tier}
                variants={fadeUpVariants}
                whileHover={{ y: isPopular ? -2 : -5, transition: { duration: 0.22 } }}
                className={`relative flex flex-col rounded-2xl p-6 overflow-hidden
                  ${isPopular
                    ? "glass-gold border border-[rgba(212,175,55,0.3)] shadow-xl shadow-[rgba(212,175,55,0.08)] scale-[1.02]"
                    : "glass"}`}
              >
                {isPopular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ds-gold)] to-transparent" />
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="badge-pill badge-gold text-xs font-bold">
                        <Sparkles className="w-3 h-3" />
                        Mais escolhido
                      </span>
                    </div>
                  </>
                )}

                <h3 className="text-lg font-bold text-[var(--ds-fg)] text-center mt-2">{plan.label}</h3>
                <p className="text-xs text-[var(--ds-fg-muted)] text-center mt-1 min-h-[2rem]">{plan.description}</p>

                {/* Price */}
                <div className="text-center my-6">
                  {cycle === "yearly" && (
                    <p className="text-xs text-[var(--ds-fg-muted)] line-through mb-1">R$ {formatPrice(origYearly)}</p>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-[var(--ds-fg-muted)]">R$</span>
                    <span className={`text-4xl font-extrabold ${isPopular ? "text-gold" : "text-[var(--ds-fg)]"}`}>{formatPrice(price)}</span>
                    <span className="text-sm text-[var(--ds-fg-muted)]">/{cycle === "monthly" ? "mês" : "ano"}</span>
                  </div>
                  <p className="text-xs text-[var(--ds-fg-muted)] mt-1.5">{plan.monthlyCredits} créditos/mês</p>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {FEATURE_LIST.map((row) => {
                    const value       = row.getValue(tier);
                    const isEnabled   = value !== false;
                    const displayText = typeof value === "string" ? value : null;
                    return (
                      <li key={row.label} className={`flex items-center gap-2.5 text-sm ${isEnabled ? "text-[var(--ds-fg)]" : "text-[var(--ds-fg-subtle)]"}`}>
                        {isEnabled
                          ? <Check className="w-4 h-4 text-[#34D399] shrink-0" />
                          : <X    className="w-4 h-4 text-[var(--ds-fg-subtle)] shrink-0" />
                        }
                        {row.label}
                        {displayText && <span className="text-[var(--ds-fg-muted)] ml-1">({displayText})</span>}
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <Link
                  to="/auth"
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isPopular ? "btn-primary justify-center" : "btn-secondary justify-center"
                  }`}
                >
                  Assinar {plan.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </StaggerChildren>

        {/* Credit costs */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-[var(--ds-fg)] font-semibold text-base mb-5 text-center">Consumo por operação</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(CREDIT_COSTS).map(([key, cost]) => (
              <div key={key} className="glass flex items-center justify-between px-4 py-3 rounded-xl">
                <span className="text-xs text-[var(--ds-fg-muted)]">{CREDIT_LABELS[key] || key}</span>
                <span className="text-sm font-bold text-[var(--ds-gold-light)]">{cost}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-[var(--ds-fg-muted)] text-sm">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          Pagamento seguro via Kiwify · Cancele quando quiser
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
