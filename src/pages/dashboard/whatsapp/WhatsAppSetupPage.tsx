import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Wifi, WifiOff, Loader2, QrCode, Smartphone, Unplug, Bot, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ConnectionStatus = "disconnected" | "connecting" | "connected";

/** Segundos até o QR expirar. Evolution/WhatsApp invalida ~40–60s, usamos 30 pra ter margem. */
const QR_EXPIRY_SECONDS = 30;

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; color: string; dotColor: string }
> = {
  disconnected: {
    label: "Desconectado",
    color: "text-red-600",
    dotColor: "bg-red-500",
  },
  connecting: {
    label: "Conectando...",
    color: "text-yellow-600",
    dotColor: "bg-yellow-500 animate-pulse",
  },
  connected: {
    label: "Conectado",
    color: "text-green-600",
    dotColor: "bg-green-500",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhatsAppSetupPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [showQr, setShowQr] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [qrAge, setQrAge] = useState(0); // segundos desde o último QR carregado
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileName, setProfileName] = useState("");
  const [stats, setStats] = useState({ messagesCount: 0, propertiesCount: 0, creativesCount: 0 });

  /* ---- Load instance data on mount — consulta DB + Evolution ao vivo ---- */
  useEffect(() => {
    async function loadInstance() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 1. Lê o snapshot do DB
      const { data } = await supabase
        .from("user_whatsapp_instances" as any)
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (data?.status === "connected") {
        setConnectionStatus("connected");
        setPhoneNumber((data as any).phone_number || "");
        setProfileName((data as any).profile_name || "");
      }

      // 2. Também consulta Evolution pra sincronizar status real (pode ter conectado
      //    em outra aba, ou conexão feita no celular mas UI ficou desatualizada)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-instance?action=status`,
          { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } },
        );
        const statusData = await res.json();
        if (statusData?.state === "open" || statusData?.state === "connected") {
          setConnectionStatus("connected");
        }
      } catch { /* silencioso — DB já é o fallback */ }
    }
    loadInstance();
  }, []);

  /* ---- Poll for connection status while connecting (2s, mais rápido) ---- */
  useEffect(() => {
    if (connectionStatus !== "connecting") return;
    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-instance?action=status`,
          { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } },
        );
        const data = await res.json();
        if (data?.state === "open" || data?.state === "connected") {
          setConnectionStatus("connected");
          clearInterval(interval);
          toast({ title: "WhatsApp conectado!" });
        }
      } catch (e) {
        console.error("status poll error:", e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [connectionStatus]);

  /* ---- Load stats when connected ---- */
  useEffect(() => {
    if (connectionStatus !== "connected" || !workspaceId) return;
    async function loadStats() {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const [msgRes, propRes, crRes] = await Promise.all([
          supabase
            .from("whatsapp_inbox" as any)
            .select("id", { count: "exact", head: true })
            .gte("created_at", todayISO),
          supabase
            .from("whatsapp_inbox" as any)
            .select("id", { count: "exact", head: true })
            .eq("message_type", "image"),
          supabase
            .from("whatsapp_inbox" as any)
            .select("id", { count: "exact", head: true })
            .eq("processed", true),
        ]);
        setStats({
          messagesCount: msgRes.count ?? 0,
          propertiesCount: propRes.count ?? 0,
          creativesCount: crRes.count ?? 0,
        });
      } catch {
        // Table may not exist yet
      }
    }
    loadStats();
  }, [connectionStatus, workspaceId]);

  /* ---- Handlers ---- */
  /**
   * Pede um novo QR ao backend. Reusado tanto pelo clique inicial quanto
   * pelo auto-refresh de 30s. Isolado em useCallback pra poder ser chamado
   * do useEffect do timer de expiracao.
   */
  const fetchQrCode = useCallback(async (): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Sessão expirada, faça login novamente");
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-instance?action=connect`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error ?? `HTTP ${res.status}`);
    }
    if (data.qrcode) {
      // whatsapp-instance retorna qrcode como string base64 direta
      setQrCode(typeof data.qrcode === "string" ? data.qrcode : data.qrcode?.base64 ?? "");
      setQrAge(0); // reseta o contador
    }
  }, []);

  const handleGenerateQr = async () => {
    setConnectionStatus("connecting");
    setShowQr(true);
    try {
      await fetchQrCode();
    } catch (err) {
      toast({ title: "Erro ao gerar QR Code", description: (err as Error).message, variant: "destructive" });
      setConnectionStatus("disconnected");
      setShowQr(false);
    }
  };

  /** Refresh manual (botão "Gerar código novo") sem resetar connectionStatus. */
  const handleRefreshQr = async () => {
    try {
      await fetchQrCode();
    } catch (err) {
      toast({ title: "Erro ao atualizar QR Code", description: (err as Error).message, variant: "destructive" });
    }
  };

  /* ---- Auto-refresh: conta idade do QR + regenera em QR_EXPIRY_SECONDS ---- */
  useEffect(() => {
    if (connectionStatus !== "connecting" || !qrCode) return;
    const tick = setInterval(() => {
      setQrAge((a) => {
        const next = a + 1;
        if (next >= QR_EXPIRY_SECONDS) {
          // Regenera em background (fire-and-forget)
          fetchQrCode().catch(() => {
            // Se falhar, apenas loga; não destrói o estado de conexão
            console.warn("auto-refresh QR falhou, mantendo o código atual");
          });
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [connectionStatus, qrCode, fetchQrCode]);

  const handleDisconnect = () => {
    setConnectionStatus("disconnected");
    setShowQr(false);
    setQrCode("");
    toast({ title: "WhatsApp desconectado." });
  };

  const status = STATUS_CONFIG[connectionStatus];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/dashboard/secretaria"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#002B5B] mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Voltar ao Hub da Secretária
          </Link>
          <h1 className="text-2xl font-bold text-[#002B5B]">Conectar WhatsApp</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vincule sua conta do WhatsApp para receber e enviar mensagens automaticamente.
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-[#002B5B]">
              <Smartphone className="inline-block h-5 w-5 mr-2 -mt-0.5" />
              Sessao WhatsApp
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status.dotColor}`} />
              <span className={`text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>

            {/* QR Code area */}
            {connectionStatus !== "connected" && (
              <div className="flex flex-col items-center gap-4">
                {qrCode ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                      alt="QR Code"
                      className="w-56 h-56 mx-auto rounded-xl border"
                    />
                    {connectionStatus === "connecting" && (
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-gray-500">
                          Atualiza automaticamente em{" "}
                          <span className="font-semibold text-[#002B5B]">
                            {Math.max(0, QR_EXPIRY_SECONDS - qrAge)}s
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={handleRefreshQr}
                          className="inline-flex items-center gap-1 text-xs text-[#002B5B] hover:underline"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Gerar novo código agora
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-[200px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {showQr && connectionStatus === "connecting" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-[#002B5B] animate-spin" />
                        <span className="text-xs text-gray-400">Carregando QR...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <QrCode className="h-12 w-12 text-gray-300" />
                        <span className="text-xs text-gray-400">QR Code</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2"
                  onClick={handleGenerateQr}
                  disabled={connectionStatus === "connecting"}
                >
                  {connectionStatus === "connecting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aguardando leitura...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Gerar QR Code
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Connected profile */}
            {connectionStatus === "connected" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Wifi className="h-8 w-8 text-green-600" />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-[#002B5B]">
                    {phoneNumber || "+55 (...) ****-****"}
                  </p>
                  {profileName && (
                    <p className="text-xs text-[#002B5B] font-medium">{profileName}</p>
                  )}
                  <p className="text-xs text-gray-500">Sessao ativa</p>
                  <Badge className="bg-green-100 text-green-700 border-0 text-[11px]">
                    Conectado
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
                  onClick={handleDisconnect}
                >
                  <Unplug className="h-4 w-4" />
                  Desconectar
                </Button>
              </div>
            )}

            {/* Instructions */}
            {connectionStatus !== "connected" && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-[#002B5B]">
                  Como conectar:
                </p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>
                    Toque em <span className="font-medium">&#8942;</span> (menu)
                  </li>
                  <li>
                    Va em <span className="font-medium">Dispositivos vinculados</span>
                  </li>
                  <li>
                    Toque em <span className="font-medium">Vincular dispositivo</span> e
                    escaneie o QR Code acima
                  </li>
                </ol>
              </div>
            )}

            {/* Note */}
            <p className="text-xs text-gray-400 text-center">
              Mantenha o WhatsApp logado no seu celular. A sessão fica ativa enquanto o dispositivo estiver vinculado.
            </p>
          </CardContent>
        </Card>

        {/* Secretária IA — link to config */}
        <Link
          to="/dashboard/whatsapp/ai-config"
          className="block rounded-xl border border-gray-200 bg-white hover:border-[#002B5B] hover:shadow-[0_2px_12px_rgba(0,43,91,0.06)] transition-all px-5 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-[#166534]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#002B5B]">Secretária Virtual IA</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure nome, tom de voz e instruções. Ative a IA que atende seus leads 24h.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
          </div>
        </Link>

        {/* Stats section */}
        {connectionStatus === "connected" && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-[#F8FAFF] rounded-xl border border-[#E5E7EB] p-4 text-center">
              <span className="text-2xl font-bold text-[#002B5B]">{stats.messagesCount}</span>
              <p className="text-xs text-[#6B7280] mt-1">Mensagens hoje</p>
            </div>
            <div className="bg-[#F8FAFF] rounded-xl border border-[#E5E7EB] p-4 text-center">
              <span className="text-2xl font-bold text-[#002B5B]">{stats.propertiesCount}</span>
              <p className="text-xs text-[#6B7280] mt-1">Imoveis detectados</p>
            </div>
            <div className="bg-[#F8FAFF] rounded-xl border border-[#E5E7EB] p-4 text-center">
              <span className="text-2xl font-bold text-[#002B5B]">{stats.creativesCount}</span>
              <p className="text-xs text-[#6B7280] mt-1">Criativos via WA</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
