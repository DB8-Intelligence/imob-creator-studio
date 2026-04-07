/**
 * AppointmentsTodayView.tsx — Dashboard diário de atendimentos
 *
 * Cards dos agendamentos de hoje, ordenados por horário.
 * Contador no topo. Status em tempo real.
 */
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { AppointmentCard } from "./AppointmentCard";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

interface AppointmentsTodayViewProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onComplete: (appointment: Appointment) => void;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function AppointmentsTodayView({ appointments, onUpdateStatus, onComplete }: AppointmentsTodayViewProps) {
  const todayAppointments = useMemo(
    () => appointments
      .filter((a) => isToday(a.data_hora))
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()),
    [appointments]
  );

  const confirmed = todayAppointments.filter((a) => a.status === "confirmado").length;
  const pending = todayAppointments.filter((a) => a.status === "agendado").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-accent" />
          <span className="text-lg font-bold text-foreground">{todayAppointments.length}</span>
          <span className="text-sm text-muted-foreground">visita{todayAppointments.length !== 1 ? "s" : ""} hoje</span>
        </div>
        {confirmed > 0 && <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500">✅ {confirmed} confirmada{confirmed !== 1 ? "s" : ""}</Badge>}
        {pending > 0 && <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-500">📅 {pending} pendente{pending !== 1 ? "s" : ""}</Badge>}
      </div>

      {/* Cards */}
      {todayAppointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground">Nenhuma visita hoje</p>
          <p className="text-sm text-muted-foreground mt-1">Crie um agendamento ou confira outros dias.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onUpdateStatus={onUpdateStatus}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
