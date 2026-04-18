// ============================================================
// voice-send — Sprint 3: Voz clonada
//
// Chamada pelo whatsapp-ai-reply quando voice_mode=voz (ou 'auto' +
// heurística positiva). Fluxo:
//
//   1. Gera TTS na voz clonada do user (ElevenLabs)
//   2. Envia base64 ao Evolution `/message/sendWhatsAppAudio/<instance>`
//      (Evolution converte para OGG/Opus internamente)
//   3. Loga em voice_usage_log
//
// Auth: service_role only (chamada internal de edge-para-edge)
// Env: ELEVENLABS_API_KEY, EVOLUTION_API_URL, EVOLUTION_API_KEY
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL       = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const EVOLUTION_URL      = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_KEY      = Deno.env.get("EVOLUTION_API_KEY");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface SendRequest {
  user_id:        string;
  phone:          string;
  text:           string;
  instance_name:  string;
}

serve(async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const auth     = req.headers.get("authorization") ?? "";
  const internal = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  const isServiceRole = auth === `Bearer ${SERVICE_ROLE_KEY}`;
  const isInternal    = expected && internal === expected;
  if (!isServiceRole && !isInternal) return json({ ok: false, error: "unauthorized" }, 401);

  if (!ELEVENLABS_API_KEY) return json({ ok: false, error: "missing_elevenlabs_key" }, 500);
  if (!EVOLUTION_URL || !EVOLUTION_KEY) return json({ ok: false, error: "missing_evolution_config" }, 500);

  let body: SendRequest;
  try { body = await req.json(); } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const { user_id, phone, text, instance_name } = body;
  if (!user_id || !phone || !text?.trim() || !instance_name) {
    return json({ ok: false, error: "missing_fields" }, 400);
  }

  // Busca clone ativo
  const { data: clone } = await admin
    .from("voice_clones")
    .select("id, elevenlabs_voice_id")
    .eq("user_id", user_id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!clone) {
    return json({ ok: false, error: "no_active_clone" }, 404);
  }

  const cleanText = text.trim().slice(0, 1500);

  // 1. TTS ElevenLabs
  let audioBase64: string;
  try {
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${clone.elevenlabs_voice_id}`,
      {
        method: "POST",
        headers: {
          "xi-api-key":   ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept":       "audio/mpeg",
        },
        body: JSON.stringify({
          text:     cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );
    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      await logUsage(user_id, clone.id, phone, cleanText.length, "failed", `tts_${ttsRes.status}`);
      return json({ ok: false, error: "tts_failed", detail: err }, 502);
    }
    const buf = new Uint8Array(await ttsRes.arrayBuffer());
    audioBase64 = encodeBase64(buf);
  } catch (e) {
    console.error("TTS error:", e);
    await logUsage(user_id, clone.id, phone, cleanText.length, "failed", "tts_network");
    return json({ ok: false, error: "tts_network" }, 502);
  }

  // 2. Envia ao Evolution (ele converte MP3 → OGG/Opus)
  const normalizedPhone = phone.replace(/[^\d]/g, "");
  try {
    const evRes = await fetch(
      `${EVOLUTION_URL}/message/sendWhatsAppAudio/${instance_name}`,
      {
        method: "POST",
        headers: { apikey: EVOLUTION_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          number:     normalizedPhone,
          audio:      audioBase64,
          encoding:   true,          // solicita conversão Opus/OGG pelo Evolution
        }),
      },
    );
    const evData = await evRes.json().catch(() => ({}));
    if (!evRes.ok) {
      console.error("Evolution sendAudio failed:", evData);
      await logUsage(user_id, clone.id, normalizedPhone, cleanText.length, "failed", `evo_${evRes.status}`);
      return json({ ok: false, error: "evolution_failed", detail: evData }, 502);
    }

    await logUsage(user_id, clone.id, normalizedPhone, cleanText.length, "sent", null);

    // Também registra em whatsapp_sent_messages para o histórico
    await admin.from("whatsapp_sent_messages").insert({
      user_id,
      to_phone: normalizedPhone,
      body:     `[áudio] ${cleanText}`,
      evolution_response: { ...evData, _source: "voice_clone", _chars: cleanText.length },
    });

    return json({ ok: true, chars: cleanText.length });
  } catch (e) {
    console.error("Evolution network error:", e);
    await logUsage(user_id, clone.id, normalizedPhone, cleanText.length, "failed", "evo_network");
    return json({ ok: false, error: "evolution_network" }, 502);
  }
});

async function logUsage(
  user_id:  string,
  clone_id: string,
  phone:    string,
  chars:    number,
  outcome:  "sent" | "failed" | "skipped",
  error:    string | null,
) {
  try {
    await admin.from("voice_usage_log").insert({
      user_id, voice_clone_id: clone_id, phone, char_count: chars, outcome, error,
    });
  } catch (e) {
    console.error("voice_usage_log insert failed:", e);
  }
}

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
    headers: { "Content-Type": "application/json" },
  });
}
