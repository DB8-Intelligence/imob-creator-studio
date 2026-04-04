import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/app/AppLayout";
import CreditHeroCard from "@/components/dashboard/CreditHeroCard";
import ActionCardsSection from "@/components/dashboard/ActionCardsSection";
import TenantWorkspaceCard from "@/components/app/TenantWorkspaceCard";
import RecentOperationsSection from "@/components/dashboard/RecentOperationsSection";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import UpgradePlannerCard from "@/components/billing/UpgradePlannerCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { data: planInfo } = useUserPlan();

  const { data: recentCreatives = [] } = useQuery({
    queryKey: ["dashboard-recent", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creatives")
        .select("id, name, format, status, created_at, exported_url, property_id, properties(title)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as {
        id: string;
        name: string;
        format: string;
        status: string | null;
        created_at: string;
        exported_url: string | null;
        property_id: string | null;
        properties: { title: string } | null;
      }[];
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";
  const credits = planInfo?.credits_remaining ?? null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <WelcomeBanner />
        <CreditHeroCard credits={credits} firstName={firstName} />
        <ActionCardsSection />
        <div className="grid md:grid-cols-4 gap-4">
          {[
            ["Criar Criativo", "Fluxo guiado principal"],
            ["Criar Sequência", "Carrossel e narrativa"],
            ["Criar Thumbnail", "Capas e peças de clique"],
            ["Animar Criativo", "Base para vídeo e reels"],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-card p-4">
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <RecentOperationsSection items={recentCreatives} />
        <TenantWorkspaceCard />
        <OnboardingChecklist />
        <UpgradePlannerCard />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
