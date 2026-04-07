import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * kiwify-webhook — Ativa créditos e planos após pagamento Kiwify (DEV-32).
 *
 * Fluxos:
 *   1. Pagamento aprovado (paid) → ativa plano + créditos + billing_event
 *   2. Reembolso (refunded) → revoga plano + log
 *   3. Cancelamento (cancelled/subscription_cancelled) → marca plano como cancelado
 *   4. Renovação (renewed) → recarrega créditos + log
 *
 * Variáveis de ambiente:
 *   KIWIFY_WEBHOOK_TOKEN
 *   KIWIFY_PRODUCT_ID_20 / 50 / 150
 *   KIWIFY_VIDEO_PRODUCT_ID_STANDARD / PLUS / PREMIUM
 */

// ─── Resolvers ──────────────────────────────────────────────────────────────

function resolveImageCredits(productId: string, productName: string): number {
  if (productId && productId === Deno.env.get("KIWIFY_PRODUCT_ID_20"))  return 20;
  if (productId && productId === Deno.env.get("KIWIFY_PRODUCT_ID_50"))  return 50;
  if (productId && productId === Deno.env.get("KIWIFY_PRODUCT_ID_150")) return 150;
  const name = productName.toLowerCase();
  if (name.includes("150")) return 150;
  if (name.includes("50"))  return 50;
  if (name.includes("20"))  return 20;
  return 0;
}

type VideoAddonType = "standard" | "plus" | "premium";

function resolveVideoAddon(productId: string, productName: string): VideoAddonType | null {
  if (productId && productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_STANDARD")) return "standard";
  if (productId && productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_PLUS"))     return "plus";
  if (productId && productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_PREMIUM"))  return "premium";
  const name = productName.toLowerCase();
  if (name.includes("premium")) return "premium";
  if (name.includes("plus"))    return "plus";
  if (name.includes("standard") || name.includes("vídeo") || name.includes("video")) return "standard";
  return null;
}

const VIDEO_ADDON_CREDITS: Record<VideoAddonType, number> = {
  standard: 300,
  plus:     600,
  premium:  800,
};

// ─── Billing event logger ─────────────────────────────────────────────────

async function logBillingEvent(
  supabase: ReturnType<typeof createClient>,
  params: {
    userId?: string;
    email: string;
    eventType: string;
    planFrom?: string;
    planTo?: string;
    creditsAmount?: number;
    creditsBefore?: number;
    creditsAfter?: number;
    orderId?: string;
    productId?: string;
    amountBrl?: number;
    billingCycle?: string;
    metadata?: Record<string, unknown>;
    errorMessage?: string;
  }
) {
  // Resolve user_id from email if not provided
  let userId = params.userId;
  if (!userId && params.email) {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("email", params.email)
      .single();
    userId = data?.id;
  }
  if (!userId) return;

  await supabase.from("billing_events").insert({
    user_id: userId,
    event_type: params.eventType,
    plan_from: params.planFrom ?? null,
    plan_to: params.planTo ?? null,
    credits_amount: params.creditsAmount ?? null,
    credits_before: params.creditsBefore ?? null,
    credits_after: params.creditsAfter ?? null,
    order_id: params.orderId ?? null,
    product_id: params.productId ?? null,
    amount_brl: params.amountBrl ?? null,
    billing_cycle: params.billingCycle ?? null,
    metadata: params.metadata ?? {},
    error_message: params.errorMessage ?? null,
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate token
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const expectedToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");
    if (expectedToken && token !== expectedToken) {
      return json({ error: "Unauthorized" }, 401);
    }

    const payload = await req.json();
    console.log("Kiwify webhook:", JSON.stringify(payload).substring(0, 300));

    const orderStatus = payload?.order_status ?? payload?.status;
    const orderId     = payload?.order_id ?? payload?.id ?? "";
    const email       = payload?.buyer?.email ?? payload?.customer?.email ?? "";
    const productId   = payload?.product?.id ?? "";
    const productName = payload?.product?.name ?? payload?.plan?.name ?? "";
    const amountBrl   = payload?.sale?.total ?? payload?.total ?? null;

    if (!orderId || !email) {
      return json({ error: "Payload inválido: faltam order_id ou email" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Get current user state ──────────────────────────────────────
    const { data: currentUser } = await supabase
      .from("users")
      .select("id, user_plan, credits_remaining, credits_total")
      .eq("email", email)
      .single();

    const currentPlan = currentUser?.user_plan ?? "credits";
    const creditsBefore = currentUser?.credits_remaining ?? 0;

    // ── Handle by status ────────────────────────────────────────────

    // REFUND
    if (orderStatus === "refunded" || orderStatus === "chargedback") {
      await supabase
        .from("users")
        .update({ user_plan: "credits" })
        .eq("email", email);

      await logBillingEvent(supabase, {
        userId: currentUser?.id,
        email,
        eventType: "plan_cancel",
        planFrom: currentPlan,
        planTo: "credits",
        orderId,
        productId,
        amountBrl: amountBrl ? Number(amountBrl) : undefined,
        metadata: { reason: orderStatus, product_name: productName },
      });

      return json({ success: true, type: "refund", plan_revoked: true });
    }

    // CANCELLATION
    if (orderStatus === "cancelled" || orderStatus === "subscription_cancelled") {
      await logBillingEvent(supabase, {
        userId: currentUser?.id,
        email,
        eventType: "plan_cancel",
        planFrom: currentPlan,
        orderId,
        productId,
        metadata: { reason: orderStatus, product_name: productName },
      });

      // Don't revoke immediately — plan remains active until period ends
      return json({ success: true, type: "cancellation_logged" });
    }

    // PAYMENT FAILED
    if (orderStatus === "payment_failed" || orderStatus === "declined") {
      await logBillingEvent(supabase, {
        userId: currentUser?.id,
        email,
        eventType: "payment_failed",
        planFrom: currentPlan,
        orderId,
        productId,
        amountBrl: amountBrl ? Number(amountBrl) : undefined,
        errorMessage: `Payment ${orderStatus}`,
        metadata: { product_name: productName },
      });

      return json({ success: true, type: "payment_failed_logged" });
    }

    // Skip non-paid events
    if (orderStatus !== "paid" && orderStatus !== "approved" && orderStatus !== "renewed") {
      return json({ received: true, skipped: true, reason: "status_not_actionable" });
    }

    // ── VIDEO PLAN ──────────────────────────────────────────────────
    const videoAddonType = resolveVideoAddon(productId, productName);

    if (videoAddonType) {
      const creditAmount = VIDEO_ADDON_CREDITS[videoAddonType];
      const billingCycle = productName.toLowerCase().includes("anual") ? "yearly" : "monthly";
      const isRenewal = orderStatus === "renewed" || currentPlan === `video_${videoAddonType}`;
      const newPlan = `video_${videoAddonType}`;

      // Apply credits (idempotent by order_id)
      const { error: creditError } = await supabase.rpc("credit_purchase", {
        p_email: email,
        p_order_id: orderId,
        p_amount: creditAmount,
        p_description: `${isRenewal ? "Renovação" : "Plano"} Vídeo ${videoAddonType.charAt(0).toUpperCase() + videoAddonType.slice(1)}`,
        p_metadata: {
          kiwify_order_id: orderId,
          product_id: productId,
          product_name: productName,
          addon_type: videoAddonType,
          billing_cycle: billingCycle,
          type: isRenewal ? "video_plan_renewal" : "video_plan",
        },
      });

      if (creditError) {
        if (creditError.code === "23505" || creditError.message?.includes("duplicate") || creditError.message?.includes("already")) {
          return json({ success: true, skipped: true, reason: "already_processed" });
        }
        throw new Error(creditError.message);
      }

      // Update user_plan
      await supabase
        .from("users")
        .update({ user_plan: newPlan })
        .eq("email", email);

      // Get updated credits
      const { data: updatedUser } = await supabase
        .from("users")
        .select("credits_remaining")
        .eq("email", email)
        .single();

      // Log billing event
      await logBillingEvent(supabase, {
        userId: currentUser?.id,
        email,
        eventType: isRenewal ? "plan_renew" : "plan_upgrade",
        planFrom: currentPlan,
        planTo: newPlan,
        creditsAmount: creditAmount,
        creditsBefore,
        creditsAfter: updatedUser?.credits_remaining ?? creditsBefore + creditAmount,
        orderId,
        productId,
        amountBrl: amountBrl ? Number(amountBrl) : undefined,
        billingCycle,
        metadata: { product_name: productName },
      });

      return json({
        success: true,
        type: isRenewal ? "video_plan_renewal" : "video_addon",
        addon_type: videoAddonType,
        credits_added: creditAmount,
        billing_cycle: billingCycle,
        email,
      });
    }

    // ── IMAGE CREDITS ───────────────────────────────────────────────
    const credits = resolveImageCredits(productId, productName);

    if (credits === 0) {
      return json({ error: "Produto não mapeado", productId, productName }, 422);
    }

    const { data, error } = await supabase.rpc("credit_purchase", {
      p_email: email,
      p_order_id: orderId,
      p_amount: credits,
      p_description: `Compra: ${productName || credits + " créditos"}`,
      p_metadata: {
        kiwify_order_id: orderId,
        product_id: productId,
        product_name: productName,
        buyer_name: payload?.buyer?.name ?? "",
        type: "image_credits",
      },
    });

    if (error) {
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("already")) {
        return json({ success: true, skipped: true, reason: "already_processed" });
      }
      throw new Error(error.message);
    }

    // Get updated credits
    const { data: updatedUserImg } = await supabase
      .from("users")
      .select("credits_remaining")
      .eq("email", email)
      .single();

    // Log billing event
    await logBillingEvent(supabase, {
      userId: currentUser?.id,
      email,
      eventType: "credit_purchase",
      creditsAmount: credits,
      creditsBefore,
      creditsAfter: updatedUserImg?.credits_remaining ?? creditsBefore + credits,
      orderId,
      productId,
      amountBrl: amountBrl ? Number(amountBrl) : undefined,
      metadata: { product_name: productName },
    });

    return json({ success: true, type: "image_credits", credits_added: credits, result: data });
  } catch (err) {
    console.error("kiwify-webhook error:", err);
    return json({ error: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
