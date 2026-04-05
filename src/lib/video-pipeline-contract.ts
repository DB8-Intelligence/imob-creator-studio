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

export interface TextOverlay {
  /** Texto a renderizar */
  text: string;
  /** Posicao vertical: top, center, bottom */
  position: "top" | "center" | "bottom";
  /** Tamanho da fonte */
  font_size: number;
  /** Cor hex */
  color: string;
  /** Fundo semitransparente (ex: "black@0.5") */
  background?: string;
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

const MOTION_SEQUENCES: Record<string, MotionType[]> = {
  default:    ["zoom_in", "pan_right", "zoom_out", "pan_left", "zoom_in", "pan_up"],
  luxury:     ["zoom_in", "zoom_out", "pan_right", "zoom_in", "pan_left", "zoom_out"],
  fast_sales: ["zoom_in", "pan_left", "zoom_out", "pan_right", "zoom_in", "pan_down"],
};

const MOTION_ZOOM_FACTORS: Record<string, number> = {
  default: 1.15,
  luxury: 1.10,
  fast_sales: 1.25,
};

const MOTION_CLIP_DURATIONS: Record<string, number> = {
  default: 5,
  luxury: 6,
  fast_sales: 4,
};

/**
 * Gera specs de clip com base no preset de movimento.
 * Alterna entre os tipos de movimento de forma ciclica.
 */
export function buildClipSpecs(
  photoUrls: string[],
  preset: "default" | "luxury" | "fast_sales",
): FFmpegClipSpec[] {
  const motionSeq = MOTION_SEQUENCES[preset];
  const zoomFactor = MOTION_ZOOM_FACTORS[preset];
  const duration = MOTION_CLIP_DURATIONS[preset];

  return photoUrls.map((url, i) => ({
    photo_url: url,
    sequence_index: i,
    ken_burns: {
      motion: motionSeq[i % motionSeq.length],
      zoom_factor: zoomFactor,
      duration_seconds: duration,
    },
  }));
}

/**
 * Gera overlays de texto a partir dos dados do imovel.
 * Overlay aparece nos ultimos 5 segundos do video.
 */
export function buildPropertyOverlays(
  property: PropertyOverlayData | undefined,
  totalDuration: number,
): TextOverlay[] {
  if (!property) return [];

  const overlays: TextOverlay[] = [];
  const overlayStart = Math.max(totalDuration - 5, 0);
  const overlayEnd = totalDuration;

  if (property.address) {
    overlays.push({
      text: property.address,
      position: "bottom",
      font_size: 42,
      color: "#FFFFFF",
      background: "black@0.6",
      start_time: overlayStart,
      end_time: overlayEnd,
    });
  }

  if (property.price) {
    overlays.push({
      text: property.price,
      position: "center",
      font_size: 56,
      color: "#FFFFFF",
      background: "black@0.5",
      start_time: overlayStart,
      end_time: overlayEnd,
    });
  }

  if (property.details) {
    overlays.push({
      text: property.details,
      position: "top",
      font_size: 32,
      color: "#FFFFFF",
      background: "black@0.4",
      start_time: overlayStart + 0.5,
      end_time: overlayEnd,
    });
  }

  return overlays;
}

/**
 * Monta o FFmpegJobSpec completo a partir do request do frontend.
 */
export function buildFFmpegJobSpec(
  request: VideoGenerationV2Request,
  userId: string,
  callbackUrl: string,
): FFmpegJobSpec {
  const clips = buildClipSpecs(request.photo_urls, request.motion_preset);

  const clipDuration = MOTION_CLIP_DURATIONS[request.motion_preset];
  const transitionDuration = 0.8;
  const totalDuration = clips.length * clipDuration - (clips.length - 1) * transitionDuration;

  const overlays = buildPropertyOverlays(request.property, totalDuration);

  return {
    job_id: request.video_job_id,
    user_id: userId,
    workspace_id: request.workspace_id,
    clips,
    transition: {
      type: request.motion_preset === "luxury" ? "dissolve" : "fade",
      duration_seconds: transitionDuration,
    },
    overlays,
    audio: {
      mood: request.audio?.mood ?? "modern",
      volume: request.audio?.volume ?? 0.3,
      fade_out_seconds: 2,
    },
    output: {
      resolution: request.resolution,
      aspect_ratio: request.aspect_ratio,
      fps: 30,
      codec: "h264",
      format: "mp4",
    },
    callback_url: callbackUrl,
  };
}
