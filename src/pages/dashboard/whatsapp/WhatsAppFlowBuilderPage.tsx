import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Zap,
  MessageSquare,
  Clock,
  GitBranch,
  Globe,
  GripVertical,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FlowNode {
  id: string;
  type: "trigger" | "send_message" | "delay" | "condition" | "webhook";
  label: string;
  config: Record<string, string>;
}

interface FlowEdge {
  from: string;
  to: string;
}

interface FlowData {
  id?: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  is_active: boolean;
}

/* ------------------------------------------------------------------ */
/*  Node type definitions                                              */
/* ------------------------------------------------------------------ */

const NODE_TYPES = [
  { type: "trigger", label: "Gatilho", icon: Zap, color: "#FFD700", description: "Evento que inicia o fluxo" },
  { type: "send_message", label: "Enviar Mensagem", icon: MessageSquare, color: "#002B5B", description: "Envia texto via WhatsApp" },
  { type: "delay", label: "Atraso", icon: Clock, color: "#10B981", description: "Aguarda antes de continuar" },
  { type: "condition", label: "Condicao", icon: GitBranch, color: "#F59E0B", description: "Bifurca baseado em regra" },
  { type: "webhook", label: "Webhook", icon: Globe, color: "#8B5CF6", description: "Chama URL externa" },
] as const;

const TRIGGER_OPTIONS = [
  { value: "keyword", label: "Palavra-chave recebida" },
  { value: "any_message", label: "Qualquer mensagem" },
  { value: "image_received", label: "Imagem recebida" },
  { value: "new_contact", label: "Novo contato" },
];

/* ------------------------------------------------------------------ */
/*  Node Config Panel                                                  */
/* ------------------------------------------------------------------ */

function NodeConfigPanel({
  node,
  onUpdate,
  onClose,
}: {
  node: FlowNode;
  onUpdate: (config: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [config, setConfig] = useState(node.config);

  const set = (key: string, value: string) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    onUpdate(next);
  };

  return (
    <div className="border-l border-gray-200 w-[300px] shrink-0 bg-white p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-[#002B5B]">Configurar: {node.label}</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {node.type === "trigger" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de gatilho</label>
            <Select value={config.trigger_type ?? "keyword"} onValueChange={(v) => set("trigger_type", v)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(config.trigger_type === "keyword" || !config.trigger_type) && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Palavra-chave</label>
              <Input
                value={config.keyword ?? ""}
                onChange={(e) => set("keyword", e.target.value)}
                placeholder="Ex: oi, preco, visita"
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}

      {node.type === "send_message" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Mensagem</label>
            <Textarea
              value={config.message ?? ""}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Texto da mensagem automatica..."
              rows={4}
              className="text-sm"
            />
          </div>
        </div>
      )}

      {node.type === "delay" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Tempo (segundos)</label>
            <Input
              type="number"
              value={config.seconds ?? "60"}
              onChange={(e) => set("seconds", e.target.value)}
              min="1"
              max="86400"
              className="text-sm"
            />
          </div>
        </div>
      )}

      {node.type === "condition" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Condicao</label>
            <Select value={config.condition_type ?? "contains"} onValueChange={(v) => set("condition_type", v)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Mensagem contem</SelectItem>
                <SelectItem value="equals">Mensagem igual a</SelectItem>
                <SelectItem value="is_image">E imagem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.condition_type !== "is_image" && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Valor</label>
              <Input
                value={config.condition_value ?? ""}
                onChange={(e) => set("condition_value", e.target.value)}
                placeholder="Texto para comparar"
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}

      {node.type === "webhook" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">URL</label>
            <Input
              value={config.url ?? ""}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://..."
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Metodo</label>
            <Select value={config.method ?? "POST"} onValueChange={(v) => set("method", v)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function WhatsAppFlowBuilderPage() {
  const { id: flowId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  const [flow, setFlow] = useState<FlowData>({
    name: "",
    description: "",
    nodes: [],
    edges: [],
    is_active: true,
  });
  const [loading, setLoading] = useState(!!flowId);
  const [saving, setSaving] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const isNew = !flowId || flowId === "novo";

  /* ---- Load existing flow ---- */
  useEffect(() => {
    if (isNew || !workspaceId) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("automation_rules" as never)
        .select("*")
        .eq("id", flowId)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Fluxo nao encontrado", variant: "destructive" });
        navigate("/dashboard/whatsapp/fluxos");
        return;
      }

      const row = data as Record<string, unknown>;
      setFlow({
        id: row.id as string,
        name: (row.name as string) ?? "",
        description: (row.description as string) ?? "",
        nodes: (row.nodes as FlowNode[]) ?? [],
        edges: (row.edges as FlowEdge[]) ?? [],
        is_active: (row.is_active as boolean) ?? true,
      });
      setLoading(false);
    })();
  }, [flowId, isNew, workspaceId, navigate, toast]);

  /* ---- Add node ---- */
  const addNode = useCallback((type: string) => {
    const def = NODE_TYPES.find((n) => n.type === type);
    if (!def) return;

    const newNode: FlowNode = {
      id: crypto.randomUUID().substring(0, 8),
      type: type as FlowNode["type"],
      label: def.label,
      config: {},
    };

    setFlow((prev) => {
      const nodes = [...prev.nodes, newNode];
      // Auto-connect to previous node
      const edges = [...prev.edges];
      if (prev.nodes.length > 0) {
        edges.push({ from: prev.nodes[prev.nodes.length - 1].id, to: newNode.id });
      }
      return { ...prev, nodes, edges };
    });
    setEditingNodeId(newNode.id);
  }, []);

  /* ---- Remove node ---- */
  const removeNode = useCallback((nodeId: string) => {
    setFlow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
    }));
    if (editingNodeId === nodeId) setEditingNodeId(null);
  }, [editingNodeId]);

  /* ---- Update node config ---- */
  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, string>) => {
    setFlow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, config } : n)),
    }));
  }, []);

  /* ---- Save ---- */
  const handleSave = async () => {
    if (!flow.name.trim()) {
      toast({ title: "Nome do fluxo e obrigatorio", variant: "destructive" });
      return;
    }

    if (flow.nodes.length === 0) {
      toast({ title: "Adicione pelo menos um node ao fluxo", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes,
        edges: flow.edges,
        is_active: flow.is_active,
        workspace_id: workspaceId,
        user_id: user!.id,
        generation_type: "post" as const,
        frequency: "manual" as const,
      };

      if (isNew) {
        const { error } = await supabase
          .from("automation_rules" as never)
          .insert(payload as never);
        if (error) throw error;
        toast({ title: "Fluxo criado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("automation_rules" as never)
          .update({
            name: payload.name,
            description: payload.description,
            nodes: payload.nodes,
            edges: payload.edges,
            is_active: payload.is_active,
          } as never)
          .eq("id", flowId);
        if (error) throw error;
        toast({ title: "Fluxo salvo!" });
      }

      navigate("/dashboard/whatsapp/fluxos");
    } catch (e) {
      toast({ title: "Erro ao salvar", description: String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const editingNode = editingNodeId ? flow.nodes.find((n) => n.id === editingNodeId) ?? null : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#002B5B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans'] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/whatsapp/fluxos")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div>
            <Input
              value={flow.name}
              onChange={(e) => setFlow((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome do fluxo..."
              className="text-lg font-bold text-[#002B5B] border-none shadow-none p-0 h-auto focus-visible:ring-0"
            />
            <Input
              value={flow.description}
              onChange={(e) => setFlow((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descricao (opcional)..."
              className="text-sm text-gray-500 border-none shadow-none p-0 h-auto focus-visible:ring-0 mt-0.5"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`cursor-pointer border-0 text-[11px] ${
              flow.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
            onClick={() => setFlow((f) => ({ ...f, is_active: !f.is_active }))}
          >
            {flow.is_active ? "Ativo" : "Inativo"}
          </Badge>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node palette */}
        <div className="w-[220px] shrink-0 border-r border-gray-200 p-4 space-y-2 overflow-y-auto bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Adicionar Node</p>
          {NODE_TYPES.map((nt) => {
            const Icon = nt.icon;
            return (
              <button
                key={nt.type}
                type="button"
                onClick={() => addNode(nt.type)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 bg-white hover:border-[#002B5B]/30 hover:shadow-sm transition-all flex items-start gap-2.5"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${nt.color}14` }}
                >
                  <Icon className="w-4 h-4" style={{ color: nt.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#002B5B]">{nt.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{nt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Canvas: vertical flow */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#FAFBFC]">
          {flow.nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#002B5B]/10 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-[#002B5B]/30" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Comece seu fluxo</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Adicione um gatilho na barra lateral para iniciar a automacao.
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-0">
              {flow.nodes.map((node, idx) => {
                const def = NODE_TYPES.find((n) => n.type === node.type);
                const Icon = def?.icon ?? Zap;
                const color = def?.color ?? "#999";
                const isSelected = editingNodeId === node.id;

                return (
                  <div key={node.id}>
                    {/* Connector line */}
                    {idx > 0 && (
                      <div className="flex justify-center">
                        <div className="w-0.5 h-8 bg-gray-300" />
                      </div>
                    )}

                    {/* Node card */}
                    <Card
                      className={`border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#002B5B] shadow-md ring-2 ring-[#002B5B]/10"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      onClick={() => setEditingNodeId(isSelected ? null : node.id)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${color}14` }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-[#002B5B]">{node.label}</p>
                            <div className="flex items-center gap-1">
                              <Badge className="text-[10px] border-0 bg-gray-100 text-gray-500">
                                {idx + 1}
                              </Badge>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNode(node.id);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Summary of config */}
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {node.type === "trigger" && (
                              TRIGGER_OPTIONS.find((o) => o.value === node.config.trigger_type)?.label ??
                              (node.config.keyword ? `Palavra: "${node.config.keyword}"` : "Configurar gatilho")
                            )}
                            {node.type === "send_message" && (
                              node.config.message
                                ? `"${node.config.message.substring(0, 50)}${node.config.message.length > 50 ? "..." : ""}"`
                                : "Configurar mensagem"
                            )}
                            {node.type === "delay" && (
                              node.config.seconds ? `Aguardar ${node.config.seconds}s` : "Configurar atraso"
                            )}
                            {node.type === "condition" && (
                              node.config.condition_value
                                ? `Se contem "${node.config.condition_value}"`
                                : "Configurar condicao"
                            )}
                            {node.type === "webhook" && (
                              node.config.url
                                ? `${node.config.method ?? "POST"} ${node.config.url.substring(0, 40)}...`
                                : "Configurar webhook"
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {/* Add more button */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-gray-300" />
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => addNode("send_message")}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#002B5B] hover:text-[#002B5B] transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Config panel */}
        {editingNode && (
          <NodeConfigPanel
            key={editingNode.id}
            node={editingNode}
            onUpdate={(config) => updateNodeConfig(editingNode.id, config)}
            onClose={() => setEditingNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
