/**
 * n8n-bridge client
 *
 * Dispatches platform events to the n8n Central Router via the
 * n8n-bridge Supabase Edge Function.
 *
 * Video job events (video_completed / video_failed) are also dispatched
 * automatically by a DB trigger on video_jobs.status, so this client is
 * primarily used for events that originate purely on the frontend
 * (e.g. creative_ready, new_user).
 */
import { supabase } from "@/integrations/supabase/client";

export type N8nEventType =
  | "video_completed"
  | "video_failed"
  | "creative_ready"
  | "new_user";

export async function dispatchN8nEvent(
  eventType: N8nEventType,
  data: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("n8n-bridge", {
      body: { event_type: eventType, data },
    });
    if (error) {
      console.warn("[n8n-bridge] dispatch warning:", error.message);
    }
  } catch (err) {
    // Non-blocking — automation failures must never break the user flow
    console.warn("[n8n-bridge] dispatch error:", err);
  }
}
