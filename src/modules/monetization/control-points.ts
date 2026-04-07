/**
 * control-points.ts — Pontos de controle para monetização (DEV-32)
 *
 * Verifica se ações podem prosseguir com base no plano do usuário.
 * Cobre: vídeo, imagem, automação, publicação.
 *
 * enforce = true: retorna { allowed: false, reason } → UI mostra paywall.
 */

import { getVideoPlanFlags, type VideoPlanLevel } from "./plan-flags";
import type { CostEstimate } from "./cost-estimator";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ControlPointResult {
  allowed: boolean;
  reason?: string;
  code?: "quota_exceeded" | "feature_locked" | "plan_required" | "duration_exceeded" | "photos_exceeded" | "channel_locked" | "automation_limit" | "property_limit" | "team_limit";
  requiredPlan?: VideoPlanLevel;
}

function nextTier(plan: VideoPlanLevel): VideoPlanLevel {
  if (plan === "standard") return "plus";
  return "premium";
}

// ─── Video: before Generate ────────────────────────────────────────────────

export function checkBeforeGenerate(params: {
  plan: string;
  creditsUsed: number;
  photoCount: number;
  durationSeconds: number;
  presetId?: string;
  costEstimate?: CostEstimate;
}): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);

  if (!flags.enforce) return { allowed: true };

  if (flags.monthlyLimit !== null && params.creditsUsed >= flags.monthlyLimit) {
    return {
      allowed: false,
      reason: "Limite mensal de créditos atingido. Faça upgrade para continuar gerando vídeos.",
      code: "quota_exceeded",
      requiredPlan: nextTier(flags.plan),
    };
  }

  if (params.photoCount > flags.maxPhotos) {
    return {
      allowed: false,
      reason: `Este plano permite até ${flags.maxPhotos} fotos por vídeo. Faça upgrade para usar mais fotos.`,
      code: "photos_exceeded",
      requiredPlan: nextTier(flags.plan),
    };
  }

  if (params.durationSeconds > flags.maxDuration) {
    return {
      allowed: false,
      reason: `Este plano permite vídeos de até ${flags.maxDuration}s. Faça upgrade para durações maiores.`,
      code: "duration_exceeded",
      requiredPlan: nextTier(flags.plan),
    };
  }

  if (params.presetId === "luxury" && !flags.canUseLuxuryPreset) {
    return {
      allowed: false,
      reason: "O preset Luxury requer plano Plus ou superior.",
      code: "feature_locked",
      requiredPlan: "plus",
    };
  }

  return { allowed: true };
}

// ─── Video: before Download ────────────────────────────────────────────────

export function checkBeforeDownload(params: { plan: string }): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  if (!flags.canDownload) {
    return { allowed: false, reason: "Download requer plano ativo.", code: "plan_required", requiredPlan: "standard" };
  }
  return { allowed: true };
}

// ─── Video: before Reuse ───────────────────────────────────────────────────

export function checkBeforeReuse(params: { plan: string }): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  if (!flags.canReuse) {
    return { allowed: false, reason: "Reutilização requer plano ativo.", code: "plan_required", requiredPlan: "standard" };
  }
  return { allowed: true };
}

// ─── Image: before Generate ────────────────────────────────────────────────

export function checkBeforeImageGenerate(params: {
  plan: string;
  imageCreditsUsed: number;
  generationType: string;
}): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  if (!flags.canGenerateImage) {
    return { allowed: false, reason: "Geração de imagem requer plano ativo.", code: "plan_required", requiredPlan: "standard" };
  }

  if (params.imageCreditsUsed >= flags.imageCreditsPerMonth) {
    return {
      allowed: false,
      reason: `Limite de ${flags.imageCreditsPerMonth} créditos de imagem/mês atingido.`,
      code: "quota_exceeded",
      requiredPlan: nextTier(flags.plan),
    };
  }

  if (params.generationType === "gerar_arte_premium" && !flags.canGeneratePremiumArt) {
    return { allowed: false, reason: "Arte premium requer plano Plus ou superior.", code: "feature_locked", requiredPlan: "plus" };
  }

  if (params.generationType === "virtual_staging" && !flags.canVirtualStaging) {
    return { allowed: false, reason: "Virtual Staging requer plano Plus ou superior.", code: "feature_locked", requiredPlan: "plus" };
  }

  return { allowed: true };
}

// ─── Automation: before Create Rule ────────────────────────────────────────

export function checkBeforeAutomation(params: {
  plan: string;
  currentRuleCount: number;
  frequency?: string;
}): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  if (!flags.canAutomate) {
    return { allowed: false, reason: "Automação requer plano ativo.", code: "plan_required", requiredPlan: "standard" };
  }

  if (params.currentRuleCount >= flags.maxAutomationRules) {
    return {
      allowed: false,
      reason: `Limite de ${flags.maxAutomationRules} regras de automação atingido.`,
      code: "automation_limit",
      requiredPlan: nextTier(flags.plan),
    };
  }

  if (params.frequency && !flags.automationFrequencies.includes(params.frequency)) {
    return {
      allowed: false,
      reason: `Frequência "${params.frequency}" não disponível neste plano.`,
      code: "feature_locked",
      requiredPlan: nextTier(flags.plan),
    };
  }

  return { allowed: true };
}

// ─── Publication: before Schedule ──────────────────────────────────────────

export function checkBeforePublish(params: {
  plan: string;
  publicationsThisMonth: number;
  channel: string;
}): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  if (!flags.canPublish) {
    return { allowed: false, reason: "Publicação requer plano ativo.", code: "plan_required", requiredPlan: "standard" };
  }

  if (params.publicationsThisMonth >= flags.maxPublicationsPerMonth) {
    return {
      allowed: false,
      reason: `Limite de ${flags.maxPublicationsPerMonth} publicações/mês atingido.`,
      code: "quota_exceeded",
      requiredPlan: nextTier(flags.plan),
    };
  }

  if (!flags.publishChannels.includes(params.channel)) {
    return {
      allowed: false,
      reason: `Canal "${params.channel}" não disponível neste plano.`,
      code: "channel_locked",
      requiredPlan: nextTier(flags.plan),
    };
  }

  return { allowed: true };
}

// ─── Properties: before Add ────────────────────────────────────────────────

export function checkPropertyLimit(params: {
  plan: string;
  currentPropertyCount: number;
}): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  if (params.currentPropertyCount >= flags.maxProperties) {
    return {
      allowed: false,
      reason: `Limite de ${flags.maxProperties} imóveis atingido.`,
      code: "property_limit",
      requiredPlan: nextTier(flags.plan),
    };
  }
  return { allowed: true };
}

// ─── Templates: before Use ─────────────────────────────────────────────────

const TIER_ORDER: Record<string, number> = { standard: 1, plus: 2, premium: 3 };

export function checkTemplateAccess(params: {
  plan: string;
  templateMinTier?: string;
}): ControlPointResult {
  if (!params.templateMinTier) return { allowed: true };

  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  const userLevel = TIER_ORDER[flags.plan] ?? 1;
  const requiredLevel = TIER_ORDER[params.templateMinTier] ?? 1;

  if (userLevel >= requiredLevel) return { allowed: true };

  const tierLabels: Record<string, string> = { standard: "Standard", plus: "Plus", premium: "Premium" };
  return {
    allowed: false,
    reason: `Este template requer plano ${tierLabels[params.templateMinTier] ?? params.templateMinTier} ou superior.`,
    code: "feature_locked",
    requiredPlan: params.templateMinTier as VideoPlanLevel,
  };
}

// ─── Team: before Add Member ───────────────────────────────────────────────

export function checkTeamLimit(params: {
  plan: string;
  currentMemberCount: number;
}): ControlPointResult {
  const flags = getVideoPlanFlags(params.plan);
  if (!flags.enforce) return { allowed: true };

  if (params.currentMemberCount >= flags.maxTeamMembers) {
    return {
      allowed: false,
      reason: `Limite de ${flags.maxTeamMembers} membro(s) da equipe atingido.`,
      code: "team_limit",
      requiredPlan: nextTier(flags.plan),
    };
  }
  return { allowed: true };
}
