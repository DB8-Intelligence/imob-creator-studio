export type VideoMotionPreset = "motion_preset_default" | "motion_preset_luxury" | "motion_preset_fast_sales";

export interface VideoMotionPresetConfig {
  id: VideoMotionPreset;
  label: string;
  description: string;
  motionTypes: Array<"PAN" | "ZOOM_IN" | "ZOOM_OUT">;
  motionIntensity: "soft" | "balanced" | "assertive";
  rhythm: "smooth" | "elegant" | "fast";
  bestFor: string;
}

export const VIDEO_MOTION_PRESETS: Record<VideoMotionPreset, VideoMotionPresetConfig> = {
  motion_preset_default: {
    id: "motion_preset_default",
    label: "Default",
    description: "Mistura equilibrada de PAN, ZOOM IN e ZOOM OUT para uso geral.",
    motionTypes: ["PAN", "ZOOM_IN", "ZOOM_OUT"],
    motionIntensity: "balanced",
    rhythm: "smooth",
    bestFor: "uso geral e publicação recorrente",
  },
  motion_preset_luxury: {
    id: "motion_preset_luxury",
    label: "Luxury",
    description: "Movimentos mais elegantes e cinematográficos para imóveis premium.",
    motionTypes: ["PAN", "ZOOM_IN", "ZOOM_OUT"],
    motionIntensity: "soft",
    rhythm: "elegant",
    bestFor: "imóveis premium e alto padrão",
  },
  motion_preset_fast_sales: {
    id: "motion_preset_fast_sales",
    label: "Fast Sales",
    description: "Ritmo mais assertivo para vídeos focados em atenção rápida e conversão.",
    motionTypes: ["PAN", "ZOOM_IN", "ZOOM_OUT"],
    motionIntensity: "assertive",
    rhythm: "fast",
    bestFor: "estoque de giro rápido e criativos de conversão",
  },
};

export function getDefaultVideoMotionPreset(): VideoMotionPreset {
  return "motion_preset_default";
}

export function getVideoMotionPresetConfig(preset?: string | null): VideoMotionPresetConfig {
  const resolved = (preset ?? getDefaultVideoMotionPreset()) as VideoMotionPreset;
  return VIDEO_MOTION_PRESETS[resolved] ?? VIDEO_MOTION_PRESETS.motion_preset_default;
}
