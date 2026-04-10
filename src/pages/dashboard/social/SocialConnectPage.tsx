import { useState, useEffect } from "react";
import { Link2, Unplug, Info, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const [instagramAccount, setInstagramAccount] = useState<any>(null);
  const [facebookAccount, setFacebookAccount] = useState<any>(null);
  const [pubStats, setPubStats] = useState({ published: 0, scheduled: 0, failed: 0 });

  /* ---- Load connected accounts from Supabase ---- */
  useEffect(() => {
    async function loadAccounts() {
      const { data } = await supabase
        .from("social_accounts" as any)
        .select("*")
        .eq("workspace_id", workspaceId);
      if (data) {
        const records = data as any[];
        const ig = records.find((a: any) => a.platform === "instagram");
        const fb = records.find((a: any) => a.platform === "facebook");
        if (ig) { setInstagramConnected(true); setInstagramAccount(ig); }
        if (fb) { setFacebookConnected(true); setFacebookAccount(fb); }
      }
    }
    if (workspaceId) loadAccounts();
  }, [workspaceId]);

  /* ---- Load publication stats ---- */
  useEffect(() => {
    async function loadStats() {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data: published } = await supabase
          .from("publication_queue" as any)
          .select("id", { count: "exact", head: true })
          .eq("status", "published")
          .gte("scheduled_at", startOfMonth);

        const { data: scheduled } = await supabase
          .from("publication_queue" as any)
          .select("id", { count: "exact", head: true })
          .eq("status", "scheduled");

        const { data: failed } = await supabase
          .from("publication_queue" as any)
          .select("id", { count: "exact", head: true })
          .eq("status", "failed")
          .gte("scheduled_at", startOfMonth);

        setPubStats({
          published: (published as any[])?.length ?? 0,
          scheduled: (scheduled as any[])?.length ?? 0,
          failed: (failed as any[])?.length ?? 0,
        });
      } catch {
        // Table may not exist yet — keep defaults
      }
    }
    if (workspaceId) loadStats();
  }, [workspaceId]);

  /* ---- Handlers ---- */
  const handleConnectInstagram = () => {
    const metaAppId = import.meta.env.VITE_META_APP_ID || "YOUR_META_APP_ID";
    const redirectUri = `${window.location.origin}/dashboard/social/callback`;
    const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement";
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=instagram`;
  };

  const handleDisconnectInstagram = async () => {
    if (instagramAccount?.id) {
      await supabase.from("social_accounts" as any).delete().eq("id", instagramAccount.id);
    }
    setInstagramConnected(false);
    setInstagramAccount(null);
    toast({ title: "Instagram desconectado." });
  };

  const handleConnectFacebook = () => {
    const metaAppId = import.meta.env.VITE_META_APP_ID || "YOUR_META_APP_ID";
    const redirectUri = `${window.location.origin}/dashboard/social/callback`;
    const scope = "pages_manage_posts,pages_read_engagement";
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=facebook`;
  };

  const handleDisconnectFacebook = async () => {
    if (facebookAccount?.id) {
      await supabase.from("social_accounts" as any).delete().eq("id", facebookAccount.id);
    }
    setFacebookConnected(false);
    setFacebookAccount(null);
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
                  <div className="flex flex-col items-center gap-1">
                    {instagramAccount?.account_picture && (
                      <img src={instagramAccount.account_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <p className="text-sm font-semibold text-[#002B5B]">
                      {instagramAccount?.account_name ? `@${instagramAccount.account_name}` : "Instagram conectado"}
                    </p>
                    <Badge className="bg-green-100 text-green-700 border-0 text-[11px] mt-1">
                      Ativo
                    </Badge>
                  </div>
                  {instagramAccount?.token_expires_at && new Date(instagramAccount.token_expires_at) < new Date(Date.now() + 7 * 86400000) && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mt-3">
                      Token expira em breve. <button type="button" onClick={handleConnectInstagram} className="font-semibold underline">Renovar agora</button>
                    </div>
                  )}
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
                  <div className="flex flex-col items-center gap-1">
                    {facebookAccount?.account_picture && (
                      <img src={facebookAccount.account_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <p className="text-sm font-semibold text-[#002B5B]">
                      {facebookAccount?.account_name || "Facebook conectado"}
                    </p>
                    <Badge className="bg-green-100 text-green-700 border-0 text-[11px] mt-1">
                      Ativo
                    </Badge>
                  </div>
                  {facebookAccount?.token_expires_at && new Date(facebookAccount.token_expires_at) < new Date(Date.now() + 7 * 86400000) && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mt-3">
                      Token expira em breve. <button type="button" onClick={handleConnectFacebook} className="font-semibold underline">Renovar agora</button>
                    </div>
                  )}
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

        {/* Publication stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-[#F8FAFF] rounded-xl border border-[#E5E7EB] p-4 text-center">
            <span className="text-2xl font-bold text-[#002B5B]">{pubStats.published}</span>
            <p className="text-xs text-[#6B7280] mt-1">Publicados este mes</p>
          </div>
          <div className="bg-[#F8FAFF] rounded-xl border border-[#E5E7EB] p-4 text-center">
            <span className="text-2xl font-bold text-[#002B5B]">{pubStats.scheduled}</span>
            <p className="text-xs text-[#6B7280] mt-1">Agendados</p>
          </div>
          <div className="bg-[#F8FAFF] rounded-xl border border-[#E5E7EB] p-4 text-center">
            <span className="text-2xl font-bold text-[#EF4444]">{pubStats.failed}</span>
            <p className="text-xs text-[#6B7280] mt-1">Falhas</p>
          </div>
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

        {/* Meta App Review warning */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-800">Para publicar, voce precisa concluir o App Review do Meta.</p>
          <p className="text-xs text-amber-600 mt-1">Enquanto nao aprovado, apenas contas de teste podem publicar.</p>
        </div>
      </div>
    </div>
  );
}
