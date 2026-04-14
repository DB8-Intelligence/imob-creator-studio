/**
 * publish-callback — Supabase Edge Function (DEV-29)
 *
 * Callback que o n8n chama após tentar publicar no canal.
 * Atualiza publication_queue status e grava publication_logs.
 *
 * Payload esperado:
 * {
 *   publication_id: string,
 *   success: boolean,
 *   external_id?: string,     // ID no canal externo (ex: IG media_id)
 *   external_url?: string,    // URL pública do post
 *   error_message?: string,
 *   error_code?: string,
 *   raw_response?: object
 * }
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const serviceKey = req.headers.get("x-service-key");
    const isServiceCall = serviceKey && serviceKey === SUPABASE_SERVICE_KEY;

    if (!isServiceCall) {
      const authHeader = req.headers.get("authorization") ?? "";
      if (!authHeader.startsWith("Bearer ")) {
        return jsonRes(401, { error: "Unauthorized" });
      }
    }

    // ── Parse body ─────────────────────────────────────────────────────
    const body = await req.json();
    const {
      publication_id,
      success,
      external_id,
      external_url,
      error_message,
      error_code,
      raw_response,
    } = body as {
      publication_id: string;
      success: boolean;
      external_id?: string;
      external_url?: string;
      error_message?: string;
      error_code?: string;
      raw_response?: Record<string, unknown>;
    };

    if (!publication_id) {
      return jsonRes(400, { error: "publication_id required" });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const now = new Date().toISOString();

    // ── Fetch current item ─────────────────────────────────────��───────
    const { data: item, error: fetchErr } = await admin
      .from("publication_queue")
      .select("*")
      .eq("id", publication_id)
      .single();

    if (fetchErr || !item) {
      return jsonRes(404, { error: "Publication not found" });
    }

    if (success) {
      // ── Success ────────────────────────────────────────────────────
      await admin
        .from("publication_queue")
        .update({
          status: "published",
          published_at: now,
          error_message: null,
          metadata: {
            ...(item.metadata ?? {}),
            external_id: external_id ?? null,
            external_url: external_url ?? null,
          },
          updated_at: now,
        })
        .eq("id", publication_id);

      await admin.from("publication_logs").insert({
        publication_id,
        action: "publish_success",
        status: "published",
        payload: { external_id, external_url },
        response: raw_response ?? null,
      });

      // Notification: success
      await admin.from("notifications").insert({
        user_id: item.user_id,
        type: "publication_done",
        title: "Publicação concluída!",
        message: `Conteúdo publicado com sucesso no canal ${item.channel}.`,
        link: external_url ?? "/calendario",
        metadata: { publication_id, channel: item.channel, external_id },
      }).then(({ error: ne }) => { if (ne)  });

      return jsonRes(200, {
        ok: true,
        publication_id,
        status: "published",
        external_id,
        external_url,
      });
    } else {
      // ── Error ──────────────────────────────────────────────────────
      const errMsg = error_message ?? "Unknown publish error";

      await admin
        .from("publication_queue")
        .update({
          status: "error",
          error_message: errMsg,
          updated_at: now,
        })
        .eq("id", publication_id);

      await admin.from("publication_logs").insert({
        publication_id,
        action: "publish_error",
        status: "error",
        payload: { error_message: errMsg, error_code: error_code ?? null },
        response: raw_response ?? null,
      });

      // Notification: error
      await admin.from("notifications").insert({
        user_id: item.user_id,
        type: "publication_error",
        title: "Erro na publicação",
        message: `Falha ao publicar no ${item.channel}: ${errMsg}`,
        link: "/calendario",
        metadata: { publication_id, channel: item.channel, error: errMsg },
      }).then(({ error: ne }) => { if (ne)  });

      return jsonRes(200, {
        ok: true,
        publication_id,
        status: "error",
        error_message: errMsg,
      });
    }
  } catch (err) {
    return jsonRes(500, { error: "Internal error", message: String(err) });
  }
});

function jsonRes(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
