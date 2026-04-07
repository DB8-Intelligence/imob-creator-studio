/**
 * AppointmentsCalendarView.tsx — Calendário mensal de agendamentos
 *
 * Grid mensal com dots coloridos por status.
 * Click em dia → mostra lista do dia.
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_CONFIG,
  APPOINTMENT_TIPO_CONFIG,
  STATUS_CALENDAR_COLOR,
  type Appointment,
} from "@/types/appointment";

interface AppointmentsCalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function AppointmentsCalendarView({ appointments, onSelectAppointment }: AppointmentsCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  // Appointments grouped by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const d = new Date(apt.data_hora);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [appointments]);

  const getAptsForDate = (d: Date) => {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return appointmentsByDate.get(key) ?? [];
  };

  const today = new Date();
  const selectedDayApts = selectedDate ? getAptsForDate(selectedDate) : [];

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Calendar grid */}
      <div>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <h3 className="text-base font-semibold text-foreground">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2">{w}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="bg-card p-2 min-h-[80px]" />;

            const dayApts = getAptsForDate(day);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "bg-card p-2 min-h-[80px] text-left transition-colors hover:bg-muted/50",
                  isSelected && "bg-accent/5 ring-1 ring-accent ring-inset",
                )}
              >
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                  isToday ? "bg-accent text-accent-foreground" : "text-foreground",
                )}>
                  {day.getDate()}
                </span>
                {/* Dots */}
                {dayApts.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {dayApts.slice(0, 4).map((apt) => (
                      <div key={apt.id} className={cn("w-1.5 h-1.5 rounded-full", STATUS_CALENDAR_COLOR[apt.status])} />
                    ))}
                    {dayApts.length > 4 && <span className="text-[8px] text-muted-foreground ml-0.5">+{dayApts.length - 4}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          {selectedDate
            ? selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
            : "Selecione um dia"}
        </h3>

        {selectedDayApts.length === 0 && (
          <p className="text-xs text-muted-foreground py-4">Nenhum agendamento neste dia.</p>
        )}

        {selectedDayApts
          .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
          .map((apt) => {
            const statusCfg = APPOINTMENT_STATUS_CONFIG[apt.status];
            const tipoCfg = APPOINTMENT_TIPO_CONFIG[apt.tipo];

            return (
              <button
                key={apt.id}
                type="button"
                onClick={() => onSelectAppointment(apt)}
                className="w-full text-left rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground">{formatTime(apt.data_hora)}</span>
                  <Badge variant="outline" className={cn("text-[10px]", statusCfg.bgColor)}>
                    {statusCfg.emoji} {statusCfg.label}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground">{apt.lead_nome}</p>
                {apt.property_nome && <p className="text-xs text-muted-foreground truncate">{apt.property_nome}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{tipoCfg.emoji} {tipoCfg.label} &middot; {apt.duracao}</p>
              </button>
            );
          })}
      </div>
    </div>
  );
}
