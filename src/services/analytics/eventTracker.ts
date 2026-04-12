// Event Tracker — fire-and-forget analytics events to Supabase user_events table
// Auto-enriches every event with first-touch and last-touch UTM metadata.

import { supabase } from "@/integrations/supabase/client";
import { getAttributionMetadata, getLastTouchMetadata } from "./utmCapture";
import { trackConversion } from "./trackingPixels";

// ─── Event type catalogue ─────────────────────────────────────────────────────

export type AcquisitionEvent =
  | "signup"
  | "first_login"
  | "trial_start"
  | "paid_conversion"
  | "landing_view"
  | "upgrade_viewed";

export type UsageEvent =
  | "creative_generated"
  | "template_used"
  | "editor_opened"
  | "library_viewed"
  | "upscale_used"
  | "reverse_prompt_used"
  | "video_creator_used"
  | "ai_agents_used"
  | "reel_script_used"
  | "virtual_staging_used"
  | "renovate_used"
  | "sketch_render_used"
  | "empty_lot_used"
  | "land_marking_used"
  | "dashboard_viewed"
  | "analytics_viewed"
  | "attribution_viewed"
  // ── Funnel / Onboarding (11B) ──
  | "onboarding_step_completed"
  | "welcome_dismissed"
  | "first_share"
  | "brand_kit_created"
  | "funnel_viewed";
  // ── Activation milestones ──
  | "first_generation_started"
  | "first_generation_completed"
  | "video_module_viewed"
  | "video_addon_activated";

export type AppEvent = AcquisitionEvent | UsageEvent;

export const EVENT_CATEGORY: Record<AppEvent, string> = {
  signup:              "acquisition",
  first_login:         "acquisition",
  trial_start:         "acquisition",
  paid_conversion:     "acquisition",
  landing_view:        "acquisition",
  creative_generated:  "usage",
  template_used:       "usage",
  editor_opened:       "usage",
  library_viewed:      "usage",
  upscale_used:        "usage",
  reverse_prompt_used: "usage",
  video_creator_used:  "usage",
  ai_agents_used:      "usage",
  reel_script_used:    "usage",
  virtual_staging_used:"usage",
  renovate_used:       "usage",
  sketch_render_used:  "usage",
  empty_lot_used:      "usage",
  land_marking_used:   "usage",
  dashboard_viewed:    "usage",
  analytics_viewed:    "usage",
  attribution_viewed:  "usage",
  // Funnel / Onboarding
  upgrade_viewed:              "acquisition",
  onboarding_step_completed:   "usage",
  welcome_dismissed:           "usage",
  first_share:                 "usage",
  brand_kit_created:           "usage",
  funnel_viewed:               "usage",
  first_generation_started:    "usage",
  first_generation_completed:  "usage",
  video_module_viewed:         "usage",
  video_addon_activated:       "usage",
};

// ─── Track function ───────────────────────────────────────────────────────────

interface TrackOptions {
  workspaceId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function trackEvent(
  userId: string,
  event: AppEvent,
  options: TrackOptions = {}
): Promise<void> {
  const firstTouch = getAttributionMetadata();
  const lastTouch  = getLastTouchMetadata();

  const payload = {
    user_id:    userId,
    event_type: event,
    category:   EVENT_CATEGORY[event],
    workspace_id: options.workspaceId ?? null,
    metadata: {
      ...firstTouch,
      ...lastTouch,
      ...(options.metadata ?? {}),
      user_agent: navigator.userAgent,
      url:        window.location.pathname,
      timestamp:  new Date().toISOString(),
    },
  };

  // Fire-and-forget — do not await, do not block UI
  supabase.from("user_events").insert(payload).then(({ error }) => {
    if (error) console.warn("[trackEvent] insert failed:", error.message);
  });

  // Bridge to GA4 + Meta Pixel
  trackConversion(event, options.metadata as Record<string, unknown> | undefined);
}
