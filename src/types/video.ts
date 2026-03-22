import type { VideoMotionPreset } from "@/lib/video-motion-presets";

export type VideoStyle = "cinematic" | "moderno" | "luxury";
export type VideoFormat = "reels" | "feed" | "youtube";
export type VideoStatus = "draft" | "queued" | "processing" | "completed" | "failed";
export type VideoPlanTier = "standard" | "plus" | "premium";

export interface VideoJob {
  id: string;
  workspace_id: string;
  property_id: string | null;
  title: string;
  style: VideoStyle;
  format: VideoFormat;
  duration_seconds: number;
  resolution: string;
  status: VideoStatus;
  photos_count: number;
  credits_used: number;
  output_url: string | null;
  thumbnail_url: string | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoPlanAddon {
  id: string;
  workspace_id: string;
  addon_type: VideoPlanTier;
  billing_cycle: "monthly" | "yearly";
  credits_total: number | null;
  credits_used: number;
  status: "active" | "inactive" | "trial";
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoJobSegment {
  id: string;
  video_job_id: string;
  workspace_id: string;
  sequence_index: number;
  source_image_path: string | null;
  source_image_name: string | null;
  clip_duration_seconds: number;
  status: "pending" | "queued" | "processing" | "completed" | "failed" | "skipped";
  output_clip_url: string | null;
  provider: string | null;
  provider_job_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVideoJobInput {
  workspaceId: string;
  propertyId?: string | null;
  title: string;
  style: VideoStyle;
  format: VideoFormat;
  durationSeconds: number;
  resolution?: string;
  photosCount: number;
  motionPreset?: VideoMotionPreset;
  metadata?: Record<string, unknown>;
}

export interface VideoModuleOverview {
  jobs: VideoJob[];
  addOn: VideoPlanAddon | null;
}

export interface CreateVideoJobSegmentsInput {
  videoJobId: string;
  workspaceId: string;
  imageNames: string[];
  renderedSegments: number;
  sourcePaths?: string[];
}
