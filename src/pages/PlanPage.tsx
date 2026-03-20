import InboxLayout from "@/components/inbox/InboxLayout";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Crown, Zap, Star, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserPlan } from "@/types/userPlan";

const PLAN_LABELS: Record<UserPlan, { label: string; icon: typeof Zap; color: string }> = {
  credits: { label: "Créditos", icon: Zap, color: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", icon: Star, color: "bg-primary text-primary-foreground" },
  vip: { label: "VIP", icon: Crown, color: "bg-amber-500 text-white" },
};

interface Feature {
  name: string;
  credits: boolean | string;
  pro: boolean | string;
  vip: boolean | string;
}

const FEATURES: Feature[] = [
  { name: "Publicação no Instagram", credits: true, pro: true, vip: true },
  { name: "Templates personalizados", credits: "1 template", pro: "Ilimitados", vip: "Ilimitados" },
  { name: "Histórico completo", credits: false, pro: true, vip: true },
  { name: "Agendamento de posts", credits: false, pro: false, vip: true },
  { name: "Multi-contas Instagram", credits: false, pro: false, vip: true },
  { name: "White-label", credits: false, pro: false, vip: "Em breve" },
  { name: "Suporte prioritário", credits: false, pro: true, vip: true },
];

const FeatureCell = ({ value }: { value: boolean | string }) => {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
};

const PlanPage = () => {
  const { data: plan, isLoading, isError } = useUserPlan();

  const planConfig = plan ? PLAN_LABELS[plan.user_plan] : null;
  const PlanIcon = planConfig?.icon || Zap;

  return (
    <InboxLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plano</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seu plano e créditos
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Erro ao carregar informações do plano. Verifique se o workflow está ativo.
          </div>
        )}

        {plan && (
          <>
            {/* Status cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", planConfig?.color)}>
                    <PlanIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plano atual</p>
                    <p className="text-xl font-bold text-foreground">{planConfig?.label}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    plan.credits_remaining > 0
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-destructive/15 text-destructive"
                  )}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Créditos restantes</p>
                    <p className="text-xl font-bold text-foreground">
                      {plan.user_plan === "pro" || plan.user_plan === "vip"
                        ? "Ilimitado"
                        : plan.credits_remaining}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {plan.user_plan === "credits" && plan.credits_remaining === 0 && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Sem créditos. Entre em contato para adquirir mais créditos ou fazer upgrade.
              </div>
            )}

            {plan.user_plan === "credits" && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-lg p-3 text-sm">
                <Star className="w-4 h-4 flex-shrink-0" />
                Recursos avançados disponíveis no plano PRO. Entre em contato para upgrade.
              </div>
            )}

            <Card>
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Evolução operacional</h2>
                <p className="text-sm text-muted-foreground">
                  Use Créditos para validar, Pro para ganhar recorrência e VIP para estruturar múltiplos fluxos, contas e governança.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border p-4 bg-muted/30">
                    <p className="font-medium text-foreground">Créditos</p>
                    <p className="text-xs text-muted-foreground mt-1">Entrada rápida para validar o fluxo e gerar os primeiros criativos.</p>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-muted/30">
                    <p className="font-medium text-foreground">Pro</p>
                    <p className="text-xs text-muted-foreground mt-1">Padrão ideal para produção frequente com templates e histórico.</p>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-muted/30">
                    <p className="font-medium text-foreground">VIP</p>
                    <p className="text-xs text-muted-foreground mt-1">Base para operação mais robusta, múltiplas contas e evolução SaaS.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">Recurso</th>
                        {(["credits", "pro", "vip"] as UserPlan[]).map((p) => {
                          const cfg = PLAN_LABELS[p];
                          const isCurrentPlan = plan.user_plan === p;
                          return (
                            <th key={p} className="p-4 text-center min-w-[100px]">
                              <div className="flex flex-col items-center gap-1">
                                <Badge className={cn("text-xs", isCurrentPlan ? cfg.color : "bg-muted text-muted-foreground")}>
                                  {cfg.label}
                                </Badge>
                                {isCurrentPlan && (
                                  <span className="text-[10px] text-primary font-medium">Atual</span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURES.map((f, i) => (
                        <tr key={f.name} className={cn("border-b border-border last:border-0", i % 2 === 0 && "bg-muted/30")}>
                          <td className="p-4 font-medium text-foreground">{f.name}</td>
                          <td className="p-4 text-center"><FeatureCell value={f.credits} /></td>
                          <td className="p-4 text-center"><FeatureCell value={f.pro} /></td>
                          <td className="p-4 text-center"><FeatureCell value={f.vip} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </InboxLayout>
  );
};

export default PlanPage;
