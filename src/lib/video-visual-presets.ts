/**
 * video-visual-presets.ts
 *
 * Presets visuais do modulo de video do ImobCreator.
 *
 * Cada preset define o "estilo cinematografico" do video:
 * como a camera se move, qual o ritmo, qual a intensidade.
 *
 * FILOSOFIA: Presets controlam apenas MOVIMENTO e RITMO.
 * Nenhum preset altera cor, exposicao ou textura da foto original.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type VisualPresetId = "default" | "luxury" | "fast_sales";

export interface VisualPreset {
  id: VisualPresetId;
  name: string;
  description: string;
  /** Sensacao que o usuario deve esperar */
  feeling: string;
  /** Tipos de movimento aplicados */
  motion_types: string[];
  /** Intensidade do zoom (1.0 = sem zoom) */
  zoom_factor: number;
  /** Velocidade do pan (px/frame no FFmpeg) */
  pan_speed: number;
  /** Duracao padrao do clip (segundos) */
  clip_duration: number;
  /** Tipo de transicao preferido */
  transition_type: string;
  /** Duracao da transicao (segundos) */
  transition_duration: number;
  /** Ritmo geral */
  rhythm: "suave" | "equilibrado" | "dinamico";
  /** Melhor combinacao com template */
  best_with_templates: string[];
  /** Icone para exibicao */
  icon: string;
}

// ─── Catalogo ───────────────────────────────────────────────────────────────

export const VISUAL_PRESETS: Record<VisualPresetId, VisualPreset> = {

  default: {
    id: "default",
    name: "Equilibrado",
    description:
      "Mistura balanceada de zoom e pan. Ritmo confortavel que funciona " +
      "para qualquer tipo de imovel. Escolha segura para publicacao recorrente.",
    feeling: "Profissional e versatil",
    motion_types: ["zoom_in", "zoom_out", "pan_right", "pan_left", "pan_up"],
    zoom_factor: 1.15,
    pan_speed: 2,
    clip_duration: 5,
    transition_type: "fade",
    transition_duration: 0.8,
    rhythm: "equilibrado",
    best_with_templates: ["slideshow_classico", "highlight_reel"],
    icon: "🎯",
  },

  luxury: {
    id: "luxury",
    name: "Luxury",
    description:
      "Movimentos lentos e elegantes. Zoom suave e dissolve entre cenas. " +
      "Transmite sofisticacao e exclusividade — ideal para imoveis de alto padrao.",
    feeling: "Elegante e cinematografico",
    motion_types: ["zoom_in", "zoom_out", "pan_right", "pan_left"],
    zoom_factor: 1.10,
    pan_speed: 1.5,
    clip_duration: 6,
    transition_type: "dissolve",
    transition_duration: 1.0,
    rhythm: "suave",
    best_with_templates: ["tour_ambientes", "slideshow_classico"],
    icon: "✨",
  },

  fast_sales: {
    id: "fast_sales",
    name: "Dinamico",
    description:
      "Ritmo mais rapido e assertivo. Zoom intenso e transicoes curtas " +
      "para capturar atencao nos primeiros segundos. Focado em conversao.",
    feeling: "Rapido e comercial",
    motion_types: ["zoom_in", "zoom_out", "pan_left", "pan_right", "pan_down"],
    zoom_factor: 1.25,
    pan_speed: 3,
    clip_duration: 4,
    transition_type: "fade",
    transition_duration: 0.5,
    rhythm: "dinamico",
    best_with_templates: ["highlight_reel"],
    icon: "⚡",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export const VISUAL_PRESET_LIST = Object.values(VISUAL_PRESETS);

export function getVisualPreset(id: string): VisualPreset {
  return VISUAL_PRESETS[id as VisualPresetId] ?? VISUAL_PRESETS.default;
}

export function getDefaultVisualPreset(): VisualPresetId {
  return "default";
}

/**
 * Mapeia o style legado do frontend para o preset visual.
 * Usado para compatibilidade com o VideoCreatorPage existente.
 */
export function styleToPresetId(style: string): VisualPresetId {
  switch (style) {
    case "luxury":      return "luxury";
    case "moderno":     return "fast_sales";
    case "fast_sales":  return "fast_sales";
    case "cinematic":   return "default";
    case "drone":       return "default";
    case "walkthrough": return "luxury";
    default:            return "default";
  }
}
