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

  // Validar token Asaas
  const token = req.headers.get("asaas-access-token");
  if (token !== Deno.env.get("ASAAS_WEBHOOK_TOKEN")) {
    console.error("Token inválido:", token);
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const event   = payload.event as string;
  const payment = payload.payment as Record<string, unknown>;

  console.log("Asaas event:", event, "payment:", payment?.id);

  // ── PAYMENT_RECEIVED — ativar módulo ─────────────────────────
  if (event === "PAYMENT_RECEIVED") {
    const email           = String(payment.customer ?? "").toLowerCase();
    const subscriptionId  = String(payment.subscription ?? "");
    const value           = Number(payment.value ?? 0);
    const description     = String(payment.description ?? "");
    const dueDate         = String(payment.dueDate ?? "");

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
      console.error("Produto não encontrado para:", description, value);
      return new Response(JSON.stringify({ ok: false, error: "Product not found" }), {
        status: 200, // retornar 200 para Asaas não retentar
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Busca workspace pelo email
    let workspaceId: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profile) {
      const { data: ws } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_user_id", profile.id)
        .maybeSingle();
      workspaceId = ws?.id ?? null;
    }

    // Upsert em user_subscriptions
    await supabase.from("user_subscriptions").upsert({
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

    // Registrar em asaas_subscriptions
    await supabase.from("asaas_subscriptions").upsert({
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

    console.log("Módulo ativado:", prod.module_id, prod.plan_slug, "para", email);
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

      await supabase.from("asaas_subscriptions").upsert({
        asaas_subscription_id: String(sub.id),
        asaas_customer_id:     String(sub.customer),
        module_id:             moduleId,
        plan_slug:             planSlug,
        workspace_id:          ws?.id ?? null,
        email:                 String(sub.customerEmail ?? ""),
        status:                "pending",
        asaas_raw:             payload,
      }, { onConflict: "asaas_subscription_id" });
    }
  }

  return new Response(JSON.stringify({ ok: true, event }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
