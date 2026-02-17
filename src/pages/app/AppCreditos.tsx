import InboxLayout from "@/components/inbox/InboxLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Zap, Crown, Star, AlertCircle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserPlan } from "@/types/userPlan";

const PLAN_LABELS: Record<UserPlan, { label: string; icon: typeof Zap; color: string }> = {
  credits: { label: "Starter", icon: Zap, color: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", icon: Star, color: "bg-primary text-primary-foreground" },
  vip: { label: "Agência", icon: Crown, color: "bg-amber-500 text-primary-foreground" },
};

// Placeholder consumption history — will be replaced by real API data
const consumptionHistory = [
  { date: "—", action: "Nenhum registro ainda", credits: 0 },
];

const AppCreditos = () => {
  const { data: plan, isLoading, isError } = useUserPlan();
  const cfg = plan ? PLAN_LABELS[plan.user_plan] : null;
  const PlanIcon = cfg?.icon || Zap;

  return (
    <InboxLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Créditos e Uso</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe seu plano e consumo</p>
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
            Erro ao carregar informações do plano.
          </div>
        )}

        {plan && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", cfg?.color)}>
                    <PlanIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plano atual</p>
                    <p className="text-xl font-bold text-foreground">{cfg?.label}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    plan.credits_remaining > 0 ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"
                  )}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Créditos restantes</p>
                    <p className="text-xl font-bold text-foreground">
                      {plan.user_plan === "pro" || plan.user_plan === "vip" ? "Ilimitado" : plan.credits_remaining}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consumption History */}
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Histórico de Consumo</h3>
                  <Badge variant="outline" className="text-xs">Último mês</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead className="text-right">Créditos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumptionHistory.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{h.date}</TableCell>
                        <TableCell>{h.action}</TableCell>
                        <TableCell className="text-right font-medium">
                          {h.credits > 0 ? `-${h.credits}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Button variant="hero" className="w-full sm:w-auto">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Comprar mais créditos
            </Button>
          </>
        )}
      </div>
    </InboxLayout>
  );
};

export default AppCreditos;
