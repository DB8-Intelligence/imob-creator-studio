import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import SecretariaOnboardingWizard from "@/components/onboarding/SecretariaOnboardingWizard";
import { useModules } from "@/hooks/useModuleAccess";
import { MODULE_WIDGETS } from "@/components/dashboard/ModuleWidgets";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSubscriptions } from "@/hooks/useUserSubscriptions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Bot, MessageCircle, Calendar, Users, Globe, Rss,
  Mic, Sparkles,
} from "lucide-react";

const QUICK_ACTIONS = [
  { title: "Hub Secretária",    description: "Métricas + activity feed da IA",       path: "/dashboard/secretaria",          icon: Bot,          requires: "whatsapp" },
  { title: "Inbox WhatsApp",    description: "Conversas ativas + leads",             path: "/dashboard/whatsapp/inbox",      icon: MessageCircle,requires: "whatsapp" },
  { title: "Agendamentos",      description: "Visitas criadas pela IA",              path: "/dashboard/secretaria/agenda",   icon: Calendar,     requires: "whatsapp" },
  { title: "CRM Kanban",        description: "Pipeline de leads por estágio",        path: "/dashboard/crm",                 icon: Users,        requires: null },
  { title: "Meu Site",          description: "Configuração + imóveis publicados",    path: "/dashboard/site-imobiliario",    icon: Globe,        requires: "site" },
  { title: "Portais XML",       description: "ZAP, OLX, VivaReal",                   path: "/dashboard/portais",             icon: Rss,          requires: "site" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { hasModule, loading: modulesLoading } = useModules();
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

  const { subscriptions } = useUserSubscriptions();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";

  // Filtra ações pelo módulo que o user tem (ou ações sem requires)
  const availableActions = QUICK_ACTIONS.filter(
    (a) => !a.requires || hasModule(a.requires),
  );

  return (
    <AppLayout>
      {/* Wizard pos-compra Secretaria */}
      {shouldShowSecretariaWizard && (
        <SecretariaOnboardingWizard
          onComplete={() => { setSecretariaWizardDone(true); setWizardDismissed(true); }}
          onDismiss={()  => { setSecretariaWizardDone(true); setWizardDismissed(true); }}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Coluna esquerda (70%) */}
        <div className="w-full lg:w-[70%] space-y-6">
          <WelcomeBanner />

          {/* Hero enxuto */}
          <Card className="bg-gradient-to-br from-[#002B5B] to-[#4C1D95] text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/70">NexoImob AI</p>
                  <h1 className="text-2xl md:text-3xl font-bold mt-1">
                    Olá, {firstName}.
                  </h1>
                  <p className="text-white/80 mt-2 max-w-xl text-sm">
                    Sua central imobiliária com IA. Atende leads 24h, publica nos portais,
                    gera criativos e agenda visitas — tudo num só dashboard.
                  </p>
                </div>
                {hasModule("whatsapp") && (
                  <Link to="/dashboard/secretaria">
                    <Button className="bg-white text-[#002B5B] hover:bg-white/90 gap-2 shrink-0">
                      <Sparkles className="h-4 w-4" /> Abrir Hub da Secretária
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acesso Rápido */}
          {!modulesLoading && availableActions.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-xl font-bold text-[#002B5B]">Acesso rápido</h2>
                <p className="text-sm text-gray-500 mt-0.5">Atalhos pros módulos que você usa</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="text-left rounded-xl border border-gray-200 bg-white p-4 flex items-start gap-3 hover:border-[#002B5B] hover:shadow-[0_2px_12px_rgba(0,43,91,0.06)] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#F0F4FF] text-[#002B5B] flex items-center justify-center shrink-0 group-hover:bg-[#002B5B] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#002B5B] text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#002B5B] shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Módulos Ativos */}
          {subscriptions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#002B5B]">Módulos ativos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subscriptions.map((sub) => {
                  const Widget = MODULE_WIDGETS[sub.module_id];
                  if (!Widget) return null;
                  return <Widget key={sub.id} subscription={sub} />;
                })}
              </div>
            </section>
          )}

          {/* Upsell inteligente — só mostra produtos que o user NÃO tem */}
          {!modulesLoading && (!hasModule("whatsapp") || !hasModule("site")) && (
            <section className="space-y-3 pt-2">
              <div>
                <h2 className="text-xl font-bold text-[#002B5B]">Expanda sua operação</h2>
                <p className="text-sm text-gray-500 mt-0.5">Produtos que completam o seu fluxo</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!hasModule("whatsapp") && (
                  <UpsellCard
                    icon={Bot}
                    title="Secretária Virtual 24h"
                    description="IA atende no WhatsApp, qualifica leads e agenda visitas sozinha."
                    price="a partir de R$ 51,40/mês"
                    accent="from-[#002B5B] to-[#4C1D95]"
                    cta="Ver planos"
                    onClick={() => navigate("/lp/secretaria-virtual")}
                  />
                )}
                {!hasModule("site") && (
                  <UpsellCard
                    icon={Globe}
                    title="Site Imobiliário + Portais"
                    description="Site com CRM + integração XML automática com OLX, ZAP, VivaReal."
                    price="R$ 147/mês"
                    accent="from-[#0891B2] to-[#0E7490]"
                    cta="Ver planos"
                    onClick={() => navigate("/lp/site")}
                  />
                )}
              </div>
            </section>
          )}
        </div>

        {/* Coluna direita (30%) */}
        <div className="w-full lg:w-[30%] space-y-4">
          {/* Status rápido */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Status</p>
              <div className="space-y-2.5">
                <StatusRow
                  label="Secretária Virtual"
                  active={hasModule("whatsapp")}
                  href={hasModule("whatsapp") ? "/dashboard/secretaria" : "/lp/secretaria-virtual"}
                  icon={Bot}
                />
                <StatusRow
                  label="Voz Clonada"
                  active={hasModule("whatsapp")}
                  href="/dashboard/whatsapp/voz"
                  icon={Mic}
                  extra="Plus"
                />
                <StatusRow
                  label="Site Imobiliário"
                  active={hasModule("site")}
                  href={hasModule("site") ? "/dashboard/site-imobiliario" : "/lp/site"}
                  icon={Globe}
                />
                <StatusRow
                  label="Portais XML"
                  active={hasModule("site")}
                  href="/dashboard/portais"
                  icon={Rss}
                />
              </div>
            </CardContent>
          </Card>

          <OnboardingChecklist />
        </div>
      </div>
    </AppLayout>
  );
};

function UpsellCard({
  icon: Icon, title, description, price, accent, cta, onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  price: string;
  accent: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg transition-all">
      <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-xl`} />
      <div className="relative">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white mb-3`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-bold text-[#002B5B]">{title}</h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{description}</p>
        <p className="text-xs font-semibold text-[#002B5B] mt-3">{price}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 gap-2"
          onClick={onClick}
        >
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function StatusRow({
  label, active, href, icon: Icon, extra,
}: {
  label: string;
  active: boolean;
  href: string;
  icon: React.ElementType;
  extra?: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-2 text-sm hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
    >
      <Icon className={`h-4 w-4 ${active ? "text-emerald-600" : "text-gray-400"}`} />
      <span className={active ? "text-[#002B5B] font-medium" : "text-gray-500"}>{label}</span>
      {extra && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{extra}</span>}
      <span className={`ml-auto h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`} />
    </Link>
  );
}

export default Dashboard;
