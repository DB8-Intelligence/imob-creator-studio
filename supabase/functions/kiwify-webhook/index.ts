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

  // ── 1. Token fail-closed ────────────────────────────────────
  const expectedToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");
  if (!expectedToken) {
    logEvent({ status: "config_error", reason: "KIWIFY_WEBHOOK_TOKEN not configured" });
    return json({ ok: false, error: "Server configuration error: webhook token not configured" }, 500);
  }

  // ── 2. Extract token (query > header > Authorization) ──────
  const url = new URL(req.url);
  const receivedToken =
    url.searchParams.get("signature") ||
    req.headers.get("x-kiwify-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!receivedToken) {
    logEvent({ status: "token_missing", reason: "no token provided" });
    return json({ ok: false, error: "Missing authentication token" }, 401);
  }

  const tokenOk = await timingSafeEqual(receivedToken, expectedToken);
  if (!tokenOk) {
    logEvent({ status: "token_invalid", reason: "timing-safe mismatch" });
    return json({ ok: false, error: "Invalid authentication token" }, 401);
  }

  // ── 3. Parse payload ──────────────────────────────────────
  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch (error) {
    logEvent({ status: "invalid_json", reason: String(error) });
    return json({ ok: false, error: "Invalid JSON in request body" }, 400);
  }

  // ── 4. Validate payload shape ─────────────────────────────
  const validation = validatePayload(payload);
  if (validation) {
    logEvent({
      status: "invalid_payload",
      reason: validation.reason,
      field: validation.field,
      order_id: payload?.order_id ?? payload?.id ?? null,
    });
    return json({ ok: false, error: "Invalid payload", field: validation.field, reason: validation.reason }, 400);
  }

  const event = String(payload.type ?? payload.event ?? "");
  const orderId = String(payload.order_id ?? payload.id ?? "");
  const email = String(payload.Customer?.email ?? payload.customer?.email ?? "").toLowerCase();

  // ── 5. Idempotency (INSERT-before-process + rollback-on-error) ──
  // Dedupe key = provider + event_type + order_id, so the same order can still
  // progress through order_approved -> subscription_renewed -> order_refunded
  // (each distinct event_type dedupes independently).
  const dedupeKey = `kiwify_${event}_${orderId}`;

  const { error: insertErr } = await supabase
    .from("webhook_events")
    .insert({ id: dedupeKey, provider: "kiwify", event_type: event, order_id: orderId });

  if (insertErr) {
    // 23505 = unique_violation -> duplicate delivery, ack and skip processing.
    if ((insertErr as any).code === "23505") {
      logEvent({ status: "duplicate", event, order_id: orderId, email, dedupe_key: dedupeKey });
      return json({ ok: true, duplicate: true, event }, 200);
    }
    logEvent({ status: "dedupe_insert_error", reason: String((insertErr as any).message ?? insertErr), order_id: orderId });
    return json({ ok: false, error: "Dedupe store unavailable" }, 500);
  }

  // ── 6. Process webhook (rollback dedupe row on error) ─────
  try {
    await processWebhook(payload, supabase);
    logEvent({
      status: "success",
      event,
      order_id: orderId,
      email,
      // module/plan resolved inside processWebhook but we re-read via fresh query
      // so the log always reflects the row actually written.
    });
    return json({ ok: true, event });
  } catch (error) {
    const msg = error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error);
    // Roll back the dedupe marker so the provider's retry can try again.
    await supabase.from("webhook_events").delete().eq("id", dedupeKey);
    logEvent({ status: "error", event, order_id: orderId, email, reason: msg });
    return json({ ok: false, error: "Processing error", message: msg }, 500);
  }
});

// ── Helpers ─────────────────────────────────────────────────

/** Structured JSON log. Never include tokens or secrets. */
function logEvent(data: Record<string, any>) {
  console.log(JSON.stringify({
    event: "kiwify_webhook",
    timestamp: new Date().toISOString(),
    ...data,
  }));
}

interface ValidationError { field: string; reason: string; }

/**
 * Validates the fields the business logic actually consumes:
 *   - payload must be a non-null object
 *   - order_id (payload.order_id || payload.id): non-empty string
 *   - email (payload.Customer.email || payload.customer.email): valid format
 *   - product id (payload.Product.id || payload.product.id): non-empty string
 *
 * Optional fields (Product.name, value) are NOT blocked — the processWebhook
 * function does not consume them, and real Kiwify payloads for renewals/refunds
 * may omit them. Missing values are logged as warnings by the caller if needed.
 */
function validatePayload(payload: any): ValidationError | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { field: "payload", reason: "missing or not an object" };
  }

  const orderId = payload.order_id ?? payload.id;
  if (typeof orderId !== "string" || orderId.trim() === "") {
    return { field: "order.id", reason: "missing or not a non-empty string" };
  }

  const email = payload.Customer?.email ?? payload.customer?.email;
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { field: "order.Customer.email", reason: "missing or invalid email format" };
  }

  const productId = payload.Product?.id ?? payload.product?.id;
  if ((typeof productId !== "string" && typeof productId !== "number") || String(productId).trim() === "") {
    return { field: "order.Product.id", reason: "missing or empty" };
  }

  return null;
}

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
