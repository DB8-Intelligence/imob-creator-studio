import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ============================================
  // 1. Ler KIWIFY_WEBHOOK_TOKEN — fail-closed
  // ============================================
  const expectedToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");

  if (!expectedToken) {
    console.error(
      "🚨 CRITICAL: KIWIFY_WEBHOOK_TOKEN not configured in Supabase Secrets"
    );
    return json(
      {
        ok: false,
        error: "Server configuration error: webhook token not configured",
      },
      500
    );
  }

  // ============================================
  // 2. Extrair token da request (3 estratégias, em ordem)
  // ============================================
  // Primário: ?signature=TOKEN (formato oficial Kiwify)
  // Fallback 1: x-kiwify-token header (backward-compat)
  // Fallback 2: Authorization: Bearer (defensive)
  const url = new URL(req.url);
  const tokenFromQuery = url.searchParams.get("signature");
  const tokenFromHeader = req.headers.get("x-kiwify-token");
  const tokenFromAuth = req.headers.get("authorization")?.replace(
    "Bearer ",
    ""
  );

  const receivedToken = tokenFromQuery || tokenFromHeader || tokenFromAuth;

  // ============================================
  // 3. Validar token com timing-safe comparison
  // ============================================
  if (!receivedToken) {
    console.warn("⚠️  Webhook request rejected: no token provided");
    return json({ ok: false, error: "Missing authentication token" }, 401);
  }

  // Timing-safe comparison (evita side-channel attacks)
  const isValid = await timingSafeEqual(receivedToken, expectedToken);

  if (!isValid) {
    console.warn("⚠️  Webhook request rejected: invalid token");
    return json({ ok: false, error: "Invalid authentication token" }, 401);
  }

  console.log("✅ Token validation passed");

  // ============================================
  // 4. Parse payload
  // ============================================
  let payload: Record<string, any>;

  try {
    payload = await req.json();
  } catch (error) {
    console.error("❌ Invalid JSON payload:", String(error));
    return json({ ok: false, error: "Invalid JSON in request body" }, 400);
  }

  const event = String(payload.type ?? payload.event ?? "");
  const order = payload;

  console.log("📦 Kiwify event:", event, "order_id:", order?.order_id);

  // ============================================
  // 5. Process webhook
  // ============================================
  try {
    await processWebhook(payload, supabase);
    return json({ ok: true, event });
  } catch (error) {
    console.error("❌ Webhook processing error:", String(error));
    return json(
      {
        ok: false,
        error: "Processing error",
        message: String(error),
      },
      500
    );
  }
});

/**
 * Timing-safe string comparison (prevents side-channel attacks)
 * Deno.core.opSync is not available, so we use a manual approach
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  // Se lengths diferentes, pad com zeros
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length === bBytes.length ? 0 : 1;

  for (let i = 0; i < maxLen; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }

  return result === 0;
}

/**
 * Processa eventos Kiwify e atualiza banco de dados
 */
async function processWebhook(
  payload: Record<string, any>,
  supabase: any
): Promise<void> {
  const event = String(payload.type ?? payload.event ?? "");
  const order = payload;

  async function findProduct(productId: string) {
    const { data } = await supabase
      .from("kiwify_products")
      .select("*")
      .eq("kiwify_product_id", productId)
      .eq("active", true)
      .maybeSingle();
    return data;
  }

  async function findWorkspace(email: string) {
    // public.profiles não tem coluna email — usar RPC que resolve via auth.users.
    const { data, error } = await supabase.rpc("get_workspace_id_by_email", { p_email: email });
    if (error) {
      console.error("get_workspace_id_by_email error:", error);
      return null;
    }
    return (data as string | null) ?? null;
  }

  // ============================================
  // compra_aprovada — libera 100% imediatamente
  // ============================================
  if (event === "order_approved" || event === "compra_aprovada") {
    const email = String(
      order.Customer?.email ?? order.customer?.email ?? ""
    ).toLowerCase();
    const productId = String(order.Product?.id ?? order.product?.id ?? "");
    const orderId = String(order.order_id ?? order.id ?? "");
    const subId = String(order.subscription_id ?? order.Subscription?.id ?? "");

    const product = await findProduct(productId);
    if (!product) {
      console.error("❌ Produto não encontrado:", productId);
      throw new Error(`Product ${productId} not found`);
    }

    const workspaceId = await findWorkspace(email);

    const { error: kiwifyError } = await supabase
      .from("kiwify_subscriptions")
      .upsert(
        {
          kiwify_order_id: orderId,
          kiwify_subscription_id: subId,
          kiwify_product_id: productId,
          workspace_id: workspaceId,
          module_id: product.module_id,
          plan_slug: product.plan_slug,
          plan_name: product.plan_name,
          email,
          credits_total: product.credits_total,
          credits_released: product.credits_total,
          status: "active",
          approved_at: new Date().toISOString(),
          kiwify_raw: payload,
        },
        { onConflict: "kiwify_order_id" }
      );

    if (kiwifyError) {
      console.error("❌ Error upserting kiwify_subscriptions:", kiwifyError);
      throw kiwifyError;
    }

    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          workspace_id: workspaceId,
          email,
          module_id: product.module_id,
          plan_slug: product.plan_slug,
          plan_name: product.plan_name,
          credits_total: product.credits_total,
          credits_used: 0,
          max_users: product.max_users,
          hotmart_subscription_id: subId || orderId,
          hotmart_product_id: productId,
          status: "active",
          activated_at: new Date().toISOString(),
          hotmart_raw: payload,
        },
        { onConflict: "hotmart_subscription_id" }
      );

    if (userSubError) {
      console.error("❌ Error upserting user_subscriptions:", userSubError);
      throw userSubError;
    }

    console.log(
      `✅ ATIVO: ${product.module_id} ${product.plan_slug} — ${product.credits_total} créditos para ${email}`
    );
  }

  // ============================================
  // subscription_renewed — repoe creditos mensais
  // ============================================
  if (event === "subscription_renewed") {
    const email = String(
      order.Customer?.email ?? order.customer?.email ?? ""
    ).toLowerCase();
    const subId = String(order.subscription_id ?? order.Subscription?.id ?? "");
    const productId = String(order.Product?.id ?? order.product?.id ?? "");
    const product = await findProduct(productId);

    if (product && subId) {
      const { error: userSubError } = await supabase
        .from("user_subscriptions")
        .update({
          status: "active",
          credits_used: 0,
          credits_total: product.credits_total,
        })
        .eq("hotmart_subscription_id", subId);

      if (userSubError) {
        console.error("❌ Error updating user_subscriptions:", userSubError);
        throw userSubError;
      }

      const { error: kiwifyError } = await supabase
        .from("kiwify_subscriptions")
        .update({
          status: "active",
          credits_released: product.credits_total,
        })
        .eq("kiwify_subscription_id", subId);

      if (kiwifyError) {
        console.error("❌ Error updating kiwify_subscriptions:", kiwifyError);
        throw kiwifyError;
      }

      console.log(`✅ RENOVADO: ${email}`);
    }
  }

  // ============================================
  // cancelamento / reembolso / chargeback
  // ============================================
  if (
    [
      "order_refunded",
      "compra_reembolsada",
      "subscription_canceled",
      "chargeback",
    ].includes(event)
  ) {
    const subId = String(order.subscription_id ?? order.Subscription?.id ?? "");
    const orderId = String(order.order_id ?? order.id ?? "");
    const now = new Date().toISOString();
    const key = subId || orderId;

    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .update({ status: "canceled", canceled_at: now })
      .eq("hotmart_subscription_id", key);

    if (userSubError) {
      console.error("❌ Error canceling user_subscriptions:", userSubError);
      throw userSubError;
    }

    const { error: kiwifyError } = await supabase
      .from("kiwify_subscriptions")
      .update({ status: "canceled", canceled_at: now })
      .or(
        `kiwify_order_id.eq.${orderId},kiwify_subscription_id.eq.${subId}`
      );

    if (kiwifyError) {
      console.error("❌ Error canceling kiwify_subscriptions:", kiwifyError);
      throw kiwifyError;
    }

    console.log(`✅ CANCELADO: order ${orderId}`);
  }

  // ============================================
  // inadimplencia
  // ============================================
  if (event === "subscription_late") {
    const subId = String(order.subscription_id ?? order.Subscription?.id ?? "");

    if (subId) {
      const { error: userSubError } = await supabase
        .from("user_subscriptions")
        .update({ status: "pending" })
        .eq("hotmart_subscription_id", subId);

      if (userSubError) {
        console.error("❌ Error updating user_subscriptions:", userSubError);
        throw userSubError;
      }

      const { error: kiwifyError } = await supabase
        .from("kiwify_subscriptions")
        .update({ status: "overdue" })
        .eq("kiwify_subscription_id", subId);

      if (kiwifyError) {
        console.error("❌ Error updating kiwify_subscriptions:", kiwifyError);
        throw kiwifyError;
      }
    }
  }
}

/**
 * Helper para response JSON
 */
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
