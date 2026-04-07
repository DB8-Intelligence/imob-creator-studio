/**
 * LeadsHistoricoPage.tsx — Timeline completa de um lead específico
 *
 * Layout 2 colunas:
 * - Esquerda (30%): Ficha resumo + ações rápidas
 * - Direita (70%): Timeline de eventos em ordem cronológica reversa
 *
 * Botão flutuante: "+ Registrar Interação"
 *
 * Aceita ?id= query param OU /leads/:id route param.
 * Se nenhum ID, exibe seletor de lead.
 */
import { useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MessageCircle,
  CalendarPlus,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Building2,
  DollarSign,
  MapPin,
  Clock,
  User,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeads, useDeleteLead } from "@/hooks/useLeads";
import { useLeadActivities, useCreateLeadActivity, useLeadActivitiesRealtime } from "@/hooks/useLeadActivities";
import { useToast } from "@/hooks/use-toast";
import { LeadTimelineItem } from "@/components/leads/LeadTimelineItem";
import { LeadFormSheet } from "@/components/leads/LeadFormSheet";
import { AddInteractionDialog } from "@/components/leads/AddInteractionDialog";
import {
  PIPELINE_COLUMNS,
  TEMPERATURA_CONFIG,
  FONTE_CONFIG,
  INTERESSE_LABEL,
  type Lead,
} from "@/types/lead";

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function LeadsHistoricoPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const leadId = routeId ?? searchParams.get("id");

  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: activities, isLoading: activitiesLoading } = useLeadActivities(leadId, leads?.find((l) => l.id === leadId)?.created_at);
  const createActivityMutation = useCreateLeadActivity(leadId);
  const deleteLeadMutation = useDeleteLead();

  // Realtime subscription for incoming WhatsApp messages
  useLeadActivitiesRealtime(leadId);

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(leadId ?? "");

  const lead = useMemo(() => leads?.find((l) => l.id === leadId) ?? null, [leads, leadId]);

  // ── No lead selected → show selector ────────────────────────────────────
  if (!leadId || (!lead && !leadsLoading)) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Histórico do Lead</h1>
            <p className="text-sm text-muted-foreground mt-1">Selecione um lead para ver a timeline de interações.</p>
          </div>
          {leads && leads.length > 0 ? (
            <div className="space-y-3">
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha um lead..." />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.nome} — {INTERESSE_LABEL[l.interesse_tipo]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!selectedLeadId}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate(`/leads/${selectedLeadId}`)}
              >
                Ver histórico
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/leads")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Pipeline
            </Button>
          )}
        </div>
      </AppLayout>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (leadsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Lead não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/leads")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusCol = PIPELINE_COLUMNS.find((c) => c.id === lead.status);
  const temp = TEMPERATURA_CONFIG[lead.temperatura];
  const fonte = FONTE_CONFIG[lead.fonte];
  const whatsappUrl = lead.telefone
    ? `https://wa.me/55${lead.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.nome}, tudo bem?`)}`
    : null;

  const handleDeleteConfirm = async () => {
    await deleteLeadMutation.mutateAsync(lead.id);
    navigate("/leads");
  };

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Breadcrumb + Back */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/leads" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Leads
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{lead.nome}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center text-lg font-bold text-accent">
            {getInitials(lead.nome)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{lead.nome}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", statusCol?.bgColor)}>
                {statusCol?.emoji} {statusCol?.label}
              </Badge>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", temp.color)}>
                {temp.emoji} {temp.label}
              </span>
              <Badge variant="secondary" className={cn("text-[10px]", fonte.color)}>
                {fonte.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">

          {/* ── Left column: Ficha resumo ─────────────────────────────── */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dados cadastrais</h3>

                {lead.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{lead.telefone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">{lead.email}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Interesse</p>
                    <p className="text-sm font-medium text-foreground">{INTERESSE_LABEL[lead.interesse_tipo]}</p>
                  </div>
                </div>

                {lead.imovel_interesse_nome && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Imóvel</p>
                      <p className="text-sm font-medium text-foreground">{lead.imovel_interesse_nome}</p>
                    </div>
                  </div>
                )}

                {lead.valor_estimado && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Valor estimado</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(lead.valor_estimado)}</p>
                    </div>
                  </div>
                )}

                {lead.corretor_responsavel && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Corretor</p>
                      <p className="text-sm text-foreground">{lead.corretor_responsavel}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Cadastrado em</p>
                    <p className="text-sm text-foreground">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Ações rápidas</h3>

                {whatsappUrl && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-green-600 border-green-500/20 hover:bg-green-500/10"
                    onClick={() => window.open(whatsappUrl, "_blank")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/atendimentos/novo", { state: { leadId: lead.id, leadNome: lead.nome } })}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Agendar Visita
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setEditSheetOpen(true)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar Dados
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Lead
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── Right column: Timeline ────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
              <span className="text-xs text-muted-foreground">
                {activities?.length ?? 0} evento{(activities?.length ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>

            {activitiesLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            )}

            {!activitiesLoading && activities && activities.length > 0 && (
              <div className="pl-1">
                {activities.map((activity, idx) => (
                  <LeadTimelineItem
                    key={activity.id}
                    activity={activity}
                    isLast={idx === activities.length - 1}
                  />
                ))}
              </div>
            )}

            {!activitiesLoading && (!activities || activities.length === 0) && (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-foreground">Nenhuma interação registrada</p>
                <p className="text-sm text-muted-foreground mt-1">Clique no botão abaixo para registrar a primeira interação.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setInteractionDialogOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 bg-accent text-accent-foreground rounded-full px-5 py-3 shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 font-medium text-sm z-40"
      >
        <Plus className="w-5 h-5" />
        Registrar Interação
      </button>

      {/* Edit sheet */}
      <LeadFormSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        lead={lead}
        onSubmit={() => setEditSheetOpen(false)}
      />

      {/* Add interaction dialog */}
      <AddInteractionDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
        leadNome={lead.nome}
        onSubmit={(data) => {
          createActivityMutation.mutate(data, {
            onSuccess: () => {
              setInteractionDialogOpen(false);
              toast({ title: "Interação registrada" });
            },
          });
        }}
        isSubmitting={createActivityMutation.isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {lead.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              O lead e todo o histórico de interações serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
