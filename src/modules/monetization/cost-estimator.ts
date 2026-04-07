/**
 * cost-estimator.ts — Estimativa de custo por vídeo
 *
 * Calcula o estimated_cost de um vídeo com base em:
 * - Duração (segundos)
 * - Resolução (720p / 1080p / 4k)
 * - Número de fotos
 * - Preset utilizado
 *
 * IMPORTANTE: Nenhum custo é cobrado. O estimated_cost é apenas um campo
 * lógico salvo nos metadados para preparar a monetização futura.
 *
 * Fórmula base (v1):
 *   estimated_cost = base_cost + (duration_factor * duration)
 *                  + (resolution_factor) + (photo_factor * photos)
 *
 * Unidade: "créditos" (mesma unidade do video_plan_addons)
 */

import type { VideoPresetId } from "@/modules/presets/types";

// ─── Cost Factors ──────────────────────────────────────────────────────────

const BASE_COST = 50;

const DURATION_COST_PER_SECOND = 1.5;

const RESOLUTION_COST: Record<string, number> = {
  "720p": 0,
  "1080p": 20,
  "4k": 50,
};

const PHOTO_COST_PER_UNIT = 2;

const PRESET_MULTIPLIER: Record<VideoPresetId, number> = {
  luxury: 1.2,
  corporate: 1.0,
  fast_sales: 0.9,
};

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CostEstimate {
  /** Custo total estimado em créditos */
  estimatedCost: number;
  /** Breakdown dos componentes */
  breakdown: {
    baseCost: number;
    durationCost: number;
    resolutionCost: number;
    photoCost: number;
    presetMultiplier: number;
  };
  /** Versão da fórmula (para futuras mudanças) */
  formulaVersion: "v1";
}

export interface CostEstimateInput {
  durationSeconds: number;
  resolution: string;
  photoCount: number;
  presetId?: VideoPresetId;
}

// ─── Calculator ────────────────────────────────────────────────────────────

export function estimateVideoCost(input: CostEstimateInput): CostEstimate {
  const baseCost = BASE_COST;
  const durationCost = Math.round(input.durationSeconds * DURATION_COST_PER_SECOND);
  const resolutionCost = RESOLUTION_COST[input.resolution] ?? 0;
  const photoCost = input.photoCount * PHOTO_COST_PER_UNIT;
  const multiplier = PRESET_MULTIPLIER[input.presetId ?? "corporate"] ?? 1.0;

  const rawCost = baseCost + durationCost + resolutionCost + photoCost;
  const estimatedCost = Math.round(rawCost * multiplier);

  return {
    estimatedCost,
    breakdown: {
      baseCost,
      durationCost,
      resolutionCost,
      photoCost,
      presetMultiplier: multiplier,
    },
    formulaVersion: "v1",
  };
}
