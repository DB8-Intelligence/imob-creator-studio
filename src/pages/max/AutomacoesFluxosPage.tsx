/**
 * AutomacoesFluxosPage.tsx — Automações WhatsApp (MAX)
 *
 * Abas: Fluxos Ativos | Construtor | Histórico | Config
 * Status Evolution API badge. Templates de fluxo pré-definidos.
 */
import { useState, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Workflow, Plus, MessageCircle, Zap, Play, Pause, Settings, History,
  GitBranch, Send, Bell, Calendar, Users, Image, RefreshCw, Search,
  CheckCircle, XCircle, Eye, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { ContentAutomationPanel } from "@/components/automacoes/ContentAutomationPanel";

// ─── Mock data ─────────────────────────────────────────────────────────────

interface AutomationFlow {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  trigger: string;
  status: "ativo" | "pausado" | "erro";
  disparosHoje: number;
  disparosTotal: number;
  ultimaExecucao: string | null;
}

const MOCK_FLOWS: AutomationFlow[] = [
  { id: "f1", nome: "Boas-vindas Lead Novo", emoji: "👋", descricao: "Envia apresentação ao cadastrar novo lead", trigger: "Novo lead cadastrado", status: "ativo", disparosHoje: 3, disparosTotal: 127, ultimaExecucao: "2026-04-05T09:30:00Z" },
  { id: "f2", nome: "Confirmação de Visita", emoji: "📅", descricao: "Confirma data/hora/endereço da visita", trigger: "Agendamento criado", status: "ativo", disparosHoje: 2, disparosTotal: 89, ultimaExecucao: "2026-04-05T08:15:00Z" },
  { id: "f3", nome: "Lembrete 24h", emoji: "⏰", descricao: "Lembra da visita 24h antes", trigger: "24h antes do agendamento", status: "ativo", disparosHoje: 1, disparosTotal: 76, ultimaExecucao: "2026-04-04T10:00:00Z" },
  { id: "f4", nome: "Follow-up Pós-Visita", emoji: "💬", descricao: "Feedback 2h após visita concluída", trigger: "Visita concluída", status: "pausado", disparosHoje: 0, disparosTotal: 45, ultimaExecucao: "2026-04-03T16:00:00Z" },
  { id: "f5", nome: "Envio de Criativo", emoji: "📸", descricao: "Envia imagem/vídeo do imóvel", trigger: "Manual", status: "ativo", disparosHoje: 5, disparosTotal: 312, ultimaExecucao: "2026-04-05T11:00:00Z" },
  { id: "f6", nome: "Reativação Lead Frio", emoji: "❄️", descricao: "Reativa leads sem contato há 7 dias", trigger: "Lead sem contato 7d", status: "ativo", disparosHoje: 0, disparosTotal: 34, ultimaExecucao: "2026-04-04T08:00:00Z" },
  { id: "f7", nome: "Novo Imóvel Match", emoji: "🏠", descricao: "Notifica leads quando imóvel novo match interesse", trigger: "Imóvel cadastrado", status: "erro", disparosHoje: 0, disparosTotal: 18, ultimaExecucao: null },
];

interface DispatchLog {
  id: string;
  fluxo: string;
  leadNome: string;
  status: "enviado" | "erro" | "lido";
  dataHora: string;
}

const MOCK_LOGS: DispatchLog[] = [
  { id: "l1", fluxo: "Boas-vindas Lead Novo", leadNome: "Ricardo Lima", status: "enviado", dataHora: "2026-04-05T09:30:00Z" },
  { id: "l2", fluxo: "Confirmação de Visita", leadNome: "Roberto Almeida", status: "lido", dataHora: "2026-04-05T08:15:00Z" },
  { id: "l3", fluxo: "Envio de Criativo", leadNome: "Beatriz Nunes", status: "enviado", dataHora: "2026-04-05T11:00:00Z" },
  { id: "l4", fluxo: "Lembrete 24h", leadNome: "Carlos Mendes", status: "lido", dataHora: "2026-04-04T10:00:00Z" },
  { id: "l5", fluxo: "Novo Imóvel Match", leadNome: "Ana Paula Silva", status: "erro", dataHora: "2026-04-03T14:00:00Z" },
];

const STATUS_CFG = {
  ativo: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500" },
  pausado: { label: "Pausado", color: "bg-amber-500/10 text-amber-500", dot: "bg-amber-500" },
  erro: { label: "Erro", color: "bg-red-500/10 text-red-500", dot: "bg-red-500" },
};

const LOG_STATUS_CFG = {
  enviado: { label: "Enviado", color: "text-blue-500", icon: Send },
  lido: { label: "Lido", color: "text-emerald-500", icon: CheckCircle },
  erro: { label: "Erro", color: "text-red-500", icon: XCircle },
};

export default function AutomacoesFluxosPage() {
  const { toast } = useToast();
  const { workspaceId } = useWorkspaceContext();
  const [flows, setFlows] = useState(MOCK_FLOWS);
  const [evolutionConnected] = useState(true);

  const toggleFlow = useCallback((id: string) => {
    setFlows((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      const newStatus = f.status === "ativo" ? "pausado" : "ativo";
      toast({ title: `${f.nome} ${newStatus === "ativo" ? "ativado" : "pausado"}` });
      return { ...f, status: newStatus };
    }));
  }, [toast]);

  function timeAgo(iso: string | null): string {
    if (!iso) return "Nunca";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Automações WhatsApp</h1>
              <p className="text-sm text-muted-foreground">{flows.filter((f) => f.status === "ativo").length} fluxos ativos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn("gap-1.5", evolutionConnected ? "border-emerald-500/40 text-emerald-500" : "border-red-500/40 text-red-500")}>
              <span className={cn("w-2 h-2 rounded-full", evolutionConnected ? "bg-emerald-500" : "bg-red-500")} />
              {evolutionConnected ? "Evolution API Conectado" : "Desconectado"}
            </Badge>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />Nova Automação
            </Button>
          </div>
        </div>

        <Tabs defaultValue="fluxos">
          <TabsList>
            <TabsTrigger value="fluxos" className="gap-1.5"><Workflow className="w-4 h-4" />Fluxos Ativos</TabsTrigger>
            <TabsTrigger value="construtor" className="gap-1.5"><GitBranch className="w-4 h-4" />Construtor</TabsTrigger>
            <TabsTrigger value="historico" className="gap-1.5"><History className="w-4 h-4" />Histórico</TabsTrigger>
            <TabsTrigger value="conteudo" className="gap-1.5"><Zap className="w-4 h-4" />Conteúdo IA</TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5"><Settings className="w-4 h-4" />Config</TabsTrigger>
          </TabsList>

          {/* ── Fluxos Ativos ─────────────────────────────── */}
          <TabsContent value="fluxos" className="mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {flows.map((flow) => {
                const stCfg = STATUS_CFG[flow.status];
                return (
                  <Card key={flow.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{flow.emoji}</span>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{flow.nome}</p>
                            <p className="text-[11px] text-muted-foreground">{flow.descricao}</p>
                          </div>
                        </div>
                        <Switch checked={flow.status === "ativo"} onCheckedChange={() => toggleFlow(flow.id)} />
                      </div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className={cn("text-[10px]", stCfg.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1", stCfg.dot)} />
                          {stCfg.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">⚡ {flow.trigger}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{flow.disparosHoje} hoje / {flow.disparosTotal} total</span>
                        <span>{timeAgo(flow.ultimaExecucao)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Construtor ────────────────────────────────── */}
          <TabsContent value="construtor" className="mt-4">
            <div className="rounded-2xl border-2 border-dashed border-border p-16 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="font-medium text-foreground text-lg">Construtor Visual de Fluxos</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Editor de blocos: Trigger → Condição → Mensagem → Aguardar → Mídia.
                Com preview de WhatsApp em tempo real.
              </p>
              <Badge variant="outline" className="mt-4">Em desenvolvimento</Badge>
            </div>
          </TabsContent>

          {/* ── Histórico ─────────────────────────────────── */}
          <TabsContent value="historico" className="mt-4 space-y-3">
            {MOCK_LOGS.map((log) => {
              const lCfg = LOG_STATUS_CFG[log.status];
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <lCfg.icon className={cn("w-4 h-4 flex-shrink-0", lCfg.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground"><span className="font-medium">{log.fluxo}</span> → {log.leadNome}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(log.dataHora).toLocaleString("pt-BR")}</p>
                  </div>
                  <Badge variant="secondary" className={cn("text-[10px]", lCfg.color)}>{lCfg.label}</Badge>
                </div>
              );
            })}
          </TabsContent>

          {/* ── Conteúdo IA (DEV-26) ────────────────────────── */}
          <TabsContent value="conteudo" className="mt-4">
            <ContentAutomationPanel workspaceId={workspaceId} />
          </TabsContent>

          {/* ── Config ────────────────────────────────────── */}
          <TabsContent value="config" className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Conexão Evolution API</h3>
                    <p className="text-sm text-muted-foreground">Número: (11) 99999-0000</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />Conectado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Horário comercial apenas</p>
                    <p className="text-xs text-muted-foreground">Não enviar fora do horário 8h-20h</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Limite diário</p>
                    <p className="text-xs text-muted-foreground">Máximo de mensagens por dia</p>
                  </div>
                  <Badge variant="secondary">100 msg/dia</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
