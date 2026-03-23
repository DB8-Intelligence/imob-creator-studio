import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

// ─── Planos de créditos de imagem ─────────────────────────────────────────────
// Pro+ (90 e 150 créditos) incluem infraestrutura do pipeline WhatsApp → Instagram.
// Configurar as env vars KIWIFY_PRODUCT_ID_PRO_PLUS_90 e KIWIFY_PRODUCT_ID_PRO_PLUS_150
// após cadastrar os produtos no Kiwify.
function resolveImageCredits(productId: string, productName: string): number {
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_20"))            return 20;
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_50"))            return 50;
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_150"))           return 150;
  // Plano Pro+
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_PRO_PLUS_90"))   return 90;
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_PRO_PLUS_150"))  return 150;

  // Fallback: detecta pelo nome
  const name = productName.toLowerCase();
  if (name.includes("pro plus 150") || name.includes("pro+ 150"))    return 150;
  if (name.includes("pro plus 90")  || name.includes("pro+ 90"))     return 90;
  if (name.includes("150")) return 150;
  if (name.includes("50"))  return 50;
  if (name.includes("20"))  return 20;

  return 0;
}

// ─── Planos de vídeo ──────────────────────────────────────────────────────────
type VideoAddonType = "standard" | "plus" | "premium";

function resolveVideoAddon(productId: string, productName: string): VideoAddonType | null {
  if (productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_STANDARD")) return "standard";
  if (productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_PLUS"))     return "plus";
  if (productId === Deno.env.get("KIWIFY_VIDEO_PRODUCT_ID_PREMIUM"))  return "premium";

  // Fallback: detecta pelo nome
  const name = productName.toLowerCase();
  if (name.includes("premium")) return "premium";
  if (name.includes("plus"))    return "plus";
  if (name.includes("standard")) return "standard";

  return null;
}

const VIDEO_ADDON_CREDITS: Record<VideoAddonType, number> = {
  standard: 300,
  plus: 600,
  premium: 800,
};

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Valida token de segurança Kiwify (?token=SEU_TOKEN na URL do webhook)
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
    console.log("Kiwify webhook payload:", JSON.stringify(payload));

    const orderStatus = payload?.order_status ?? payload?.status;

    // Só processa pagamentos confirmados
    if (orderStatus !== "paid" && orderStatus !== "approved") {
      console.log("Ignorando evento com status:", orderStatus);
      return new Response(JSON.stringify({ received: true, skipped: true, reason: "status_not_paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderId    = payload?.order_id ?? payload?.id;
    const email      = payload?.buyer?.email ?? payload?.customer?.email;
    const productId  = payload?.product?.id ?? "";
    const productName = payload?.product?.name ?? payload?.plan?.name ?? "";

    if (!orderId || !email) {
      console.error("Payload inválido: faltam order_id ou email", { orderId, email });
      return new Response(JSON.stringify({ error: "Payload inválido: faltam order_id ou email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Tenta identificar como plano de vídeo primeiro ────────────────────────
    const videoAddonType = resolveVideoAddon(productId, productName);

    if (videoAddonType) {
      console.log("Produto de vídeo identificado:", videoAddonType, "order:", orderId);

      // Busca o user_id pelo email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        console.error("Usuário não encontrado para email:", email);
        return new Response(
          JSON.stringify({ error: "Usuário não encontrado", email }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = userData.id;

      // Busca workspace do usuário (workspace principal = owner)
      const { data: wsData } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId)
        .eq("role", "owner")
        .limit(1)
        .single();

      const workspaceId = wsData?.workspace_id ?? null;

      if (!workspaceId) {
        console.error("Workspace não encontrado para user:", userId);
        return new Response(
          JSON.stringify({ error: "Workspace não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const creditsTotal = VIDEO_ADDON_CREDITS[videoAddonType];
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Determina billing_cycle pelo nome do produto
      const billingCycle = productName.toLowerCase().includes("anual") ? "yearly" : "monthly";

      // Desativa addons anteriores do workspace
      await supabase
        .from("video_plan_addons")
        .update({ status: "inactive" })
        .eq("workspace_id", workspaceId)
        .eq("status", "active");

      // Cria novo addon (idempotência via order_id no metadata)
      const { data: addonData, error: addonError } = await supabase
        .from("video_plan_addons")
        .insert({
          workspace_id: workspaceId,
          addon_type: videoAddonType,
          billing_cycle: billingCycle,
          credits_total: creditsTotal,
          credits_used: 0,
          status: "active",
          expires_at: expiresAt.toISOString(),
          metadata: {
            kiwify_order_id: orderId,
            product_id: productId,
            product_name: productName,
            activated_by_webhook: true,
          },
        })
        .select()
        .single();

      if (addonError) {
        // Verifica se é duplicata do order_id
        if (addonError.message?.includes("duplicate") || addonError.code === "23505") {
          console.log("Addon já ativado para order_id:", orderId);
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "already_processed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error("Erro ao ativar addon de vídeo:", addonError);
        throw new Error(addonError.message);
      }

      console.log("Addon de vídeo ativado:", videoAddonType, "workspace:", workspaceId);

      return new Response(
        JSON.stringify({
          success: true,
          type: "video_addon",
          addon_type: videoAddonType,
          credits_total: creditsTotal,
          workspace_id: workspaceId,
          addon_id: addonData?.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Plano de créditos de imagem ────────────────────────────────────────────
    const credits = resolveImageCredits(productId, productName);

    if (credits === 0) {
      console.error("Produto não mapeado:", { productId, productName });
      return new Response(
        JSON.stringify({ error: "Produto não mapeado", productId, productName }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        buyer_name: payload?.buyer?.name ?? payload?.customer?.name ?? "",
        raw_status: orderStatus,
      },
    });

    if (error) {
      console.error("Erro ao creditar:", error);
      throw new Error(error.message);
    }

    console.log("Créditos de imagem creditados:", credits, "para:", email);

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
