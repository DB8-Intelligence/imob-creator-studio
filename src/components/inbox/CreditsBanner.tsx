import { useNavigate } from "react-router-dom";
import { AlertTriangle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserPlanInfo } from "@/types/userPlan";

interface CreditsBannerProps {
  userPlan: UserPlanInfo | undefined;
}

export default function CreditsBanner({ userPlan }: CreditsBannerProps) {
  const navigate = useNavigate();
  if (!userPlan || userPlan.user_plan !== "credits") return null;

  const credits = userPlan.credits_remaining ?? 0;
  const isLow = credits > 0 && credits <= 3;
  const isEmpty = credits <= 0;

  if (isEmpty) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">Seus créditos acabaram</p>
          <p className="text-xs text-muted-foreground">Adquira mais créditos para continuar publicando.</p>
        </div>
        <span className="rounded-full bg-destructive/20 px-3 py-1 text-sm font-bold text-destructive">0</span>
        <Button size="sm" variant="destructive" onClick={() => navigate("/plan")}>Comprar créditos</Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
      isLow
        ? "border-yellow-500/40 bg-yellow-500/10"
        : "border-border bg-muted/50"
    }`}>
      <Coins className={`h-5 w-5 shrink-0 ${isLow ? "text-yellow-600" : "text-muted-foreground"}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {isLow ? "Créditos acabando!" : "Créditos disponíveis"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isLow ? "Considere adquirir mais créditos em breve." : "Cada publicação consome 1 crédito."}
        </p>
      </div>
      <span className={`rounded-full px-3 py-1 text-sm font-bold ${
        isLow
          ? "bg-yellow-500/20 text-yellow-700"
          : "bg-primary/10 text-primary"
      }`}>
        {credits}
      </span>
      {isLow && (
        <Button size="sm" variant="outline" onClick={() => navigate("/plan")}>Comprar créditos</Button>
      )}
    </div>
  );
}
