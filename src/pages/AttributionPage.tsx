import { useEffect } from "react";
import AppLayout from "@/components/app/AppLayout";
import { AttributionDashboard } from "@/components/analytics/AttributionDashboard";
import { useAttributionMetrics } from "@/hooks/useAnalytics";
import { trackEvent } from "@/services/analytics/eventTracker";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { GitBranch } from "lucide-react";

export default function AttributionPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { data, isLoading, error } = useAttributionMetrics();

  useEffect(() => {
    if (user) trackEvent(user.id, "attribution_viewed", { workspaceId: workspaceId ?? undefined });
  }, [user, workspaceId]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10 mt-0.5">
            <GitBranch className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atribuição</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Origem dos cadastros por UTM — modelos First Touch e Last Touch.
            </p>
          </div>
        </div>

        {error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 text-sm text-destructive">
            Erro ao carregar dados de atribuição: {(error as Error).message}
          </div>
        ) : (
          <AttributionDashboard
            data={
              data ?? {
                by_source: [], by_medium: [], by_campaign: [], by_landing: [],
                lt_by_source: [], lt_by_medium: [], lt_by_campaign: [], lt_by_landing: [],
                total_signups: 0, tracked_pct: 0,
              }
            }
            isLoading={isLoading}
          />
        )}
      </div>
    </AppLayout>
  );
}
