import { useWhatsAppInstance } from "@/hooks/useWhatsAppInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Wifi, WifiOff, Loader2, CheckCircle2 } from "lucide-react";

export function WhatsAppConnect() {
  const { status, qrCode, profile, loading, connect, disconnect } = useWhatsAppInstance();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-500" />
          WhatsApp Business
        </CardTitle>
        <CardDescription>
          Conecte seu WhatsApp para receber imóveis de parceiros
          e disparar automações automaticamente.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* idle */}
        {status === "idle" && (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="font-medium">Nenhum WhatsApp conectado</p>
              <p className="text-sm text-gray-500 mt-1">
                Conecte para automatizar seu atendimento e captação de imóveis
              </p>
            </div>
            <Button onClick={connect} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
              Conectar meu WhatsApp
            </Button>
          </div>
        )}

        {/* connecting */}
        {status === "connecting" && (
          <div className="text-center py-8 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto" />
            <p className="text-sm text-gray-500">Gerando QR Code...</p>
          </div>
        )}

        {/* qr_ready */}
        {status === "qr_ready" && qrCode && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-green-200 rounded-xl p-4 flex items-center justify-center">
              <img
                src={qrCode}
                alt="QR Code WhatsApp"
                className="w-52 h-52 object-contain"
              />
            </div>
            <div className="bg-green-50 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium text-green-800">Como escanear:</p>
              <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                <li>Abra o WhatsApp no celular</li>
                <li>Toque em Menu ou Configurações</li>
                <li>Selecione "Aparelhos conectados"</li>
                <li>Toque em "Conectar um aparelho"</li>
                <li>Aponte a câmera para o QR code acima</li>
              </ol>
            </div>
            <p className="text-xs text-center text-gray-400 animate-pulse">
              Aguardando conexão...
            </p>
          </div>
        )}

        {/* connected */}
        {status === "connected" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              {profile?.picture ? (
                <img src={profile.picture} alt="Perfil" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.name ?? "WhatsApp Conectado"}</p>
                <p className="text-xs text-gray-500">{profile?.phone ?? "Número conectado"}</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-bold text-gray-800">0</p>
                <p className="text-xs text-gray-500">Mensagens hoje</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-bold text-gray-800">0</p>
                <p className="text-xs text-gray-500">Imóveis recebidos</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={disconnect}
              disabled={loading}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
              Desconectar WhatsApp
            </Button>
          </div>
        )}

        {/* error */}
        {status === "error" && (
          <div className="text-center space-y-3 py-4">
            <p className="text-sm text-red-500">Erro ao conectar. Tente novamente.</p>
            <Button onClick={connect} variant="outline" size="sm">Tentar novamente</Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
