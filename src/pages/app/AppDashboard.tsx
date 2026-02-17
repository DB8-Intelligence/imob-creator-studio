import { useNavigate } from "react-router-dom";
import InboxLayout from "@/components/inbox/InboxLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useInboxProperties } from "@/hooks/useInboxProperties";
import {
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Send,
} from "lucide-react";

const AppDashboard = () => {
  const navigate = useNavigate();
  const { data: plan, isLoading: planLoading } = useUserPlan();
  const { data: properties, isLoading: propsLoading } = useInboxProperties();

  const isLoading = planLoading || propsLoading;

  const pending = properties?.filter((p) => ["pending", "editing"].includes(p.status)).length ?? 0;
  const published = properties?.filter((p) => p.status === "published").length ?? 0;

  const cards = [
    {
      icon: Zap,
      label: "Créditos Disponíveis",
      value: plan
        ? plan.user_plan === "pro" || plan.user_plan === "vip"
          ? "∞"
          : String(plan.credits_remaining)
        : "—",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Clock,
      label: "Pendentes de Aprovação",
      value: String(pending),
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: CheckCircle,
      label: "Publicados (total)",
      value: String(published),
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Send,
      label: "Economia de Tempo",
      value: `${Math.max(published * 15, 0)}min`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <InboxLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral da sua conta</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg}`}>
                    <c.icon className={`w-6 h-6 ${c.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <p className="text-2xl font-bold text-foreground">{c.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/app/inbox")}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-1">Inbox WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-3">Gerencie imóveis recebidos</p>
              <Button variant="outline" size="sm">
                Abrir <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/app/aprovacoes")}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-1">Aprovações</h3>
              <p className="text-sm text-muted-foreground mb-3">Revise e publique posts</p>
              <Button variant="outline" size="sm">
                Abrir <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/app/creditos")}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-1">Créditos</h3>
              <p className="text-sm text-muted-foreground mb-3">Acompanhe seu consumo</p>
              <Button variant="outline" size="sm">
                Abrir <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </InboxLayout>
  );
};

export default AppDashboard;
