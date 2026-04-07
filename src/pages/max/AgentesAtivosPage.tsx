/**
 * AgentesAtivosPage.tsx — Agentes de IA (MAX)
 *
 * Abas: Agentes Ativos | Criar Agente | Logs | Créditos
 * Cards por agente com status, execuções, toggle.
 * Templates pré-configurados.
 */
import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Bot, Plus, Play, Pause, Settings, ScrollText, Zap, Brain,
  FileText, MessageCircle, BarChart3, Calendar, Image, Eye,
  Loader2, CheckCircle, XCircle, Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { INTERACTIVE_AGENTS, type InteractiveAgentDef } from "@/config/interactive-agents";
import { InteractiveAgentCard } from "@/components/agentes/InteractiveAgentCard";
import { AgentChatSheet } from "@/components/agentes/AgentChatSheet";

interface AIAgent {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  tipo: string;
  status: "ativo" | "pausado" | "erro" | "executando";
  execucoesHoje: number;
  execucoesTotal: number;
  tokensConsumidos: number;
  ultimaExecucao: string | null;
  trigger: string;
}

const MOCK_AGENTS: AIAgent[] = [
  { id: "ag1", nome: "Gerador Diário de Conteúdo", emoji: "📝", descricao: "Gera 3 posts por dia às 9h com base nos imóveis", tipo: "Gerador de Conteúdo", status: "ativo", execucoesHoje: 1, execucoesTotal: 28, tokensConsumidos: 45200, ultimaExecucao: "2026-04-05T09:00:00Z", trigger: "Diário às 9h" },
  { id: "ag2", nome: "Atendente WhatsApp 24/7", emoji: "💬", descricao: "Responde leads fora do horário comercial", tipo: "Atendente WhatsApp", status: "ativo", execucoesHoje: 7, execucoesTotal: 342, tokensConsumidos: 128500, ultimaExecucao: "2026-04-05T07:30:00Z", trigger: "Mensagem recebida" },
  { id: "ag3", nome: "Qualificador de Leads", emoji: "🎯", descricao: "Atribui temperatura Quente/Morno/Frio a novos leads", tipo: "Analisador", status: "ativo", execucoesHoje: 2, execucoesTotal: 89, tokensConsumidos: 15800, ultimaExecucao: "2026-04-05T09:30:00Z", trigger: "Novo lead cadastrado" },
  { id: "ag4", nome: "Criador de Reels Automático", emoji: "🎬", descricao: "Gera vídeo Reel ao cadastrar novo imóvel", tipo: "Gerador de Conteúdo", status: "pausado", execucoesHoje: 0, execucoesTotal: 12, tokensConsumidos: 8900, ultimaExecucao: "2026-04-03T14:00:00Z", trigger: "Imóvel cadastrado" },
  { id: "ag5", nome: "Monitor de Concorrentes", emoji: "👀", descricao: "Monitora Instagram de concorrentes diariamente", tipo: "Analisador", status: "erro", execucoesHoje: 0, execucoesTotal: 5, tokensConsumidos: 3200, ultimaExecucao: null, trigger: "Diário às 7h" },
  { id: "ag6", nome: "Book Agente Dinâmico", emoji: "📚", descricao: "Atualiza Book PDF quando novos imóveis entram", tipo: "Agendador", status: "ativo", execucoesHoje: 0, execucoesTotal: 8, tokensConsumidos: 5400, ultimaExecucao: "2026-04-04T22:00:00Z", trigger: "Imóvel cadastrado" },
];

const STATUS_CFG = {
  ativo: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500" },
  pausado: { label: "Pausado", color: "bg-amber-500/10 text-amber-500", dot: "bg-amber-500" },
  erro: { label: "Erro", color: "bg-red-500/10 text-red-500", dot: "bg-red-500" },
  executando: { label: "Executando", color: "bg-blue-500/10 text-blue-500", dot: "bg-blue-500 animate-pulse" },
};

interface LogEntry { id: string; agente: string; entrada: string; saida: string; tokens: number; duracao: string; status: "sucesso" | "erro"; data: string; }

const MOCK_LOGS: LogEntry[] = [
  { id: "lg1", agente: "Gerador Diário", entrada: "Gerar 3 posts para imóveis ativos", saida: "3 legendas + hashtags gerados", tokens: 1580, duracao: "4.2s", status: "sucesso", data: "2026-04-05T09:00:00Z" },
  { id: "lg2", agente: "Atendente WhatsApp", entrada: "Lead: 'Qual o preço do apt Vila Mariana?'", saida: "Respondeu com dados + fotos + CTA", tokens: 890, duracao: "2.1s", status: "sucesso", data: "2026-04-05T07:30:00Z" },
  { id: "lg3", agente: "Qualificador", entrada: "Novo lead: Ricardo Lima", saida: "Classificado como Morno (score 62)", tokens: 320, duracao: "1.3s", status: "sucesso", data: "2026-04-05T09:30:00Z" },
  { id: "lg4", agente: "Monitor Concorrentes", entrada: "Verificar @imob_concorrente", saida: "Erro: conta privada, acesso negado", tokens: 0, duracao: "0.5s", status: "erro", data: "2026-04-04T07:00:00Z" },
];

export default function AgentesAtivosPage() {
  const { toast } = useToast();
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [chatAgent, setChatAgent] = useState<InteractiveAgentDef | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleOpenChat = (agent: InteractiveAgentDef) => {
    setChatAgent(agent);
    setChatOpen(true);
  };

  // Load memory counts from localStorage
  const getMemoryCount = (agentId: string): number => {
    try {
      const raw = localStorage.getItem(`imob_agent_memory_${agentId}`);
      if (!raw) return 0;
      const mem = JSON.parse(raw);
      return mem.facts?.length ?? 0;
    } catch { return 0; }
  };

  const totalTokens = agents.reduce((s, a) => s + a.tokensConsumidos, 0);
  const creditLimit = 500000;
  const creditPct = Math.round((totalTokens / creditLimit) * 100);

  const toggleAgent = (id: string) => {
    setAgents((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const ns = a.status === "ativo" ? "pausado" : "ativo";
      toast({ title: `${a.nome} ${ns === "ativo" ? "ativado" : "pausado"}` });
      return { ...a, status: ns as AIAgent["status"] };
    }));
  };

  function timeAgo(iso: string | null): string {
    if (!iso) return "Nunca";
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agentes de IA</h1>
              <p className="text-sm text-muted-foreground">{agents.filter((a) => a.status === "ativo").length} ativos &middot; {totalTokens.toLocaleString()} tokens consumidos</p>
            </div>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="w-4 h-4 mr-2" />Criar Agente</Button>
        </div>

        <Tabs defaultValue="assistentes">
          <TabsList className="flex-wrap">
            <TabsTrigger value="assistentes" className="gap-1.5"><MessageCircle className="w-4 h-4" />Assistentes</TabsTrigger>
            <TabsTrigger value="ativos" className="gap-1.5"><Bot className="w-4 h-4" />Automáticos</TabsTrigger>
            <TabsTrigger value="criar" className="gap-1.5"><Plus className="w-4 h-4" />Criar Agente</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5"><ScrollText className="w-4 h-4" />Logs</TabsTrigger>
            <TabsTrigger value="creditos" className="gap-1.5"><Coins className="w-4 h-4" />Créditos</TabsTrigger>
          </TabsList>

          {/* ── Assistentes Interativos ───────────────────── */}
          <TabsContent value="assistentes" className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Seus Assistentes IA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                6 agentes especializados prontos para ajudar. Clique em "Conversar" para iniciar. Memória persistente entre sessões.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {INTERACTIVE_AGENTS.map((agent) => (
                <InteractiveAgentCard
                  key={agent.id}
                  agent={agent}
                  memoryCount={getMemoryCount(agent.id)}
                  onExecute={handleOpenChat}
                />
              ))}
            </div>
          </TabsContent>

          {/* ── Agentes Ativos ────────────────────────────── */}
          <TabsContent value="ativos" className="mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {agents.map((agent) => {
                const stCfg = STATUS_CFG[agent.status];
                return (
                  <Card key={agent.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{agent.emoji}</span>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{agent.nome}</p>
                            <p className="text-[11px] text-muted-foreground">{agent.descricao}</p>
                          </div>
                        </div>
                        <Switch checked={agent.status === "ativo" || agent.status === "executando"} onCheckedChange={() => toggleAgent(agent.id)} />
                      </div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className={cn("text-[10px]", stCfg.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1", stCfg.dot)} />{stCfg.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">{agent.tipo}</Badge>
                        <Badge variant="secondary" className="text-[10px]">⚡ {agent.trigger}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{agent.execucoesHoje} hoje / {agent.execucoesTotal} total</span>
                        <span>{timeAgo(agent.ultimaExecucao)}</span>
                      </div>
                      <div className="flex gap-1.5 mt-3">
                        <Button size="sm" variant="outline" className="text-xs h-7 flex-1"><Play className="w-3 h-3 mr-1" />Executar</Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7"><ScrollText className="w-3 h-3 mr-1" />Logs</Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7"><Settings className="w-3 h-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Criar Agente ──────────────────────────────── */}
          <TabsContent value="criar" className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do agente</Label>
                    <Input placeholder="Ex: Gerador de Stories" />
                  </div>
                  <div>
                    <Label>Tipo base</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gerador">Gerador de Conteúdo</SelectItem>
                        <SelectItem value="atendente">Atendente WhatsApp</SelectItem>
                        <SelectItem value="analisador">Analisador</SelectItem>
                        <SelectItem value="agendador">Agendador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Descrição (system prompt)</Label>
                  <Textarea placeholder="Descreva o que o agente deve fazer..." rows={4} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Trigger</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Quando executar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="agendado">Agendado (cron)</SelectItem>
                        <SelectItem value="novo_imovel">Novo imóvel cadastrado</SelectItem>
                        <SelectItem value="novo_lead">Novo lead cadastrado</SelectItem>
                        <SelectItem value="mensagem">Mensagem recebida</SelectItem>
                        <SelectItem value="visita_concluida">Visita concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Modelo de IA</Label>
                    <Select defaultValue="sonnet">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sonnet">Claude Sonnet 4.6 (padrão MAX)</SelectItem>
                        <SelectItem value="haiku">Claude Haiku (mais rápido)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Ações permitidas</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "legendas", label: "Gerar legendas", icon: FileText },
                      { id: "videos", label: "Gerar vídeos", icon: Image },
                      { id: "whatsapp", label: "Enviar WhatsApp", icon: MessageCircle },
                      { id: "agendamentos", label: "Criar agendamentos", icon: Calendar },
                      { id: "leads", label: "Atualizar leads", icon: Bot },
                      { id: "instagram", label: "Postar Instagram", icon: Eye },
                    ].map((action) => (
                      <label key={action.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <action.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs">{action.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline"><Play className="w-4 h-4 mr-2" />Testar Agente</Button>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Zap className="w-4 h-4 mr-2" />Salvar e Ativar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Logs ──────────────────────────────────────── */}
          <TabsContent value="logs" className="mt-4 space-y-3">
            {MOCK_LOGS.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {log.status === "sucesso" ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{log.agente}</span>
                        <Badge variant="secondary" className="text-[10px]">{log.tokens} tokens &middot; {log.duracao}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Entrada: {log.entrada}</p>
                      <p className="text-xs text-foreground mt-0.5">Saída: {log.saida}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(log.data).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Créditos ──────────────────────────────────── */}
          <TabsContent value="creditos" className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Tokens consumidos</p>
                  <p className="text-4xl font-bold text-foreground">{totalTokens.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">de {creditLimit.toLocaleString()} disponíveis</p>
                  <Progress value={creditPct} className="mt-3 h-3" />
                  <p className="text-xs text-muted-foreground mt-2">{creditPct}% utilizado</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Consumo por agente</h4>
                  {agents.filter((a) => a.tokensConsumidos > 0).sort((a, b) => b.tokensConsumidos - a.tokensConsumidos).map((a) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="text-sm">{a.emoji}</span>
                      <span className="text-xs text-foreground flex-1">{a.nome}</span>
                      <span className="text-xs text-muted-foreground">{a.tokensConsumidos.toLocaleString()}</span>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${Math.round((a.tokensConsumidos / totalTokens) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Sheet */}
      <AgentChatSheet
        agent={chatAgent}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </AppLayout>
  );
}
