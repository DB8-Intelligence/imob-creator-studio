import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return json({ error: "authorization header is required" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey);
    const anon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await anon.auth.getUser(token);
    if (userError || !userData.user) {
      return json({ error: "invalid user token" }, 401);
    }

    const body = await req.json();
    const videoJobId = String(body.videoJobId ?? "");
    const workspaceId = String(body.workspaceId ?? "");
    const compositionMode = String(body.compositionMode ?? "simple_concat_with_branding");

    if (!videoJobId || !workspaceId) {
      return json({ error: "videoJobId and workspaceId are required" }, 400);
    }

    const { data: job, error: jobError } = await admin
      .from("video_jobs")
      .select("id, workspace_id, title, format, resolution, output_url, metadata")
      .eq("id", videoJobId)
      .eq("workspace_id", workspaceId)
      .single();

    if (jobError || !job) {
      return json({ error: "video job not found" }, 404);
    }

    const { data: segments, error: segmentsError } = await admin
      .from("video_job_segments")
      .select("id, sequence_index, status, output_clip_url, metadata")
      .eq("video_job_id", videoJobId)
      .eq("workspace_id", workspaceId)
      .order("sequence_index", { ascending: true });

    if (segmentsError) {
      return json({ error: "failed to load segments" }, 500);
    }

    const allSegments = segments ?? [];
    const validSegments = allSegments.filter((segment) => segment.status === "completed" && !!segment.output_clip_url);
    const skippedSegments = allSegments.filter((segment) => segment.status === "skipped").length;
    const failedSegments = allSegments.filter((segment) => segment.status === "failed").length;

    if (validSegments.length === 0) {
      await admin
        .from("video_jobs")
        .update({
          status: "failed",
          metadata: {
            ...(job.metadata ?? {}),
            composition_mode: compositionMode,
            composition_error: "no_completed_segments",
          },
        })
        .eq("id", videoJobId)
        .eq("workspace_id", workspaceId);

      return json({ error: "no completed segments available for composition" }, 400);
    }

    const compositionSummary = {
      composition_mode: compositionMode,
      segments_total: allSegments.length,
      segments_used: validSegments.length,
      segments_skipped: skippedSegments,
      segments_failed: failedSegments,
      final_duration_seconds: validSegments.length * 5,
      used_segment_ids: validSegments.map((segment) => segment.id),
      segment_urls: validSegments.map((segment) => segment.output_clip_url),
      composed_at: new Date().toISOString(),
    };

    await admin
      .from("video_jobs")
      .update({
        metadata: {
          ...(job.metadata ?? {}),
          composition: compositionSummary,
        },
      })
      .eq("id", videoJobId)
      .eq("workspace_id", workspaceId);

    return json({
      ok: true,
      message: "compose-video foundation executed",
      composition: compositionSummary,
      note: "This function currently prepares and records composition metadata. Final ffmpeg/media composition is the next step.",
    });
  } catch (error) {
    console.error("compose-video error:", error);
    return json({ error: error instanceof Error ? error.message : "internal error" }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
