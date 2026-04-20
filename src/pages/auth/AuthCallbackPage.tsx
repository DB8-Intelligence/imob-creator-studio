import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Evita race: quando o Supabase processa o hash antes do useEffect
    // subscrever onAuthStateChange, o SIGNED_IN é perdido. Checa sessão
    // atual primeiro e só escuta eventos como fallback.
    let navigated = false;
    const goDashboard = () => {
      if (navigated) return;
      navigated = true;
      navigate("/dashboard", { replace: true });
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goDashboard();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          goDashboard();
        } else if (event === "SIGNED_OUT") {
          navigate("/auth", { replace: true });
        }
      }
    );

    // Timeout de segurança: se após 5s nenhum evento chegar, manda pro /auth
    // (provavelmente o link já expirou ou tokens inválidos)
    const timeout = setTimeout(() => {
      if (!navigated) navigate("/auth", { replace: true });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFF" }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#002B5B] border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold text-[#002B5B] text-lg">Autenticando...</p>
        <p className="text-gray-400 text-sm mt-1">Aguarde um momento</p>
      </div>
    </div>
  );
}
