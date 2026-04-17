import { useModulePlan } from "@/hooks/useUserPlan";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-gray-100 text-gray-700",
  basico:  "bg-blue-100 text-blue-700",
  pro:     "bg-purple-100 text-purple-700",
  max:     "bg-yellow-100 text-yellow-800",
};

export function PlanBadge() {
  const { plan, isLoading, hasActivePlan, creditsLeft, isMax } = useModulePlan();

  if (isLoading) return <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />;
  if (!plan || !hasActivePlan) return (
    <Badge variant="outline" className="text-red-500 border-red-300">
      Sem plano ativo
    </Badge>
  );

  return (
    <div className="flex items-center gap-2">
      <Badge className={PLAN_COLORS[plan.plan_slug] ?? "bg-gray-100"}>
        {plan.plan_name}
      </Badge>
      <span className="flex items-center gap-1 text-sm text-gray-600">
        <Zap className="h-3 w-3 text-yellow-500" />
        {isMax ? "∞ créditos" : `${creditsLeft} créditos`}
      </span>
    </div>
  );
}