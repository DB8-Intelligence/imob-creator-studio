/**
 * resolver.ts — Preset Resolver & FFmpeg Spec Builder
 *
 * Converte um VideoPreset em:
 * 1. FFmpegClipSpec[] — clips com Ken Burns individuais
 * 2. TransitionConfig — transição entre cenas
 * 3. AudioConfig — config de áudio do preset
 * 4. TextOverlay[] — overlays baseados no textStyle do preset
 * 5. FFmpegJobSpec completo — pronto para enviar ao backend
 *
 * DESIGN:
 * - Substitui os builders inline de video-pipeline-contract.ts
 * - Mantém backward compat: aceita preset ID string OU VideoPreset object
 * - Preparado para Shotstack: exporta resolveForShotstack (stub)
 */

import type {
  FFmpegClipSpec,
  FFmpegJobSpec,
  TransitionConfig,
  AudioConfig,
  TextOverlay,
  OutputConfig,
  PropertyOverlayData,
  VideoAspectRatio,
  VideoResolution,
  MusicMood,
} from "@/lib/video-pipeline-contract";
import type { VideoPreset, VideoPresetId } from "./types";
import { getVideoPreset } from "./catalog";

// ─── Resolve preset (string ID or object) ──────────────────────────────────

export function resolvePreset(presetOrId: string | VideoPreset): VideoPreset {
  if (typeof presetOrId === "string") {
    return getVideoPreset(presetOrId);
  }
  return presetOrId;
}

// ─── Legacy ID mapping ─────────────────────────────────────────────────────
// Maps old visual preset IDs and style names to new preset engine IDs

const LEGACY_MAP: Record<string, VideoPresetId> = {
  // Old VisualPresetId values
  default: "corporate",
  luxury: "luxury",
  fast_sales: "fast_sales",
  // Old style names from VideoCreatorPage
  cinematic: "corporate",
  moderno: "fast_sales",
  drone: "corporate",
  walkthrough: "luxury",
};

export function resolveLegacyPresetId(legacyId: string): VideoPresetId {
  return LEGACY_MAP[legacyId] ?? "corporate";
}

// ─── Build clip specs from preset ──────────────────────────────────────────

export function buildClipsFromPreset(
  photoUrls: string[],
  preset: VideoPreset,
): FFmpegClipSpec[] {
  const { motion } = preset;

  return photoUrls.map((url, i) => ({
    photo_url: url,
    sequence_index: i,
    ken_burns: {
      motion: motion.motionSequence[i % motion.motionSequence.length],
      zoom_factor: motion.zoomFactor,
      duration_seconds: motion.clipDurationSeconds,
    },
  }));
}

// ─── Build transition config from preset ───────────────────────────────────

export function buildTransitionFromPreset(preset: VideoPreset): TransitionConfig {
  return {
    type: preset.transition.type,
    duration_seconds: preset.transition.durationSeconds,
  };
}

// ─── Build audio config from preset ────────────────────────────────────────

export function buildAudioFromPreset(
  preset: VideoPreset,
  overrideMood?: MusicMood,
  overrideVolume?: number,
): AudioConfig {
  return {
    mood: overrideMood ?? preset.defaultAudioMood,
    volume: overrideVolume ?? preset.defaultAudioVolume,
    fade_out_seconds: preset.defaultFadeOutSeconds,
  };
}

// ─── Build text overlays from preset + property data ───────────────────────

export function buildOverlaysFromPreset(
  preset: VideoPreset,
  property: PropertyOverlayData | undefined,
  totalDuration: number,
): TextOverlay[] {
  if (!property) return [];

  const { textStyle } = preset;
  const overlays: TextOverlay[] = [];
  const overlayStart = Math.max(totalDuration - textStyle.overlayOffsetFromEnd, 0);
  const overlayEnd = totalDuration;

  if (property.address) {
    overlays.push({
      text: property.address,
      position: "bottom_safe",
      font_size: textStyle.titleFontSize,
      color: textStyle.color,
      background: textStyle.background,
      margin_bottom: 120,
      start_time: overlayStart,
      end_time: overlayEnd,
    });
  }

  if (property.price) {
    overlays.push({
      text: property.price,
      position: "center",
      font_size: textStyle.subtitleFontSize + 14, // price stands out more
      color: textStyle.color,
      background: textStyle.background,
      start_time: overlayStart,
      end_time: overlayEnd,
    });
  }

  if (property.details) {
    overlays.push({
      text: property.details,
      position: "top",
      font_size: textStyle.detailsFontSize,
      color: textStyle.color,
      background: textStyle.background,
      start_time: overlayStart + 0.5,
      end_time: overlayEnd,
    });
  }

  return overlays;
}

// ─── Compute total duration from preset ────────────────────────────────────

export function computeTotalDuration(
  clipCount: number,
  preset: VideoPreset,
): number {
  const clipDuration = preset.motion.clipDurationSeconds;
  const transitionDuration = preset.transition.durationSeconds;
  return clipCount * clipDuration - Math.max(clipCount - 1, 0) * transitionDuration;
}

// ─── Build complete FFmpegJobSpec ──────────────────────────────────────────

export interface BuildJobSpecParams {
  presetOrId: string | VideoPreset;
  photoUrls: string[];
  jobId: string;
  userId: string;
  workspaceId: string;
  callbackUrl: string;
  resolution: VideoResolution;
  aspectRatio: VideoAspectRatio;
  property?: PropertyOverlayData;
  audioMoodOverride?: MusicMood;
  audioVolumeOverride?: number;
}

export function buildJobSpecFromPreset(params: BuildJobSpecParams): FFmpegJobSpec {
  const preset = resolvePreset(params.presetOrId);

  const clips = buildClipsFromPreset(params.photoUrls, preset);
  const transition = buildTransitionFromPreset(preset);
  const totalDuration = computeTotalDuration(clips.length, preset);
  const overlays = buildOverlaysFromPreset(preset, params.property, totalDuration);
  const audio = buildAudioFromPreset(preset, params.audioMoodOverride, params.audioVolumeOverride);

  const output: OutputConfig = {
    resolution: params.resolution,
    aspect_ratio: params.aspectRatio,
    fps: 30,
    codec: "h264",
    format: "mp4",
  };

  return {
    job_id: params.jobId,
    user_id: params.userId,
    workspace_id: params.workspaceId,
    clips,
    transition,
    overlays,
    audio,
    output,
    callback_url: params.callbackUrl,
  };
}

// ─── Template + Preset + OutputType mapping ────────────────────────────────

export interface PresetTemplateMapping {
  presetId: VideoPresetId;
  templateId: string;
  outputFormat: "reels" | "feed" | "youtube";
}

/**
 * Resolve o preset recomendado para um dado template + formato.
 * Usa a lista recommendedTemplates do preset como hint.
 * Fallback: corporate.
 */
export function resolvePresetForTemplate(
  templateId: string,
  outputFormat?: string,
): VideoPresetId {
  // Highlight reel → fast_sales (short/dynamic)
  if (templateId === "highlight_reel") return "fast_sales";
  // Tour ambientes → luxury (slow/elegant)
  if (templateId === "tour_ambientes") return "luxury";
  // Slideshow classico → corporate (balanced) unless YouTube
  if (templateId === "slideshow_classico") {
    return outputFormat === "youtube" ? "corporate" : "corporate";
  }
  return "corporate";
}

// ─── Shotstack stub (future engine) ────────────────────────────────────────

/**
 * Placeholder for future Shotstack integration.
 * Will convert VideoPreset into Shotstack Edit JSON.
 */
export function resolveForShotstack(
  preset: VideoPreset,
  _photoUrls: string[],
): Record<string, unknown> {
  return {
    _engine: "shotstack",
    _presetId: preset.id,
    _style: preset.metadata?.shotstack_style ?? "default",
    _status: "not_implemented",
  };
}
