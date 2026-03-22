import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapeamento produto → créditos
// Configure as variáveis de ambiente com os IDs reais dos produtos no Kiwify
const PRODUCT_CREDITS: Record<string, number> = {};

function resolveCredits(productId: string, productName: string): number {
  // 1. Tenta por ID exato (via env vars)
  const byId = PRODUCT_CREDITS[productId];
  if (byId) return byId;

  // 2. Tenta por ID das env vars
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_20")) return 20;
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_50")) return 50;
  if (productId === Deno.env.get("KIWIFY_PRODUCT_ID_150")) return 150;

  // 3. Fallback: detecta pelo nome do produto
  const name = productName.toLowerCase();
  if (name.includes("150")) return 150;
  if (name.includes("50")) return 50;
  if (name.includes("20")) return 20;

  return 0;
}

serve(async (req) => {
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

    const orderId = payload?.order_id ?? payload?.id;
    const email = payload?.buyer?.email ?? payload?.customer?.email;
    const productId = payload?.product?.id ?? "";
    const productName = payload?.product?.name ?? payload?.plan?.name ?? "";

    if (!orderId || !email) {
      console.error("Payload inválido: faltam order_id ou email", { orderId, email });
      return new Response(JSON.stringify({ error: "Payload inválido: faltam order_id ou email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const credits = resolveCredits(productId, productName);

    if (credits === 0) {
      console.error("Produto não mapeado:", { productId, productName });
      return new Response(
        JSON.stringify({ error: "Produto não mapeado", productId, productName }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Chama a função RPC credit_purchase no Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    console.log("Créditos creditados:", data);

    return new Response(
      JSON.stringify({ success: true, credits_added: credits, result: data }),
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
