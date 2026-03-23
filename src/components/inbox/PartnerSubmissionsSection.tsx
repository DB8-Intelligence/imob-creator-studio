/**
 * PartnerSubmissionsSection — Seção do Inbox para o Plano Pro
 *
 * Exibe todas as submissões recebidas via WhatsApp de corretores parceiros
 * e o estado atual de cada uma no pipeline de automação.
 */
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle, ImageIcon, Zap, Clock, CheckCircle2,
  XCircle, Instagram, RefreshCw, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserPlan } from "@/hooks/useUserPlan";

interface PartnerSubmission {
  id: string;
  sender_phone: string;
  sender_name: string | null;
  raw_description: string | null;
  images_received: string[];
  images_selected: string[];
  images_upscaled: string[];
  cover_image_url: string | null;
  cta_options: Array<{ id: string; headline: string; subtext: string; style: string }>;
  cta_selected: { headline: string; subtext: string } | null;
  status: string;
  creative_url: string | null;
  instagram_post_id: string | null;
  facebook_post_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  received:       { label: "Recebido",           color: "bg-blue-500/10 text-blue-600 border-blue-500/20",    icon: MessageCircle, description: "Imagens recebidas, aguardando processamento" },
  processing:     { label: "Processando",        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: RefreshCw,    description: "Selecionando melhores imagens e fazendo upscale" },
  cta_pending:    { label: "Aguarda CTA",        color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Zap,          description: "Opções de CTA enviadas, aguardando aprovação do corretor" },
  cover_pending:  { label: "Aguarda capa",       color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: ImageIcon,    description: "Aguardando corretor selecionar a imagem de capa" },
  generating:     { label: "Gerando criativo",   color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: RefreshCw,    description: "Criativo sendo gerado com IA" },
  preview_sent:   { label: "Preview enviado",    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",    icon: MessageCircle, description: "Preview enviado ao corretor, aguardando aprovação final" },
  publishing:     { label: "Publicando",         color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: RefreshCw,    description: "Publicando no Instagram e Facebook" },
  published:      { label: "Publicado",          color: "bg-green-500/10 text-green-600 border-green-500/20",  icon: CheckCircle2, description: "Publicado com sucesso nas redes sociais" },
  failed:         { label: "Falhou",             color: "bg-red-500/10 text-red-600 border-red-500/20",        icon: XCircle,      description: "Erro no pipeline, verificar logs" },
  cancelled:      { label: "Cancelado",          color: "bg-muted text-muted-foreground border-border",         icon: XCircle,      description: "Cancelado pelo corretor" },
};

const PIPELINE_PROGRESS: Record<string, number> = {
  received: 10, processing: 30, cta_pending: 50, cover_pending: 60,
  generating: 70, preview_sent: 80, publishing: 90, published: 100,
  failed: 0, cancelled: 0,
};

function SubmissionCard({ sub }: { sub: PartnerSubmission }) {
  const statusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.received;
  const StatusIcon = statusCfg.icon;
  const progress   = PIPELINE_PROGRESS[sub.status] ?? 0;
  const isActive   = !["published", "failed", "cancelled"].includes(sub.status);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const formatPhone = (phone: string) => {
    const p = phone.replace(/\D/g, "");
    if (p.length === 13) return `+${p.slice(0,2)} (${p.slice(2,4)}) ${p.slice(4,9)}-${p.slice(9)}`;
    return `+${p}`;
  };

  return (
    <Card className={`border-border/60 transition-all ${isActive ? "hover:border-accent/30" : "opacity-75"}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <MessageCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground text-sm">
                  {sub.sender_name ?? formatPhone(sub.sender_phone)}
                </p>
                {sub.sender_name && (
                  <p className="text-xs text-muted-foreground">{formatPhone(sub.sender_phone)}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(sub.created_at)}</p>
            </div>
          </div>
          <Badge className={`${statusCfg.color} border text-xs shrink-0 flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </Badge>
        </div>

        {/* Barra de progresso */}
        {isActive && (
          <div className="space-y-1">
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{statusCfg.description}</p>
          </div>
        )}

        {/* Descritivo */}
        {sub.raw_description && (
          <p className="text-sm text-foreground/70 line-clamp-2 bg-muted/20 rounded-lg px-3 py-2">
            {sub.raw_description}
          </p>
        )}

        {/* Contadores de imagens */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {sub.images_received.length > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {sub.images_received.length} recebidas
            </span>
          )}
          {sub.images_selected.length > 0 && (
            <span className="flex items-center gap-1 text-accent">
              <CheckCircle2 className="w-3 h-3" />
              {sub.images_selected.length} selecionadas
            </span>
          )}
          {sub.images_upscaled.length > 0 && (
            <span className="flex items-center gap-1 text-green-500">
              <Zap className="w-3 h-3" />
              {sub.images_upscaled.length} upscaled
            </span>
          )}
        </div>

        {/* CTA aprovado */}
        {sub.cta_selected && (
          <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
            <p className="text-xs text-muted-foreground mb-0.5 font-mono uppercase tracking-widest">CTA aprovado</p>
            <p className="text-sm font-semibold text-foreground">{sub.cta_selected.headline}</p>
            <p className="text-xs text-muted-foreground">{sub.cta_selected.subtext}</p>
          </div>
        )}

        {/* Ações para status publicado */}
        {sub.status === "published" && (
          <div className="flex gap-2">
            {sub.instagram_post_id && (
              <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                <a href={`https://instagram.com/p/${sub.instagram_post_id}`} target="_blank" rel="noreferrer">
                  <Instagram className="w-3.5 h-3.5 mr-1.5" />
                  Ver no Instagram
                </a>
              </Button>
            )}
            {sub.creative_url && (
              <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                <a href={sub.creative_url} target="_blank" rel="noreferrer">
                  <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                  Ver criativo
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PartnerSubmissionsSection() {
  const { currentWorkspace } = useWorkspace();
  const { data: planInfo }   = useUserPlan();

  const isPro = ["pro", "vip"].includes(planInfo?.user_plan ?? "");

  const { data: submissions = [], isLoading, refetch } = useQuery<PartnerSubmission[]>({
    queryKey: ["partner-submissions", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data } = await supabase
        .from("partner_submissions")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as PartnerSubmission[];
    },
    enabled: !!currentWorkspace?.id && isPro,
    refetchInterval: 15_000,
  });

  if (!isPro) return null;

  const active    = submissions.filter(s => !["published", "failed", "cancelled"].includes(s.status));
  const completed = submissions.filter(s => ["published", "failed", "cancelled"].includes(s.status));

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              Submissões de Parceiros
              {active.length > 0 && (
                <Badge className="bg-green-500/15 text-green-600 border-green-500/20 text-xs">
                  {active.length} ativo{active.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Imóveis recebidos via WhatsApp de corretores parceiros
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Estado vazio */}
      {submissions.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
          <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma submissão recebida ainda.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Configure o número de WhatsApp no Dashboard e compartilhe com seus parceiros.
          </p>
        </div>
      )}

      {/* Submissões ativas */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(sub => <SubmissionCard key={sub.id} sub={sub} />)}
        </div>
      )}

      {/* Submissões concluídas */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Concluídas / Arquivadas
          </p>
          {completed.slice(0, 5).map(sub => <SubmissionCard key={sub.id} sub={sub} />)}
        </div>
      )}
    </section>
  );
}
