import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { type PlanTier, type PlanFeatures, PLAN_RULES, canAccessFeature } from "@/lib/plan-rules";
import type { UserPlan } from "@/types/userPlan";

/**
 * Mapeia o user_plan do banco (credits/pro/vip) para o PlanTier do plan-rules.
 * Quando o backend migrar para os novos tiers, esse mapeamento pode ser removido.
 */
export function userPlanToTier(userPlan?: UserPlan | null): PlanTier {
  switch (userPlan) {
    case "vip":
      return "premium";
    case "pro":
      return "plus";
    case "credits":
    default:
      return "starter";
  }
}

interface PlanGateProps {
  /** A feature que precisa estar habilitada no plano */
  feature: keyof PlanFeatures;
  /** Tier do usuário atual */
  userTier: PlanTier;
  /** Nome da feature para exibição */
  featureLabel: string;
  /** Descrição do que a feature faz */
  featureDescription?: string;
  /** Tier mínimo necessário para acessar */
  minimumTier?: PlanTier;
  /** Children renderizados se o acesso for permitido */
  children: React.ReactNode;
}

/**
 * Componente que bloqueia o acesso a features baseado no plano do usuário.
 * Se o plano não suporta a feature, mostra um card de upgrade.
 */
export function PlanGate({
  feature,
  userTier,
  featureLabel,
  featureDescription,
  minimumTier,
  children,
}: PlanGateProps) {
  const hasAccess = canAccessFeature(userTier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <PlanGateBlock
      featureLabel={featureLabel}
      featureDescription={featureDescription}
      currentTier={userTier}
      minimumTier={minimumTier}
    />
  );
}

interface PlanGateBlockProps {
  featureLabel: string;
  featureDescription?: string;
  currentTier: PlanTier;
  minimumTier?: PlanTier;
}

export function PlanGateBlock({
  featureLabel,
  featureDescription,
  currentTier,
  minimumTier,
}: PlanGateBlockProps) {
  const navigate = useNavigate();

  // Find the minimum tier that has this feature
  const requiredPlan = minimumTier
    ? PLAN_RULES[minimumTier]
    : null;

  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-9 h-9 text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {featureLabel}
      </h2>
      <p className="text-muted-foreground mb-2 leading-relaxed">
        {featureDescription ||
          `Esta funcionalidade não está disponível no seu plano atual (${PLAN_RULES[currentTier].label}).`}
      </p>
      {requiredPlan && (
        <p className="text-sm text-muted-foreground mb-8">
          Disponível a partir do plano{" "}
          <span className="font-semibold text-foreground">
            {requiredPlan.label}
          </span>{" "}
          (R$ {requiredPlan.monthlyPrice}/mês).
        </p>
      )}
      <button
        onClick={() => navigate("/planos")}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all"
      >
        Ver planos e fazer upgrade
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
