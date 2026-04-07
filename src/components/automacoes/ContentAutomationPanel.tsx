/**
 * ContentAutomationPanel.tsx — Painel de automação de conteúdo (DEV-26)
 *
 * UI mínima para:
 * - Listar automation_rules com toggle ativo/inativo
 * - Criar nova regra (tipo, template, frequência)
 * - Ver logs de execução por regra
 */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap, Plus, FileText, Video, Clock, CheckCircle, XCircle,
  Loader2, Trash2, ChevronDown, ChevronUp, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useContentAutomation } from "@/hooks/useContentAutomation";
import type { AutomationRule, AutomationRuleInput, AutomationLog } from "@/types/automation";

interface ContentAutomationPanelProps {
  workspaceId: string | null;
}

const FREQ_LABEL = { daily: "Diário", weekly: "Semanal", manual: "Manual" } as const;
const FREQ_COLOR = { daily: "bg-blue-500/10 text-blue-500", weekly: "bg-violet-500/10 text-violet-500", manual: "bg-zinc-500/10 text-zinc-400" };
const TYPE_ICON = { post: FileText, video: Video } as const;

const LOG_STATUS_CFG = {
  pending: { label: "Pendente", color: "text-blue-500", icon: Clock },
  running: { label: "Executando", color: "text-amber-500", icon: Loader2 },
  success: { label: "Sucesso", color: "text-emerald-500", icon: CheckCircle },
  error: { label: "Erro", color: "text-red-500", icon: XCircle },
} as const;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export function ContentAutomationPanel({ workspaceId }: ContentAutomationPanelProps) {
  const { rules, activeCount, toggleRule, createRule, deleteRule, getLogsForRule, isLoading, error, isCreating } = useContentAutomation(workspaceId);

  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"post" | "video">("post");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly" | "manual">("daily");
  const [newTemplate, setNewTemplate] = useState("");

  function handleCreate() {
    if (!newName.trim()) return;
    const input: AutomationRuleInput = {
      name: newName.trim(),
      generation_type: newType,
      frequency: newFreq,
      template_id: newTemplate.trim() || null,
    };
    createRule(input);
    setShowCreate(false);
    setNewName("");
    setNewTemplate("");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">{activeCount} automação{activeCount !== 1 ? "ões" : ""} ativa{activeCount !== 1 ? "s" : ""}</span>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-1" />Nova Automação
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando automações…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <XCircle className="w-8 h-8 text-red-500/40 mx-auto mb-2" />
          <p className="text-sm text-red-500">Erro ao carregar automações.</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as Error).message}</p>
        </div>
      )}

      {/* Rules list */}
      {!isLoading && !error && rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Zap className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma automação de conteúdo criada.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" />Criar primeira
          </Button>
        </div>
      ) : !isLoading && !error ? (
        <div className="space-y-3">
          {rules.map((rule) => {
            const TypeIcon = TYPE_ICON[rule.generation_type];
            const isExpanded = expandedRule === rule.id;
            const logs = getLogsForRule(rule.id);
            return (
              <Card key={rule.id} className={cn(!rule.is_active && "opacity-60")}>
                <CardContent className="p-4">
                  {/* Rule header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        rule.generation_type === "video" ? "bg-violet-500/10" : "bg-blue-500/10"
                      )}>
                        <TypeIcon className={cn("w-4 h-4", rule.generation_type === "video" ? "text-violet-500" : "text-blue-500")} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{rule.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge variant="secondary" className="text-[10px]">{rule.generation_type === "post" ? "Post" : "Vídeo"}</Badge>
                          <Badge variant="secondary" className={cn("text-[10px]", FREQ_COLOR[rule.frequency])}>
                            <CalendarDays className="w-2.5 h-2.5 mr-0.5" />{FREQ_LABEL[rule.frequency]}
                          </Badge>
                          {rule.template_id && <Badge variant="outline" className="text-[10px]">{rule.template_id}</Badge>}
                          {rule.preset && <Badge variant="outline" className="text-[10px]">Preset: {rule.preset}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule.id)} />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Excluir" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {/* Expand logs */}
                  <button
                    type="button"
                    onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {logs.length} execuç{logs.length !== 1 ? "ões" : "ão"}
                  </button>

                  {/* Logs */}
                  {isExpanded && logs.length > 0 && (
                    <div className="mt-3 space-y-1.5 pl-11">
                      {logs.map((log) => {
                        const lCfg = LOG_STATUS_CFG[log.status];
                        return (
                          <div key={log.id} className="flex items-center gap-2 text-xs">
                            <lCfg.icon className={cn("w-3 h-3 flex-shrink-0", lCfg.color, log.status === "running" && "animate-spin")} />
                            <span className={cn("font-medium", lCfg.color)}>{lCfg.label}</span>
                            {log.asset_id && <Badge variant="outline" className="text-[9px]">Asset: {log.asset_id.slice(0, 8)}</Badge>}
                            {log.error && <span className="text-red-500 truncate max-w-[200px]" title={log.error}>{log.error}</span>}
                            <span className="text-muted-foreground ml-auto">{timeAgo(log.created_at)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Automação de Conteúdo</DialogTitle>
            <DialogDescription>Configure a geração automática via n8n</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Nome</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Post diário — Apt Vila Mariana" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Tipo de conteúdo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewType("post")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors",
                    newType === "post" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                  )}
                >
                  <FileText className={cn("w-4 h-4", newType === "post" ? "text-accent" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewType("video")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors",
                    newType === "video" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                  )}
                >
                  <Video className={cn("w-4 h-4", newType === "video" ? "text-accent" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">Vídeo</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Frequência</label>
              <div className="flex gap-2">
                {(["daily", "weekly", "manual"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setNewFreq(freq)}
                    className={cn(
                      "flex-1 p-2 rounded-lg border text-sm text-center transition-colors",
                      newFreq === freq ? "border-accent bg-accent/5 font-medium" : "border-border hover:border-accent/30 text-muted-foreground"
                    )}
                  >
                    {FREQ_LABEL[freq]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Template (opcional)</label>
              <Input value={newTemplate} onChange={(e) => setNewTemplate(e.target.value)} placeholder="Ex: gerar_post, slideshow_classico" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || isCreating} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isCreating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Criando…</> : "Criar Automação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
