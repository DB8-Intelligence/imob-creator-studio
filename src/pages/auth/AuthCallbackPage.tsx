import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/dashboard", { replace: true });
        } else if (event === "SIGNED_OUT") {
          navigate("/auth", { replace: true });
        }
      }
    );
    return () => subscription.unsubscribe();
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
