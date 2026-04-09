import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useModules } from "@/hooks/useModuleAccess";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";

const MODULE_ICONS: Record<string, string> = {
  criativos: "🎨",
  videos: "🎬",
  site: "🏠",
  crm: "🤝",
  whatsapp: "📱",
  social: "📣",
};

const MODULE_NAMES: Record<string, string> = {
  criativos: "Criativos",
  videos: "Vídeos",
  site: "Site + Portais",
  crm: "CRM",
  whatsapp: "WhatsApp",
  social: "Social",
};

interface AsaasProduct {
  id: string;
  module_id: string;
  plan_slug: string;
  plan_name: string;
  price: number;
  credits: number;
  max_users: number;
  description: string;
}

export default function ModulesPage() {
  const [products, setProducts] = useState<AsaasProduct[]>([]);
  const { modules, loading: modulesLoading } = useModules();

  useEffect(() => {
    supabase
      .from("asaas_products")
      .select("*")
      .eq("active", true)
      .order("module_id")
      .order("price")
      .then(({ data }) => setProducts((data as AsaasProduct[]) ?? []));
  }, []);

  const grouped = products.reduce(
    (acc, p) => {
      if (!acc[p.module_id]) acc[p.module_id] = [];
      acc[p.module_id].push(p);
      return acc;
    },
    {} as Record<string, AsaasProduct[]>
  );

  const hasModule = (moduleId: string) =>
    modules.some((m) => m.module_id === moduleId);

  const currentPlan = (moduleId: string) =>
    modules.find((m) => m.module_id === moduleId)?.plan_slug;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Planos e Módulos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Assine apenas os módulos que você precisa. CRM básico grátis com
            qualquer módulo.
          </p>
        </div>

        {Object.entries(grouped).map(([moduleId, plans]) => (
          <div key={moduleId} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{MODULE_ICONS[moduleId]}</span>
              <div>
                <h2 className="text-lg font-semibold">
                  {MODULE_NAMES[moduleId]}
                </h2>
                {hasModule(moduleId) && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    ✓ Ativo — plano {currentPlan(moduleId)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isActive = modules.some(
                  (m) =>
                    m.module_id === moduleId &&
                    m.plan_slug === plan.plan_slug
                );
                return (
                  <div
                    key={plan.id}
                    className={`border rounded-xl p-4 space-y-3 ${
                      isActive
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{plan.plan_name}</p>
                      <p className="text-2xl font-bold mt-1">
                        R${Number(plan.price).toFixed(0)}
                        <span className="text-sm font-normal text-gray-500">
                          /mês
                        </span>
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      {plan.credits > 0 && plan.credits < 99999 && (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          {plan.credits} créditos/mês
                        </div>
                      )}
                      {plan.credits >= 99999 && (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          Ilimitado
                        </div>
                      )}
                      {plan.max_users > 1 && (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          {plan.max_users} usuários
                        </div>
                      )}
                    </div>
                    {isActive ? (
                      <Badge className="w-full justify-center bg-green-100 text-green-700">
                        Plano atual
                      </Badge>
                    ) : (
                      <SubscribeButton
                        moduleId={moduleId}
                        planSlug={plan.plan_slug}
                        planName={plan.plan_name}
                        price={Number(plan.price)}
                        className="w-full"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
