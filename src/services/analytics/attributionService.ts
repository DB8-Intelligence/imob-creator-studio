// Attribution Service — writes first-touch + last-touch records to Supabase
// Called at signup and on every login (last-touch sync).

import { supabase } from "@/integrations/supabase/client";
import { getFirstTouch, getLastTouch } from "./utmCapture";

/** Insert a new attribution record for a freshly signed-up user. */
export async function saveAttributionRecord(
  userId: string,
  workspaceId?: string
): Promise<void> {
  const ft = getFirstTouch();
  const lt = getLastTouch();

  const record = {
    user_id:           userId,
    workspace_id:      workspaceId ?? null,
    // first-touch
    utm_source:        ft?.utm_source   ?? null,
    utm_medium:        ft?.utm_medium   ?? null,
    utm_campaign:      ft?.utm_campaign ?? null,
    utm_content:       ft?.utm_content  ?? null,
    utm_term:          ft?.utm_term     ?? null,
    landing_page:      ft?.landing_page ?? null,
    first_touch_at:    ft?.captured_at  ?? new Date().toISOString(),
    // last-touch (may equal first-touch on signup)
    last_utm_source:   lt?.utm_source   ?? ft?.utm_source   ?? null,
    last_utm_medium:   lt?.utm_medium   ?? ft?.utm_medium   ?? null,
    last_utm_campaign: lt?.utm_campaign ?? ft?.utm_campaign ?? null,
    last_utm_content:  lt?.utm_content  ?? ft?.utm_content  ?? null,
    last_utm_term:     lt?.utm_term     ?? ft?.utm_term     ?? null,
    last_touch_at:     lt?.captured_at  ?? ft?.captured_at  ?? null,
  };

  supabase
    .from("acquisition_attribution")
    .insert(record)
    .then(({ error }) => {
      if (error) console.warn("[saveAttributionRecord] insert failed:", error.message);
    });
}

/** On login: update the last-touch columns if the user returned via a campaign. */
export async function syncLastTouchToDb(userId: string): Promise<void> {
  const lt = getLastTouch();
  if (!lt?.utm_source) return;

  supabase
    .from("acquisition_attribution")
    .update({
      last_utm_source:   lt.utm_source   ?? null,
      last_utm_medium:   lt.utm_medium   ?? null,
      last_utm_campaign: lt.utm_campaign ?? null,
      last_utm_content:  lt.utm_content  ?? null,
      last_utm_term:     lt.utm_term     ?? null,
      last_touch_at:     lt.captured_at  ?? new Date().toISOString(),
    })
    .eq("user_id", userId)
    .then(({ error }) => {
      if (error) console.warn("[syncLastTouchToDb] update failed:", error.message);
    });
}

/** After workspace creation: link the workspace to the attribution record. */
export async function linkAttributionWorkspace(
  userId: string,
  workspaceId: string
): Promise<void> {
  supabase
    .from("acquisition_attribution")
    .update({ workspace_id: workspaceId })
    .eq("user_id", userId)
    .is("workspace_id", null)
    .then(({ error }) => {
      if (error) console.warn("[linkAttributionWorkspace] update failed:", error.message);
    });
}
