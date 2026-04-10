import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SocialCallbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state"); // "instagram" or "facebook"
      const error = params.get("error");

      if (error) {
        toast({ title: "Erro na conexao", description: params.get("error_description") || error, variant: "destructive" });
        navigate("/dashboard/social/conectar");
        return;
      }

      if (!code || !state) {
        toast({ title: "Erro", description: "Parametros invalidos", variant: "destructive" });
        navigate("/dashboard/social/conectar");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/dashboard/social/callback`;
        const { error: fnError } = await supabase.functions.invoke("publish-social", {
          body: { action: "connect-account", platform: state, code, redirect_uri: redirectUri },
        });

        if (fnError) throw fnError;
        toast({ title: `${state === "instagram" ? "Instagram" : "Facebook"} conectado com sucesso!` });
      } catch (err: any) {
        toast({ title: "Erro ao conectar", description: err.message || "Tente novamente", variant: "destructive" });
      }

      navigate("/dashboard/social/conectar");
    }

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#002B5B] animate-spin mx-auto" />
        <p className="text-[#0A1628] font-semibold">Conectando sua conta...</p>
        <p className="text-[#6B7280] text-sm">Aguarde enquanto processamos a autorizacao</p>
      </div>
    </div>
  );
}
