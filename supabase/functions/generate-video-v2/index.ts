/**
 * generate-video-v2 — Supabase Edge Function
 *
 * Pipeline de video imobiliario v2 do ImobCreator AI.
 *
 * FILOSOFIA: As fotos sao INTOCAVEIS. Nenhuma IA modifica pixels.
 * O pipeline aplica apenas camadas: movimento, transicao, texto, musica.
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │  FLUXO                                                           │
 * │                                                                   │
 * │  Frontend ──POST──▶ generate-video-v2                            │
 * │                         │                                         │
 * │                         ├─ valida fotos + plano                  │
 * │                         ├─ cria/atualiza video_job (processing)  │
 * │                         ├─ monta FFmpegJobSpec                   │
 * │                         ├─ dispara para backend FFmpeg           │
 * │                         └─▶ retorna { job_id, status }           │
 * │                                                                   │
 * │  Backend FFmpeg (db8-engine)                                     │
 * │      ├─ Passo 1: zoompan + xfade (clips individuais)            │
 * │      ├─ Passo 2: drawtext + audio + output final                │
 * │      └─▶ POST generation-callback                               │
 * │                                                                   │
 * │  Frontend ◀── Realtime subscription (video_jobs)                 │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * Output: 1080x1920 (9:16), 30fps, H.264, Instagram Reels ready
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Plan Rules ──────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, { maxPhotos: number; maxDuration: number; resolution: string }> = {
  standard: { maxPhotos: 10, maxDuration: 50,  resolution: "720p" },
  plus:     { maxPhotos: 15, maxDuration: 75,  resolution: "1080p" },
  premium:  { maxPhotos: 20, maxDuration: 90,  resolution: "1080p" },
};

const MOTION_PRESETS: Record<string, { clip_duration: number; zoom_factor: number; transition_duration: number; transition_type: string }> = {
  default:    { clip_duration: 5, zoom_factor: 1.15, transition_duration: 0.8, transition_type: "fade" },
  luxury:     { clip_duration: 6, zoom_factor: 1.10, transition_duration: 1.0, transition_type: "dissolve" },
  fast_sales: { clip_duration: 4, zoom_factor: 1.25, transition_duration: 0.5, transition_type: "fade" },
};

const MOTION_SEQUENCES = [
  "zoom_in", "pan_right", "zoom_out", "pan_left", "zoom_in", "pan_up",
  "zoom_out", "pan_down", "zoom_in", "pan_right", "zoom_out", "pan_left",
  "zoom_in", "pan_up", "zoom_out", "pan_right", "zoom_in", "pan_down",
  "zoom_out", "pan_left",
];

const RESOLUTION_MAP: Record<string, Record<string, { w: number; h: number }>> = {
  "720p":  { "9:16": { w: 720, h: 1280 },  "1:1": { w: 720, h: 720 },   "16:9": { w: 1280, h: 720 } },
  "1080p": { "9:16": { w: 1080, h: 1920 }, "1:1": { w: 1080, h: 1080 }, "16:9": { w: 1920, h: 1080 } },
};

// ─── Backend URL ─────────────────────────────────────────────────────────────

const FFMPEG_BACKEND_URL = "https://api.db8intelligence.com.br/generate-video/v2";

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl        = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey    = Deno.env.get("SUPABASE_ANON_KEY")!;

  const admin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // ── Auth ──────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return json({ error: "authorization required" }, 401);
    }

    const anon = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await anon.auth.getUser();
    if (authError || !userData.user) {
      return json({ error: "invalid token" }, 401);
    }
    const userId = userData.user.id;

    // ── Parse request ─────────────────────────────────────────────────
    const body = await req.json();

    const {
      workspace_id,
      video_job_id,
      photo_urls,
      motion_preset  = "default",
      aspect_ratio   = "9:16",
      resolution,
      property,
      audio,
      plan_tier      = "standard",
      skip_credits   = false,
    } = body;

    if (!workspace_id) return json({ error: "workspace_id is required" }, 400);
    if (!video_job_id) return json({ error: "video_job_id is required" }, 400);
    if (!Array.isArray(photo_urls) || photo_urls.length === 0) {
      return json({ error: "photo_urls must be a non-empty array" }, 400);
    }

    // ── Apply plan limits ────────────────────────────────────────────
    const planRule = PLAN_LIMITS[plan_tier] ?? PLAN_LIMITS.standard;
    const effectiveResolution = resolution ?? planRule.resolution;
    const effectivePhotos = photo_urls.slice(0, planRule.maxPhotos);

    const preset = MOTION_PRESETS[motion_preset] ?? MOTION_PRESETS.default;
    const totalClips = effectivePhotos.length;
    const rawDuration = totalClips * preset.clip_duration
      - (totalClips - 1) * preset.transition_duration;
    const totalDuration = Math.min(rawDuration, planRule.maxDuration);

    const dims = RESOLUTION_MAP[effectiveResolution]?.[aspect_ratio]
      ?? RESOLUTION_MAP["1080p"]["9:16"];

    console.log(`[generate-video-v2] ${totalClips} clips, ${totalDuration.toFixed(1)}s, ${dims.w}x${dims.h}, preset: ${motion_preset}`);

    // ── Build FFmpeg job spec ────────────────────────────────────────
    const clips = effectivePhotos.map((url: string, i: number) => ({
      photo_url: url,
      sequence_index: i,
      ken_burns: {
        motion: MOTION_SEQUENCES[i % MOTION_SEQUENCES.length],
        zoom_factor: preset.zoom_factor,
        duration_seconds: preset.clip_duration,
      },
    }));

    // Overlays de texto (ultimos 5s do video)
    const overlays = buildTextOverlays(property, totalDuration);

    const callbackUrl = `${supabaseUrl}/functions/v1/generation-callback`;

    const ffmpegSpec = {
      job_id:        video_job_id,
      user_id:       userId,
      workspace_id,
      clips,
      transition: {
        type: preset.transition_type,
        duration_seconds: preset.transition_duration,
      },
      overlays,
      audio: {
        mood:             audio?.mood ?? "modern",
        track_file:       (audio?.mood && audio.mood !== "none") ? audio.mood : null,
        volume:           audio?.volume ?? 0.3,
        fade_out_seconds: 2,
      },
      output: {
        resolution:   effectiveResolution,
        aspect_ratio,
        width:        dims.w,
        height:       dims.h,
        fps:          30,
        codec:        "h264",
        format:       "mp4",
      },
      callback_url: callbackUrl,
    };

    // ── Update video_job -> processing ───────────────────────────────
    await admin
      .from("video_jobs")
      .update({
        status: "processing",
        metadata: {
          pipeline_version: "v2",
          motion_preset,
          aspect_ratio,
          resolution: effectiveResolution,
          total_clips: totalClips,
          total_duration_seconds: totalDuration,
          output_dimensions: dims,
          photos_accepted: effectivePhotos.length,
          photos_submitted: photo_urls.length,
        },
      })
      .eq("id", video_job_id)
      .eq("workspace_id", workspace_id);

    // ── Track in generation_jobs (pipeline integration) ─────────────
    const { data: genJob, error: genJobError } = await admin
      .from("generation_jobs")
      .insert({
        user_id:         userId,
        workspace_id,
        generation_type: "video_compose_v2",
        engine_id:       "ffmpeg_kenburns",
        status:          "processing",
        callback_mode:   "async",
        callback_url:    callbackUrl,
        credits_consumed: 1,
        request_payload: ffmpegSpec,
      })
      .select("id")
      .single();

    if (genJobError) {
      console.warn("generation_jobs insert error:", genJobError.message);
    }

    const generationJobId = genJob?.id ?? video_job_id;

    // Update ffmpegSpec.job_id to use the generation_jobs ID for callback
    ffmpegSpec.job_id = generationJobId;

    // ── Dispatch to FFmpeg backend ───────────────────────────────────
    // Attempt to reach the backend. If it's not available yet (404/network error),
    // fallback to n8n webhook dispatch.
    const dispatchToBackend = async () => {
      try {
        const res = await fetch(FFMPEG_BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ffmpegSpec),
        });

        if (res.ok) {
          console.log(`[generate-video-v2] Dispatched to FFmpeg backend (${res.status})`);
          return;
        }

        // Backend returned error (404 = endpoint not deployed yet)
        console.warn(`[generate-video-v2] Backend returned ${res.status}, falling back to n8n`);
      } catch (err) {
        console.warn(`[generate-video-v2] Backend unreachable, falling back to n8n:`, err);
      }

      // Fallback: dispatch to n8n generation-router (which can route video_compose_v2)
      const N8N_WEBHOOK = "https://automacao.db8intelligence.com.br/webhook/imobcreator-generate";
      try {
        await fetch(N8N_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...ffmpegSpec,
            generation_type: "video_compose_v2",
            engine_id: "ffmpeg_kenburns",
            source: "generate-video-v2",
          }),
        });
        console.log("[generate-video-v2] Dispatched to n8n fallback");
      } catch (n8nErr) {
        console.error("[generate-video-v2] Both backend and n8n failed:", n8nErr);
        // Mark jobs as failed
        await admin
          .from("video_jobs")
          .update({ status: "failed", metadata: { error: "all_dispatch_failed" } })
          .eq("id", video_job_id);
        if (genJob?.id) {
          await admin
            .from("generation_jobs")
            .update({ status: "error", error_message: "All dispatch targets failed" })
            .eq("id", genJob.id);
        }
      }
    };

    // Fire-and-forget
    dispatchToBackend();

    return json({
      job_id:              generationJobId,
      video_job_id,
      status:              "processing",
      pipeline_version:    "v2",
      total_clips:         totalClips,
      total_duration:      totalDuration,
      output_dimensions:   dims,
      motion_preset,
    });

  } catch (err) {
    console.error("generate-video-v2 error:", err);
    return json({ error: err instanceof Error ? err.message : "internal error" }, 500);
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface PropertyData {
  address?: string;
  price?: string;
  details?: string;
  broker_name?: string;
  broker_phone?: string;
}

function buildTextOverlays(
  property: PropertyData | undefined,
  totalDuration: number,
): Array<Record<string, unknown>> {
  if (!property) return [];

  const overlays: Array<Record<string, unknown>> = [];
  const overlayStart = Math.max(totalDuration - 5, 0);
  const overlayEnd = totalDuration;

  if (property.price) {
    overlays.push({
      text:       property.price,
      position:   "center",
      font_size:  56,
      color:      "#FFFFFF",
      background: "black@0.5",
      start_time: overlayStart,
      end_time:   overlayEnd,
    });
  }

  if (property.address) {
    overlays.push({
      text:          property.address,
      position:      "bottom_safe",
      font_size:     42,
      color:         "#FFFFFF",
      background:    "black@0.6",
      margin_bottom: 120,    // Instagram Reels safe zone
      start_time:    overlayStart,
      end_time:      overlayEnd,
    });
  }

  if (property.details) {
    overlays.push({
      text:       property.details,
      position:   "top",
      font_size:  32,
      color:      "#FFFFFF",
      background: "black@0.4",
      start_time: overlayStart + 0.5,
      end_time:   overlayEnd,
    });
  }

  if (property.broker_name && property.broker_phone) {
    overlays.push({
      text:          `${property.broker_name} | ${property.broker_phone}`,
      position:      "bottom_safe",
      font_size:     28,
      color:         "#FFFFFF",
      background:    "black@0.4",
      margin_bottom: 180,    // Above address overlay
      start_time:    overlayStart + 1,
      end_time:      overlayEnd,
    });
  }

  return overlays;
}
