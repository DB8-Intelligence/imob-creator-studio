/**
 * Preset Engine — barrel export
 *
 * Usage:
 *   import { getVideoPreset, buildJobSpecFromPreset } from "@/modules/presets";
 */

// Types
export type {
  VideoPreset,
  VideoPresetId,
  VideoPresetMap,
  MotionProfile,
  TransitionProfile,
  TextStyleProfile,
} from "./types";

// Catalog
export {
  VIDEO_PRESETS,
  VIDEO_PRESET_LIST,
  VIDEO_PRESET_IDS,
  getVideoPreset,
  getDefaultVideoPresetId,
} from "./catalog";

// Resolver & builders
export {
  resolvePreset,
  resolveLegacyPresetId,
  buildClipsFromPreset,
  buildTransitionFromPreset,
  buildAudioFromPreset,
  buildOverlaysFromPreset,
  computeTotalDuration,
  buildJobSpecFromPreset,
  resolvePresetForTemplate,
  resolveForShotstack,
} from "./resolver";
export type { BuildJobSpecParams } from "./resolver";
