import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_API_URL = "https://api.asaas.com/v3";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const { module_id, plan_slug, cpf_cnpj, phone } = await req.json();

  if (!module_id || !plan_slug) {
    return json({ error: "module_id e plan_slug são obrigatórios" }, 400);
  }

  const { data: product } = await supabaseAdmin
    .from("asaas_products")
    .select("*")
    .eq("module_id", module_id)
    .eq("plan_slug", plan_slug)
    .eq("active", true)
    .maybeSingle();

  if (!product) {
    return json({ error: "Produto não encontrado" }, 404);
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Canonical: NEXOIMOB_ASAAS_API_KEY (per DB8 convention).
  // LEGACY fallback: ASAAS_API_KEY — remove once all environments are migrated.
  const apiKey =
    Deno.env.get("NEXOIMOB_ASAAS_API_KEY") ??
    Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    console.error("CRITICAL: NEXOIMOB_ASAAS_API_KEY (nor legacy ASAAS_API_KEY) configured");
    return json({ error: "Server configuration error: Asaas API key not configured" }, 500);
  }
  const headers = {
    "Content-Type": "application/json",
    "access_token": apiKey,
  };

  // ── PASSO 1: Criar ou buscar customer no Asaas ─────────────────
  let asaasCustomerId: string;

  const searchRes = await fetch(
    `${ASAAS_API_URL}/customers?email=${encodeURIComponent(user.email!)}`,
    { headers }
  );
  const searchData = await searchRes.json();

  if (searchData.data?.length > 0) {
    asaasCustomerId = searchData.data[0].id;
  } else {
    const customerRes = await fetch(`${ASAAS_API_URL}/customers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name:              profile?.full_name ?? user.email!.split("@")[0],
        email:             user.email,
        cpfCnpj:           cpf_cnpj ?? "",
        phone:             phone ?? "",
        externalReference: user.id,
      }),
    });
    const customer = await customerRes.json();
    if (!customer.id) {
      console.error("Erro ao criar customer:", customer);
      return json({ error: "Erro ao criar cliente no Asaas", details: customer }, 500);
    }
    asaasCustomerId = customer.id;
  }

  // ── PASSO 2: Criar assinatura recorrente ──────────────────────
  const subscriptionRes = await fetch(`${ASAAS_API_URL}/subscriptions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customer:          asaasCustomerId,
      billingType:       "UNDEFINED",
      value:             product.price,
      nextDueDate:       new Date().toISOString().split("T")[0],
      cycle:             "MONTHLY",
      description:       product.description,
      externalReference: `${user.id}|${module_id}|${plan_slug}`,
    }),
  });
  const subscription = await subscriptionRes.json();

  if (!subscription.id) {
    console.error("Erro ao criar assinatura:", subscription);
    return json({ error: "Erro ao criar assinatura no Asaas", details: subscription }, 500);
  }

  // ── PASSO 3: Buscar URL de pagamento da primeira cobrança ─────
  const paymentsRes = await fetch(
    `${ASAAS_API_URL}/subscriptions/${subscription.id}/payments`,
    { headers }
  );
  const paymentsData = await paymentsRes.json();
  const firstPayment = paymentsData.data?.[0];

  const checkoutUrl = firstPayment?.invoiceUrl ??
    `https://www.asaas.com/i/${firstPayment?.id}`;

  // ── PASSO 4: Salvar registro pendente ─────────────────────────
  const { data: workspace } = await supabaseAdmin
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  await supabaseAdmin.from("asaas_subscriptions").insert({
    workspace_id:          workspace?.id ?? null,
    asaas_subscription_id: subscription.id,
    asaas_customer_id:     asaasCustomerId,
    asaas_payment_id:      firstPayment?.id ?? null,
    module_id,
    plan_slug,
    plan_name:             product.plan_name,
    credits_total:         product.credits,
    max_users:             product.max_users,
    email:                 user.email!,
    status:                "pending",
    next_due_date:         new Date().toISOString().split("T")[0],
    asaas_raw:             subscription,
  });

  return json({
    ok:              true,
    subscription_id: subscription.id,
    checkout_url:    checkoutUrl,
    payment_id:      firstPayment?.id,
  });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
