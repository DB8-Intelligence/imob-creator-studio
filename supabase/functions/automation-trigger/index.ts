/**
 * automation-trigger — Supabase Edge Function (DEV-26)
 *
 * Webhook chamado pelo n8n scheduler para disparar geração automática de conteúdo.
 *
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │  n8n Schedule Trigger                                                      │
 * │       │                                                                    │
 * │       ├─ consulta automation_rules ativas (cron ou HTTP)                  │
 * │       └─ POST /automation-trigger { automation_id, ... }                  │
 * │                   │                                                        │
 * │                   ├─ valida regra (ativa? pertence ao user?)              │
 * │                   ├─ constrói GenerationRequest                           │
 * │                   ├─ chama generate-dispatch internamente                 │
 * │                   ├─ grava automation_logs (pending → success/error)      │
 * │                   └─ retorna { log_id, job_id, status }                   │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * Segurança:
 *   - Aceita x-service-key (service-to-service do n8n) ou JWT
 *   - RLS: automation_rules.user_id deve corresponder ao JWT
 *   - automation_rules.workspace_id deve existir
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-service-key",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SERVICE_KEY_HEADER = Deno.env.get("AUTOMATION_SERVICE_KEY") ?? "";

// Map automation generation_type → GenerationType for generate-dispatch
const AUTOMATION_TYPE_MAP: Record<string, string> = {
  post: "gerar_post",
  video: "video_compose_v2",
};

// Default engine per type
const DEFAULT_ENGINE: Record<string, string> = {
  post: "openai_gpt4o",
  video: "ffmpeg_kenburns",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const serviceKey = req.headers.get("x-service-key");
    const authHeader = req.headers.get("authorization") ?? "";

    let userId: string | null = null;
    let isServiceCall = false;

    if (serviceKey && SERVICE_KEY_HEADER && serviceKey === SERVICE_KEY_HEADER) {
      isServiceCall = true;
    } else if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user }, error } = await userClient.auth.getUser();
      if (error || !user) {
        return jsonResponse(401, { error: "Unauthorized" });
      }
      userId = user.id;
    } else {
      return jsonResponse(401, { error: "Missing auth" });
    }

    // ── Parse payload ──────────────────────────────────────────────────
    const body = await req.json();
    const { automation_id } = body;

    if (!automation_id) {
      return jsonResponse(400, { error: "automation_id required" });
    }

    // ── Fetch automation rule ──────────────────────────────────────────
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: rule, error: ruleErr } = await admin
      .from("automation_rules")
      .select("*")
      .eq("id", automation_id)
      .single();

    if (ruleErr || !rule) {
      return jsonResponse(404, { error: "Automation rule not found" });
    }

    // ── Security: user can only trigger own automation ─────────────────
    if (!isServiceCall && userId && rule.user_id !== userId) {
      return jsonResponse(403, { error: "Forbidden: not your automation" });
    }

    if (!rule.is_active) {
      return jsonResponse(400, { error: "Automation is inactive" });
    }

    // ── Check for duplicate recent execution ────────────────────────
    if (rule.frequency !== "manual") {
      const windowStart = new Date();
      if (rule.frequency === "daily") {
        windowStart.setHours(0, 0, 0, 0);
      } else if (rule.frequency === "weekly") {
        const dayOfWeek = windowStart.getDay();
        windowStart.setDate(windowStart.getDate() - dayOfWeek);
        windowStart.setHours(0, 0, 0, 0);
      }

      const { count } = await admin
        .from("automation_logs")
        .select("*", { count: "exact", head: true })
        .eq("automation_id", automation_id)
        .in("status", ["pending", "running", "success"])
        .gte("created_at", windowStart.toISOString());

      if ((count ?? 0) >= 1) {
        return jsonResponse(409, {
          error: `Already executed this ${rule.frequency === "daily" ? "day" : "week"}`,
        });
      }
    }

    // ── Create automation log (pending) ───────────────────────────────
    const { data: log, error: logErr } = await admin
      .from("automation_logs")
      .insert({
        automation_id,
        status: "running",
      })
      .select()
      .single();

    if (logErr) {
      return jsonResponse(500, { error: "Failed to create log", details: logErr.message });
    }

    // ── Build GenerationRequest ───────────────────────────────────────
    const generationType = AUTOMATION_TYPE_MAP[rule.generation_type] ?? "gerar_post";
    const engineId = rule.engine_id ?? DEFAULT_ENGINE[rule.generation_type] ?? "openai_gpt4o";

    const generationPayload = {
      workspace_id: rule.workspace_id,
      user_id: rule.user_id,
      generation_type: generationType,
      engine_id: engineId,
      template_id: rule.template_id ?? undefined,
      property_id: rule.property_id ?? undefined,
      style: rule.preset ?? undefined,
      callback_mode: "async",
      metadata: {
        automation: true,
        automation_id,
        automation_log_id: log.id,
        visual_preset: rule.preset ?? undefined,
        music_mood: rule.mood ?? undefined,
      },
    };

    // ── Call generate-dispatch ─────────────────────────────────────────
    const dispatchUrl = `${SUPABASE_URL}/functions/v1/generate-dispatch`;

    const dispatchRes = await fetch(dispatchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify(generationPayload),
    });

    const dispatchData = await dispatchRes.json();

    if (!dispatchRes.ok) {
      // Update log as error
      await admin
        .from("automation_logs")
        .update({
          status: "error",
          error: dispatchData.error ?? "generate-dispatch failed",
        })
        .eq("id", log.id);

      return jsonResponse(dispatchRes.status, {
        error: "Generation dispatch failed",
        details: dispatchData,
        log_id: log.id,
      });
    }

    // ── Update log with job_id ────────────────────────────────────────
    await admin
      .from("automation_logs")
      .update({
        job_id: dispatchData.job_id ?? null,
      })
      .eq("id", log.id);

    // Note: final status (success/error) will be updated by generation-callback
    // via the automation metadata we passed in the generation request.

    // Notification: automation triggered
    await admin.from("notifications").insert({
      user_id: rule.user_id,
      type: "automation_done",
      title: "Automação executada",
      message: `A regra "${rule.name}" disparou uma geração automaticamente.`,
      link: "/agentes/logs",
      metadata: { automation_id, job_id: dispatchData.job_id, rule_name: rule.name },
    }).then(({ error: ne }) => { if (ne) console.warn("notif err:", ne.message); });

    return jsonResponse(200, {
      log_id: log.id,
      job_id: dispatchData.job_id,
      status: dispatchData.status ?? "pending",
      automation_id,
    });
  } catch (err) {
    return jsonResponse(500, { error: "Internal error", message: String(err) });
  }
});

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
