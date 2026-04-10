import { useState, useEffect } from "react";
import {
  Camera,
  Bell,
  CalendarCheck,
  Zap,
  Info,
} from "lucide-react";
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
}

const FLOWS: Flow[] = [
  {
    id: "foto-criativo",
    icon: <Camera className="h-5 w-5 text-[#002B5B]" />,
    title: "Foto → Criativo Automatico",
    description:
      "Ao receber foto pelo WhatsApp, gerar criativo automaticamente com o template padrao.",
  },
  {
    id: "lead-notificacao",
    icon: <Bell className="h-5 w-5 text-[#FFD700]" />,
    title: "Novo Lead → Notificacao WA",
    description:
      "Notificar corretor via WhatsApp quando um novo lead chegar pelo site.",
  },
  {
    id: "agendamento-confirmacao",
    icon: <CalendarCheck className="h-5 w-5 text-green-600" />,
    title: "Agendamento → Confirmacao",
    description:
      "Enviar confirmacao de visita automaticamente ao proprietario e ao lead.",
  },
];

const LOCAL_KEY = "wa_flows";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhatsAppFluxosPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  const [enabledFlows, setEnabledFlows] = useState<Record<string, boolean>>(
    () => {
      try {
        const stored = localStorage.getItem(LOCAL_KEY);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }
  );

  /* ---- Persist to localStorage ---- */
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(enabledFlows));
  }, [enabledFlows]);

  /* ---- Toggle handler ---- */
  const handleToggle = (flowId: string) => {
    const next = !enabledFlows[flowId];
    setEnabledFlows((prev) => ({ ...prev, [flowId]: next }));
    toast({
      title: next ? "Fluxo ativado" : "Fluxo desativado",
      description: FLOWS.find((f) => f.id === flowId)?.title,
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
          {FLOWS.map((flow) => {
            const active = !!enabledFlows[flow.id];
            return (
              <Card
                key={flow.id}
                className={`border transition-colors ${
                  active
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
                          active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {flow.description}
                    </p>
                  </div>

                  {/* Toggle */}
                  <Switch
                    checked={active}
                    onCheckedChange={() => handleToggle(flow.id)}
                    className="shrink-0 data-[state=checked]:bg-[#002B5B]"
                  />
                </CardContent>
              </Card>
            );
          })}
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
