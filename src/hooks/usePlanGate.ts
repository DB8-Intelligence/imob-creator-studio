/**
 * usePlanGate.ts — Hook de controle de acesso por plano (DEV-32)
 *
 * Expõe o plano atual do usuário e funções de verificação
 * para que qualquer componente possa checar limites antes de agir.
 *
 * Uso:
 *   const { plan, flags, check, blocked } = usePlanGate();
 *   const result = check.generate({ creditsUsed: 100, photoCount: 5, durationSeconds: 30 });
 *   if (!result.allowed) { toast(result.reason); return; }
 */
import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useToast } from "@/hooks/use-toast";
import {
  getVideoPlanFlags,
  resolveVideoPlanTier,
  checkBeforeGenerate,
  checkBeforeDownload,
  checkBeforeReuse,
  checkBeforeImageGenerate,
  checkBeforeAutomation,
  checkBeforePublish,
  checkPropertyLimit,
  checkTeamLimit,
  checkTemplateAccess,
} from "@/modules/monetization";
import type { ControlPointResult, VideoPlanLevel, VideoPlanFlags, CostEstimate } from "@/modules/monetization";

export function usePlanGate() {
  const { data: userPlan } = useUserPlan();
  const { toast } = useToast();
  const navigate = useNavigate();

  const planTier = useMemo(
    () => resolveVideoPlanTier(userPlan?.user_plan ?? null),
    [userPlan]
  );

  const flags = useMemo(() => getVideoPlanFlags(planTier), [planTier]);

  /** Show block toast + optionally redirect to upgrade page */
  const handleBlocked = useCallback(
    (result: ControlPointResult) => {
      if (result.allowed) return false;
      toast({
        title: "Ação bloqueada pelo plano",
        description: result.reason,
        variant: "destructive",
      });
      return true;
    },
    [toast]
  );

  /** Navigate to upgrade page */
  const goUpgrade = useCallback(
    () => navigate("/configuracoes/plano"),
    [navigate]
  );

  // ── Check functions (each returns ControlPointResult) ───────────────

  const check = useMemo(
    () => ({
      generate: (params: { creditsUsed: number; photoCount: number; durationSeconds: number; presetId?: string; costEstimate?: CostEstimate }) =>
        checkBeforeGenerate({ plan: planTier, ...params }),

      download: () => checkBeforeDownload({ plan: planTier }),

      reuse: () => checkBeforeReuse({ plan: planTier }),

      imageGenerate: (params: { imageCreditsUsed: number; generationType: string }) =>
        checkBeforeImageGenerate({ plan: planTier, ...params }),

      automation: (params: { currentRuleCount: number; frequency?: string }) =>
        checkBeforeAutomation({ plan: planTier, ...params }),

      publish: (params: { publicationsThisMonth: number; channel: string }) =>
        checkBeforePublish({ plan: planTier, ...params }),

      property: (params: { currentPropertyCount: number }) =>
        checkPropertyLimit({ plan: planTier, ...params }),

      team: (params: { currentMemberCount: number }) =>
        checkTeamLimit({ plan: planTier, ...params }),

      template: (params: { templateMinTier?: string }) =>
        checkTemplateAccess({ plan: planTier, ...params }),
    }),
    [planTier]
  );

  /** Shorthand: check + block if not allowed. Returns true if blocked. */
  const blocked = useMemo(
    () => ({
      generate: (params: Parameters<typeof check.generate>[0]) => handleBlocked(check.generate(params)),
      download: () => handleBlocked(check.download()),
      reuse: () => handleBlocked(check.reuse()),
      imageGenerate: (params: Parameters<typeof check.imageGenerate>[0]) => handleBlocked(check.imageGenerate(params)),
      automation: (params: Parameters<typeof check.automation>[0]) => handleBlocked(check.automation(params)),
      publish: (params: Parameters<typeof check.publish>[0]) => handleBlocked(check.publish(params)),
      property: (params: Parameters<typeof check.property>[0]) => handleBlocked(check.property(params)),
      team: (params: Parameters<typeof check.team>[0]) => handleBlocked(check.team(params)),
      template: (params: Parameters<typeof check.template>[0]) => handleBlocked(check.template(params)),
    }),
    [check, handleBlocked]
  );

  return {
    plan: planTier,
    flags,
    userPlan,
    check,
    blocked,
    goUpgrade,
    creditsRemaining: userPlan?.credits_remaining ?? 0,
    creditsTotal: userPlan?.credits_total ?? 0,
    isEnforced: flags.enforce,
  };
}
