// ============================================================
// voice-clone-create — Sprint 3: Voz clonada
//
// Fluxo:
//   1. Client grava/enviou amostra e fez upload em voice-samples/<user_id>/<id>.<ext>
//   2. Client chama POST /voice-clone-create com { sample_path, display_name }
//   3. Função baixa sample do Storage (service_role), envia para ElevenLabs /v1/voices/add
//   4. Arquiva clones anteriores e persiste voice_clones com elevenlabs_voice_id
//
// Gate: plan_slug='pro' em module_id='whatsapp' (Plus). A UI valida antes,
// mas a função valida de novo via my_modules view.
//
// Env:
//   NEXOIMOB_ELEVENLABS_API_KEY
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NEXOIMOB_ELEVENLABS_API_KEY = Deno.env.get("NEXOIMOB_ELEVENLABS_API_KEY");

interface CreateRequest {
  sample_path:  string;           // voice-samples/<user_id>/<id>.m4a
  display_name?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!NEXOIMOB_ELEVENLABS_API_KEY) {
    return json({ ok: false, error: "NEXOIMOB_ELEVENLABS_API_KEY not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "unauthorized" }, 401);

  // Cliente com JWT do user para validar identidade + consultar my_modules (RLS)
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ ok: false, error: "unauthorized" }, 401);

  // Gate de plano: Plus (plan_slug='pro' em módulo whatsapp)
  const { data: mod } = await userClient
    .from("my_modules")
    .select("plan_slug, status")
    .eq("module_id", "whatsapp")
    .maybeSingle();

  const hasPlus = mod?.status === "active" && ["pro", "max"].includes(mod?.plan_slug ?? "");
  if (!hasPlus) {
    return json({ ok: false, error: "plan_required", message: "Voz clonada requer Secretária Virtual Plus" }, 403);
  }

  let body: CreateRequest;
  try { body = await req.json(); } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (!body.sample_path || !body.sample_path.startsWith(`${user.id}/`)) {
    return json({ ok: false, error: "invalid_sample_path" }, 400);
  }

  const displayName = (body.display_name ?? "Minha voz").trim().slice(0, 60) || "Minha voz";

  // Cliente service_role para baixar do Storage e escrever voice_clones
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Download da amostra
  const { data: sampleBlob, error: dlErr } = await admin.storage
    .from("voice-samples")
    .download(body.sample_path);

  if (dlErr || !sampleBlob) {
    console.error("download sample error:", dlErr);
    return json({ ok: false, error: "sample_not_found" }, 404);
  }

  if (sampleBlob.size < 20_000) {
    return json({ ok: false, error: "sample_too_short", message: "Amostra muito curta — grave ao menos 30 segundos" }, 400);
  }
  if (sampleBlob.size > 25_000_000) {
    return json({ ok: false, error: "sample_too_large", message: "Amostra maior que 25MB — reduza a duração" }, 400);
  }

  // 2. Enviar para ElevenLabs (multipart /v1/voices/add)
  const form = new FormData();
  form.append("name", `imob-${user.id.slice(0, 8)}-${Date.now()}`);
  form.append("description", `Voz clonada — NexoImob AI`);
  form.append("files", sampleBlob, "sample.m4a");

  let voiceId: string;
  try {
    const elRes = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": NEXOIMOB_ELEVENLABS_API_KEY },
      body:    form,
    });
    const elData = await elRes.json();
    if (!elRes.ok || !elData.voice_id) {
      console.error("ElevenLabs add voice failed:", elData);
      return json({ ok: false, error: "elevenlabs_failed", detail: elData?.detail ?? elData }, 502);
    }
    voiceId = elData.voice_id;
  } catch (e) {
    console.error("ElevenLabs request error:", e);
    return json({ ok: false, error: "elevenlabs_network" }, 502);
  }

  // 3. Arquiva clones antigos e insere o novo como 'ready'
  await admin
    .from("voice_clones")
    .update({ status: "archived" })
    .eq("user_id", user.id)
    .eq("status", "ready");

  const { data: inserted, error: insErr } = await admin
    .from("voice_clones")
    .insert({
      user_id:             user.id,
      elevenlabs_voice_id: voiceId,
      display_name:        displayName,
      sample_storage_path: body.sample_path,
      status:              "ready",
    })
    .select("id, elevenlabs_voice_id, display_name")
    .single();

  if (insErr || !inserted) {
    console.error("voice_clones insert error:", insErr);
    return json({ ok: false, error: "db_insert_failed" }, 500);
  }

  return json({
    ok: true,
    clone: {
      id:             inserted.id,
      voice_id:       inserted.elevenlabs_voice_id,
      display_name:   inserted.display_name,
    },
  });
});

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
