import { useState, useEffect } from "react";
import {
  Camera,
  Bell,
  CalendarCheck,
  Instagram,
  Clock,
  Zap,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Flow definitions                                                   */
/* ------------------------------------------------------------------ */

interface Flow {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  is_active: boolean;
}

const FLOW_ICONS: Record<string, React.ReactNode> = {
  "foto-criativo": <Camera className="h-5 w-5 text-[#002B5B]" />,
  "lead-notificacao": <Bell className="h-5 w-5 text-[#FFD700]" />,
  "imovel-instagram": <Instagram className="h-5 w-5 text-pink-500" />,
  "publicacao-diaria": <Clock className="h-5 w-5 text-green-600" />,
};

const DEFAULT_FLOWS = [
  {
    id: "foto-criativo",
    title: "Foto \u2192 Criativo Automatico",
    description:
      "Ao receber foto pelo WhatsApp, gerar criativo automaticamente com o template padrao.",
    is_active: false,
  },
  {
    id: "lead-notificacao",
    title: "Lead Site \u2192 Notificacao WA",
    description:
      "Notificar corretor via WhatsApp quando um novo lead chegar pelo site.",
    is_active: false,
  },
  {
    id: "imovel-instagram",
    title: "Imovel WA \u2192 Publicar Instagram",
    description:
      "Ao receber dados de imovel pelo WhatsApp, publicar automaticamente no Instagram.",
    is_active: false,
  },
  {
    id: "publicacao-diaria",
    title: "Publicacao Automatica Diaria",
    description:
      "Publicar automaticamente um criativo por dia nos canais configurados.",
    is_active: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhatsAppFluxosPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  const [flows, setFlows] = useState<Flow[]>(
    DEFAULT_FLOWS.map((f) => ({ ...f, icon: FLOW_ICONS[f.id] || <Zap className="h-5 w-5" /> }))
  );
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  /* ---- Load from Supabase (or fallback to localStorage) ---- */
  useEffect(() => {
    if (!workspaceId || !user) return;

    async function loadFlows() {
      try {
        const { data, error } = await supabase
          .from("automation_rules" as any)
          .select("*")
          .eq("workspace_id", workspaceId);

        if (error) {
          console.warn("automation_rules query:", error.message);
          // Fallback to localStorage
          setUseLocalFallback(true);
          try {
            const stored = localStorage.getItem("wa_flows");
            if (stored) {
              const enabled: Record<string, boolean> = JSON.parse(stored);
              setFlows((prev) =>
                prev.map((f) => ({ ...f, is_active: !!enabled[f.id] }))
              );
            }
          } catch { /* ignore */ }
          return;
        }

        if (data && data.length > 0) {
          setFlows(
            (data as any[]).map((d) => ({
              id: d.id,
              title: d.title || d.rule_name || d.id,
              description: d.description || "",
              is_active: !!d.is_active,
              icon: FLOW_ICONS[d.id] || FLOW_ICONS[d.rule_key] || <Zap className="h-5 w-5" />,
            }))
          );
        } else {
          // Seed defaults
          const toInsert = DEFAULT_FLOWS.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            is_active: false,
            workspace_id: workspaceId,
            user_id: user.id,
          }));
          const { data: inserted, error: insertErr } = await supabase
            .from("automation_rules" as any)
            .insert(toInsert as any)
            .select();
          if (insertErr) {
            console.warn("automation_rules seed:", insertErr.message);
            setUseLocalFallback(true);
          } else if (inserted) {
            setFlows(
              (inserted as any[]).map((d) => ({
                id: d.id,
                title: d.title || d.id,
                description: d.description || "",
                is_active: !!d.is_active,
                icon: FLOW_ICONS[d.id] || <Zap className="h-5 w-5" />,
              }))
            );
          }
        }
      } catch {
        setUseLocalFallback(true);
      }
    }

    loadFlows();
  }, [workspaceId, user]);

  /* ---- Toggle handler ---- */
  const handleToggle = async (flowId: string, currentActive: boolean) => {
    const nextActive = !currentActive;

    if (useLocalFallback) {
      // Persist to localStorage as fallback
      setFlows((prev) =>
        prev.map((f) => (f.id === flowId ? { ...f, is_active: nextActive } : f))
      );
      try {
        const stored = localStorage.getItem("wa_flows");
        const enabled: Record<string, boolean> = stored ? JSON.parse(stored) : {};
        enabled[flowId] = nextActive;
        localStorage.setItem("wa_flows", JSON.stringify(enabled));
      } catch { /* ignore */ }
    } else {
      const { error } = await supabase
        .from("automation_rules" as any)
        .update({ is_active: nextActive } as any)
        .eq("id", flowId);
      if (error) {
        toast({ title: "Erro ao atualizar fluxo", variant: "destructive" });
        return;
      }
      setFlows((prev) =>
        prev.map((f) => (f.id === flowId ? { ...f, is_active: nextActive } : f))
      );
    }

    const flow = flows.find((f) => f.id === flowId);
    toast({
      title: nextActive ? "Fluxo ativado" : "Fluxo desativado",
      description: flow?.title,
    });
  };

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#002B5B]">
            <Zap className="inline-block h-5 w-5 mr-2 -mt-0.5 text-[#FFD700]" />
            Fluxos de Automacao
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ative automacoes para processar mensagens e interagir com leads.
          </p>
        </div>

        {/* Flow cards */}
        <div className="space-y-4">
          {flows.map((flow) => (
            <Card
              key={flow.id}
              className={`border transition-colors ${
                flow.is_active
                  ? "border-[#002B5B]/30 bg-[#002B5B]/[0.02]"
                  : "border-gray-200"
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                {/* Icon */}
                <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {flow.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-[#002B5B]">
                      {flow.title}
                    </h3>
                    <Badge
                      className={`text-[11px] border-0 ${
                        flow.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {flow.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {flow.description}
                  </p>
                </div>

                {/* Toggle */}
                <Switch
                  checked={flow.is_active}
                  onCheckedChange={() => handleToggle(flow.id, flow.is_active)}
                  className="shrink-0 data-[state=checked]:bg-[#002B5B]"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-4">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500">
            Fluxos customizados em breve. Entre em contato para configuracoes
            avancadas.
          </p>
        </div>
      </div>
    </div>
  );
}
