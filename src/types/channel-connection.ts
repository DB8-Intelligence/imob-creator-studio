/**
 * channel-connection.ts — Tipos de conexão de canal (DEV-30)
 *
 * Credenciais por workspace para publicação em canais externos.
 * WhatsApp: Evolution API v2 (self-hosted, Railway).
 */
import type { PublicationChannel } from "@/types/publication";

export interface ChannelConnection {
  id: string;
  workspace_id: string;
  channel: PublicationChannel;
  is_active: boolean;
  display_name: string | null;
  ig_user_id: string | null;
  ig_access_token: string | null;
  page_id: string | null;
  page_access_token: string | null;
  evolution_instance_name: string | null;
  evolution_api_key: string | null;
  evolution_phone: string | null;
  credentials: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelConnectionInput {
  channel: PublicationChannel;
  display_name?: string;
  ig_user_id?: string;
  ig_access_token?: string;
  page_id?: string;
  page_access_token?: string;
  evolution_instance_name?: string;
  evolution_api_key?: string;
  evolution_phone?: string;
}

/** Campos exibíveis (sem tokens) para UI */
export interface ChannelConnectionSafe {
  id: string;
  channel: PublicationChannel;
  is_active: boolean;
  display_name: string | null;
  has_ig_token: boolean;
  has_fb_token: boolean;
  has_evolution_key: boolean;
  ig_user_id: string | null;
  page_id: string | null;
  evolution_phone: string | null;
  created_at: string;
}
