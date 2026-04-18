// ============================================================
// google-oauth-callback — Recebe code do Google, troca por tokens,
// salva em calendar_integrations e redireciona de volta ao app.
//
// Env:
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   SITE_URL (default: https://imobcreatorai.com.br)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://imobcreatorai.com.br";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  const url   = new URL(req.url);
  const code  = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err   = url.searchParams.get("error");

  if (err) return redirectTo(`/dashboard/whatsapp/ai-config?google=error&reason=${encodeURIComponent(err)}`);
  if (!code || !state) return redirectTo(`/dashboard/whatsapp/ai-config?google=error&reason=missing_params`);

  let userId: string;
  try {
    const decoded = JSON.parse(atob(state)) as { user_id: string };
    if (!decoded.user_id) throw new Error("no user_id in state");
    userId = decoded.user_id;
  } catch {
    return redirectTo(`/dashboard/whatsapp/ai-config?google=error&reason=invalid_state`);
  }

  const clientId     = Deno.env.get("NEXOIMOB_GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("NEXOIMOB_GOOGLE_OAUTH_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return redirectTo(`/dashboard/whatsapp/ai-config?google=error&reason=missing_credentials`);
  }

  const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-oauth-callback`;

  // ── Troca code por tokens ──────────────────────────────────
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.access_token) {
    console.error("Google token exchange failed:", tokens);
    return redirectTo(`/dashboard/whatsapp/ai-config?google=error&reason=token_exchange_failed`);
  }

  // ── Busca email do usuário Google ──────────────────────────
  let email: string | null = null;
  try {
    const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const info = await infoRes.json();
    email = info.email ?? null;
  } catch {
    /* opcional */
  }

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + (tokens.expires_in as number) * 1000).toISOString()
    : null;

  // ── Upsert integration ─────────────────────────────────────
  const { error: upsertError } = await supabase
    .from("calendar_integrations")
    .upsert(
      {
        user_id:          userId,
        provider:         "google",
        access_token:     tokens.access_token,
        refresh_token:    tokens.refresh_token ?? null, // só vem no primeiro consent
        token_expires_at: expiresAt,
        scope:            tokens.scope ?? null,
        email,
        calendar_id:      "primary",
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    console.error("Upsert calendar_integrations failed:", upsertError);
    return redirectTo(`/dashboard/whatsapp/ai-config?google=error&reason=db_error`);
  }

  return redirectTo(`/dashboard/whatsapp/ai-config?google=connected`);
});

function redirectTo(path: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: `${SITE_URL}${path}` },
  });
}
