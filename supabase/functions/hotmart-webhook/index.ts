import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── MODULE_MAP: produto Hotmart → módulo ImobCreator ─────────────────────────
// Substituir os IDs placeholder após criar produtos no Hotmart
const MODULE_MAP: Record<string, {
  module_id: string;
  plan_slug: string;
  plan_name: string;
  credits: number;
  max_users: number;
}> = {
  // CRIATIVOS
  "HM_CRIATIVOS_STARTER": { module_id: "criativos", plan_slug: "starter", plan_name: "Criativos Starter", credits: 50,    max_users: 1 },
  "HM_CRIATIVOS_BASICO":  { module_id: "criativos", plan_slug: "basico",  plan_name: "Criativos Básico",  credits: 100,   max_users: 1 },
  "HM_CRIATIVOS_PRO":     { module_id: "criativos", plan_slug: "pro",     plan_name: "Criativos PRO",     credits: 150,   max_users: 1 },
  // VIDEOS
  "HM_VIDEOS_STARTER":    { module_id: "videos",    plan_slug: "starter", plan_name: "Vídeos Starter",    credits: 5,     max_users: 1 },
  "HM_VIDEOS_BASICO":     { module_id: "videos",    plan_slug: "basico",  plan_name: "Vídeos Básico",     credits: 10,    max_users: 1 },
  "HM_VIDEOS_PRO":        { module_id: "videos",    plan_slug: "pro",     plan_name: "Vídeos PRO",        credits: 20,    max_users: 1 },
  // SITE
  "HM_SITE_STARTER":      { module_id: "site",      plan_slug: "starter", plan_name: "Site Starter",      credits: 200,   max_users: 1 },
  "HM_SITE_BASICO":       { module_id: "site",      plan_slug: "basico",  plan_name: "Site Básico",       credits: 500,   max_users: 3 },
  "HM_SITE_PRO":          { module_id: "site",      plan_slug: "pro",     plan_name: "Site PRO",          credits: 700,   max_users: 5 },
  "HM_SITE_MAX":          { module_id: "site",      plan_slug: "max",     plan_name: "Site MAX",          credits: 99999, max_users: 10 },
  // CRM PRO
  "HM_CRM_PRO":           { module_id: "crm",       plan_slug: "pro",     plan_name: "CRM PRO",           credits: 0,     max_users: 10 },
  // WHATSAPP
  "HM_WA_STARTER":        { module_id: "whatsapp",  plan_slug: "starter", plan_name: "WhatsApp Starter",  credits: 5,     max_users: 1 },
  "HM_WA_BASICO":         { module_id: "whatsapp",  plan_slug: "basico",  plan_name: "WhatsApp Básico",   credits: 8,     max_users: 2 },
  "HM_WA_PRO":            { module_id: "whatsapp",  plan_slug: "pro",     plan_name: "WhatsApp PRO",      credits: 999,   max_users: 3 },
  "HM_WA_MAX":            { module_id: "whatsapp",  plan_slug: "max",     plan_name: "WhatsApp MAX",      credits: 999,   max_users: 5 },
  // SOCIAL
  "HM_SOC_STARTER":       { module_id: "social",    plan_slug: "starter", plan_name: "Social Starter",    credits: 1,     max_users: 1 },
  "HM_SOC_BASICO":        { module_id: "social",    plan_slug: "basico",  plan_name: "Social Básico",     credits: 2,     max_users: 1 },
  "HM_SOC_PRO":           { module_id: "social",    plan_slug: "pro",     plan_name: "Social PRO",        credits: 3,     max_users: 1 },
};

// ── Mensagens de boas-vindas por plan_slug ───────────────────────────────────
const WELCOME_MSG: Record<string, string> = {
  starter: "🎉 Bem-vindo ao ImobCreator AI!\n\nSeu módulo foi ativado no plano *Starter*.\n\n👉 Acesse agora: https://imobcreatorai.com.br\n\nQualquer dúvida, responda aqui. 🏠",
  basico:  "🎉 Bem-vindo ao ImobCreator AI!\n\nSeu módulo foi ativado no plano *Básico*.\n\n👉 Acesse agora: https://imobcreatorai.com.br\n\nQualquer dúvida, responda aqui. 🏠",
  pro:     "🚀 Bem-vindo ao ImobCreator AI PRO!\n\nSeu módulo foi ativado no plano *PRO*.\n\n👉 Acesse agora: https://imobcreatorai.com.br\n\nQualquer dúvida, responda aqui. 🏠",
  max:     "⭐ Bem-vindo ao ImobCreator AI MAX!\n\nSeu módulo foi ativado no plano *MAX*.\n\n👉 Acesse agora: https://imobcreatorai.com.br\n\nQualquer dúvida, responda aqui. 🏠",
};

serve(async (req: Request) => {
  if (req.method === "GET") {
    return new Response(JSON.stringify({ ok: true, service: "hotmart-webhook" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const hottok = req.headers.get("x-hotmart-hottok");
  if (hottok !== Deno.env.get("HOTMART_HOTTOK")) {
    console.error("HOTTOK inválido recebido:", hottok);
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log("Evento Hotmart recebido:", payload.event);

  const event        = payload.event as string;
  const data         = payload.data as Record<string, unknown>;
  const buyer        = data?.buyer as Record<string, unknown>;
  const product      = data?.product as Record<string, unknown>;
  const subscription = data?.subscription as Record<string, unknown>;
  const purchase     = data?.purchase as Record<string, unknown>;

  const email          = buyer?.email as string;
  const phone          = (buyer?.checkout_phone as string ?? "").replace(/\D/g, "");
  const productId      = String(product?.id ?? "");
  const transactionId  = purchase?.transaction as string;
  const subscriptionId = (subscription as Record<string, unknown>)?.subscriber
    ? ((subscription as Record<string, Record<string, unknown>>).subscriber?.code as string)
    : transactionId;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Resolve user_id e workspace pelo email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", profile?.id ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  const mod = MODULE_MAP[productId];

  switch (event) {
    case "PURCHASE_APPROVED": {
      if (!mod) {
        console.warn("Produto não mapeado:", productId);
        // Salva em user_plans (legacy) para análise posterior
        await supabase.from("user_plans").insert({
          user_id: profile?.id ?? null,
          email,
          hotmart_subscription_id: subscriptionId,
          hotmart_transaction_id:  transactionId,
          plan_slug:  "starter",
          plan_name:  "Pendente Mapeamento",
          credits_total: 0,
          status: "pending",
          hotmart_raw: payload,
        }).select();
        break;
      }

      // ── Upsert em user_subscriptions (modular) ──────────────────────
      const { error } = await supabase.from("user_subscriptions").upsert({
        workspace_id:            workspace?.id ?? null,
        email,
        module_id:               mod.module_id,
        plan_slug:               mod.plan_slug,
        plan_name:               mod.plan_name,
        credits_total:           mod.credits,
        credits_used:            0,
        max_users:               mod.max_users,
        hotmart_subscription_id: subscriptionId,
        hotmart_transaction_id:  transactionId,
        hotmart_product_id:      productId,
        status:                  "active",
        activated_at:            new Date().toISOString(),
        hotmart_raw:             payload,
      }, { onConflict: "hotmart_subscription_id" });

      if (error) console.error("Erro Supabase upsert:", error);
      else console.log("Módulo ativado:", mod.module_id, mod.plan_name, "para", email);

      // Dispara boas-vindas via n8n -> WhatsApp
      if (phone) {
        await notifyN8n({
          event:     "purchase_approved",
          phone:     `55${phone}`,
          message:   WELCOME_MSG[mod.plan_slug],
          email,
          module:    mod.module_id,
          plan:      mod.plan_name,
          plan_slug: mod.plan_slug,
        });
      }
      break;
    }

    case "SUBSCRIPTION_CANCELLATION":
    case "PURCHASE_CANCELED": {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("hotmart_subscription_id", subscriptionId);
      if (error) console.error("Erro ao cancelar:", error);
      else console.log("Assinatura cancelada:", subscriptionId);
      break;
    }

    case "PURCHASE_REFUNDED": {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "refunded" })
        .eq("hotmart_transaction_id", transactionId);
      if (error) console.error("Erro ao reembolsar:", error);
      else console.log("Assinatura reembolsada:", transactionId);
      break;
    }

    default:
      console.log("Evento não tratado (ignorado):", event);
  }

  return new Response(JSON.stringify({ ok: true, event }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function notifyN8n(data: Record<string, unknown>) {
  const url = Deno.env.get("N8N_WEBHOOK_HOTMART");
  if (!url) {
    console.warn("N8N_WEBHOOK_HOTMART não configurado");
    return;
  }
  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    console.log("n8n notificado, status:", res.status);
  } catch (e) {
    console.error("Falha ao notificar n8n:", e);
  }
}
