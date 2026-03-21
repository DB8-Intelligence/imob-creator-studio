/**
 * n8n-bridge — Supabase Edge Function
 *
 * Receives internal events from the platform and forwards them to the
 * n8n Central Router webhook for automation processing.
 *
 * Supported event_types:
 *   video_completed | video_failed | creative_ready | new_user | video_addon_activated
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const N8N_WEBHOOK_URL = "https://automacao.db8intelligence.com.br/webhook/imobcreator-events";

const VALID_EVENTS = [
  "video_completed",
  "video_failed",
  "creative_ready",
  "new_user",
  "video_addon_activated",
] as const;

type EventType = typeof VALID_EVENTS[number];

function mapEventType(eventType: EventType) {
  switch (eventType) {
    case "video_completed":
      return "video.completed";
    case "video_failed":
      return "video.failed";
    case "video_addon_activated":
      return "video.addon.activated";
    case "creative_ready":
      return "creative.ready";
    case "new_user":
      return "user.created";
    default:
      return eventType;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const serviceKey = req.headers.get("x-service-key");
    const expectedServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const isServiceCall = serviceKey && serviceKey === expectedServiceKey;

    if (!isServiceCall) {
      if (!authHeader) {
        return json({ error: "authorization required" }, 401);
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { error } = await supabase.auth.getUser();
      if (error) {
        return json({ error: "invalid token" }, 401);
      }
    }

    const body = await req.json();
    const { event_type, data } = body as {
      event_type: EventType;
      data: Record<string, unknown>;
    };

    if (!event_type || !VALID_EVENTS.includes(event_type)) {
      return json({ error: `invalid event_type. Must be one of: ${VALID_EVENTS.join(", ")}` }, 400);
    }

    const payload = {
      event: mapEventType(event_type),
      ...(data ?? {}),
      dispatched_at: new Date().toISOString(),
      source: "imobcreator-platform",
    };

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text();
      console.error(`n8n webhook error ${n8nRes.status}:`, text);
      return json({ error: "n8n dispatch failed", status: n8nRes.status }, 502);
    }

    return json({ ok: true, forwarded_event: payload.event, dispatched_at: payload.dispatched_at });
  } catch (err) {
    console.error("n8n-bridge error:", err);
    return json({ error: "internal error" }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
