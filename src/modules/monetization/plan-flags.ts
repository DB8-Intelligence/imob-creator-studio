/**
 * plan-flags.ts — Feature flags por plano (DEV-32)
 *
 * Define o que cada plano pode fazer. Cobre todos os módulos:
 * vídeo, geração de imagem, automação, publicação.
 *
 * enforce = true → control points bloqueiam ações fora do plano.
 *
 * Níveis:
 *   standard → funcionalidades básicas
 *   plus     → funcionalidades avançadas
 *   premium  → tudo liberado + prioridade
 */

export type VideoPlanLevel = "standard" | "plus" | "premium";

export interface VideoPlanFlags {
  plan: VideoPlanLevel;
  /** Se true, os control points bloqueiam ações */
  enforce: boolean;

  // ── Vídeo ──────────────────────────────────────────────────────────
  canGenerate: boolean;
  canDownload: boolean;
  canReuse: boolean;
  canUseLuxuryPreset: boolean;
  canUse4K: boolean;
  /** Limite de créditos de vídeo por mês (null = ilimitado) */
  monthlyLimit: number | null;
  maxPhotos: number;
  maxDuration: number;
  queuePriority: "normal" | "high";

  // ── Geração de imagem/post ─────────────────────────────────────────
  canGenerateImage: boolean;
  canGeneratePremiumArt: boolean;
  canVirtualStaging: boolean;
  imageCreditsPerMonth: number;

  // ── Automação (DEV-26) ─────────────────────────────────────────────
  canAutomate: boolean;
  maxAutomationRules: number;
  automationFrequencies: string[];

  // ── Publicação (DEV-28/29/30) ──────────────────────────────────────
  canPublish: boolean;
  maxPublicationsPerMonth: number;
  publishChannels: string[];

  // ── Geral ──────────────────────────────────────────────────────────
  maxTeamMembers: number;
  maxProperties: number;
  canExportPDF: boolean;
  canWhiteLabel: boolean;
}

// ─── Definições por plano ──────────────────────────────────────────────────

export const VIDEO_PLAN_FLAGS: Record<VideoPlanLevel, VideoPlanFlags> = {
  standard: {
    plan: "standard",
    enforce: true,
    // Vídeo
    canGenerate: true,
    canDownload: true,
    canReuse: true,
    canUseLuxuryPreset: false,
    canUse4K: false,
    monthlyLimit: 300,
    maxPhotos: 10,
    maxDuration: 50,
    queuePriority: "normal",
    // Imagem
    canGenerateImage: true,
    canGeneratePremiumArt: false,
    canVirtualStaging: false,
    imageCreditsPerMonth: 50,
    // Automação
    canAutomate: true,
    maxAutomationRules: 3,
    automationFrequencies: ["manual", "weekly"],
    // Publicação
    canPublish: true,
    maxPublicationsPerMonth: 30,
    publishChannels: ["instagram_feed", "instagram_stories", "facebook"],
    // Geral
    maxTeamMembers: 1,
    maxProperties: 20,
    canExportPDF: false,
    canWhiteLabel: false,
  },
  plus: {
    plan: "plus",
    enforce: true,
    // Vídeo
    canGenerate: true,
    canDownload: true,
    canReuse: true,
    canUseLuxuryPreset: true,
    canUse4K: false,
    monthlyLimit: 600,
    maxPhotos: 15,
    maxDuration: 75,
    queuePriority: "normal",
    // Imagem
    canGenerateImage: true,
    canGeneratePremiumArt: true,
    canVirtualStaging: true,
    imageCreditsPerMonth: 150,
    // Automação
    canAutomate: true,
    maxAutomationRules: 10,
    automationFrequencies: ["manual", "daily", "weekly"],
    // Publicação
    canPublish: true,
    maxPublicationsPerMonth: 100,
    publishChannels: ["instagram_feed", "instagram_stories", "instagram_reels", "facebook", "whatsapp"],
    // Geral
    maxTeamMembers: 3,
    maxProperties: 50,
    canExportPDF: true,
    canWhiteLabel: false,
  },
  premium: {
    plan: "premium",
    enforce: true,
    // Vídeo
    canGenerate: true,
    canDownload: true,
    canReuse: true,
    canUseLuxuryPreset: true,
    canUse4K: true,
    monthlyLimit: 800,
    maxPhotos: 20,
    maxDuration: 90,
    queuePriority: "high",
    // Imagem
    canGenerateImage: true,
    canGeneratePremiumArt: true,
    canVirtualStaging: true,
    imageCreditsPerMonth: 500,
    // Automação
    canAutomate: true,
    maxAutomationRules: 50,
    automationFrequencies: ["manual", "daily", "weekly"],
    // Publicação
    canPublish: true,
    maxPublicationsPerMonth: 500,
    publishChannels: ["instagram_feed", "instagram_stories", "instagram_reels", "facebook", "whatsapp", "tiktok", "linkedin"],
    // Geral
    maxTeamMembers: 10,
    maxProperties: 200,
    canExportPDF: true,
    canWhiteLabel: true,
  },
};

// ─── Accessors ─────────────────────────────────────────────────────────────

export function getVideoPlanFlags(plan: string): VideoPlanFlags {
  if (plan === "premium" || plan === "plus" || plan === "standard") {
    return VIDEO_PLAN_FLAGS[plan];
  }
  // Resolve video_standard/video_plus/video_premium
  if (plan.startsWith("video_")) {
    const tier = plan.replace("video_", "");
    if (tier === "premium" || tier === "plus" || tier === "standard") {
      return VIDEO_PLAN_FLAGS[tier];
    }
  }
  return VIDEO_PLAN_FLAGS.standard;
}

/** Retorna true se a monetização está ativa para este plano */
export function isEnforcementActive(plan: string): boolean {
  return getVideoPlanFlags(plan).enforce;
}

/** Resolve plano do user_plan string para VideoPlanLevel */
export function resolveVideoPlanTier(userPlan: string | null): VideoPlanLevel {
  if (!userPlan) return "standard";
  const clean = userPlan.replace("video_", "");
  if (clean === "premium" || clean === "plus" || clean === "standard") return clean;
  return "standard";
}
