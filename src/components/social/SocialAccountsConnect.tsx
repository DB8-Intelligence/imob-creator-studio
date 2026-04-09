import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useModules } from "@/hooks/useModuleAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Loader2, CheckCircle2, AlertCircle, Unplug } from "lucide-react";
import { UpgradePrompt } from "@/components/creatives/UpgradePrompt";

interface SocialAccount {
  id: string;
  platform: string;
  account_id: string;
  account_name: string | null;
  account_picture: string | null;
  status: string;
  profile_slot: number;
  token_expires_at: string | null;
}

export function SocialAccountsConnect() {
  const { hasModule } = useModules();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fetchAccounts = useCallback(async () => {
    const { data } = await supabase
      .from("social_accounts")
      .select("*")
      .order("profile_slot");
    setAccounts((data as SocialAccount[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleConnect = (platform: "instagram" | "facebook") => {
    if (!hasModule("social")) {
      setShowUpgrade(true);
      return;
    }
    // Meta OAuth redirect
    const appId = import.meta.env.VITE_META_APP_ID;
    const redirectUri = `${window.location.origin}/auth/meta-callback`;
    const scope = platform === "instagram"
      ? "instagram_basic,instagram_content_publish,pages_show_list"
      : "pages_manage_posts,pages_read_engagement,pages_show_list";
    window.location.href =
      `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${platform}`;
  };

  const igAccount = accounts.find(a => a.platform === "instagram");
  const fbAccount = accounts.find(a => a.platform === "facebook");

  const isTokenExpiring = (account: SocialAccount) => {
    if (!account.token_expires_at) return false;
    return new Date(account.token_expires_at).getTime() - Date.now() < 7 * 86400000;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
          <CardDescription>
            Conecte Instagram e Facebook para publicar criativos diretamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Instagram */}
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Instagram</p>
                  {igAccount ? (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate">{igAccount.account_name ?? igAccount.account_id}</p>
                      {isTokenExpiring(igAccount) && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                          <AlertCircle className="h-2.5 w-2.5 mr-1" />Token expirando
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Não conectado</p>
                  )}
                </div>
                {igAccount ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Ativo
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-red-500 h-7">
                      <Unplug className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => handleConnect("instagram")}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs">
                    Conectar
                  </Button>
                )}
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Facebook Pages</p>
                  {fbAccount ? (
                    <p className="text-xs text-gray-500 truncate">{fbAccount.account_name ?? fbAccount.account_id}</p>
                  ) : (
                    <p className="text-xs text-gray-400">Não conectado</p>
                  )}
                </div>
                {fbAccount ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Ativo
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-red-500 h-7">
                      <Unplug className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => handleConnect("facebook")}
                    className="bg-blue-600 text-white text-xs hover:bg-blue-700">
                    Conectar
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} blockedAction="publish" />
    </>
  );
}
