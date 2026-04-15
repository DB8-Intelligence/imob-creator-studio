import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_API_BASE = "https://api.asaas.com/v3";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const apiKey = Deno.env.get("NEXOIMOB_ASAAS_API_KEY");
  if (!apiKey) {
    console.error("🚨 CRITICAL: NEXOIMOB_ASAAS_API_KEY not configured in Supabase Secrets");
    return json({ ok: false, error: "Server configuration error: Asaas API key not configured" }, 500);
  }

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON in request body" }, 400);
  }

  const action = String(body.action ?? "");
  if (!action) {
    return json({ ok: false, error: "Missing 'action' field" }, 400);
  }

  console.log(`📦 Asaas API: ${action}`);

  try {
    switch (action) {
      case "get_customer_by_email":     return await getCustomerByEmail(body, apiKey);
      case "get_payments_by_customer":  return await getPaymentsByCustomer(body, apiKey);
      case "get_subscriptions_by_customer": return await getSubscriptionsByCustomer(body, apiKey);
      case "validate_payment_status":   return await validatePaymentStatus(body, apiKey);
      default:
        return json({ ok: false, error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error(`❌ Asaas API ${action} error:`, String(error));
    return json({ ok: false, error: "Request failed", message: String(error) }, 500);
  }
});

async function asaasFetch(endpoint: string, apiKey: string): Promise<any> {
  const res = await fetch(`${ASAAS_API_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 429) {
    console.warn("⚠️  Asaas API rate limit hit (429)");
    throw new Error("Asaas API rate limit exceeded");
  }

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ Asaas API ${res.status}:`, text);
    throw new Error(`Asaas API ${res.status}: ${text}`);
  }

  return await res.json();
}

async function getCustomerByEmail(body: Record<string, any>, apiKey: string): Promise<Response> {
  const email = String(body.email ?? "").trim();
  if (!email) return json({ ok: false, error: "Missing 'email' field" }, 400);

  const data = await asaasFetch(`/customers?email=${encodeURIComponent(email)}`, apiKey);
  const customer = Array.isArray(data?.data) && data.data.length > 0 ? data.data[0] : null;

  console.log(`✅ Asaas: get_customer_by_email — ${customer ? "found" : "not found"}`);
  return json({ ok: true, customer });
}

async function getPaymentsByCustomer(body: Record<string, any>, apiKey: string): Promise<Response> {
  const customerId = String(body.customer_id ?? "").trim();
  if (!customerId) return json({ ok: false, error: "Missing 'customer_id' field" }, 400);

  const limit = Math.min(Number(body.limit ?? 10), 100);
  const data = await asaasFetch(`/payments?customer=${encodeURIComponent(customerId)}&limit=${limit}`, apiKey);

  const payments = Array.isArray(data?.data) ? data.data : [];
  console.log(`✅ Asaas: get_payments_by_customer — ${payments.length} found`);
  return json({ ok: true, payments });
}

async function getSubscriptionsByCustomer(body: Record<string, any>, apiKey: string): Promise<Response> {
  const customerId = String(body.customer_id ?? "").trim();
  if (!customerId) return json({ ok: false, error: "Missing 'customer_id' field" }, 400);

  const data = await asaasFetch(`/subscriptions?customer=${encodeURIComponent(customerId)}`, apiKey);
  const subscriptions = Array.isArray(data?.data) ? data.data : [];

  console.log(`✅ Asaas: get_subscriptions_by_customer — ${subscriptions.length} found`);
  return json({ ok: true, subscriptions });
}

async function validatePaymentStatus(body: Record<string, any>, apiKey: string): Promise<Response> {
  const paymentId = String(body.payment_id ?? body.order_id ?? "").trim();
  if (!paymentId) return json({ ok: false, error: "Missing 'payment_id' or 'order_id' field" }, 400);

  const payment = await asaasFetch(`/payments/${encodeURIComponent(paymentId)}`, apiKey);

  let actionSuggested = "none";
  if (payment?.status === "RECEIVED" || payment?.status === "CONFIRMED") {
    actionSuggested = "liberar_creditos";
  } else if (payment?.status === "REFUNDED") {
    actionSuggested = "revogar_creditos";
  } else if (payment?.status === "OVERDUE") {
    actionSuggested = "marcar_overdue";
  }

  console.log(`✅ Asaas: validate_payment_status — ${payment?.status ?? "unknown"} → ${actionSuggested}`);
  return json({ ok: true, payment, action_suggested: actionSuggested });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
