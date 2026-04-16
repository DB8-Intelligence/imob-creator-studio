import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── 1. Token fail-closed ────────────────────────────────
  const expectedToken = Deno.env.get("NEXOIMOB_ASAAS_WEBHOOK_API_KEY");
  if (!expectedToken) {
    logEvent({ status: "config_error", reason: "NEXOIMOB_ASAAS_WEBHOOK_API_KEY not configured" });
    return json({ ok: false, error: "Server configuration error: webhook token not configured" }, 500);
  }

  // ── 2. Extract token (header > query > Authorization) ──
  const url = new URL(req.url);
  const receivedToken =
    req.headers.get("asaas-access-token") ||
    url.searchParams.get("signature") ||
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

  // ── 3. Parse payload ───────────────────────────────────
  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch (error) {
    logEvent({ status: "invalid_json", reason: String(error) });
    return json({ ok: false, error: "Invalid JSON in request body" }, 400);
  }

  const event   = String(payload.event ?? "");
  const payment = (payload.payment ?? {}) as Record<string, any>;
  const paymentId = String(payment?.id ?? "");

  if (!event || !paymentId) {
    logEvent({ status: "invalid_payload", reason: "missing event or payment.id", event, payment_id: paymentId });
    return json({ ok: false, error: "Missing event or payment.id" }, 400);
  }

  // ── 4. Idempotency (INSERT-before-process + rollback-on-error) ──
  const dedupeKey = `asaas_${event}_${paymentId}`;
  const { error: insertErr } = await supabase
    .from("webhook_events")
    .insert({ id: dedupeKey, provider: "asaas", event_type: event, order_id: paymentId });

  if (insertErr) {
    if ((insertErr as any).code === "23505") {
      logEvent({ status: "duplicate", event, payment_id: paymentId, dedupe_key: dedupeKey });
      trackFunnel(supabase, "webhook_received", null, {
        provider: "asaas", event_type: event, payment_id: paymentId, duplicate: true,
      });
      return json({ ok: true, duplicate: true, event }, 200);
    }
    logEvent({ status: "dedupe_insert_error", reason: String((insertErr as any).message ?? insertErr), payment_id: paymentId });
    return json({ ok: false, error: "Dedupe store unavailable" }, 500);
  }

  trackFunnel(supabase, "webhook_received", null, {
    provider: "asaas", event_type: event, payment_id: paymentId,
  });

  // ── 5. Process webhook (rollback dedupe row on error) ──
  try {
    await processWebhook(event, payload, payment, supabase);
    logEvent({ status: "success", event, payment_id: paymentId });

    // Backend funnel events for revenue-stage conversions.
    if (event === "PAYMENT_RECEIVED") {
      trackFunnel(supabase, "payment_approved", null, {
        provider: "asaas", payment_id: paymentId,
      });
      trackFunnel(supabase, "credits_released", null, {
        provider: "asaas", payment_id: paymentId,
      });
    } else if (event === "SUBSCRIPTION_CREATED") {
      trackFunnel(supabase, "subscription_created", null, {
        provider: "asaas", payment_id: paymentId,
      });
    }

    return json({ ok: true, event });
  } catch (error) {
    const msg = error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error);
    await supabase.from("webhook_events").delete().eq("id", dedupeKey);
    logEvent({ status: "error", event, payment_id: paymentId, reason: msg });
    trackFunnel(supabase, "webhook_error", null, {
      provider: "asaas", payment_id: paymentId, reason: msg,
    });
    return json({ ok: false, error: "Processing error", message: msg }, 500);
  }
});

// ── Helpers ─────────────────────────────────────────────

/** Structured JSON log. Never include tokens or secrets. */
function logEvent(data: Record<string, any>) {
  console.log(JSON.stringify({
    event: "asaas_webhook",
    timestamp: new Date().toISOString(),
    ...data,
  }));
}

/**
 * Fire-and-forget funnel event insert. Never throws; uses the service_role
 * supabase client the webhook already has. Failures are warn-logged but never
 * propagated so tracking cannot degrade the webhook.
 */
function trackFunnel(supabase: any, event: string, email: string | null, metadata: Record<string, any>) {
  supabase
    .from("funnel_events")
    .insert({ event, email, metadata })
    .then(({ error }: { error: any }) => {
      if (error) console.warn(JSON.stringify({
        event: "asaas_webhook",
        timestamp: new Date().toISOString(),
        status: "funnel_track_failed",
        funnel_event: event,
        reason: String(error.message ?? error),
      }));
    });
}

/**
 * Timing-safe string comparison (prevents side-channel attacks)
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length === bBytes.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return result === 0;
}

async function processWebhook(
  event: string,
  payload: Record<string, any>,
  payment: Record<string, unknown>,
  supabase: any
): Promise<void> {

  // ── PAYMENT_RECEIVED — ativar módulo ─────────────────────────
  if (event === "PAYMENT_RECEIVED") {
    const customerId     = String(payment.customer ?? "");
    // For one-off Pix/boleto payments, payment.subscription is empty.
    // Use payment.id as the unique identifier so the upsert keys don't collide.
    const subscriptionId = String(payment.subscription ?? "") || String(payment.id ?? "");
    const value          = Number(payment.value ?? 0);
    const description    = String(payment.description ?? "");
    const dueDate        = String(payment.dueDate ?? "");

    // Asaas payload only carries customer ID (cus_xxx), not email.
    // Resolve the email by calling Asaas /customers/{id}.
    const apiKey = Deno.env.get("NEXOIMOB_ASAAS_API_KEY");
    if (!apiKey) {
      console.error("❌ NEXOIMOB_ASAAS_API_KEY not configured — cannot resolve customer email");
      throw new Error("NEXOIMOB_ASAAS_API_KEY not configured");
    }
    let email = "";
    try {
      const custRes = await fetch(`https://api.asaas.com/v3/customers/${encodeURIComponent(customerId)}`, {
        headers: { "access_token": apiKey, "Content-Type": "application/json" },
      });
      if (!custRes.ok) {
        const text = await custRes.text();
        console.error(`❌ Asaas /customers/${customerId} error ${custRes.status}: ${text}`);
        throw new Error(`Asaas customer lookup failed: ${custRes.status}`);
      }
      const customer = await custRes.json();
      email = String(customer?.email ?? "").toLowerCase();
      if (!email) {
        console.error("❌ Asaas customer has no email:", customerId);
        throw new Error(`Asaas customer ${customerId} has no email`);
      }
    } catch (err) {
      console.error("❌ Failed to fetch Asaas customer:", String(err));
      throw err;
    }

    // Busca produto pelo nome/descrição
    let prod: Record<string, unknown> | null = null;

    const { data: productByDesc } = await supabase
      .from("asaas_products")
      .select("*")
      .ilike("description", `%${description}%`)
      .eq("active", true)
      .maybeSingle();

    if (productByDesc) {
      prod = productByDesc;
    } else {
      // Tenta encontrar pelo valor
      const { data: productByPrice } = await supabase
        .from("asaas_products")
        .select("*")
        .eq("price", value)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      prod = productByPrice;
    }

    if (!prod) {
      console.error("❌ Asaas: produto não encontrado para:", description, value);
      throw new Error(`Asaas product not found: ${description} / ${value}`);
    }

    // ── DEV-3B: Integrity check — expected price vs paid value ──
    // Does not block (spec: "NÃO bloquear automaticamente"), but flags
    // suspect payments in structured log for later antifraud review.
    const expectedPrice = Number(prod.price ?? 0);
    const priceDelta = Math.abs(expectedPrice - value);
    if (priceDelta > 0.01 && expectedPrice > 0) {
      console.log(JSON.stringify({
        event: "asaas_webhook",
        timestamp: new Date().toISOString(),
        status: "suspect_value_mismatch",
        payment_id: String(payment.id ?? ""),
        description,
        expected_price: expectedPrice,
        paid_value: value,
        delta: Number(priceDelta.toFixed(2)),
        action: "flagged_not_blocked",
      }));
    }

    // Busca workspace pelo email — public.profiles não tem coluna email,
    // resolver via RPC que faz join auth.users → workspaces.
    let workspaceId: string | null = null;
    const { data: wsId, error: wsErr } = await supabase.rpc("get_workspace_id_by_email", { p_email: email });
    if (wsErr) {
      console.error("❌ get_workspace_id_by_email error:", wsErr);
    }
    workspaceId = (wsId as string | null) ?? null;

    if (!workspaceId) {
      console.error(`❌ Asaas: workspace não encontrado para email ${email}. Pagamento ignorado (usuário não tem conta).`);
      throw new Error(`No workspace for email ${email}`);
    }

    // Upsert em user_subscriptions
    const { error: userSubError } = await supabase.from("user_subscriptions").upsert({
      workspace_id:            workspaceId,
      email,
      module_id:               prod.module_id,
      plan_slug:               prod.plan_slug,
      plan_name:               prod.plan_name,
      credits_total:           prod.credits,
      credits_used:            0,
      max_users:               prod.max_users,
      hotmart_subscription_id: subscriptionId,
      hotmart_product_id:      prod.description,
      status:                  "active",
      activated_at:            new Date().toISOString(),
      hotmart_raw:             payload,
    }, { onConflict: "hotmart_subscription_id" });

    if (userSubError) {
      console.error("❌ Error upserting user_subscriptions:", userSubError);
      throw userSubError;
    }

    // Registrar em asaas_subscriptions
    const { error: asaasSubError } = await supabase.from("asaas_subscriptions").upsert({
      workspace_id:          workspaceId,
      asaas_subscription_id: subscriptionId,
      asaas_customer_id:     String(payment.customer ?? ""),
      asaas_payment_id:      String(payment.id ?? ""),
      module_id:             prod.module_id,
      plan_slug:             prod.plan_slug,
      plan_name:             prod.plan_name,
      credits_total:         prod.credits,
      max_users:             prod.max_users,
      email,
      status:                "active",
      next_due_date:         dueDate || null,
      activated_at:          new Date().toISOString(),
      asaas_raw:             payload,
    }, { onConflict: "asaas_subscription_id" });

    if (asaasSubError) {
      console.error("❌ Error upserting asaas_subscriptions:", asaasSubError);
      throw asaasSubError;
    }

    console.log(`✅ ATIVO Asaas: ${prod.module_id} ${prod.plan_slug} — ${prod.credits} créditos para ${email}`);
  }

  // ── PAYMENT_OVERDUE — marcar como inadimplente ────────────────
  if (event === "PAYMENT_OVERDUE") {
    const subscriptionId = String(payment.subscription ?? "");
    if (subscriptionId) {
      await supabase.from("user_subscriptions")
        .update({ status: "pending" })
        .eq("hotmart_subscription_id", subscriptionId);

      await supabase.from("asaas_subscriptions")
        .update({ status: "overdue" })
        .eq("asaas_subscription_id", subscriptionId);

      console.log(`⚠️  OVERDUE Asaas: subscription ${subscriptionId}`);
    }
  }

  // ── PAYMENT_DELETED / SUBSCRIPTION_CANCELLED ─────────────────
  if (event === "PAYMENT_DELETED" || event === "SUBSCRIPTION_CANCELLED") {
    const subscriptionId = String(payment.subscription ?? "");
    if (subscriptionId) {
      await supabase.from("user_subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("hotmart_subscription_id", subscriptionId);

      await supabase.from("asaas_subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("asaas_subscription_id", subscriptionId);

      console.log(`✅ CANCELADO Asaas: subscription ${subscriptionId}`);
    }
  }

  // ── SUBSCRIPTION_CREATED — registrar nova assinatura ─────────
  if (event === "SUBSCRIPTION_CREATED") {
    const sub = payload.subscription as Record<string, unknown>;
    const externalRef = String(sub?.externalReference ?? "");
    const [userId, moduleId, planSlug] = externalRef.split("|");

    if (userId && moduleId && planSlug) {
      const { data: ws } = await supabase
        .from("workspaces").select("id")
        .eq("owner_user_id", userId).maybeSingle();

      const { error: subError } = await supabase.from("asaas_subscriptions").upsert({
        asaas_subscription_id: String(sub.id),
        asaas_customer_id:     String(sub.customer),
        module_id:             moduleId,
        plan_slug:             planSlug,
        workspace_id:          ws?.id ?? null,
        email:                 String(sub.customerEmail ?? ""),
        status:                "pending",
        asaas_raw:             payload,
      }, { onConflict: "asaas_subscription_id" });

      if (subError) {
        console.error("❌ Error creating asaas_subscription:", subError);
        throw subError;
      }

      console.log(`✅ Asaas subscription registered: ${sub.id}`);
    }
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
