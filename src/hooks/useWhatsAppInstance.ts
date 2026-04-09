import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type WaStatus = "idle" | "connecting" | "qr_ready" | "connected" | "error";

export function useWhatsAppInstance() {
  const [status, setStatus]   = useState<WaStatus>("idle");
  const [qrCode, setQrCode]   = useState<string | null>(null);
  const [profile, setProfile] = useState<{ phone?: string; name?: string; picture?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const pollingRef            = useRef<ReturnType<typeof setInterval> | null>(null);

  const callEdge = useCallback(async (action: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-instance?action=${action}`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    return res.json();
  }, []);

  // Load current state on mount
  useEffect(() => {
    callEdge("get").then(({ instance }) => {
      if (instance?.status === "connected") {
        setStatus("connected");
        setProfile({
          phone:   instance.phone_number,
          name:    instance.profile_name,
          picture: instance.profile_picture,
        });
      }
    }).catch(() => {});
  }, [callEdge]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const { state } = await callEdge("status");
        if (state === "open") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStatus("connected");
          setQrCode(null);
          const { instance } = await callEdge("get");
          setProfile({
            phone:   instance?.phone_number,
            name:    instance?.profile_name,
            picture: instance?.profile_picture,
          });
        }
      } catch { /* ignore polling errors */ }
    }, 3000);
  }, [callEdge]);

  const connect = useCallback(async () => {
    setLoading(true);
    setStatus("connecting");
    try {
      const { qrcode } = await callEdge("connect");
      if (qrcode) {
        setQrCode(qrcode);
        setStatus("qr_ready");
        startPolling();
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, [callEdge, startPolling]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await callEdge("disconnect");
      setStatus("idle");
      setProfile(null);
      setQrCode(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
    } finally {
      setLoading(false);
    }
  }, [callEdge]);

  // Cleanup polling on unmount
  useEffect(() => () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  }, []);

  return { status, qrCode, profile, loading, connect, disconnect };
}
