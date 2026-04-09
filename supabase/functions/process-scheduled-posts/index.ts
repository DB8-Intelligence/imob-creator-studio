import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (_req: Request) => {
  // Fetch pending posts that are due
  const { data: posts, error } = await supabase
    .from("scheduled_posts")
    .select("*, social_accounts(*), creatives_gallery(*)")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .limit(10);

  if (error || !posts?.length) {
    return new Response(JSON.stringify({ ok: true, processed: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let processed = 0;

  for (const post of posts) {
    const account  = post.social_accounts;
    const creative = post.creatives_gallery;
    if (!account || !creative) continue;

    // Mark as publishing
    await supabase.from("scheduled_posts")
      .update({ status: "publishing" })
      .eq("id", post.id);

    try {
      const fullCaption = `${post.caption ?? creative.caption ?? ""}\n\n${post.hashtags ?? creative.hashtags ?? ""}`.trim();
      const imageUrl = post.format === "story" ? creative.format_story : creative.format_feed;

      if (!imageUrl) throw new Error("No image URL for format");

      let platformPostId: string | null = null;

      if (post.platform === "instagram" || post.platform === "both") {
        // Instagram: container → publish
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
          platformPostId = published.id ?? null;
        }
      }

      // Mark as published
      await supabase.from("scheduled_posts").update({
        status: "published",
        platform_post_id: platformPostId,
        published_at: new Date().toISOString(),
      }).eq("id", post.id);

      // Update creative
      await supabase.from("creatives_gallery").update({
        status: "published",
        published_at: new Date().toISOString(),
        ig_post_id: platformPostId,
      }).eq("id", creative.id);

      processed++;
    } catch (e) {
      await supabase.from("scheduled_posts").update({
        status: "failed",
        error_message: String(e),
      }).eq("id", post.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, processed }), {
    headers: { "Content-Type": "application/json" },
  });
});
