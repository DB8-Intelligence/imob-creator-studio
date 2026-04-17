import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSubscriptions } from "@/hooks/useUserSubscriptions";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  requires: string;
  fallbackPath?: string;
}

export function ModuleProtectedRoute({ children, requires, fallbackPath = "/precos" }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasModule, isLoading: subsLoading } = useUserSubscriptions();
  const { data: isSuperAdmin, isLoading: adminLoading } = useIsSuperAdmin();
  const location = useLocation();

  if (authLoading || subsLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (isSuperAdmin) return <>{children}</>;

  if (!hasModule(requires)) {
    return <Navigate to={fallbackPath} state={{ missingModule: requires }} replace />;
  }

  return <>{children}</>;
}
