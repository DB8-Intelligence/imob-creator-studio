/**
 * catalog.ts — Catálogo de VideoPresets do ImobCreator
 *
 * Três presets iniciais:
 *  luxury      → elegante, lento, dissolve, piano/cordas
 *  corporate   → profissional, clean, fade, beat inspiracional
 *  fast_sales  → dinâmico, rápido, fade curto, lofi chill
 *
 * Cada preset define completamente como um vídeo se comporta:
 * movimento, transição, texto, áudio, defaults.
 *
 * FILOSOFIA: presets controlam camadas — fotos intocáveis.
 */

import type { VideoPreset, VideoPresetMap, VideoPresetId } from "./types";

// ─── Presets ───────────────────────────────────────────────────────────────

export const VIDEO_PRESETS: VideoPresetMap = {

  // ── Luxury ──────────────────────────────────────────────────────────────
  luxury: {
    id: "luxury",
    name: "Luxury",
    description:
      "Movimentos lentos e elegantes com dissolve suave entre cenas. " +
      "Transmite sofisticação e exclusividade. Ideal para imóveis de alto padrão, " +
      "coberturas e penthouses.",
    tagline: "Elegante e cinematográfico",
    icon: "✨",

    motion: {
      id: "motion_luxury",
      label: "Luxury Motion",
      description: "Zoom suave e pan lento — movimentos cinematográficos",
      motionSequence: ["zoom_in", "zoom_out", "pan_right", "zoom_in", "pan_left", "zoom_out"],
      zoomFactor: 1.10,
      panSpeed: 1.5,
      intensity: "soft",
      clipDurationSeconds: 6,
    },

    transition: {
      id: "transition_luxury",
      label: "Dissolve Elegante",
      type: "dissolve",
      durationSeconds: 1.0,
      easing: "smooth",
    },

    textStyle: {
      titleFontSize: 48,
      subtitleFontSize: 36,
      detailsFontSize: 28,
      color: "#FFFFFF",
      background: "black@0.5",
      overlayOffsetFromEnd: 6,
    },

    defaultAudioMood: "luxury",
    defaultAudioVolume: 0.25,
    defaultFadeOutSeconds: 3,

    supportedAspectRatios: ["9:16", "1:1", "16:9"],
    recommendedTemplates: ["tour_ambientes", "slideshow_classico"],
    tier: "free",

    metadata: {
      shotstack_style: "cinematic_slow",
      color_grade: "warm_gold",
    },
  },

  // ── Corporate ───────────────────────────────────────────────────────────
  corporate: {
    id: "corporate",
    name: "Corporativo",
    description:
      "Ritmo balanceado com transições limpas. Transmite confiança e " +
      "profissionalismo. Ideal para salas comerciais, galpões, imobiliárias " +
      "e apresentações institucionais.",
    tagline: "Profissional e confiável",
    icon: "💼",

    motion: {
      id: "motion_corporate",
      label: "Corporate Motion",
      description: "Mistura equilibrada de zoom e pan — versatilidade profissional",
      motionSequence: ["zoom_in", "pan_right", "zoom_out", "pan_left", "zoom_in", "pan_up"],
      zoomFactor: 1.15,
      panSpeed: 2.0,
      intensity: "balanced",
      clipDurationSeconds: 5,
    },

    transition: {
      id: "transition_corporate",
      label: "Fade Limpo",
      type: "fade",
      durationSeconds: 0.8,
      easing: "smooth",
    },

    textStyle: {
      titleFontSize: 42,
      subtitleFontSize: 32,
      detailsFontSize: 28,
      color: "#FFFFFF",
      background: "black@0.6",
      overlayOffsetFromEnd: 5,
    },

    defaultAudioMood: "energetic",
    defaultAudioVolume: 0.30,
    defaultFadeOutSeconds: 2,

    supportedAspectRatios: ["9:16", "1:1", "16:9"],
    recommendedTemplates: ["slideshow_classico", "highlight_reel"],
    tier: "free",

    metadata: {
      shotstack_style: "corporate_clean",
      color_grade: "neutral",
    },
  },

  // ── Fast Sales ──────────────────────────────────────────────────────────
  fast_sales: {
    id: "fast_sales",
    name: "Dinâmico",
    description:
      "Ritmo rápido e assertivo com zoom intenso e cortes curtos. " +
      "Captura atenção nos primeiros segundos. Focado em conversão e " +
      "estoque de giro rápido.",
    tagline: "Rápido e comercial",
    icon: "⚡",

    motion: {
      id: "motion_fast_sales",
      label: "Fast Sales Motion",
      description: "Zoom assertivo e pan rápido — energia e conversão",
      motionSequence: ["zoom_in", "pan_left", "zoom_out", "pan_right", "zoom_in", "pan_down"],
      zoomFactor: 1.25,
      panSpeed: 3.0,
      intensity: "assertive",
      clipDurationSeconds: 4,
    },

    transition: {
      id: "transition_fast_sales",
      label: "Fade Curto",
      type: "fade",
      durationSeconds: 0.5,
      easing: "sharp",
    },

    textStyle: {
      titleFontSize: 46,
      subtitleFontSize: 34,
      detailsFontSize: 30,
      color: "#FFFFFF",
      background: "black@0.7",
      overlayOffsetFromEnd: 4,
    },

    defaultAudioMood: "modern",
    defaultAudioVolume: 0.35,
    defaultFadeOutSeconds: 1.5,

    supportedAspectRatios: ["9:16", "1:1", "16:9"],
    recommendedTemplates: ["highlight_reel"],
    tier: "free",

    metadata: {
      shotstack_style: "dynamic_fast",
      color_grade: "high_contrast",
    },
  },
};

// ─── Accessors ─────────────────────────────────────────────────────────────

export const VIDEO_PRESET_LIST = Object.values(VIDEO_PRESETS);

export function getVideoPreset(id: string): VideoPreset {
  return VIDEO_PRESETS[id as VideoPresetId] ?? VIDEO_PRESETS.corporate;
}

export function getDefaultVideoPresetId(): VideoPresetId {
  return "corporate";
}

/** IDs disponíveis para iteração em UI */
export const VIDEO_PRESET_IDS: VideoPresetId[] = ["luxury", "corporate", "fast_sales"];
