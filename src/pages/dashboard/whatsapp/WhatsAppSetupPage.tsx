import { useState } from "react";
import { Wifi, WifiOff, Loader2, QrCode, Smartphone, Unplug } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ConnectionStatus = "disconnected" | "connecting" | "connected";

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

  /* ---- Handlers ---- */
  const handleGenerateQr = () => {
    setConnectionStatus("connecting");
    setShowQr(true);
    toast({ title: "Gerando QR Code...", description: "Aguarde enquanto preparamos a conexao." });

    // Simulated connection after 4 seconds
    setTimeout(() => {
      setConnectionStatus("connected");
      toast({ title: "WhatsApp conectado com sucesso!" });
    }, 4000);
  };

  const handleDisconnect = () => {
    setConnectionStatus("disconnected");
    setShowQr(false);
    toast({ title: "WhatsApp desconectado." });
  };

  const status = STATUS_CONFIG[connectionStatus];

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
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
                    +55 (11) 99999-0000
                  </p>
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
              Integracao via Evolution API. Sua sessao ficara ativa 24h.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
