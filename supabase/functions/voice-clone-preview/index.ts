// ============================================================
// voice-clone-preview — Sprint 3: Voz clonada
//
// Gera TTS da voz clonada do user com um texto arbitrário (preview do wizard).
// Retorna base64 MP3 para o browser tocar via data URL.
//
// Env: NEXOIMOB_ELEVENLABS_API_KEY
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NEXOIMOB_ELEVENLABS_API_KEY = Deno.env.get("NEXOIMOB_ELEVENLABS_API_KEY");
const PREVIEW_MAX_CHARS = 300;

interface PreviewRequest {
  clone_id?: string;   // opcional — se omitido usa o clone ativo
  text:      string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  if (!NEXOIMOB_ELEVENLABS_API_KEY) return json({ ok: false, error: "NEXOIMOB_ELEVENLABS_API_KEY not configured" }, 500);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "unauthorized" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ ok: false, error: "unauthorized" }, 401);

  let body: PreviewRequest;
  try { body = await req.json(); } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const text = (body.text ?? "").trim().slice(0, PREVIEW_MAX_CHARS);
  if (!text) return json({ ok: false, error: "empty_text" }, 400);

  // Busca clone ativo do user (RLS garante owner)
  const q = userClient
    .from("voice_clones")
    .select("id, elevenlabs_voice_id, status")
    .eq("status", "ready");

  const { data: clone } = body.clone_id
    ? await q.eq("id", body.clone_id).maybeSingle()
    : await q.order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (!clone) return json({ ok: false, error: "clone_not_found" }, 404);

  try {
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${clone.elevenlabs_voice_id}`, {
      method:  "POST",
      headers: {
        "xi-api-key":   NEXOIMOB_ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept":       "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      console.error("ElevenLabs TTS failed:", err);
      return json({ ok: false, error: "tts_failed", detail: err }, 502);
    }
    const buf = new Uint8Array(await ttsRes.arrayBuffer());
    const base64 = encodeBase64(buf);
    return json({ ok: true, audio_base64: base64, mime: "audio/mpeg" });
  } catch (e) {
    console.error("voice-clone-preview error:", e);
    return json({ ok: false, error: "tts_network" }, 502);
  }
});

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as number[]);
  }
  return btoa(binary);
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
