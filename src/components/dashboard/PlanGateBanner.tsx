import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface PlanGateBannerProps {
  module: "criativos" | "videos" | "site" | "crm" | "whatsapp" | "social";
  requiredPlan?: string;
  featureName?: string;
}

export function PlanGateBanner({ module, requiredPlan = "Básico", featureName = "Esta funcionalidade" }: PlanGateBannerProps) {
  const upgradeUrl = module === "videos" ? "/videos#planos" : "/criativos#planos";
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <Lock className="h-5 w-5 text-amber-600 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">{featureName} requer plano {requiredPlan} ou superior</p>
        <p className="text-xs text-amber-600 mt-0.5">Faça upgrade para desbloquear publicação, agendamento e mais.</p>
      </div>
      <Link to={upgradeUrl} className="shrink-0 bg-[#002B5B] hover:bg-[#001d3d] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
        Fazer upgrade
      </Link>
    </div>
  );
}
