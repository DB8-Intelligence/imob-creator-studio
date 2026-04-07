/**
 * AtendimentosCalendarioPage.tsx — Página principal de Atendimentos / Agendamentos
 *
 * Header: "Atendimentos" + botão "Novo Agendamento" + filtros
 * Abas: Hoje | Calendário | Lista
 */
import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, Plus, Loader2, Sun, Calendar, List } from "lucide-react";
import { useAppointments, useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { useLeads } from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";
import { AppointmentsTodayView } from "@/components/appointments/AppointmentsTodayView";
import { AppointmentsCalendarView } from "@/components/appointments/AppointmentsCalendarView";
import { AppointmentsListView } from "@/components/appointments/AppointmentsListView";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";
import { PostVisitDialog } from "@/components/appointments/PostVisitDialog";
import type { Appointment, AppointmentStatus, CreateAppointmentInput } from "@/types/appointment";

export default function AtendimentosCalendarioPage() {
  const location = useLocation();
  const prefill = (location.state ?? {}) as { leadId?: string; leadNome?: string };
  const { toast } = useToast();

  const { data: appointments, isLoading } = useAppointments();
  const { data: leads } = useLeads();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();

  const [newDialogOpen, setNewDialogOpen] = useState(Boolean(prefill.leadId));
  const [postVisitDialogOpen, setPostVisitDialogOpen] = useState(false);
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null);

  // Stats
  const todayCount = (appointments ?? []).filter((a) => {
    const d = new Date(a.data_hora);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const handleUpdateStatus = useCallback((id: string, status: AppointmentStatus) => {
    updateMutation.mutate({ id, status }, {
      onSuccess: () => {
        const labels: Record<string, string> = { confirmado: "Confirmado", em_andamento: "Em andamento", nao_compareceu: "Não compareceu", cancelado: "Cancelado" };
        toast({ title: labels[status] ?? "Atualizado" });
      },
    });
  }, [updateMutation, toast]);

  const handleComplete = useCallback((apt: Appointment) => {
    setCompletingAppointment(apt);
    setPostVisitDialogOpen(true);
  }, []);

  const handlePostVisitSubmit = useCallback((data: { resultado: any; proximo_passo: any; observacoes: string }) => {
    if (!completingAppointment) return;
    updateMutation.mutate(
      { id: completingAppointment.id, status: "concluido" as AppointmentStatus, ...data, observacoes_pos_visita: data.observacoes },
      {
        onSuccess: () => {
          setPostVisitDialogOpen(false);
          setCompletingAppointment(null);
          toast({ title: "Visita concluída e registrada" });
        },
      }
    );
  }, [completingAppointment, updateMutation, toast]);

  const handleCreate = useCallback((data: CreateAppointmentInput) => {
    createMutation.mutate(data, {
      onSuccess: () => setNewDialogOpen(false),
    });
  }, [createMutation]);

  const handleCalendarSelect = useCallback((_apt: Appointment) => {
    // Could open a detail dialog — for now just a toast
    toast({ title: `${_apt.lead_nome}`, description: `${_apt.property_nome ?? "Sem imóvel"} — ${new Date(_apt.data_hora).toLocaleString("pt-BR")}` });
  }, [toast]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Atendimentos</h1>
              <p className="text-sm text-muted-foreground">
                {todayCount} visita{todayCount !== 1 ? "s" : ""} hoje &middot; {(appointments ?? []).length} total
              </p>
            </div>
          </div>

          <Button onClick={() => setNewDialogOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Tabs */}
        {!isLoading && (
          <Tabs defaultValue="hoje">
            <TabsList>
              <TabsTrigger value="hoje" className="gap-1.5">
                <Sun className="w-4 h-4" />
                Hoje
              </TabsTrigger>
              <TabsTrigger value="calendario" className="gap-1.5">
                <Calendar className="w-4 h-4" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="lista" className="gap-1.5">
                <List className="w-4 h-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hoje" className="mt-4">
              <AppointmentsTodayView
                appointments={appointments ?? []}
                onUpdateStatus={handleUpdateStatus}
                onComplete={handleComplete}
              />
            </TabsContent>

            <TabsContent value="calendario" className="mt-4">
              <AppointmentsCalendarView
                appointments={appointments ?? []}
                onSelectAppointment={handleCalendarSelect}
              />
            </TabsContent>

            <TabsContent value="lista" className="mt-4">
              <AppointmentsListView
                appointments={appointments ?? []}
                onUpdateStatus={handleUpdateStatus}
                onComplete={handleComplete}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        leads={leads ?? []}
        prefillLeadId={prefill.leadId}
        prefillLeadNome={prefill.leadNome}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Post-Visit Dialog */}
      <PostVisitDialog
        open={postVisitDialogOpen}
        onOpenChange={setPostVisitDialogOpen}
        appointment={completingAppointment}
        onSubmit={handlePostVisitSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </AppLayout>
  );
}
