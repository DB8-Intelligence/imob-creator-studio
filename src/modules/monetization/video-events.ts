/**
 * video-events.ts — Structured event logging para vídeos
 *
 * Eventos:
 *   video_started   — geração iniciada
 *   video_completed — geração concluída com sucesso
 *   video_failed    — geração falhou
 *
 * Cada evento carrega metadata estruturada para analytics:
 * - generation_type, engine_id, preset, template, mood
 * - duração, resolução, fotos, custo estimado
 * - plano do usuário, workspace
 *
 * Os eventos são salvos em generation_logs via Supabase
 * e também enviados ao n8n para processamento downstream.
 */

import { supabase } from "@/integrations/supabase/client";
import type { VideoPresetId } from "@/modules/presets/types";
import type { CostEstimate } from "./cost-estimator";

// ─── Event Types ───────────────────────────────────────────────────────────

export type VideoEventType =
  | "video_started"
  | "video_completed"
  | "video_failed";

export interface VideoEventPayload {
  event: VideoEventType;
  jobId: string;
  workspaceId: string;
  userId?: string;

  // ── Marcação de uso (P1) ─────────────────────────────────────────
  generationType: "video_compose_v2";
  engineId: "ffmpeg_kenburns" | "veo_video";

  // ── Metadata do vídeo ────────────────────────────────────────────
  durationSeconds?: number;
  resolution?: string;
  templateId?: string;
  templateName?: string;
  presetId?: VideoPresetId;
  moodId?: string;
  photoCount?: number;
  format?: string;
  aspectRatio?: string;

  // ── Custo estimado (P2) ──────────────────────────────────────────
  estimatedCost?: CostEstimate;

  // ── Plano (P3) ──────────────────────────────────────────────────
  plan?: string;
  addonType?: string;
  creditsUsed?: number;
  creditsRemaining?: number;

  // ── Error info (video_failed only) ──────────────────────────────
  errorMessage?: string;
  errorType?: string;

  // ── Output (video_completed only) ───────────────────────────────
  outputUrl?: string;
  renderTimeMs?: number;
}

// ─── Log to generation_logs ────────────────────────────────────────────────

export async function logVideoEvent(payload: VideoEventPayload): Promise<void> {
  const level = payload.event === "video_failed" ? "error"
    : payload.event === "video_started" ? "info"
    : "info";

  try {
    await supabase.from("generation_logs").insert({
      job_id: payload.jobId,
      level,
      message: `[video] ${payload.event}`,
      details: {
        ...payload,
        // Flatten for easier querying
        _event: payload.event,
        _generation_type: payload.generationType,
        _engine_id: payload.engineId,
        _preset_id: payload.presetId,
        _template_id: payload.templateId,
        _duration: payload.durationSeconds,
        _resolution: payload.resolution,
        _photo_count: payload.photoCount,
        _estimated_cost: payload.estimatedCost?.estimatedCost,
        _plan: payload.plan,
      },
    });
  } catch (err) {
    // Never block video flow for logging failures
    console.warn("[video-events] Failed to log event:", payload.event, err);
  }
}

// ─── Convenience wrappers ──────────────────────────────────────────────────

export async function logVideoStarted(
  payload: Omit<VideoEventPayload, "event">
): Promise<void> {
  return logVideoEvent({ ...payload, event: "video_started" });
}

export async function logVideoCompleted(
  payload: Omit<VideoEventPayload, "event">
): Promise<void> {
  return logVideoEvent({ ...payload, event: "video_completed" });
}

export async function logVideoFailed(
  payload: Omit<VideoEventPayload, "event">
): Promise<void> {
  return logVideoEvent({ ...payload, event: "video_failed" });
}
