/**
 * WhatsAppConfigCard — Plano Pro
 *
 * Permite ao corretor Pro cadastrar o número de WhatsApp que
 * receberá imagens e descritivos de imóveis de corretores parceiros.
 * O sistema automaticamente seleciona as 10 melhores imagens,
 * faz upscale, analisa o CTA e publica no Instagram/Facebook.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageCircle, Zap, CheckCircle2, AlertCircle,
  Copy, ExternalLink, RefreshCw, Settings2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserPlan } from "@/hooks/useUserPlan";

interface WhatsAppConfig {
  id: string;
  phone_number: string;
  display_name: string | null;
  evolution_instance: string | null;
  is_active: boolean;
}

interface SubmissionStats {
  total: number;
  received: number;
  processing: number;
  published: number;
  failed: number;
}

const PIPELINE_STEPS = [
  { icon: "📸", label: "Recebe imagens via WhatsApp" },
  { icon: "⭐", label: "Seleciona as 10 melhores" },
  { icon: "🔍", label: "Upscale com IA" },
  { icon: "✍️", label: "Analisa descritivo e gera CTAs" },
  { icon: "✅", label: "Corretor aprova pelo WhatsApp" },
  { icon: "🎨", label: "Gera criativo final" },
  { icon: "📱", label: "Publica no Instagram e Facebook" },
];

export default function WhatsAppConfigCard() {
  const { currentWorkspace } = useWorkspace();
  const { data: planInfo } = useUserPlan();
  const queryClient = useQueryClient();

  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput]   = useState("");
  const [editing, setEditing]       = useState(false);
  const [copied, setCopied]         = useState(false);

  const isPro = ["pro", "vip"].includes(planInfo?.user_plan ?? "");

  // Buscar configuração existente
  const { data: config, isLoading } = useQuery<WhatsAppConfig | null>({
    queryKey: ["whatsapp-config", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;
      const { data } = await supabase
        .from("whatsapp_configs")
        .select("id, phone_number, display_name, evolution_instance, is_active")
        .eq("workspace_id", currentWorkspace.id)
        .single();
      return data ?? null;
    },
    enabled: !!currentWorkspace?.id && isPro,
  });

  // Buscar estatísticas
  const { data: stats } = useQuery<SubmissionStats>({
    queryKey: ["partner-stats", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return { total: 0, received: 0, processing: 0, published: 0, failed: 0 };
      const { data } = await supabase
        .rpc("get_partner_submission_stats", { p_workspace_id: currentWorkspace.id });
      return data ?? { total: 0, received: 0, processing: 0, published: 0, failed: 0 };
    },
    enabled: !!currentWorkspace?.id && isPro,
    refetchInterval: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const phone = phoneInput.replace(/\D/g, "");
      if (!phone || phone.length < 10) throw new Error("Número inválido");

      if (config?.id) {
        await supabase
          .from("whatsapp_configs")
          .update({ phone_number: phone, display_name: nameInput || null })
          .eq("id", config.id);
      } else {
        await supabase
          .from("whatsapp_configs")
          .insert({
            workspace_id: currentWorkspace!.id,
            phone_number: phone,
            display_name: nameInput || null,
            is_active: true,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-config"] });
      setEditing(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!config?.id) return;
      await supabase
        .from("whatsapp_configs")
        .update({ is_active: !config.is_active })
        .eq("id", config.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-config"] }),
  });

  const webhookUrl = `https://[seu-projeto].supabase.co/functions/v1/whatsapp-receiver`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Plano não-Pro: mostrar upsell
  if (!isPro) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-card to-muted/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground">Pipeline WhatsApp → Instagram</p>
                <Badge variant="outline" className="text-xs">Plano Pro</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Receba imóveis de parceiros pelo WhatsApp. O sistema seleciona, faz upscale, cria e publica automaticamente.
              </p>
              <Button size="sm" className="mt-3" onClick={() => window.location.href = "/plano"}>
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Upgrade para Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Pipeline WhatsApp → Instagram</p>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Pro</Badge>
                {config?.is_active && (
                  <Badge className="bg-green-500/15 text-green-600 border-green-500/20 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Ativo
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Corretores parceiros enviam imóveis via WhatsApp → publicação automática
              </p>
            </div>
          </div>
          {config && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
              <Settings2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Estatísticas (quando configurado) */}
        {config && stats && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total (30d)", value: stats.total, color: "text-foreground" },
              { label: "Em andamento", value: stats.processing + stats.received, color: "text-yellow-500" },
              { label: "Publicados", value: stats.published, color: "text-green-500" },
              { label: "Com erro", value: stats.failed, color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Número configurado */}
        {config && !editing ? (
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Número cadastrado</p>
                <p className="text-lg font-semibold text-foreground mt-1">+{config.phone_number}</p>
                {config.display_name && (
                  <p className="text-sm text-muted-foreground">{config.display_name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleMutation.mutate()}
                  disabled={toggleMutation.isPending}
                >
                  {config.is_active ? "Pausar" : "Ativar"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Editar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Formulário de configuração */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Número do WhatsApp (com DDI)
              </Label>
              <Input
                placeholder="Ex: 5511999998888"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                defaultValue={config?.phone_number}
              />
              <p className="text-xs text-muted-foreground">
                Este é o número que os corretores parceiros irão enviar as imagens.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Nome de exibição (opcional)
              </Label>
              <Input
                placeholder="Ex: Imóveis Premium SP"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                defaultValue={config?.display_name ?? ""}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Salvar número</>
                )}
              </Button>
              {editing && (
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              )}
            </div>
            {saveMutation.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {(saveMutation.error as Error).message}
              </div>
            )}
          </div>
        )}

        {/* Webhook URL para configurar na Evolution API */}
        {config && (
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
              Webhook — Evolution API
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-foreground/70 flex-1 truncate font-mono bg-muted/30 rounded px-2 py-1">
                {webhookUrl}
              </code>
              <Button variant="ghost" size="sm" onClick={copyWebhook} className="shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure este URL no painel da Evolution API para o evento MESSAGES_UPSERT.
            </p>
          </div>
        )}

        {/* Pipeline visual */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Como funciona</p>
          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-1 rounded-full bg-muted/40 border border-border/40 px-2.5 py-1">
                <span className="text-xs">{step.icon}</span>
                <span className="text-xs text-muted-foreground">{step.label}</span>
                {i < PIPELINE_STEPS.length - 1 && (
                  <span className="text-xs text-muted-foreground/40 ml-1">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
