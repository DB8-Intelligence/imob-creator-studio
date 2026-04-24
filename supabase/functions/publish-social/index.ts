// publish-social — orquestração de publicação + OAuth Meta (Instagram/Facebook)
// Graph API v21.0 (LTS). Scopes atualizados para o modelo instagram_business_* (Dec/2024).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH_API = "https://graph.facebook.com/v21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Debug endpoint publico: confirma qual META_APP_ID/SECRET a function enxerga.
  // Retorna so fingerprints (nao vaza secret). Remover apos diagnostico.
  const debugUrl = new URL(req.url);
  if (debugUrl.searchParams.get("debug") === "meta") {
    const id = Deno.env.get("META_APP_ID") ?? "";
    const secret = Deno.env.get("META_APP_SECRET") ?? "";
    return json({
      meta_app_id: id || null,
      meta_app_id_length: id.length,
      meta_app_secret_set: !!secret,
      meta_app_secret_length: secret.length,
      meta_app_secret_first2: secret.slice(0, 2),
      meta_app_secret_last4: secret.slice(-4),
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  console.log("[publish-social] auth header present:", !!authHeader);

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader ?? "" } } }
  );

  const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr) console.log("[publish-social] getUser error:", userErr.message);
  if (!user) {
    return json({
      ok: false,
      error: "Unauthorized",
      detail: {
        has_auth_header: !!authHeader,
        auth_error: userErr?.message ?? null,
      },
    }, 401);
  }
  console.log("[publish-social] user:", user.id);

  const body = await req.json().catch(() => ({}));
  // action pode vir via body (supabase.functions.invoke) OU querystring (compat)
  const url = new URL(req.url);
  const action = body.action || url.searchParams.get("action");

  const { data: workspace } = await supabase
    .from("workspaces").select("id").eq("owner_user_id", user.id).maybeSingle();
  if (!workspace) return json({ ok: false, error: "Workspace not found" }, 404);

  switch (action) {

    // ── CONECTAR CONTA SOCIAL (OAuth callback — recebe code, troca tudo) ─────
    case "connect-account": {
      const { code, redirect_uri } = body;
      if (!code || !redirect_uri) {
        return json({ ok: false, error: "Missing code or redirect_uri" }, 400);
      }

      const appId = Deno.env.get("META_APP_ID");
      const appSecret = Deno.env.get("META_APP_SECRET");
      if (!appId || !appSecret) {
        return json({ ok: false, error: "META_APP_ID/META_APP_SECRET not configured" }, 500);
      }

      // 1. Troca code → short-lived user token
      const shortRes = await fetch(
        `${GRAPH_API}/oauth/access_token?` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
        `code=${code}`
      );
      const shortData = await shortRes.json();
      if (!shortData.access_token) {
        return json({ ok: false, error: "Failed to exchange code", detail: shortData }, 400);
      }

      // 2. Short-lived → long-lived (60 dias)
      const longRes = await fetch(
        `${GRAPH_API}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `fb_exchange_token=${shortData.access_token}`
      );
      const longData = await longRes.json();
      const userAccessToken = longData.access_token ?? shortData.access_token;
      const expiresAt = longData.expires_in
        ? new Date(Date.now() + longData.expires_in * 1000).toISOString()
        : null;

      // 3. Busca meta_user_id
      const meRes = await fetch(`${GRAPH_API}/me?access_token=${userAccessToken}`);
      const me = await meRes.json();
      const metaUserId: string | undefined = me.id;
      if (!metaUserId) {
        return json({ ok: false, error: "Failed to fetch Meta user id", detail: me }, 400);
      }

      // 4. Lista Pages do usuário (cada Page tem seu próprio access_token)
      const pagesRes = await fetch(
        `${GRAPH_API}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url,name}&access_token=${userAccessToken}`
      );
      const pagesData = await pagesRes.json();
      const pages: any[] = pagesData.data || [];
      if (pages.length === 0) {
        return json({ ok: false, error: "Nenhuma Página do Facebook encontrada. Vincule sua conta Instagram Business a uma Página do Facebook." }, 400);
      }

      // 5. Pega a primeira Page com IG Business conectado (MVP: slot 1)
      const pageWithIg = pages.find((p) => p.instagram_business_account?.id) || pages[0];

      const pageId = pageWithIg.id;
      const pageName = pageWithIg.name;
      const pageAccessToken = pageWithIg.access_token;
      const ig = pageWithIg.instagram_business_account;

      const upsertRows: any[] = [];

      // Linha Facebook Page
      upsertRows.push({
        workspace_id: workspace.id,
        platform: "facebook",
        account_id: pageId,
        account_name: pageName,
        account_picture: null,
        access_token: pageAccessToken ?? userAccessToken,
        token_expires_at: expiresAt,
        page_id: pageId,
        page_access_token: pageAccessToken ?? userAccessToken,
        meta_user_id: metaUserId,
        profile_slot: 1,
        status: "active",
      });

      // Linha Instagram (se Page tem IG Business vinculado)
      if (ig?.id) {
        upsertRows.push({
          workspace_id: workspace.id,
          platform: "instagram",
          account_id: ig.id,
          account_name: ig.username ?? ig.name ?? null,
          account_picture: ig.profile_picture_url ?? null,
          access_token: pageAccessToken ?? userAccessToken,
          token_expires_at: expiresAt,
          page_id: pageId,
          page_access_token: pageAccessToken ?? userAccessToken,
          meta_user_id: metaUserId,
          profile_slot: 1,
          status: "active",
        });
      }

      const { error: upsertError } = await supabase
        .from("social_accounts")
        .upsert(upsertRows, { onConflict: "workspace_id, platform, profile_slot" });
      if (upsertError) {
        return json({ ok: false, error: upsertError.message }, 500);
      }

      return json({
        ok: true,
        facebook: { id: pageId, name: pageName },
        instagram: ig?.id ? { id: ig.id, username: ig.username } : null,
      });
    }

    // ── PUBLICAR AGORA ────────────────────────────────────────
    case "publish": {
      const { creative_id, platform, caption, hashtags, format = "feed" } = body;

      const { data: creative } = await supabase
        .from("creatives_gallery").select("*").eq("id", creative_id).maybeSingle();
      if (!creative) return json({ ok: false, error: "Creative not found" }, 404);

      const targetPlatform = platform === "both" ? "instagram" : platform;
      const { data: account } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("workspace_id", workspace.id)
        .eq("platform", targetPlatform)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (!account) return json({ ok: false, error: "No social account connected" }, 400);

      const fullCaption = `${caption ?? creative.caption ?? ""}\n\n${hashtags ?? creative.hashtags ?? ""}`.trim();
      const imageUrl = format === "story" ? creative.format_story : creative.format_feed;
      if (!imageUrl) return json({ ok: false, error: "Image URL not found for format" }, 400);

      let igPostId: string | null = null;
      if (platform === "instagram" || platform === "both") {
        // Instagram: 2 steps (container → publish)
        const containerRes = await fetch(
          `${GRAPH_API}/${account.account_id}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: imageUrl,
              caption: fullCaption,
              access_token: account.page_access_token ?? account.access_token,
            }),
          }
        );
        const container = await containerRes.json();
        if (!container.id) {
          return json({ ok: false, error: "IG container creation failed", detail: container }, 400);
        }
        const publishRes = await fetch(
          `${GRAPH_API}/${account.account_id}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: container.id,
              access_token: account.page_access_token ?? account.access_token,
            }),
          }
        );
        const published = await publishRes.json();
        if (!published.id) {
          return json({ ok: false, error: "IG publish failed", detail: published }, 400);
        }
        igPostId = published.id;
      }

      await supabase.from("creatives_gallery").update({
        status: "published",
        published_at: new Date().toISOString(),
        ig_post_id: igPostId,
      }).eq("id", creative_id);

      return json({ ok: true, ig_post_id: igPostId });
    }

    // ── AGENDAR ───────────────────────────────────────────────
    case "schedule": {
      const { creative_id, platform, caption, hashtags, scheduled_at, format } = body;

      const { error } = await supabase.from("scheduled_posts").insert({
        workspace_id: workspace.id,
        creative_id,
        platform,
        caption,
        hashtags,
        format: format ?? "feed",
        scheduled_at,
        status: "pending",
      });

      if (error) return json({ ok: false, error: error.message }, 500);

      await supabase.from("creatives_gallery")
        .update({ status: "scheduled", scheduled_at })
        .eq("id", creative_id);

      return json({ ok: true });
    }

    // ── DESCONECTAR ────────────────────────────────────────────
    case "disconnect-account": {
      const { platform } = body;
      if (!platform || !["instagram", "facebook"].includes(platform)) {
        return json({ ok: false, error: "Invalid platform" }, 400);
      }
      await supabase
        .from("social_accounts")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("platform", platform);
      return json({ ok: true });
    }

    default:
      return json({ ok: false, error: "Action not found" }, 404);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
