/**
 * Monetization module — barrel export (DEV-32)
 *
 * Estrutura de monetização completa: vídeo, imagem, automação, publicação.
 */

// Cost estimator
export { estimateVideoCost } from "./cost-estimator";
export type { CostEstimate, CostEstimateInput } from "./cost-estimator";

// Plan flags
export {
  VIDEO_PLAN_FLAGS,
  getVideoPlanFlags,
  isEnforcementActive,
  resolveVideoPlanTier,
} from "./plan-flags";
export type { VideoPlanLevel, VideoPlanFlags } from "./plan-flags";

// Control points
export {
  checkBeforeGenerate,
  checkBeforeDownload,
  checkBeforeReuse,
  checkBeforeImageGenerate,
  checkBeforeAutomation,
  checkBeforePublish,
  checkPropertyLimit,
  checkTeamLimit,
  checkTemplateAccess,
} from "./control-points";
export type { ControlPointResult } from "./control-points";

// Event logging
export {
  logVideoEvent,
  logVideoStarted,
  logVideoCompleted,
  logVideoFailed,
} from "./video-events";
export type { VideoEventType, VideoEventPayload } from "./video-events";
