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

  // Validar token Kiwify
  const token = req.headers.get("x-kiwify-token") ??
    req.headers.get("authorization")?.replace("Bearer ", "");
  const expectedToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");
  if (expectedToken && token !== expectedToken) {
    console.error("Token invalido:", token);
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const event   = String(payload.type ?? payload.event ?? "");
  const order   = payload;

  console.log("Kiwify event:", event, "order_id:", order?.order_id);

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
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("email", email).maybeSingle();
    if (!profile) return null;
    const { data: ws } = await supabase
      .from("workspaces").select("id").eq("owner_user_id", profile.id).maybeSingle();
    return ws?.id ?? null;
  }

  // compra_aprovada — libera 100% imediatamente
  if (event === "order_approved" || event === "compra_aprovada") {
    const email     = String(order.Customer?.email ?? order.customer?.email ?? "").toLowerCase();
    const productId = String(order.Product?.id ?? order.product?.id ?? "");
    const orderId   = String(order.order_id ?? order.id ?? "");
    const subId     = String(order.subscription_id ?? order.Subscription?.id ?? "");

    const product = await findProduct(productId);
    if (!product) {
      console.error("Produto nao encontrado:", productId);
      return json({ ok: false, error: "Product not found" });
    }

    const workspaceId = await findWorkspace(email);

    await supabase.from("kiwify_subscriptions").upsert({
      kiwify_order_id:        orderId,
      kiwify_subscription_id: subId,
      kiwify_product_id:      productId,
      workspace_id:           workspaceId,
      module_id:              product.module_id,
      plan_slug:              product.plan_slug,
      plan_name:              product.plan_name,
      email,
      credits_total:          product.credits_total,
      credits_released:       product.credits_total,
      status:                 "active",
      approved_at:            new Date().toISOString(),
      kiwify_raw:             payload,
    }, { onConflict: "kiwify_order_id" });

    await supabase.from("user_subscriptions").upsert({
      workspace_id:            workspaceId,
      email,
      module_id:               product.module_id,
      plan_slug:               product.plan_slug,
      plan_name:               product.plan_name,
      credits_total:           product.credits_total,
      credits_used:            0,
      max_users:               product.max_users,
      hotmart_subscription_id: subId || orderId,
      hotmart_product_id:      productId,
      status:                  "active",
      activated_at:            new Date().toISOString(),
      hotmart_raw:             payload,
    }, { onConflict: "hotmart_subscription_id" });

    console.log(`ATIVO: ${product.module_id} ${product.plan_slug} — ${product.credits_total} creditos para ${email}`);
  }

  // subscription_renewed — repoe creditos mensais
  if (event === "subscription_renewed") {
    const email     = String(order.Customer?.email ?? order.customer?.email ?? "").toLowerCase();
    const subId     = String(order.subscription_id ?? order.Subscription?.id ?? "");
    const productId = String(order.Product?.id ?? order.product?.id ?? "");
    const product   = await findProduct(productId);
    if (product && subId) {
      await supabase.from("user_subscriptions")
        .update({ status: "active", credits_used: 0, credits_total: product.credits_total })
        .eq("hotmart_subscription_id", subId);
      await supabase.from("kiwify_subscriptions")
        .update({ status: "active", credits_released: product.credits_total })
        .eq("kiwify_subscription_id", subId);
      console.log(`RENOVADO: ${email}`);
    }
  }

  // cancelamento / reembolso / chargeback
  if (["order_refunded","compra_reembolsada","subscription_canceled","chargeback"].includes(event)) {
    const subId   = String(order.subscription_id ?? order.Subscription?.id ?? "");
    const orderId = String(order.order_id ?? order.id ?? "");
    const now     = new Date().toISOString();
    const key     = subId || orderId;
    await supabase.from("user_subscriptions")
      .update({ status: "canceled", canceled_at: now })
      .eq("hotmart_subscription_id", key);
    await supabase.from("kiwify_subscriptions")
      .update({ status: "canceled", canceled_at: now })
      .or(`kiwify_order_id.eq.${orderId},kiwify_subscription_id.eq.${subId}`);
    console.log(`CANCELADO: order ${orderId}`);
  }

  // inadimplencia
  if (event === "subscription_late") {
    const subId = String(order.subscription_id ?? order.Subscription?.id ?? "");
    if (subId) {
      await supabase.from("user_subscriptions")
        .update({ status: "pending" })
        .eq("hotmart_subscription_id", subId);
      await supabase.from("kiwify_subscriptions")
        .update({ status: "overdue" })
        .eq("kiwify_subscription_id", subId);
    }
  }

  return json({ ok: true, event });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
