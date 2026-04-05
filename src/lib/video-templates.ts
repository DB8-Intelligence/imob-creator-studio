/**
 * video-templates.ts
 *
 * Templates oficiais do modulo de video do ImobCreator.
 *
 * Cada template define: narrativa visual, duracao por foto, transicao,
 * preset recomendado, limites de fotos e caso de uso ideal.
 *
 * FILOSOFIA: Fotos intocaveis. Templates controlam apenas camadas
 * (movimento, ritmo, transicao) — nunca alteram a imagem original.
 */

import type { TransitionType } from "@/lib/video-pipeline-contract";

// ─── Types ──────────────────────────────────────────────────────────────────

export type VideoTemplateId =
  | "slideshow_classico"
  | "tour_ambientes"
  | "highlight_reel";

export interface VideoTemplate {
  id: VideoTemplateId;
  name: string;
  description: string;
  /** Descricao curta para badges/cards */
  tagline: string;
  /** Duracao de cada clip em segundos */
  seconds_per_photo: number;
  /** Transicao padrao entre clips */
  default_transition: TransitionType;
  /** Duracao da transicao em segundos */
  transition_duration: number;
  /** Preset visual recomendado */
  recommended_preset: "default" | "luxury" | "fast_sales";
  /** Mood musical recomendado */
  recommended_mood: string;
  /** Quantidade minima de fotos */
  min_photos: number;
  /** Quantidade maxima recomendada de fotos */
  max_photos: number;
  /** Melhor caso de uso */
  best_for: string;
  /** Exemplos de imoveis ideais para este template */
  ideal_properties: string[];
  /** Duracao estimada do video final (com max_photos) */
  estimated_duration_label: string;
  /** Icone/emoji para exibicao */
  icon: string;
  /** Tier futuro (para extensibilidade) */
  tier: "free" | "plus" | "premium";
}

// ─── Catalogo ───────────────────────────────────────────────────────────────

export const VIDEO_TEMPLATES: Record<VideoTemplateId, VideoTemplate> = {

  slideshow_classico: {
    id: "slideshow_classico",
    name: "Slideshow Classico",
    description:
      "Apresentacao elegante e completa do imovel. Cada foto recebe atencao " +
      "individual com movimento suave e transicoes refinadas. Ideal para " +
      "mostrar todos os ambientes com calma e profissionalismo.",
    tagline: "Elegante e completo",
    seconds_per_photo: 5,
    default_transition: "dissolve",
    transition_duration: 1.0,
    recommended_preset: "default",
    recommended_mood: "moderno",
    min_photos: 6,
    max_photos: 15,
    best_for: "Apresentacao completa do imovel para Instagram Reels e portais",
    ideal_properties: [
      "Apartamentos com varios ambientes",
      "Casas com area externa",
      "Imoveis de medio padrao",
    ],
    estimated_duration_label: "30-60s",
    icon: "🎞️",
    tier: "free",
  },

  tour_ambientes: {
    id: "tour_ambientes",
    name: "Tour de Ambientes",
    description:
      "Narrativa visual que guia o espectador pelos comodos do imovel, " +
      "como se estivesse fazendo uma visita presencial. Movimentos de pan " +
      "criam a sensacao de caminhada e exploracao.",
    tagline: "Passeio pelos comodos",
    seconds_per_photo: 6,
    default_transition: "wipeleft",
    transition_duration: 0.8,
    recommended_preset: "luxury",
    recommended_mood: "luxo",
    min_photos: 8,
    max_photos: 20,
    best_for: "Imoveis premium que precisam de narrativa espacial completa",
    ideal_properties: [
      "Coberturas e penthouses",
      "Casas de alto padrao",
      "Imoveis com plantas amplas",
      "Condominios com area de lazer",
    ],
    estimated_duration_label: "45-90s",
    icon: "🏠",
    tier: "free",
  },

  highlight_reel: {
    id: "highlight_reel",
    name: "Highlight Reel",
    description:
      "Video curto e impactante mostrando apenas os melhores angulos do imovel. " +
      "Ritmo rapido, transicoes dinamicas e energia alta para capturar atencao " +
      "nos primeiros segundos do feed.",
    tagline: "Curto e impactante",
    seconds_per_photo: 3,
    default_transition: "fade",
    transition_duration: 0.5,
    recommended_preset: "fast_sales",
    recommended_mood: "moderno",
    min_photos: 4,
    max_photos: 8,
    best_for: "Captacao rapida de atencao em Reels e Stories",
    ideal_properties: [
      "Imoveis de giro rapido",
      "Studios e compactos",
      "Lancamentos com fotos de destaque",
      "Imoveis comerciais",
    ],
    estimated_duration_label: "12-20s",
    icon: "⚡",
    tier: "free",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export const VIDEO_TEMPLATE_LIST = Object.values(VIDEO_TEMPLATES);

export function getVideoTemplate(id: string): VideoTemplate {
  return VIDEO_TEMPLATES[id as VideoTemplateId] ?? VIDEO_TEMPLATES.slideshow_classico;
}

export function getDefaultVideoTemplate(): VideoTemplateId {
  return "slideshow_classico";
}

/**
 * Calcula duracao estimada do video com base no template e numero de fotos.
 */
export function estimateVideoDuration(templateId: VideoTemplateId, photoCount: number): number {
  const t = VIDEO_TEMPLATES[templateId];
  const effectivePhotos = Math.min(Math.max(photoCount, t.min_photos), t.max_photos);
  const rawDuration = effectivePhotos * t.seconds_per_photo
    - (effectivePhotos - 1) * t.transition_duration;
  return Math.round(rawDuration * 10) / 10;
}
