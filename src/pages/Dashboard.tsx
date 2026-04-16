import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import CreditHeroCard from "@/components/dashboard/CreditHeroCard";
import ActionCardsSection from "@/components/dashboard/ActionCardsSection";
import TenantWorkspaceCard from "@/components/app/TenantWorkspaceCard";
import RecentOperationsSection from "@/components/dashboard/RecentOperationsSection";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import UpgradePlannerCard from "@/components/billing/UpgradePlannerCard";
import { ActivationFunnelCard } from "@/components/dashboard/ActivationFunnelCard";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { MODULE_WIDGETS } from "@/components/dashboard/ModuleWidgets";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserSubscriptions } from "@/hooks/useUserSubscriptions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Megaphone, Clapperboard, Package2, Instagram, PlusCircle } from "lucide-react";

function formatTimeToValue(start: string | undefined, end: string | null) {
  if (!start) return "—";

  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : Date.now();
  const diffMs = Math.max(endMs - startMs, 0);
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "menos de 1 min";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

const INTENT_OPTIONS = [
  {
    title: "Post para Instagram",
    description: "Comece rápido com ideia + copy para feed e stories.",
    path: "/create/ideia",
    icon: Instagram,
  },
  {
    title: "Criativo para anúncio",
    description: "Gere peças de conversão com template e CTA de campanha.",
    path: "/create/studio",
    icon: Megaphone,
  },
  {
    title: "Vídeo do imóvel",
    description: "Transforme fotos em vídeo para Reels, Feed e YouTube.",
    path: "/video-creator",
    icon: Clapperboard,
  },
  {
    title: "Pacote completo",
    description: "Entre no fluxo completo para criar com consistência operacional.",
    path: "/create",
    icon: Package2,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: planInfo } = useUserPlan();
  const {
    showWizard,
    completeWizard,
    dismiss: dismissOnboarding,
    firstGenerationAt,
  } = useOnboardingProgress();
  const [wizardDismissed, setWizardDismissed] = useState(false);

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

  const { subscriptions } = useUserSubscriptions();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";
  const credits = planInfo?.credits_remaining ?? null;
  const timeToValueLabel = formatTimeToValue(user?.created_at, firstGenerationAt);
  const hasReachedValue = Boolean(firstGenerationAt);

  return (
    <AppLayout>
      {/* Onboarding wizard overlay for first-time users */}
      {showWizard && !wizardDismissed && (
        <OnboardingWizard
          onComplete={() => { setWizardDismissed(true); completeWizard(); }}
          onSkip={() => { setWizardDismissed(true); dismissOnboarding(); }}
        />
      )}
      <div className="space-y-8">
        <WelcomeBanner />
        <CreditHeroCard credits={credits} firstName={firstName} />

        {/* ── Módulos Ativos (subscription-based) ──────────────────── */}
        {subscriptions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Seus Módulos</h2>
                <p className="text-sm text-muted-foreground mt-1">{subscriptions.length} módulo(s) ativo(s)</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/planos")}>
                <PlusCircle className="w-4 h-4 mr-1.5" /> Adicionar módulo
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {subscriptions.map((sub) => {
                const Widget = MODULE_WIDGETS[sub.module_id];
                if (!Widget) return null;
                return <Widget key={sub.id} subscription={sub} />;
              })}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">O que você quer gerar hoje?</h2>
            <p className="text-sm text-muted-foreground mt-1">Escolha um objetivo e siga direto para o fluxo ideal.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {INTENT_OPTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-4 hover:border-accent/40 hover:shadow-elevated transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate(item.path)}>
                    Abrir fluxo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-accent">Time-to-first-value</p>
            <h2 className="text-2xl font-display font-bold text-foreground mt-1">{timeToValueLabel}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {hasReachedValue
                ? "Tempo entre sua criacao de conta e o primeiro output util gerado."
                : "Contador em andamento ate o seu primeiro output util."}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {hasReachedValue ? "primeiro valor entregue" : "em andamento"}
            </span>
            <Button variant="outline" onClick={() => navigate("/dashboard/funnel")}>
              Ver jornada de ativacao
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

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
        <ActivationFunnelCard />
        <UpgradePlannerCard />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
