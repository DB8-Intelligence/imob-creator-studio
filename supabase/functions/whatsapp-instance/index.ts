import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVOLUTION_URL = Deno.env.get("EVOLUTION_API_URL")!;
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authenticate user via Supabase JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const userId       = user.id;
  const userShortId  = userId.replace(/-/g, "").substring(0, 12);
  const instanceName = `whatsapp-user-${userShortId}`;

  const url    = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {

      // ── CONNECT: create instance and return QR code ────────────────────
      case "connect": {
        const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
          method:  "POST",
          headers: { apikey: EVOLUTION_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            instanceName,
            qrcode:      true,
            integration: "WHATSAPP-BAILEYS",
            webhook: {
              enabled: true,
              url:     `${Deno.env.get("SUPABASE_URL")}/functions/v1/whatsapp-events`,
              events:  ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
            },
          }),
        });

        const data = await res.json();

        await supabase.from("user_whatsapp_instances").upsert({
          user_id:       userId,
          instance_name: instanceName,
          instance_id:   data.instance?.instanceId ?? null,
          status:        "connecting",
        }, { onConflict: "user_id" });

        return new Response(JSON.stringify({
          ok:       true,
          qrcode:   data.qrcode?.base64 ?? null,
          instance: instanceName,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ── STATUS: check connection state ─────────────────────────────────
      case "status": {
        const res = await fetch(
          `${EVOLUTION_URL}/instance/connectionState/${instanceName}`,
          { headers: { apikey: EVOLUTION_KEY } }
        );
        const data = await res.json();
        const state = data.instance?.state ?? "disconnected";

        if (state === "open") {
          const profileRes = await fetch(
            `${EVOLUTION_URL}/instance/fetchInstances?instanceName=${instanceName}`,
            { headers: { apikey: EVOLUTION_KEY } }
          );
          const profiles = await profileRes.json();
          const profile  = Array.isArray(profiles) ? profiles[0] : profiles;

          await supabase.from("user_whatsapp_instances").upsert({
            user_id:         userId,
            instance_name:   instanceName,
            status:          "connected",
            phone_number:    profile?.instance?.ownerJid?.replace("@s.whatsapp.net", "") ?? null,
            profile_name:    profile?.instance?.profileName ?? null,
            profile_picture: profile?.instance?.profilePicUrl ?? null,
            connected_at:    new Date().toISOString(),
          }, { onConflict: "user_id" });
        }

        return new Response(JSON.stringify({ ok: true, state }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── DISCONNECT: logout and delete instance ─────────────────────────
      case "disconnect": {
        await fetch(`${EVOLUTION_URL}/instance/logout/${instanceName}`, {
          method:  "DELETE",
          headers: { apikey: EVOLUTION_KEY },
        });
        await fetch(`${EVOLUTION_URL}/instance/delete/${instanceName}`, {
          method:  "DELETE",
          headers: { apikey: EVOLUTION_KEY },
        });

        await supabase.from("user_whatsapp_instances")
          .update({
            status:          "disconnected",
            phone_number:    null,
            profile_name:    null,
            profile_picture: null,
            disconnected_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── GET: return user's instance data ───────────────────────────────
      case "get": {
        const { data } = await supabase
          .from("user_whatsapp_instances")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        return new Response(JSON.stringify({ ok: true, instance: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response("Action not found", { status: 404 });
    }
  } catch (e) {
    console.error("Erro whatsapp-instance:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status:  500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
