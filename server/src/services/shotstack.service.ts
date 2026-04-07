/**
 * shotstack.service.ts — Shotstack render API (composição de imagem estática)
 *
 * POST /render → polling → URL do criativo renderizado
 * Ou via webhook para produção.
 */
import axios from 'axios';
import type { PipelineVars } from './types.js';
import { interpolateDeep } from './variable-resolver.service.js';

const SHOTSTACK_API = 'https://api.shotstack.io/edit/v1';
const API_KEY = process.env.SHOTSTACK_API_KEY ?? '';
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

const SIZES: Record<string, { width: number; height: number }> = {
  post:     { width: 1080, height: 1350 },
  story:    { width: 1080, height: 1920 },
  reels:    { width: 1080, height: 1920 },
  quadrado: { width: 1080, height: 1080 },
  paisagem: { width: 1920, height: 1080 },
};

/** Monta JSON Shotstack a partir de template + vars, envia para render */
export function buildShotstackJson(
  shotstackTemplate: Record<string, unknown>,
  vars: PipelineVars
): Record<string, unknown> {
  const interpolated = interpolateDeep(shotstackTemplate, vars) as Record<string, unknown>;

  const size = SIZES[vars.formato] ?? SIZES.post;

  interpolated.output = {
    format: 'jpg',
    quality: 'high',
    size,
  };

  return interpolated;
}

/** Submete render ao Shotstack. Retorna render_id. */
export async function renderCreative(templateJson: Record<string, unknown>): Promise<string> {
  const response = await axios.post(
    `${SHOTSTACK_API}/render`,
    templateJson,
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.response.id;
}

/** Submete render com callback webhook. */
export async function renderWithWebhook(
  templateJson: Record<string, unknown>,
  jobId: string,
  formato: string
): Promise<string> {
  const callbackUrl = `${API_BASE_URL}/api/webhooks/shotstack?jobId=${jobId}&formato=${formato}`;

  const payload = {
    ...templateJson,
    callback: callbackUrl,
  };

  const response = await axios.post(
    `${SHOTSTACK_API}/render`,
    payload,
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.response.id;
}

/** Polling de render (fallback quando webhook não disponível). */
export async function pollRender(renderId: string): Promise<string> {
  const maxAttempts = 30;
  const intervalMs = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const response = await axios.get(
      `${SHOTSTACK_API}/render/${renderId}`,
      { headers: { 'x-api-key': API_KEY } }
    );

    const status = response.data.response.status;

    if (status === 'done') {
      return response.data.response.url;
    }

    if (status === 'failed') {
      throw new Error(`Shotstack render failed: ${renderId}`);
    }
  }

  throw new Error(`Render timeout: ${renderId}`);
}
