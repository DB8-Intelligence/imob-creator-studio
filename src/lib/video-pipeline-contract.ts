/**
 * video-pipeline-contract.ts
 *
 * Contrato padrao para o pipeline de video v2 do ImobCreator.
 *
 * FILOSOFIA: As fotos sao intocaveis. O pipeline aplica apenas camadas
 * (movimento, transicao, texto, musica) sobre as imagens originais.
 *
 * Este modulo define:
 * - VideoGenerationV2Request  (frontend -> edge function)
 * - VideoGenerationV2Response (edge function -> frontend)
 * - FFmpegJobSpec             (edge function -> backend FFmpeg)
 * - FFmpegJobResult           (backend -> callback)
 */

// ─── Engine Selection ───────────────────────────────────────────────────────

/**
 * VideoEngineId — discriminante de engine de video.
 *
 * "ffmpeg_kenburns" = pipeline FFmpeg (Ken Burns + xfade + drawtext + audio)
 *                     DEFAULT — fotos intocaveis, composicao pura
 *
 * "veo_video"       = Veo 3.1 (Gemini) — IA generativa de video
 *                     OPCIONAL — nao padrao, disponivel para experimentacao
 */
export type VideoEngineId = "ffmpeg_kenburns" | "veo_video";

export const DEFAULT_VIDEO_ENGINE: VideoEngineId = "ffmpeg_kenburns";

// ─── Motion Presets ─────────────────────────────────────────────────────────

export type MotionType = "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "pan_up" | "pan_down";

export type TransitionType = "fade" | "dissolve" | "wipeleft" | "wiperight" | "slideup" | "slidedown";

export interface KenBurnsConfig {
  /** Tipo de movimento para este clip */
  motion: MotionType;
  /** Intensidade do zoom: 1.0 = sem zoom, 1.3 = 30% zoom */
  zoom_factor: number;
  /** Duracao do clip em segundos */
  duration_seconds: number;
}

export interface TransitionConfig {
  type: TransitionType;
  /** Duracao da transicao em segundos (tipicamente 0.5-1.0) */
  duration_seconds: number;
}

// ─── Overlay / Texto ────────────────────────────────────────────────────────

/**
 * Safe zone: Instagram Reels tem ~120px de UI na parte inferior.
 * "bottom_safe" posiciona o texto acima dessa zona.
 */
export type OverlayPosition = "top" | "center" | "bottom_safe";

export interface TextOverlay {
  /** Texto a renderizar */
  text: string;
  /** Posicao vertical: top, center, bottom_safe (safe = acima da UI do Instagram) */
  position: OverlayPosition;
  /** Tamanho da fonte */
  font_size: number;
  /** Cor hex */
  color: string;
  /** Fundo semitransparente (ex: "black@0.5") */
  background?: string;
  /** Margem inferior extra em pixels (safe zone = 120px para Reels) */
  margin_bottom?: number;
  /** Quando aparece no video (segundos) */
  start_time: number;
  /** Quando desaparece (segundos) */
  end_time: number;
}

export interface PropertyOverlayData {
  /** Endereco do imovel */
  address?: string;
  /** Preco formatado (ex: "R$ 450.000") */
  price?: string;
  /** Detalhes curtos (ex: "3 quartos | 2 vagas | 120m2") */
  details?: string;
  /** Nome do corretor */
  broker_name?: string;
  /** Telefone do corretor */
  broker_phone?: string;
  /** Logo URL (para overlay final) */
  logo_url?: string;
}

// ─── Audio / Musica ─────────────────────────────────────────────────────────

export type MusicMood = "luxury" | "modern" | "warm" | "energetic" | "calm";

export interface AudioConfig {
  /** Mood da musica — o backend seleciona a trilha */
  mood: MusicMood;
  /** Volume da musica (0.0 a 1.0) */
  volume: number;
  /** Fade out nos ultimos N segundos */
  fade_out_seconds: number;
}

// ─── Output ─────────────────────────────────────────────────────────────────

export type VideoResolution = "720p" | "1080p" | "4k";
export type VideoAspectRatio = "9:16" | "1:1" | "16:9";

export interface OutputConfig {
  /** Resolucao: 720p, 1080p, 4k */
  resolution: VideoResolution;
  /** Aspect ratio: 9:16 (Reels), 1:1 (Feed), 16:9 (YouTube) */
  aspect_ratio: VideoAspectRatio;
  /** FPS (padrao 30) */
  fps: number;
  /** Codec (padrao h264) */
  codec: "h264" | "h265";
  /** Formato container */
  format: "mp4";
}

/** Dimensoes de pixel derivadas de resolution + aspect_ratio */
export const RESOLUTION_MAP: Record<VideoResolution, Record<VideoAspectRatio, { width: number; height: number }>> = {
  "720p": {
    "9:16": { width: 720, height: 1280 },
    "1:1":  { width: 720, height: 720 },
    "16:9": { width: 1280, height: 720 },
  },
  "1080p": {
    "9:16": { width: 1080, height: 1920 },
    "1:1":  { width: 1080, height: 1080 },
    "16:9": { width: 1920, height: 1080 },
  },
  "4k": {
    "9:16": { width: 2160, height: 3840 },
    "1:1":  { width: 2160, height: 2160 },
    "16:9": { width: 3840, height: 2160 },
  },
};

// ─── Requests & Responses ───────────────────────────────────────────────────

/**
 * Frontend -> generate-video-v2 edge function
 */
export interface VideoGenerationV2Request {
  workspace_id: string;
  video_job_id: string;
  /** URLs publicas das fotos (ja no Supabase Storage) */
  photo_urls: string[];
  /** Estilo do preset de movimento */
  motion_preset: "default" | "luxury" | "fast_sales";
  /** Aspect ratio desejado */
  aspect_ratio: VideoAspectRatio;
  /** Resolucao */
  resolution: VideoResolution;
  /** Dados do imovel para overlay de texto */
  property?: PropertyOverlayData;
  /** Config de audio */
  audio?: {
    mood: MusicMood;
    volume?: number;
  };
  /** Tier do plano (determina limites) */
  plan_tier: "standard" | "plus" | "premium";
}

/**
 * generate-video-v2 -> Frontend (resposta imediata, async)
 */
export interface VideoGenerationV2Response {
  job_id: string;
  status: "pending" | "processing" | "done" | "error";
  /** Presente quando status = done */
  video_url?: string;
  /** Metadata de render */
  render_metadata?: {
    total_clips: number;
    total_duration_seconds: number;
    resolution: string;
    render_time_ms?: number;
  };
  error_message?: string;
}

// ─── FFmpeg Backend Spec ────────────────────────────────────────────────────

/**
 * Payload que a edge function envia ao backend FFmpeg (db8-engine /generate-video/v2)
 *
 * O backend recebe este JSON e:
 * 1. Baixa as fotos
 * 2. Executa FFmpeg pipeline em 2 passes
 * 3. Faz upload do video final
 * 4. Chama generation-callback com o resultado
 */
export interface FFmpegJobSpec {
  /** ID do job no Supabase */
  job_id: string;
  user_id: string;
  workspace_id: string;

  /** Lista de fotos com instrucoes individuais de movimento */
  clips: FFmpegClipSpec[];

  /** Transicao entre clips */
  transition: TransitionConfig;

  /** Overlays de texto */
  overlays: TextOverlay[];

  /** Config de audio */
  audio: AudioConfig;

  /** Config de saida */
  output: OutputConfig;

  /** URL de callback para resultado */
  callback_url: string;
}

export interface FFmpegClipSpec {
  /** URL publica da foto */
  photo_url: string;
  /** Indice na sequencia */
  sequence_index: number;
  /** Config de movimento Ken Burns */
  ken_burns: KenBurnsConfig;
}

/**
 * Resultado que o backend FFmpeg envia para generation-callback
 */
export interface FFmpegJobResult {
  job_id: string;
  status: "done" | "error";
  /** URL publica do video final (ja uploaded) */
  video_url?: string;
  /** Tempo de render em ms */
  render_time_ms?: number;
  /** Total de clips processados */
  clips_rendered?: number;
  /** Duracao final em segundos */
  duration_seconds?: number;
  error_message?: string;
}

// ─── Preset Builders ────────────────────────────────────────────────────────
//
// NOTA: Os builders abaixo agora delegam ao Preset Engine (src/modules/presets).
// As funções originais são mantidas como wrappers de backward compatibility
// para edge functions e código legado que ainda usam a assinatura antiga.

import {
  resolvePreset,
  resolveLegacyPresetId,
  buildClipsFromPreset,
  buildOverlaysFromPreset,
  buildJobSpecFromPreset,
  computeTotalDuration,
} from "@/modules/presets";

/**
 * Gera specs de clip com base no preset de movimento.
 * @deprecated Use buildClipsFromPreset() do módulo presets.
 */
export function buildClipSpecs(
  photoUrls: string[],
  preset: "default" | "luxury" | "fast_sales",
): FFmpegClipSpec[] {
  const presetId = resolveLegacyPresetId(preset);
  const resolved = resolvePreset(presetId);
  return buildClipsFromPreset(photoUrls, resolved);
}

/**
 * Gera overlays de texto a partir dos dados do imovel.
 * @deprecated Use buildOverlaysFromPreset() do módulo presets.
 */
export function buildPropertyOverlays(
  property: PropertyOverlayData | undefined,
  totalDuration: number,
): TextOverlay[] {
  // Use corporate preset defaults for overlay styling (backward compat)
  const preset = resolvePreset("corporate");
  return buildOverlaysFromPreset(preset, property, totalDuration);
}

/**
 * Monta o FFmpegJobSpec completo a partir do request do frontend.
 * @deprecated Use buildJobSpecFromPreset() do módulo presets.
 */
export function buildFFmpegJobSpec(
  request: VideoGenerationV2Request,
  userId: string,
  callbackUrl: string,
): FFmpegJobSpec {
  const presetId = resolveLegacyPresetId(request.motion_preset);

  return buildJobSpecFromPreset({
    presetOrId: presetId,
    photoUrls: request.photo_urls,
    jobId: request.video_job_id,
    userId,
    workspaceId: request.workspace_id,
    callbackUrl,
    resolution: request.resolution,
    aspectRatio: request.aspect_ratio,
    property: request.property,
    audioMoodOverride: request.audio?.mood,
    audioVolumeOverride: request.audio?.volume,
  });
}
