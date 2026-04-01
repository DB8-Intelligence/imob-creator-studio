import type { VideoPlanTier } from "@/types/video";
import { PLAN_RULES, type PlanTier } from "@/lib/plan-rules";

export type EffectiveVideoPlanTier = VideoPlanTier;

export interface VideoPlanRule {
  tier: EffectiveVideoPlanTier;
  label: string;
  maxUploadImages: number;
  maxRenderedSegments: number;
  secondsPerImage: number;
  maxDurationSeconds: number;
  resolution: string;
  monthlyCredits: number;
  creditCostPerVideo: number;
}

export const VIDEO_PLAN_RULES: Record<EffectiveVideoPlanTier, VideoPlanRule> = {
  standard: {
    tier: "standard",
    label: "Standard",
    maxUploadImages: PLAN_RULES.standard.features.maxPhotosPerVideo,
    maxRenderedSegments: PLAN_RULES.standard.features.maxPhotosPerVideo,
    secondsPerImage: 5,
    maxDurationSeconds: PLAN_RULES.standard.features.maxPhotosPerVideo * 5,
    resolution: PLAN_RULES.standard.features.videoResolution,
    monthlyCredits: PLAN_RULES.standard.monthlyCredits,
    creditCostPerVideo: 100,
  },
  plus: {
    tier: "plus",
    label: "Plus",
    maxUploadImages: PLAN_RULES.plus.features.maxPhotosPerVideo,
    maxRenderedSegments: PLAN_RULES.plus.features.maxPhotosPerVideo,
    secondsPerImage: 5,
    maxDurationSeconds: PLAN_RULES.plus.features.maxPhotosPerVideo * 5,
    resolution: PLAN_RULES.plus.features.videoResolution,
    monthlyCredits: PLAN_RULES.plus.monthlyCredits,
    creditCostPerVideo: 100,
  },
  premium: {
    tier: "premium",
    label: "Premium",
    maxUploadImages: PLAN_RULES.premium.features.maxPhotosPerVideo,
    maxRenderedSegments: 18,
    secondsPerImage: 5,
    maxDurationSeconds: 90,
    resolution: PLAN_RULES.premium.features.videoResolution,
    monthlyCredits: PLAN_RULES.premium.monthlyCredits,
    creditCostPerVideo: 200,
  },
};

/** Maps the central PlanTier to the video-specific tier */
export function planTierToVideoTier(planTier: PlanTier): EffectiveVideoPlanTier {
  if (planTier === "starter") return "standard"; // Starter uses standard video rules
  if (planTier === "plus" || planTier === "premium") return planTier;
  return "standard";
}

export function resolveVideoPlanTier(input?: string | null): EffectiveVideoPlanTier {
  if (input === "premium" || input === "plus" || input === "standard") return input;
  return "standard";
}

export function getVideoPlanRule(input?: string | null): VideoPlanRule {
  return VIDEO_PLAN_RULES[resolveVideoPlanTier(input)];
}

export function getRenderedSegmentsCount(imagesCount: number, input?: string | null): number {
  const rule = getVideoPlanRule(input);
  return Math.min(Math.max(imagesCount, 0), rule.maxRenderedSegments);
}

export function getComputedDurationSeconds(imagesCount: number, input?: string | null): number {
  const rule = getVideoPlanRule(input);
  return Math.min(getRenderedSegmentsCount(imagesCount, input) * rule.secondsPerImage, rule.maxDurationSeconds);
}

export function getUploadSummary(imagesCount: number, input?: string | null) {
  const rule = getVideoPlanRule(input);
  const renderedSegments = getRenderedSegmentsCount(imagesCount, input);
  const computedDurationSeconds = getComputedDurationSeconds(imagesCount, input);
  const ignoredImages = Math.max(imagesCount - renderedSegments, 0);

  return {
    rule,
    renderedSegments,
    computedDurationSeconds,
    ignoredImages,
    hasOptimization: ignoredImages > 0,
  };
}
