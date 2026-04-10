import { useState } from "react";
import { Link2, Unplug, Info, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SocialConnectPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  const [instagramConnected, setInstagramConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);

  /* ---- Handlers ---- */
  const handleConnectInstagram = () => {
    toast({
      title: "Redirecionando para Meta Login...",
      description: "Voce sera levado a tela de autorizacao do Instagram.",
    });
    // Simulated — in production this would redirect to Meta OAuth
    setTimeout(() => {
      setInstagramConnected(true);
      toast({ title: "Instagram conectado com sucesso!" });
    }, 2000);
  };

  const handleDisconnectInstagram = () => {
    setInstagramConnected(false);
    toast({ title: "Instagram desconectado." });
  };

  const handleConnectFacebook = () => {
    toast({
      title: "Redirecionando para Meta Login...",
      description: "Voce sera levado a tela de autorizacao do Facebook.",
    });
    setTimeout(() => {
      setFacebookConnected(true);
      toast({ title: "Facebook conectado com sucesso!" });
    }, 2000);
  };

  const handleDisconnectFacebook = () => {
    setFacebookConnected(false);
    toast({ title: "Facebook desconectado." });
  };

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#002B5B]">
            Conectar Redes Sociais
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Vincule suas contas para publicar diretamente pela plataforma.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mb-2">
                <span className="text-2xl">📸</span>
              </div>
              <CardTitle className="text-lg text-[#002B5B]">Instagram</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    instagramConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    instagramConnected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {instagramConnected ? "Conectado" : "Nao conectado"}
                </span>
              </div>

              {instagramConnected ? (
                <div className="text-center space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-[#002B5B]">
                      @imobiliaria_demo
                    </p>
                    <Badge className="bg-green-100 text-green-700 border-0 text-[11px] mt-1">
                      Ativo
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
                    onClick={handleDisconnectInstagram}
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white gap-2"
                  onClick={handleConnectInstagram}
                >
                  <Link2 className="h-4 w-4" />
                  Conectar Instagram
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Facebook card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mb-2">
                <span className="text-2xl">📘</span>
              </div>
              <CardTitle className="text-lg text-[#002B5B]">Facebook</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    facebookConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    facebookConnected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {facebookConnected ? "Conectado" : "Nao conectado"}
                </span>
              </div>

              {facebookConnected ? (
                <div className="text-center space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-[#002B5B]">
                      Imobiliaria Demo
                    </p>
                    <Badge className="bg-green-100 text-green-700 border-0 text-[11px] mt-1">
                      Ativo
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
                    onClick={handleDisconnectFacebook}
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  onClick={handleConnectFacebook}
                >
                  <Link2 className="h-4 w-4" />
                  Conectar Facebook
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Permissions note */}
        <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-4">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              Para conectar, seu app Meta precisa das permissoes{" "}
              <code className="bg-gray-200 px-1 py-0.5 rounded text-[11px]">
                instagram_content_publish
              </code>{" "}
              e{" "}
              <code className="bg-gray-200 px-1 py-0.5 rounded text-[11px]">
                pages_manage_posts
              </code>
              .
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-[#002B5B] hover:underline font-medium"
            >
              Como configurar
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
