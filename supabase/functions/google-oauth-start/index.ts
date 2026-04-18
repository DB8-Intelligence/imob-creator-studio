// ============================================================
// google-oauth-start — Inicia fluxo OAuth com Google Calendar
//
// Fluxo:
//   1. Usuário autenticado chama GET /google-oauth-start
//   2. Geramos state CSRF e salvamos em localStorage (no client)
//   3. Retornamos authUrl para redirecionar
//
// Env:
//   GOOGLE_OAUTH_CLIENT_ID
//   SITE_URL (ex: https://imobcreatorai.com.br) — onde voltar após callback
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const clientId = Deno.env.get("NEXOIMOB_GOOGLE_OAUTH_CLIENT_ID");
  if (!clientId) {
    return json({ ok: false, error: "NEXOIMOB_GOOGLE_OAUTH_CLIENT_ID not configured" }, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const redirectUri = `${supabaseUrl}/functions/v1/google-oauth-callback`;

  // State: user_id + random nonce (assinado simplesmente via base64; callback valida via supabase)
  const state = btoa(JSON.stringify({ user_id: user.id, nonce: crypto.randomUUID() }));

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id",     clientId);
  authUrl.searchParams.set("redirect_uri",  redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope",         GOOGLE_SCOPES);
  authUrl.searchParams.set("access_type",   "offline");
  authUrl.searchParams.set("prompt",        "consent");
  authUrl.searchParams.set("state",         state);

  return json({ ok: true, authUrl: authUrl.toString() });
});

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
