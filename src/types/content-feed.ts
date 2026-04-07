/**
 * content-feed.ts — Tipos do feed de conteúdo e calendário editorial (DEV-27)
 *
 * Unifica gerados (generated_assets + generation_jobs) + automações (automation_logs)
 * em um modelo único para feed e calendário.
 */

export type ContentOrigin = "manual" | "automation";
export type ContentType = "post" | "video" | "text";
export type ContentStatus =
  | "scheduled"
  | "processing"
  | "done"
  | "error"
  | "ready_to_publish";

export interface ContentFeedItem {
  id: string;
  type: ContentType;
  origin: ContentOrigin;
  status: ContentStatus;
  name: string;
  templateId: string | null;
  templateName: string | null;
  presetId: string | null;
  generationType: string | null;
  propertyId: string | null;
  url: string | null;
  previewUrl: string | null;
  platform: string | null;
  automationId: string | null;
  automationName: string | null;
  scheduledAt: string | null;
  createdAt: string;
  error: string | null;
  /** DEV-29B: publication queue status if scheduled for publishing */
  publicationStatus: string | null;
  publicationChannel: string | null;
}

export type CalendarView = "month" | "week" | "day";
