import type { VideoPlanTier } from "@/types/video";

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
    maxUploadImages: 10,
    maxRenderedSegments: 10,
    secondsPerImage: 5,
    maxDurationSeconds: 50,
    resolution: "720p",
    monthlyCredits: 300,
    creditCostPerVideo: 100,
  },
  plus: {
    tier: "plus",
    label: "Plus",
    maxUploadImages: 15,
    maxRenderedSegments: 15,
    secondsPerImage: 5,
    maxDurationSeconds: 75,
    resolution: "1080p Full HD",
    monthlyCredits: 600,
    creditCostPerVideo: 100,
  },
  premium: {
    tier: "premium",
    label: "Premium",
    maxUploadImages: 20,
    maxRenderedSegments: 18,
    secondsPerImage: 5,
    maxDurationSeconds: 90,
    resolution: "4K Ultra HD",
    monthlyCredits: 800,
    creditCostPerVideo: 200,
  },
};

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
