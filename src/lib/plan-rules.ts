/**
 * Regras centrais de planos do iMob Creator Studio.
 *
 * Baseado nos planos do iMOVIE (SML Solution AI) com adaptações
 * para o ecossistema iMob Creator.
 */

export type PlanTier = "starter" | "standard" | "plus" | "premium";
export type BillingCycle = "monthly" | "yearly";

export interface PlanFeatures {
  /** Geração de vídeo */
  maxPhotosPerVideo: number;
  videoResolution: "720p" | "1080p" | "4K";
  videoLogo: boolean;
  videoTextOverlay: boolean;

  /** Upscale de imagem */
  upscaleBasic: boolean;
  upscalePremium: boolean;

  /** Image Restoration — mobiliar ambientes */
  stagingResidential: boolean;
  stagingCommercial: boolean;

  /** Reformar e valorizar imóveis */
  renovateProperty: boolean;

  /** Render de esboços */
  sketchRender: boolean;

  /** Tipos de negócio em terreno vazio */
  maxBusinessTypesEmptyLot: number;

  /** Marcação de terreno */
  landMarking: boolean;
  landMarking3D: boolean;

  /** Usuários simultâneos */
  maxConcurrentUsers: number;
}

export interface PlanRule {
  tier: PlanTier;
  label: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyCredits: number;
  features: PlanFeatures;
  popular?: boolean;
}

export const PLAN_RULES: Record<PlanTier, PlanRule> = {
  starter: {
    tier: "starter",
    label: "Starter",
    description: "Para corretores que estão começando a apresentar imóveis com IA",
    monthlyPrice: 97,
    yearlyPrice: 1067, // 11 meses (1 mês grátis)
    monthlyCredits: 100,
    features: {
      maxPhotosPerVideo: 5,
      videoResolution: "720p",
      videoLogo: true,
      videoTextOverlay: true,
      upscaleBasic: true,
      upscalePremium: false,
      stagingResidential: true,
      stagingCommercial: false,
      renovateProperty: false,
      sketchRender: false,
      maxBusinessTypesEmptyLot: 1,
      landMarking: false,
      landMarking3D: false,
      maxConcurrentUsers: 1,
    },
  },
  standard: {
    tier: "standard",
    label: "Standard",
    description: "Para corretores que anunciam ocasionalmente",
    monthlyPrice: 297,
    yearlyPrice: 3279, // 11 meses (1 mês grátis)
    monthlyCredits: 300,
    popular: false,
    features: {
      maxPhotosPerVideo: 10,
      videoResolution: "720p",
      videoLogo: true,
      videoTextOverlay: true,
      upscaleBasic: true,
      upscalePremium: true,
      stagingResidential: true,
      stagingCommercial: true,
      renovateProperty: true,
      sketchRender: true,
      maxBusinessTypesEmptyLot: 3,
      landMarking: true,
      landMarking3D: false,
      maxConcurrentUsers: 1,
    },
  },
  plus: {
    tier: "plus",
    label: "Plus",
    description: "Para corretores que anunciam vários imóveis por mês",
    monthlyPrice: 497,
    yearlyPrice: 5467, // 11 meses (1 mês grátis)
    monthlyCredits: 600,
    popular: true,
    features: {
      maxPhotosPerVideo: 15,
      videoResolution: "1080p",
      videoLogo: true,
      videoTextOverlay: true,
      upscaleBasic: true,
      upscalePremium: true,
      stagingResidential: true,
      stagingCommercial: true,
      renovateProperty: true,
      sketchRender: true,
      maxBusinessTypesEmptyLot: 5,
      landMarking: true,
      landMarking3D: true,
      maxConcurrentUsers: 2,
    },
  },
  premium: {
    tier: "premium",
    label: "Premium",
    description: "Para imobiliárias, equipes e projetos imobiliários",
    monthlyPrice: 1697,
    yearlyPrice: 18667, // 11 meses (1 mês grátis)
    monthlyCredits: 800,
    features: {
      maxPhotosPerVideo: 20,
      videoResolution: "4K",
      videoLogo: true,
      videoTextOverlay: true,
      upscaleBasic: true,
      upscalePremium: true,
      stagingResidential: true,
      stagingCommercial: true,
      renovateProperty: true,
      sketchRender: true,
      maxBusinessTypesEmptyLot: 5,
      landMarking: true,
      landMarking3D: true,
      maxConcurrentUsers: 5,
    },
  },
};

export const PLAN_TIERS_ORDERED: PlanTier[] = ["starter", "standard", "plus", "premium"];

export function getPlanRule(tier?: string | null): PlanRule {
  if (tier && tier in PLAN_RULES) return PLAN_RULES[tier as PlanTier];
  return PLAN_RULES.starter;
}

export function canAccessFeature(tier: PlanTier, feature: keyof PlanFeatures): boolean {
  const plan = PLAN_RULES[tier];
  const value = plan.features[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR");
}

/** Calcula preço anual original (sem desconto) para mostrar riscado */
export function getOriginalYearlyPrice(tier: PlanTier): number {
  return PLAN_RULES[tier].monthlyPrice * 12;
}

/** Crédito por operação */
export const CREDIT_COSTS = {
  video_generation: 10,
  image_restoration: 3,
  upscale_basic: 1,
  upscale_premium: 2,
  renovate_property: 3,
  sketch_render: 5,
  land_marking: 3,
  land_marking_3d: 5,
  empty_lot: 5,
  creative_generation: 1,
  caption_generation: 1,
} as const;
