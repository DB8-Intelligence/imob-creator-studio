import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * kiwify-webhook — Ativa créditos e planos após pagamento aprovado pela Kiwify.
 *
 * Schema real (spjnymdizezgmzwoskoj):
 *   - public.users         : id, email, user_plan, credits_remaining, credits_total
 *   - public.credit_transactions : rastreia transações (via RPC credit_purchase)
 *   - RPC credit_purchase  : aplica créditos + registra transação (idempotente via order_id)
 *
 * Fluxos:
 *   1. Créditos avulsos de imagem (20 / 50 / 150) → credit_purchase RPC
 *   2. Planos de vídeo (standard / plus / premium)  → credit_purchase RPC + update user_plan
 *
 * Variáveis de ambiente necessárias (Supabase Secrets):
 *   KIWIFY_WEBHOOK_TOKEN          — token de validação no query string ?token=
 *   KIWIFY_PRODUCT_ID_20          — (opcional) ID Kiwify do pacote 20 créditos
 *   KIWIFY_PRODUCT_ID_50          — (opcional) ID Kiwify do pacote 50 créditos
 *   KIWIFY_PRODUCT_ID_150         — (opcional) ID Kiwify do pacote 150 créditos
 *   KIWIFY_VIDEO_PRODUCT_ID_STANDARD — (opcional) ID Kiwify do plano vídeo standard
 *   KIWIFY_VIDEO_PRODUCT_ID_PLUS     — (opcional) ID Kiwify do plano vídeo plus
 *   KIWIFY_VIDEO_PRODUCT_ID_PREMIUM  — (opcional) ID Kiwify do plano vídeo premium
 *   (sem esses IDs o fallback é por nome do produto)
 */

// ─── Créditos por pacote de imagem ───────────────────────────────────────────
function resolveImageCredits(productId: string, productName: string): number {
  if (productId && productId === Deno.env.get("KIWIFY_PRODUCT_ID_20"))  return 20;
  if (productId && productId === Deno.env.get("KIWIFY_PRODUCT_ID_50"))  return 50;
  if (productId && productId === Deno.env.get("KIWIFY_PRODUCT_ID_150")) return 150;

  // Fallback por nome
  const name = productName.toLowerCase();
  if (name.includes("150")) return 150;
  if (name.includes("50"))  return 50;
  if (name.includes("20"))  return 20;

  return 0;
}

// ─── Tipo de addon de vídeo ───────────────────────────────────────────────────
type VideoAddonType = "standard" | "plus" | "premium";

function resolveVideoAddon(productId: string, productName: string): VideoAddonType | null {
  if (productId && productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_STANDARD")) return "standard";
  if (productId && productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_PLUS"))     return "plus";
  if (productId && productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_PREMIUM"))  return "premium";

  // Fallback por nome
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Valida token (?token=XXX na URL do webhook) ──────────────────────────
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const expectedToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");

    if (expectedToken && token !== expectedToken) {
      console.error("Kiwify webhook: token inválido");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    console.log("Kiwify webhook received:", JSON.stringify(payload).substring(0, 300));

    const orderStatus = payload?.order_status ?? payload?.status;

    // Só processa pagamentos confirmados
    if (orderStatus !== "paid" && orderStatus !== "approved") {
      console.log("Skipping non-paid event:", orderStatus);
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: "status_not_paid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderId     = payload?.order_id ?? payload?.id ?? "";
    const email       = payload?.buyer?.email ?? payload?.customer?.email ?? "";
    const productId   = payload?.product?.id ?? "";
    const productName = payload?.product?.name ?? payload?.plan?.name ?? "";

    if (!orderId || !email) {
      console.error("Invalid payload — missing orderId or email", { orderId, email });
      return new Response(
        JSON.stringify({ error: "Payload inválido: faltam order_id ou email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Tenta plano de vídeo primeiro ────────────────────────────────────────
    const videoAddonType = resolveVideoAddon(productId, productName);

    if (videoAddonType) {
      const creditAmount = VIDEO_ADDON_CREDITS[videoAddonType];
      const billingCycle = productName.toLowerCase().includes("anual") ? "yearly" : "monthly";

      console.log("Video addon identified:", videoAddonType, "credits:", creditAmount, "order:", orderId);

      // Aplica créditos via credit_purchase (idempotente por order_id)
      const { error: creditError } = await supabase.rpc("credit_purchase", {
        p_email:       email,
        p_order_id:    orderId,
        p_amount:      creditAmount,
        p_description: `Plano Vídeo ${videoAddonType.charAt(0).toUpperCase() + videoAddonType.slice(1)} — ${productName || orderId}`,
        p_metadata: {
          kiwify_order_id: orderId,
          product_id:      productId,
          product_name:    productName,
          addon_type:      videoAddonType,
          billing_cycle:   billingCycle,
          type:            "video_plan",
        },
      });

      if (creditError) {
        // Duplicate order_id = já processado (idempotência)
        if (creditError.code === "23505" || creditError.message?.includes("duplicate") || creditError.message?.includes("already")) {
          console.log("Video order already processed:", orderId);
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "already_processed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error("Error applying video credits:", creditError);
        throw new Error(creditError.message);
      }

      // Atualiza user_plan para refletir o tier ativo
      // Valores possíveis: video_standard | video_plus | video_premium
      const { error: planError } = await supabase
        .from("users")
        .update({ user_plan: `video_${videoAddonType}` })
        .eq("email", email);

      if (planError) {
        // Não bloqueia: créditos já foram aplicados com sucesso
        console.error("Warning: credits applied but user_plan update failed:", planError.message);
      }

      console.log("Video addon activated:", videoAddonType, "credits:", creditAmount, "email:", email);

      return new Response(
        JSON.stringify({
          success:       true,
          type:          "video_addon",
          addon_type:    videoAddonType,
          credits_added: creditAmount,
          billing_cycle: billingCycle,
          email,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Créditos avulsos de imagem ────────────────────────────────────────────
    const credits = resolveImageCredits(productId, productName);

    if (credits === 0) {
      console.error("Produto não mapeado:", { productId, productName });
      return new Response(
        JSON.stringify({ error: "Produto não mapeado", productId, productName }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase.rpc("credit_purchase", {
      p_email:       email,
      p_order_id:    orderId,
      p_amount:      credits,
      p_description: `Compra: ${productName || credits + " créditos"}`,
      p_metadata: {
        kiwify_order_id: orderId,
        product_id:      productId,
        product_name:    productName,
        buyer_name:      payload?.buyer?.name ?? payload?.customer?.name ?? "",
        raw_status:      orderStatus,
        type:            "image_credits",
      },
    });

    if (error) {
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("already")) {
        console.log("Image credit order already processed:", orderId);
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "already_processed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("Error crediting image credits:", error);
      throw new Error(error.message);
    }

    console.log("Image credits applied:", credits, "to:", email, "order:", orderId);

    return new Response(
      JSON.stringify({ success: true, type: "image_credits", credits_added: credits, result: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("kiwify-webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
