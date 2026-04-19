import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import CreditHeroCard from "@/components/dashboard/CreditHeroCard";
import TenantWorkspaceCard from "@/components/app/TenantWorkspaceCard";
import RecentOperationsSection from "@/components/dashboard/RecentOperationsSection";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import UpgradePlannerCard from "@/components/billing/UpgradePlannerCard";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import SecretariaOnboardingWizard from "@/components/onboarding/SecretariaOnboardingWizard";
import { useModules } from "@/hooks/useModuleAccess";
import { MODULE_WIDGETS } from "@/components/dashboard/ModuleWidgets";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserSubscriptions } from "@/hooks/useUserSubscriptions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Megaphone, Clapperboard, Package2, Instagram, PlusCircle } from "lucide-react";

// Reduzimos a quantidade de opções para ficar mais focado.
const INTENT_OPTIONS = [
  {
    title: "Post para Instagram",
    description: "Idea + copy para feed e stories.",
    path: "/create/ideia",
    icon: Instagram,
  },
  {
    title: "Criativo para Anúncio",
    description: "Peças prontas e escaláveis para Ads.",
    path: "/create/studio",
    icon: Megaphone,
  },
  {
    title: "Vídeo do Imóvel",
    description: "Fotos viram Reels profissionais.",
    path: "/video-creator",
    icon: Clapperboard,
  },
  {
    title: "Pacote Completo",
    description: "Crie campanhas integradas.",
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
  } = useOnboardingProgress();
  const { hasModule } = useModules();
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const [secretariaWizardDone, setSecretariaWizardDone] = useState<boolean | null>(null);

  // Checa se o corretor ja completou o wizard pos-compra Secretaria
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      const d = data as Record<string, unknown> | null;
      setSecretariaWizardDone(Boolean(d?.secretaria_wizard_completed_at));
    })();
  }, [user]);

  const shouldShowSecretariaWizard =
    hasModule("whatsapp") &&
    secretariaWizardDone === false &&
    !wizardDismissed;

  // Hook isolado para as operações recentes
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

  return (
    <AppLayout>
      {/* Secretaria wizard tem prioridade quando o corretor tem m\u00f3dulo whatsapp */}
      {shouldShowSecretariaWizard ? (
        <SecretariaOnboardingWizard
          onComplete={() => { setSecretariaWizardDone(true); setWizardDismissed(true); }}
          onDismiss={()  => { setSecretariaWizardDone(true); setWizardDismissed(true); }}
        />
      ) : (
        /* Onboarding wizard legado para users sem m\u00f3dulo whatsapp (cria\u00e7\u00e3o de criativos) */
        showWizard && !wizardDismissed && (
          <OnboardingWizard
            onComplete={() => { setWizardDismissed(true); completeWizard(); }}
            onSkip={() => { setWizardDismissed(true); dismissOnboarding(); }}
          />
        )
      )}

      {/* Grid Container de Layout (2 Colunas) */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* =========================================
            COLUNA ESQUERDA (Área de Trabalho - 70%) 
            ========================================= */}
        <div className="w-full lg:w-[70%] space-y-8">
          <WelcomeBanner />

          {/* O que vamos gerar */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Acesso Rápido</h2>
              <p className="text-sm text-muted-foreground mt-1">O que você gostaria de criar hoje?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INTENT_OPTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.title} 
                    className="rounded-2xl border border-border/60 bg-card p-5 flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group" 
                    onClick={() => navigate(item.path)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors text-accent flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Criações Recentes */}
          <RecentOperationsSection items={recentCreatives} />

          {/* Módulos Ativos (subscription-based) */}
          {subscriptions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">Sua Central de Módulos</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/planos")}>
                  <PlusCircle className="w-4 h-4 mr-1.5" /> Adicionar
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subscriptions.map((sub) => {
                  const Widget = MODULE_WIDGETS[sub.module_id];
                  if (!Widget) return null;
                  return <Widget key={sub.id} subscription={sub} />;
                })}
              </div>
            </section>
          )}

          {/* =========================================
              UPSELL & LOJA DE MÓDULOS (TRIPWIRE)
              ========================================= */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  Nexo Store <span className="p-1 px-2.5 bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 rounded-full text-xs font-black uppercase tracking-wider">Upgrades</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Ferramentas extras para escalar sua operação</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card Upsell Secretária Virtual */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-[#FFD700]/50 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FFD700]/10 rounded-full blur-xl group-hover:bg-[#FFD700]/20 transition-all" />
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  Secretária Virtual 24h
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  Atendimento automático que qualifica e agenda visitas no WhatsApp enquanto você dorme.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-[#FFD700] font-bold">12x R$ 49,90</span>
                  <span className="text-xs text-muted-foreground line-through">R$ 598</span>
                </div>
                <Button className="w-full mt-4 bg-[#0A1628] hover:bg-[#162038] text-white" onClick={() => navigate("/lp/secretaria-virtual")}>
                  Ver Detalhes <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Card Upsell Site + Portais */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all">
                 <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  Site + Portais
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  Seu imóvel nas primeiras posições do Google e sincronizado com ZAP Imóveis.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="font-bold text-foreground">12x R$ 39,90</span>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/planos")}>
                  Adicionar Módulo <PlusCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================
            COLUNA DIREITA (Status & Gerenciamento - 30%) 
            ========================================= */}
        <div className="w-full lg:w-[30%] space-y-6">
          
          <CreditHeroCard credits={credits} firstName={firstName} />

          <OnboardingChecklist />

          <div className="pt-6 mt-6 border-t border-border/60 space-y-6">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Conta e Planos</h3>
            
            <TenantWorkspaceCard />
            <UpgradePlannerCard />
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
