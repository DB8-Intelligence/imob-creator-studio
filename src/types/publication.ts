/**
 * publication.ts — Tipos da fila de publicação e agendamento (DEV-28)
 *
 * Entidades: publication_queue (fila) + publication_logs (rastreio).
 * Estados: queued → publishing → published | error | cancelled.
 */

export type PublicationChannel =
  | "instagram_feed"
  | "instagram_stories"
  | "instagram_reels"
  | "facebook"
  | "whatsapp"
  | "tiktok"
  | "linkedin";

export type PublicationStatus =
  | "queued"
  | "publishing"
  | "published"
  | "error"
  | "cancelled";

export type PublicationLogAction =
  | "created"
  | "scheduled"
  | "publish_started"
  | "publish_success"
  | "publish_error"
  | "retry"
  | "cancelled";

/** Item na fila de publicação */
export interface PublicationQueueItem {
  id: string;
  user_id: string;
  workspace_id: string;
  asset_id: string | null;
  content_feed_id: string | null;
  channel: PublicationChannel;
  status: PublicationStatus;
  caption: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  error_message: string | null;
  retry_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Log de ação na publicação */
export interface PublicationLog {
  id: string;
  publication_id: string;
  action: PublicationLogAction;
  status: PublicationStatus;
  payload: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  created_at: string;
}

/** Input para criar um agendamento */
export interface SchedulePublicationInput {
  asset_id?: string | null;
  content_feed_id?: string | null;
  channel: PublicationChannel;
  caption?: string;
  scheduled_at: string;
}

/** Canais disponíveis com metadata */
export const PUBLICATION_CHANNELS: {
  id: PublicationChannel;
  label: string;
  icon: string;
  color: string;
}[] = [
  { id: "instagram_feed", label: "Instagram Feed", icon: "📷", color: "text-purple-500" },
  { id: "instagram_stories", label: "Instagram Stories", icon: "📱", color: "text-blue-500" },
  { id: "instagram_reels", label: "Instagram Reels", icon: "🎬", color: "text-orange-500" },
  { id: "facebook", label: "Facebook", icon: "📘", color: "text-blue-600" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "text-green-500" },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "text-pink-500" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "text-sky-600" },
];

export const PUBLICATION_STATUS_CFG: Record<PublicationStatus, { label: string; color: string }> = {
  queued:     { label: "Na fila",     color: "text-blue-500" },
  publishing: { label: "Publicando",  color: "text-amber-500" },
  published:  { label: "Publicado",   color: "text-emerald-500" },
  error:      { label: "Erro",        color: "text-red-500" },
  cancelled:  { label: "Cancelado",   color: "text-zinc-400" },
};

// ─── Channel payloads (DEV-29) ────────────────────────────────────────────

/** Payload base para publicação em qualquer canal */
export interface ChannelPublishPayload {
  publication_id: string;
  channel: PublicationChannel;
  asset_url: string;
  caption: string | null;
  scheduled_at: string | null;
  user_id: string;
  workspace_id: string;
  metadata: Record<string, unknown> | null;
}

/** Payload específico Instagram (Feed/Stories/Reels) */
export interface InstagramPublishPayload extends ChannelPublishPayload {
  channel: "instagram_feed" | "instagram_stories" | "instagram_reels";
  ig_user_id?: string;
  ig_access_token?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  hashtags?: string[];
  location_id?: string;
}

/** Payload específico Facebook */
export interface FacebookPublishPayload extends ChannelPublishPayload {
  channel: "facebook";
  page_id?: string;
  page_access_token?: string;
  link?: string;
}

/** Payload específico WhatsApp (via Evolution API v2) */
export interface WhatsAppPublishPayload extends ChannelPublishPayload {
  channel: "whatsapp";
  phone_numbers: string[];
  evolution_instance_name?: string;
  evolution_api_key?: string;
  message_type: "image" | "video" | "document" | "text";
}

/** Resposta do canal após tentativa de publicação */
export interface ChannelPublishResult {
  success: boolean;
  channel: PublicationChannel;
  external_id?: string;
  external_url?: string;
  error_message?: string;
  error_code?: string;
  raw_response?: Record<string, unknown>;
}

/** Mapeamento canal → tipo de mídia Instagram */
export const CHANNEL_MEDIA_TYPE: Record<string, string> = {
  instagram_feed: "IMAGE",
  instagram_stories: "IMAGE",
  instagram_reels: "REELS",
  facebook: "photo",
  whatsapp: "image",
};
