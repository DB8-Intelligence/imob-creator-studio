import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return json({ ok: false, error: "Unauthorized" }, 401);

  const url    = new URL(req.url);
  const action = url.searchParams.get("action");
  const body   = await req.json().catch(() => ({}));

  const { data: workspace } = await supabase
    .from("workspaces").select("id").eq("owner_user_id", user.id).maybeSingle();
  if (!workspace) return json({ ok: false, error: "Workspace not found" }, 404);

  switch (action) {

    // ── PUBLICAR AGORA ────────────────────────────────────────
    case "publish": {
      const { creative_id, platform, caption, hashtags, format = "feed" } = body;

      const { data: creative } = await supabase
        .from("creatives_gallery").select("*").eq("id", creative_id).maybeSingle();
      if (!creative) return json({ ok: false, error: "Creative not found" }, 404);

      const { data: account } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("workspace_id", workspace.id)
        .eq("platform", platform === "both" ? "instagram" : platform)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (!account) return json({ ok: false, error: "No social account connected" }, 400);

      const fullCaption = `${caption ?? creative.caption ?? ""}\n\n${hashtags ?? creative.hashtags ?? ""}`.trim();
      const imageUrl = format === "story" ? creative.format_story : creative.format_feed;
      if (!imageUrl) return json({ ok: false, error: "Image URL not found for format" }, 400);

      // Instagram: 2 steps (container → publish)
      let igPostId: string | null = null;
      if (platform === "instagram" || platform === "both") {
        const containerRes = await fetch(
          `https://graph.facebook.com/v18.0/${account.account_id}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: imageUrl,
              caption: fullCaption,
              access_token: account.access_token,
            }),
          }
        );
        const container = await containerRes.json();
        if (container.id) {
          const publishRes = await fetch(
            `https://graph.facebook.com/v18.0/${account.account_id}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: container.id,
                access_token: account.access_token,
              }),
            }
          );
          const published = await publishRes.json();
          igPostId = published.id ?? null;
        }
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

    // ── CONECTAR CONTA SOCIAL (OAuth callback) ────────────────
    case "connect-account": {
      const { platform, access_token, account_id, account_name, profile_slot } = body;

      // Exchange for long-lived token
      const ltRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${Deno.env.get("META_APP_ID")}&` +
        `client_secret=${Deno.env.get("META_APP_SECRET")}&` +
        `fb_exchange_token=${access_token}`
      );
      const lt = await ltRes.json();

      await supabase.from("social_accounts").upsert({
        workspace_id: workspace.id,
        platform,
        account_id,
        account_name,
        access_token: lt.access_token ?? access_token,
        token_expires_at: lt.expires_in
          ? new Date(Date.now() + lt.expires_in * 1000).toISOString()
          : null,
        profile_slot: profile_slot ?? 1,
        status: "active",
      }, { onConflict: "workspace_id, platform, profile_slot" });

      return json({ ok: true });
    }

    default:
      return new Response("Action not found", { status: 404 });
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
