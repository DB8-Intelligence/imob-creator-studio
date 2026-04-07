/**
 * publish-dispatch — Supabase Edge Function (DEV-29 / DEV-30)
 *
 * Dispatcher de publicação com resolução de credenciais por canal.
 *
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │  1. Lê publication_queue (queued + scheduled_at <= now)                   │
 * │  2. Para cada item:                                                       │
 * │     a. Resolve asset_url do generated_assets                             │
 * │     b. Resolve credenciais do canal via channel_connections              │
 * │     c. Detecta media_type (imagem/vídeo) pelo asset                     │
 * │     d. Monta payload completo com credenciais injetadas                  │
 * │     e. Despacha para n8n Publish Router                                  │
 * │  3. n8n publica → POST /publish-callback { publication_id, success }     │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * Segurança:
 *   - Credenciais nunca passam pelo frontend
 *   - channel_connections acessado via service role (bypassa RLS)
 *   - Tokens injetados server-side no payload para n8n
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

const N8N_PUBLISH_WEBHOOK =
  "https://automacao.db8intelligence.com.br/webhook/imobcreator-publish";

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

// ─── Media type detection ─────────────────────────────────────────────────

function detectMediaType(assetUrl: string, channel: string): string {
  if (channel === "instagram_reels") return "REELS";
  if (/\.(mp4|mov|webm|avi)$/i.test(assetUrl)) {
    return channel.startsWith("instagram") ? "VIDEO" : "video";
  }
  return channel.startsWith("instagram") ? "IMAGE" : "image";
}

// ─── Channel normalization for credential lookup ──────────────────────────

function normalizeChannel(channel: string): string {
  // instagram_feed, instagram_stories, instagram_reels all use same IG credentials
  if (channel.startsWith("instagram")) return "instagram_feed";
  return channel;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const serviceKey = req.headers.get("x-service-key");
    const authHeader = req.headers.get("authorization") ?? "";
    if (!(serviceKey && serviceKey === SUPABASE_SERVICE_KEY) && !authHeader.startsWith("Bearer ")) {
      return jsonRes(401, { error: "Unauthorized" });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Optional single item mode ──────────────────────────────────────
    let singleId: string | null = null;
    try {
      const body = await req.json();
      singleId = body?.publication_id ?? null;
    } catch {
      // batch mode
    }

    // ── Fetch ready items ──────────────────────────────────────────────
    let query = admin
      .from("publication_queue")
      .select("*")
      .eq("status", "queued")
      .lte("scheduled_at", new Date().toISOString())
      .lt("retry_count", MAX_RETRIES)
      .order("scheduled_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (singleId) {
      query = admin
        .from("publication_queue")
        .select("*")
        .eq("id", singleId)
        .in("status", ["queued", "error"])
        .limit(1);
    }

    const { data: items, error: fetchErr } = await query;
    if (fetchErr) return jsonRes(500, { error: "Failed to fetch queue", details: fetchErr.message });
    if (!items || items.length === 0) return jsonRes(200, { dispatched: 0, message: "No items ready" });

    // ── Pre-load channel credentials for all unique workspace+channel pairs ──
    const credentialKeys = [...new Set(items.map((i) => `${i.workspace_id}|${normalizeChannel(i.channel)}`))];
    const credMap = new Map<string, Record<string, unknown>>();

    for (const key of credentialKeys) {
      const [wsId, ch] = key.split("|");
      const { data: conn } = await admin
        .from("channel_connections")
        .select("*")
        .eq("workspace_id", wsId)
        .eq("channel", ch)
        .eq("is_active", true)
        .single();

      if (conn) {
        credMap.set(key, conn as Record<string, unknown>);
      }
    }

    // ── Process items ──────────────────────────────────────────────────
    const results: Array<{ id: string; dispatched: boolean; error?: string }> = [];

    for (const item of items) {
      try {
        // 1. Mark publishing
        await admin
          .from("publication_queue")
          .update({ status: "publishing", updated_at: new Date().toISOString() })
          .eq("id", item.id);

        await admin.from("publication_logs").insert({
          publication_id: item.id,
          action: "publish_started",
          status: "publishing",
          payload: { channel: item.channel, attempt: (item.retry_count ?? 0) + 1 },
        });

        // 2. Resolve asset
        let assetUrl = "";
        let assetType = "image";
        if (item.asset_id) {
          const { data: asset } = await admin
            .from("generated_assets")
            .select("asset_url, preview_url, asset_type")
            .eq("id", item.asset_id)
            .single();
          assetUrl = asset?.asset_url ?? "";
          assetType = asset?.asset_type ?? "image";
        }
        if (!assetUrl && item.metadata?.asset_url) {
          assetUrl = item.metadata.asset_url as string;
        }

        if (!assetUrl) {
          throw new Error("No asset_url resolved — cannot publish without media");
        }

        // Instagram Stories cannot be published via Content Publishing API
        // (Meta limitation: only Feed and Reels are supported)
        if (item.channel === "instagram_stories") {
          throw new Error("Instagram Stories não pode ser publicado via API. Use Instagram Feed ou Reels.");
        }

        // 3. Resolve channel credentials
        const credKey = `${item.workspace_id}|${normalizeChannel(item.channel)}`;
        const creds = credMap.get(credKey);

        if (!creds) {
          throw new Error(`No active channel_connection for ${item.channel} in workspace ${item.workspace_id}. Configure in Integrações.`);
        }

        // 4. Build channel-specific payload with credentials injected
        const mediaType = detectMediaType(assetUrl, item.channel);

        const isVideo = mediaType === "VIDEO" || mediaType === "REELS" || mediaType === "video";

        const channelPayload: Record<string, unknown> = {
          publication_id: item.id,
          channel: item.channel,
          asset_url: assetUrl,
          asset_type: assetType,
          media_type: mediaType,
          is_video: isVideo,
          caption: item.caption,
          scheduled_at: item.scheduled_at,
          user_id: item.user_id,
          workspace_id: item.workspace_id,
          callback_url: `${SUPABASE_URL}/functions/v1/publish-callback`,
          metadata: item.metadata ?? {},
        };

        // Inject channel-specific credentials
        if (item.channel.startsWith("instagram")) {
          channelPayload.ig_user_id = creds.ig_user_id;
          channelPayload.ig_access_token = creds.ig_access_token;
        } else if (item.channel === "facebook") {
          channelPayload.page_id = creds.page_id;
          channelPayload.page_access_token = creds.page_access_token;
        } else if (item.channel === "whatsapp") {
          channelPayload.evolution_instance_name = creds.evolution_instance_name;
          channelPayload.evolution_api_key = creds.evolution_api_key;
          channelPayload.phone_numbers = item.metadata?.phone_numbers ?? [];
        }

        // 5. Dispatch to n8n
        const n8nRes = await fetch(N8N_PUBLISH_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(channelPayload),
        });

        if (!n8nRes.ok) {
          const errText = await n8nRes.text();
          throw new Error(`n8n ${n8nRes.status}: ${errText.slice(0, 200)}`);
        }

        results.push({ id: item.id, dispatched: true });
      } catch (err) {
        const errMsg = String(err instanceof Error ? err.message : err);

        await admin
          .from("publication_queue")
          .update({
            status: "error",
            error_message: errMsg,
            retry_count: (item.retry_count ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        await admin.from("publication_logs").insert({
          publication_id: item.id,
          action: "publish_error",
          status: "error",
          payload: { error: errMsg, attempt: (item.retry_count ?? 0) + 1 },
        });

        results.push({ id: item.id, dispatched: false, error: errMsg });
      }
    }

    const dispatched = results.filter((r) => r.dispatched).length;
    const errors = results.filter((r) => !r.dispatched).length;
    return jsonRes(200, { dispatched, errors, total: items.length, results });
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
