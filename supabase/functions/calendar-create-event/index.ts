// ============================================================
// calendar-create-event — Cria evento no Google Calendar do usuário.
//
// Auth: service_role (chamada interna) OU bearer do user (manual via UI)
// Input: { user_id?, summary, description?, location?, start_at, end_at, phone?, conversation_id? }
//   - Quando chamado com service_role, user_id é OBRIGATÓRIO
//   - Quando chamado com bearer do user, user_id é ignorado (uso o do JWT)
//
// Faz refresh do access_token se expirado (usando refresh_token).
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL       = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_CLIENT_ID     = Deno.env.get("NEXOIMOB_GOOGLE_OAUTH_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("NEXOIMOB_GOOGLE_OAUTH_CLIENT_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface CreateEventRequest {
  user_id?:        string;
  summary:         string;
  description?:    string;
  location?:       string;
  start_at:        string; // ISO
  end_at:          string; // ISO
  phone?:          string;
  conversation_id?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")    return json({ ok: false, error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("authorization") ?? "";
  const internal   = req.headers.get("x-internal-secret");
  const internalExpected = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  const isServiceRole = authHeader === `Bearer ${SERVICE_ROLE_KEY}`;
  const isInternal    = internalExpected && internal === internalExpected;

  // ── Resolve user_id ───────────────────────────────────────
  let userId: string | null = null;

  if (isServiceRole || isInternal) {
    const body = await req.clone().json().catch(() => ({}));
    userId = (body as CreateEventRequest).user_id ?? null;
  } else if (authHeader) {
    const supabaseUser = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error } = await supabaseUser.auth.getUser();
    if (error || !user) return json({ ok: false, error: "unauthorized" }, 401);
    userId = user.id;
  } else {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if (!userId) return json({ ok: false, error: "missing_user_id" }, 400);

  let body: CreateEventRequest;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (!body.summary || !body.start_at || !body.end_at) {
    return json({ ok: false, error: "missing_fields" }, 400);
  }

  // ── Carrega integration ───────────────────────────────────
  const { data: integration } = await supabase
    .from("calendar_integrations")
    .select("access_token, refresh_token, token_expires_at, calendar_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!integration) return json({ ok: false, error: "calendar_not_connected" }, 400);

  // ── Refresh token se perto de expirar ─────────────────────
  let accessToken = integration.access_token;
  const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at).getTime() : 0;
  const needsRefresh = expiresAt - Date.now() < 60_000; // 1 min buffer

  if (needsRefresh && integration.refresh_token) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return json({ ok: false, error: "missing_google_credentials" }, 500);
    }
    const refreshed = await refreshAccessToken(integration.refresh_token);
    if (!refreshed) return json({ ok: false, error: "refresh_failed" }, 500);

    accessToken = refreshed.access_token;
    await supabase
      .from("calendar_integrations")
      .update({
        access_token:     refreshed.access_token,
        token_expires_at: refreshed.expires_at,
      })
      .eq("user_id", userId);
  }

  // ── Cria evento no Google Calendar ────────────────────────
  const calendarId = integration.calendar_id ?? "primary";

  const gEventBody = {
    summary:     body.summary,
    description: body.description,
    location:    body.location,
    start:       { dateTime: body.start_at, timeZone: "America/Bahia" },
    end:         { dateTime: body.end_at,   timeZone: "America/Bahia" },
    reminders:   { useDefault: true },
  };

  const gRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method:  "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body:    JSON.stringify(gEventBody),
    }
  );

  const gEvent = await gRes.json().catch(() => ({}));
  if (!gRes.ok) {
    console.error("Google Calendar insert failed:", gEvent);
    return json({ ok: false, error: "google_insert_failed", google: gEvent }, 502);
  }

  // ── Salva em calendar_events ─────────────────────────────
  const { data: saved, error: saveError } = await supabase
    .from("calendar_events")
    .insert({
      user_id:         userId,
      conversation_id: body.conversation_id ?? null,
      phone:           body.phone ?? null,
      google_event_id: gEvent.id ?? null,
      summary:         body.summary,
      description:     body.description ?? null,
      location:        body.location ?? null,
      start_at:        body.start_at,
      end_at:          body.end_at,
      created_by:      (isServiceRole || isInternal) ? "ai" : "manual",
    })
    .select("id, google_event_id, start_at, end_at, summary")
    .single();

  if (saveError) {
    console.error("Save calendar_event failed:", saveError);
    return json({ ok: true, warning: "event_created_on_google_but_db_failed", google_event_id: gEvent.id }, 200);
  }

  return json({ ok: true, event: saved });
});

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access_token: string; expires_at: string } | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.access_token) {
    console.error("Token refresh failed:", json);
    return null;
  }
  const expiresAt = new Date(Date.now() + (json.expires_in ?? 3600) * 1000).toISOString();
  return { access_token: json.access_token, expires_at: expiresAt };
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
