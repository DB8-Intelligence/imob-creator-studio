import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSubscriptions } from "@/hooks/useUserSubscriptions";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /**
   * module_id que corresponde às linhas em user_subscriptions.
   * Valores atuais: "criativos" | "videos" | "site" | "crm" | "whatsapp" | "social" | "portais"
   */
  requires: string;
  fallbackPath?: string;
}

export function ModuleProtectedRoute({ children, requires, fallbackPath = "/precos" }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasModule, isLoading: subsLoading } = useUserSubscriptions();
  const location = useLocation();

  // Super-admin bypass — admin tem acesso total
  const isSuperAdmin = user?.email === "douglas@db8intelligence.com.br";
  if (isSuperAdmin) return <>{children}</>;

  if (authLoading || subsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasModule(requires)) {
    return <Navigate to={fallbackPath} state={{ missingModule: requires }} replace />;
  }

  return <>{children}</>;
}
