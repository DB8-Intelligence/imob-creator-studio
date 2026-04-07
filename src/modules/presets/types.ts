/**
 * types.ts — Entidades do Preset Engine
 *
 * Três entidades desacopladas que se compõem em um VideoPreset:
 *
 * MotionProfile   → controla Ken Burns (zoom, pan, intensidade)
 * TransitionProfile → controla transições entre cenas (tipo, duração)
 * VideoPreset     → agrupa motion + transition + texto + áudio + defaults
 *
 * DESIGN:
 * - Desacoplado do domínio (sem referência a imóvel, corretor, etc.)
 * - Compatível com FFmpeg atual (buildClipSpecs / buildFFmpegJobSpec)
 * - Preparado para Shotstack futuro (campos extensíveis via metadata)
 */

import type {
  MotionType,
  TransitionType,
  MusicMood,
  VideoAspectRatio,
} from "@/lib/video-pipeline-contract";

// ─── Motion Profile ────────────────────────────────────────────────────────

export interface MotionProfile {
  /** ID único do perfil de movimento */
  id: string;
  /** Nome de exibição */
  label: string;
  /** Descrição curta */
  description: string;
  /** Sequência de movimentos que se repete ciclicamente nos clips */
  motionSequence: MotionType[];
  /** Fator de zoom (1.0 = sem zoom, 1.3 = 30% zoom in) */
  zoomFactor: number;
  /** Velocidade do pan em pixels/frame (só para FFmpeg) */
  panSpeed: number;
  /** Intensidade perceptual: determina a "energia" visual */
  intensity: "soft" | "balanced" | "assertive";
  /** Duração padrão de cada clip em segundos */
  clipDurationSeconds: number;
}

// ─── Transition Profile ────────────────────────────────────────────────────

export interface TransitionProfile {
  /** ID único do perfil de transição */
  id: string;
  /** Nome de exibição */
  label: string;
  /** Tipo de transição FFmpeg */
  type: TransitionType;
  /** Duração da transição em segundos */
  durationSeconds: number;
  /** Easing suave ou corte seco */
  easing: "smooth" | "sharp";
}

// ─── Text Style ────────────────────────────────────────────────────────────

export interface TextStyleProfile {
  /** Tamanho da fonte para título principal */
  titleFontSize: number;
  /** Tamanho da fonte para subtítulo */
  subtitleFontSize: number;
  /** Tamanho da fonte para detalhes */
  detailsFontSize: number;
  /** Cor do texto (hex) */
  color: string;
  /** Fundo semitransparente (FFmpeg: "black@0.5") */
  background: string;
  /** Segundos antes do fim que o overlay aparece */
  overlayOffsetFromEnd: number;
}

// ─── Video Preset (entidade principal) ─────────────────────────────────────

export type VideoPresetId =
  | "luxury"
  | "corporate"
  | "fast_sales";

export interface VideoPreset {
  /** ID único do preset */
  id: VideoPresetId;
  /** Nome de exibição */
  name: string;
  /** Descrição para o usuário */
  description: string;
  /** Tagline curta para badges */
  tagline: string;
  /** Ícone/emoji */
  icon: string;

  // ── Composição de profiles ──────────────────────────────────────────

  /** Perfil de movimento (Ken Burns) */
  motion: MotionProfile;
  /** Perfil de transição */
  transition: TransitionProfile;
  /** Estilo de texto para overlays */
  textStyle: TextStyleProfile;

  // ── Defaults ────────────────────────────────────────────────────────

  /** Mood de áudio padrão */
  defaultAudioMood: MusicMood;
  /** Volume de áudio padrão (0-1) */
  defaultAudioVolume: number;
  /** Fade out em segundos */
  defaultFadeOutSeconds: number;

  // ── Compatibilidade ────────────────────────────────────────────────

  /** Aspect ratios suportados (vazio = todos) */
  supportedAspectRatios: VideoAspectRatio[];
  /** Templates recomendados (IDs de video-templates.ts) */
  recommendedTemplates: string[];
  /** Tier do preset (para future gating) */
  tier: "free" | "plus" | "premium";

  // ── Extensibilidade ────────────────────────────────────────────────

  /** Metadata livre para engines futuros (ex: Shotstack) */
  metadata?: Record<string, unknown>;
}

// ─── Preset Map Type ───────────────────────────────────────────────────────

export type VideoPresetMap = Record<VideoPresetId, VideoPreset>;
