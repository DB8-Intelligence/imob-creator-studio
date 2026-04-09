import { useModules } from "@/hooks/useModuleAccess";
import { Badge } from "@/components/ui/badge";

const MODULE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  criativos: { label: "Criativos", emoji: "🎨", color: "bg-indigo-100 text-indigo-700" },
  videos:    { label: "Vídeos",    emoji: "🎬", color: "bg-green-100 text-green-700" },
  site:      { label: "Site",      emoji: "🏠", color: "bg-orange-100 text-orange-700" },
  crm:       { label: "CRM PRO",   emoji: "👥", color: "bg-purple-100 text-purple-700" },
  whatsapp:  { label: "WhatsApp",  emoji: "📱", color: "bg-emerald-100 text-emerald-700" },
  social:    { label: "Social",    emoji: "📣", color: "bg-pink-100 text-pink-700" },
};

export function ModuleBadges() {
  const { modules, loading } = useModules();

  if (loading) return <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />;

  if (modules.length === 0) {
    return (
      <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">
        Nenhum módulo ativo
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {modules.map((m) => {
        const cfg = MODULE_CONFIG[m.module_id];
        if (!cfg) return null;
        return (
          <Badge key={m.module_id} className={`${cfg.color} text-xs`}>
            {cfg.emoji} {cfg.label} {m.plan_slug !== "max" ? `· ${m.credits_remaining} créd.` : "· ∞"}
          </Badge>
        );
      })}
    </div>
  );
}
