/**
 * channel-adapters.ts — Adaptadores de canal para publicação (DEV-29)
 *
 * Define a estrutura de payload por canal e helpers para construir
 * o payload correto para envio ao n8n publish webhook.
 *
 * Canais suportados:
 * - Instagram (Feed, Stories, Reels) → Meta Graph API via n8n
 * - Facebook (Pages) → Meta Graph API via n8n
 * - WhatsApp → Evolution API v2 via n8n
 *
 * Nota: a publicação real é feita pelo n8n, não pelo frontend.
 * Este módulo apenas constrói payloads tipados.
 */
import type {
  PublicationChannel,
  PublicationQueueItem,
  ChannelPublishPayload,
  InstagramPublishPayload,
  FacebookPublishPayload,
  WhatsAppPublishPayload,
} from "@/types/publication";

// ─── Channel config ───────────────────────────────────────────────────────

interface ChannelAdapter {
  channel: PublicationChannel;
  supportsVideo: boolean;
  supportsImage: boolean;
  supportsText: boolean;
  requiresCaption: boolean;
  maxCaptionLength: number;
  buildPayload: (item: PublicationQueueItem, assetUrl: string) => ChannelPublishPayload;
}

// ─── Instagram adapter ────────────────────────────────────────────────────

function resolveInstagramMediaType(
  channel: "instagram_feed" | "instagram_stories" | "instagram_reels",
  assetUrl: string
): "IMAGE" | "VIDEO" | "REELS" {
  if (channel === "instagram_reels") return "REELS";
  const isVideo = /\.(mp4|mov|webm)$/i.test(assetUrl);
  return isVideo ? "VIDEO" : "IMAGE";
}

const instagramAdapter: ChannelAdapter = {
  channel: "instagram_feed",
  supportsVideo: true,
  supportsImage: true,
  supportsText: false,
  requiresCaption: false,
  maxCaptionLength: 2200,
  buildPayload: (item, assetUrl) => ({
    publication_id: item.id,
    channel: item.channel,
    asset_url: assetUrl,
    caption: item.caption,
    scheduled_at: item.scheduled_at,
    user_id: item.user_id,
    workspace_id: item.workspace_id,
    metadata: item.metadata,
    media_type: resolveInstagramMediaType(
      item.channel as "instagram_feed" | "instagram_stories" | "instagram_reels",
      assetUrl
    ),
  } as InstagramPublishPayload),
};

// ─── Facebook adapter ─────────────────────────────────────────────────────

const facebookAdapter: ChannelAdapter = {
  channel: "facebook",
  supportsVideo: true,
  supportsImage: true,
  supportsText: true,
  requiresCaption: false,
  maxCaptionLength: 63206,
  buildPayload: (item, assetUrl) => ({
    publication_id: item.id,
    channel: "facebook" as const,
    asset_url: assetUrl,
    caption: item.caption,
    scheduled_at: item.scheduled_at,
    user_id: item.user_id,
    workspace_id: item.workspace_id,
    metadata: item.metadata,
  } as FacebookPublishPayload),
};

// ─── WhatsApp adapter ─────────────────────────────────────────────────────

function resolveWhatsAppMediaType(assetUrl: string): "image" | "video" | "document" | "text" {
  if (!assetUrl) return "text";
  if (/\.(mp4|mov|webm)$/i.test(assetUrl)) return "video";
  if (/\.(pdf|doc|docx|xls)$/i.test(assetUrl)) return "document";
  return "image";
}

const whatsappAdapter: ChannelAdapter = {
  channel: "whatsapp",
  supportsVideo: true,
  supportsImage: true,
  supportsText: true,
  requiresCaption: false,
  maxCaptionLength: 4096,
  buildPayload: (item, assetUrl) => ({
    publication_id: item.id,
    channel: "whatsapp" as const,
    asset_url: assetUrl,
    caption: item.caption,
    scheduled_at: item.scheduled_at,
    user_id: item.user_id,
    workspace_id: item.workspace_id,
    metadata: item.metadata,
    phone_numbers: ((item.metadata as Record<string, unknown>)?.phone_numbers as string[]) ?? [],
    message_type: resolveWhatsAppMediaType(assetUrl),
  } as WhatsAppPublishPayload),
};

// ─── Registry ─────────────────────────────────────────────────────────────

const ADAPTERS: Record<string, ChannelAdapter> = {
  instagram_feed: { ...instagramAdapter, channel: "instagram_feed" },
  instagram_stories: { ...instagramAdapter, channel: "instagram_stories" },
  instagram_reels: { ...instagramAdapter, channel: "instagram_reels" },
  facebook: facebookAdapter,
  whatsapp: whatsappAdapter,
  tiktok: { ...instagramAdapter, channel: "tiktok" as PublicationChannel },
  linkedin: { ...facebookAdapter, channel: "linkedin" as PublicationChannel },
};

/** Obtém adapter por canal */
export function getChannelAdapter(channel: PublicationChannel): ChannelAdapter | null {
  return ADAPTERS[channel] ?? null;
}

/** Constrói payload para o canal */
export function buildChannelPayload(
  item: PublicationQueueItem,
  assetUrl: string
): ChannelPublishPayload {
  const adapter = getChannelAdapter(item.channel);
  if (!adapter) {
    // Fallback genérico
    return {
      publication_id: item.id,
      channel: item.channel,
      asset_url: assetUrl,
      caption: item.caption,
      scheduled_at: item.scheduled_at,
      user_id: item.user_id,
      workspace_id: item.workspace_id,
      metadata: item.metadata,
    };
  }
  return adapter.buildPayload(item, assetUrl);
}

/** Valida se o canal suporta o tipo de conteúdo */
export function validateChannelSupport(
  channel: PublicationChannel,
  contentType: "image" | "video" | "text"
): { supported: boolean; reason?: string } {
  const adapter = getChannelAdapter(channel);
  if (!adapter) return { supported: false, reason: "Canal não suportado" };

  if (contentType === "video" && !adapter.supportsVideo) {
    return { supported: false, reason: `${channel} não suporta vídeo` };
  }
  if (contentType === "image" && !adapter.supportsImage) {
    return { supported: false, reason: `${channel} não suporta imagem` };
  }
  if (contentType === "text" && !adapter.supportsText) {
    return { supported: false, reason: `${channel} não suporta texto` };
  }
  return { supported: true };
}

/** Trunca caption ao limite do canal */
export function truncateCaption(channel: PublicationChannel, caption: string): string {
  const adapter = getChannelAdapter(channel);
  const max = adapter?.maxCaptionLength ?? 2200;
  return caption.length > max ? caption.slice(0, max - 3) + "..." : caption;
}
