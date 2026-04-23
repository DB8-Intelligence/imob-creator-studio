// Meta/Facebook Data Deletion Request Callback
// Called by Meta when a user requests deletion of their data.
// Per Meta requirements, must return { url, confirmation_code } so Meta can show the user a tracking URL.
//
// Meta docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const form = await req.formData();
    const signedRequest = form.get("signed_request")?.toString();
    if (!signedRequest) {
      return json({ ok: false, error: "Missing signed_request" }, 400);
    }

    const appSecret = Deno.env.get("META_APP_SECRET");
    if (!appSecret) {
      return json({ ok: false, error: "META_APP_SECRET not set" }, 500);
    }

    const payload = await parseSignedRequest(signedRequest, appSecret);
    if (!payload) {
      return json({ ok: false, error: "Invalid signature" }, 400);
    }

    const metaUserId = payload.user_id;
    if (!metaUserId) {
      return json({ ok: false, error: "Missing user_id in payload" }, 400);
    }

    const confirmationCode = crypto.randomUUID();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Registra pedido para tratamento manual em até 15 dias úteis (prazo LGPD).
    await supabase.from("data_deletion_requests").insert({
      meta_user_id: metaUserId,
      confirmation_code: confirmationCode,
      status: "pending",
      payload,
    });

    // Remove imediatamente o que é seguro remover sem verificação manual:
    // tokens de acesso associados a esse Meta user id.
    await supabase
      .from("social_accounts")
      .delete()
      .eq("account_id", metaUserId);

    return json({
      url: `https://nexoimobai.com.br/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (err) {
    console.error("instagram-data-deletion error:", err);
    return json({ ok: false, error: "Internal error" }, 500);
  }
});

async function parseSignedRequest(signedRequest: string, appSecret: string): Promise<any | null> {
  const [encodedSig, payload] = signedRequest.split(".");
  if (!encodedSig || !payload) return null;

  const sig = base64UrlDecode(encodedSig);
  const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));

  if (data.algorithm !== "HMAC-SHA256") return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  );

  if (expected.length !== sig.length) return null;
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== sig[i]) return null;
  }

  return data;
}

function base64UrlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
