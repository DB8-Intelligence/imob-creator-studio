/**
 * media-library.ts — Tipos unificados da Biblioteca de Mídia
 *
 * Unifica generated_assets + creatives em um modelo único (MediaItem).
 */

export type MediaType = "image" | "video" | "post";
export type MediaStatus = "done" | "processing" | "pending" | "error" | "draft";
export type MediaSource = "asset" | "creative";

export interface MediaItem {
  id: string;
  source: MediaSource;
  sourceId: string;
  type: MediaType;
  name: string;
  url: string;
  previewUrl: string | null;
  status: MediaStatus;
  format: string | null;
  generationType: string | null;
  templateId: string | null;
  templateName: string | null;
  presetId: string | null;
  moodId: string | null;
  engineId: string | null;
  aspectRatio: string | null;
  propertyId: string | null;
  fileSizeBytes: number | null;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown> | null;
  jobId: string | null;
  createdAt: string;
}

/** Campos reaproveitáveis ao reutilizar um asset em outro fluxo */
export interface AssetReusePrefill {
  sourceAssetId: string;
  templateId: string | null;
  presetId: string | null;
  moodId: string | null;
  engineId: string | null;
  format: string | null;
  aspectRatio: string | null;
  propertyId: string | null;
  imageUrls: string[];
  metadata: Record<string, unknown> | null;
}

export type ReuseFlow =
  | "post"        // gerar post a partir do asset
  | "video"       // gerar vídeo a partir do asset
  | "staging"     // virtual staging
  | "variation";  // gerar variação do mesmo tipo
