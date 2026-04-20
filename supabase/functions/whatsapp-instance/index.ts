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
        // 1. Checa se a instância já existe no Evolution
        let instanceExists = false;
        try {
          const checkRes = await fetch(
            `${EVOLUTION_URL}/instance/fetchInstances?instanceName=${instanceName}`,
            { headers: { apikey: EVOLUTION_KEY } },
          );
          const checkData = await checkRes.json();
          instanceExists = Array.isArray(checkData) ? checkData.length > 0 : !!checkData?.instance;
        } catch (_) { /* considera que não existe */ }

        let data: Record<string, unknown> = {};

        if (instanceExists) {
          // Instância existe — usa /instance/connect/{name} que é idempotente e retorna QR rápido
          const connRes = await fetch(
            `${EVOLUTION_URL}/instance/connect/${instanceName}`,
            { headers: { apikey: EVOLUTION_KEY } },
          );
          data = await connRes.json();
        } else {
          // Primeira conexão — cria instância
          const createRes = await fetch(`${EVOLUTION_URL}/instance/create`, {
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
          data = await createRes.json();
        }

        // Normaliza qrcode: Evolution retorna em data.qrcode.base64 ou data.base64 (endpoint /connect)
        const qrcodeBase64 =
          (data as { qrcode?: { base64?: string } })?.qrcode?.base64 ??
          (data as { base64?: string })?.base64 ??
          null;

        await supabase.from("user_whatsapp_instances").upsert({
          user_id:       userId,
          instance_name: instanceName,
          instance_id:   (data as { instance?: { instanceId?: string } })?.instance?.instanceId ?? null,
          status:        "connecting",
        }, { onConflict: "user_id, instance_name" });

        return new Response(JSON.stringify({
          ok:       true,
          qrcode:   qrcodeBase64,
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

      // ── SEND: send text message via Evolution API ─────────────────────
      case "send": {
        if (req.method !== "POST") {
          return new Response("Method not allowed", { status: 405, headers: corsHeaders });
        }

        const body = await req.json();
        const { phone, text } = body as { phone?: string; text?: string };

        if (!phone || !text) {
          return new Response(JSON.stringify({ ok: false, error: "phone and text are required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Verify instance is connected
        const { data: inst } = await supabase
          .from("user_whatsapp_instances")
          .select("status")
          .eq("user_id", userId)
          .maybeSingle();

        if (inst?.status !== "connected") {
          return new Response(JSON.stringify({ ok: false, error: "WhatsApp not connected" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Send via Evolution API
        const sendRes = await fetch(`${EVOLUTION_URL}/message/sendText/${instanceName}`, {
          method: "POST",
          headers: { apikey: EVOLUTION_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            number: phone.replace(/[^\d]/g, ""),
            text,
            linkPreview: true,
          }),
        });

        const sendData = await sendRes.json();

        if (!sendRes.ok) {
          return new Response(JSON.stringify({ ok: false, error: sendData.message ?? "Evolution API error" }), {
            status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Audit log: save sent message
        await supabase.from("whatsapp_sent_messages").insert({
          user_id:   userId,
          to_phone:  phone.replace(/[^\d]/g, ""),
          body:      text,
          evolution_response: sendData,
        });

        return new Response(JSON.stringify({
          ok:         true,
          message_id: sendData.key?.id ?? null,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ── MESSAGES: fetch conversation history for a phone number ───────
      case "messages": {
        const phoneParam = url.searchParams.get("phone");
        if (!phoneParam) {
          return new Response(JSON.stringify({ ok: false, error: "phone param required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const cleanPhone = phoneParam.replace(/[^\d]/g, "");

        // Find workspace
        const { data: ws } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_user_id", userId)
          .maybeSingle();

        if (!ws) {
          return new Response(JSON.stringify({ ok: true, messages: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch incoming messages from whatsapp_inbox
        const { data: incoming } = await supabase
          .from("whatsapp_inbox")
          .select("id, from_phone, from_name, message_type, message_text, media_urls, received_at")
          .eq("workspace_id", ws.id)
          .eq("from_phone", cleanPhone)
          .order("received_at", { ascending: true })
          .limit(100);

        // Fetch outgoing messages from whatsapp_sent_messages (inclui evolution_response pra badge IA)
        const { data: outgoing } = await supabase
          .from("whatsapp_sent_messages")
          .select("id, to_phone, body, created_at, evolution_response")
          .eq("user_id", userId)
          .eq("to_phone", cleanPhone)
          .order("created_at", { ascending: true })
          .limit(100);

        // Merge and sort by timestamp
        const merged = [
          ...(incoming ?? []).map((m: Record<string, unknown>) => ({
            id:        m.id,
            direction: "incoming" as const,
            phone:     m.from_phone,
            name:      m.from_name,
            text:      m.message_text ?? "",
            type:      m.message_type ?? "text",
            media:     m.media_urls ?? [],
            timestamp: m.received_at,
            source:    "incoming" as const,
          })),
          ...(outgoing ?? []).map((m: Record<string, unknown>) => {
            const evo = (m.evolution_response as Record<string, unknown> | null) ?? {};
            const source = (evo._source as string | undefined) ?? null;
            const isVoice = (evo._voice as boolean | undefined) === true;
            const kind =
              source === "ai_reply" || source === "voice_clone" ? "ai_reply" :
              source === "ai_media"                              ? "ai_media" :
              isVoice                                            ? "ai_reply" :
              "manual";
            return {
              id:        m.id,
              direction: "outgoing" as const,
              phone:     m.to_phone,
              name:      null,
              text:      m.body ?? "",
              type:      "text",
              media:     [],
              timestamp: m.created_at,
              source:    kind,
            };
          }),
        ].sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime());

        return new Response(JSON.stringify({ ok: true, messages: merged }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── CONTACTS: list unique contacts from inbox ─────────────────────
      case "contacts": {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_user_id", userId)
          .maybeSingle();

        if (!ws) {
          return new Response(JSON.stringify({ ok: true, contacts: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get distinct contacts with their latest message
        const { data: inboxRows } = await supabase
          .from("whatsapp_inbox")
          .select("from_phone, from_name, message_text, received_at")
          .eq("workspace_id", ws.id)
          .order("received_at", { ascending: false })
          .limit(500);

        // Deduplicate by phone, keep most recent
        const contactMap = new Map<string, { phone: string; name: string | null; lastMessage: string; lastAt: string }>();
        for (const row of (inboxRows ?? []) as Array<Record<string, unknown>>) {
          const phone = row.from_phone as string;
          if (!contactMap.has(phone)) {
            contactMap.set(phone, {
              phone,
              name:        (row.from_name as string | null) ?? null,
              lastMessage: (row.message_text as string) ?? "",
              lastAt:      row.received_at as string,
            });
          }
        }

        return new Response(JSON.stringify({ ok: true, contacts: Array.from(contactMap.values()) }), {
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
