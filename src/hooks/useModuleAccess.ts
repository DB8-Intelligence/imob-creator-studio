import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ModuleSubscription {
  module_id:         string;
  plan_slug:         string;
  plan_name:         string;
  credits_total:     number;
  credits_used:      number;
  credits_remaining: number;
  max_users:         number;
  status:            string;
  activated_at:      string;
  expires_at:        string | null;
}

// Hierarquia de planos
const PLAN_LEVEL: Record<string, number> = {
  starter: 1, basico: 2, pro: 3, max: 4,
};

export function useModules() {
  const [modules, setModules] = useState<ModuleSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("my_modules")
      .select("*")
      .then(({ data }) => {
        setModules((data as ModuleSubscription[]) ?? []);
        setLoading(false);
      });
  }, []);

  const getModule = (id: string) => modules.find((m) => m.module_id === id);
  const hasModule = (id: string) => !!getModule(id);
  const planLevel = (id: string) => PLAN_LEVEL[getModule(id)?.plan_slug ?? ""] ?? 0;

  // Gates de acesso por módulo e nível
  const can = {
    // Criativos
    downloadCreative:   () => hasModule("criativos"),
    sendCreativeWA:     () => hasModule("criativos"),
    approveCreative:    () => hasModule("criativos") && planLevel("criativos") >= 2,
    scheduleCreative:   () => hasModule("criativos") && planLevel("criativos") >= 2,
    publishSocial:      () => hasModule("social"),

    // Site
    publishToSite:      () => hasModule("site"),
    exportXML:          () => hasModule("site"),

    // WhatsApp
    connectWhatsApp:    () => hasModule("whatsapp"),
    receiveImoveisByWA: () => hasModule("whatsapp"),

    // CRM PRO
    teamLeadRotation:   () => hasModule("crm") && planLevel("crm") >= 3,
    financialModule:    () => hasModule("crm") && planLevel("crm") >= 3,

    // Vídeos
    generateVideo:      () => hasModule("videos"),
  };

  // Max users = maior valor entre todos os módulos ativos
  const maxWorkspaceUsers = Math.max(1, ...modules.map((m) => m.max_users));

  return { modules, loading, getModule, hasModule, can, maxWorkspaceUsers };
}

// Hook simplificado para um módulo específico
export function useModule(moduleId: string) {
  const { getModule, hasModule, loading } = useModules();
  return {
    subscription: getModule(moduleId),
    active:       hasModule(moduleId),
    loading,
  };
}
