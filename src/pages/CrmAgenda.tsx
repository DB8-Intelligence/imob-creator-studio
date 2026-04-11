/**
 * CrmAgenda.tsx — Calendar/agenda page for appointments
 * Route: /crm/agenda
 * Weekly + monthly views, side panel with upcoming events, event creation/editing
 */
import React, { useState, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppointments, useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { useLeads } from "@/hooks/useLeads";
import type { Appointment, AppointmentTipo, AppointmentDuracao } from "@/types/appointment";
import { APPOINTMENT_STATUS_CONFIG, APPOINTMENT_TIPO_CONFIG, DURACAO_LABEL } from "@/types/appointment";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const EVENT_COLORS: Record<string, string> = {
  visita_presencial: "bg-blue-800 text-white",
  visita_virtual: "bg-yellow-500 text-yellow-900",
  reuniao_apresentacao: "bg-emerald-600 text-white",
};

const REMINDER_OPTIONS = [
  { value: "none", label: "Sem lembrete" },
  { value: "15min", label: "15 minutos antes" },
  { value: "30min", label: "30 minutos antes" },
  { value: "1h", label: "1 hora antes" },
  { value: "1d", label: "1 dia antes" },
];

// ─── Event modal ─────────────────────────────────────────────────────────────

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  defaultDate?: Date;
}

const EventModal: React.FC<EventModalProps> = ({ open, onOpenChange, appointment, defaultDate }) => {
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const { data: leads = [] } = useLeads();

  const isEdit = Boolean(appointment);

  const [title, setTitle] = useState("");
  const [tipo, setTipo] = useState<AppointmentTipo>("visita_presencial");
  const [dateStart, setDateStart] = useState("");
  const [timeStart, setTimeStart] = useState("10:00");
  const [timeEnd, setTimeEnd] = useState("11:00");
  const [duracao, setDuracao] = useState<AppointmentDuracao>("1h");
  const [leadId, setLeadId] = useState("");
  const [description, setDescription] = useState("");
  const [reminder, setReminder] = useState("30min");
  const [leadSearch, setLeadSearch] = useState("");

  React.useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.data_hora);
      setTitle(appointment.lead_nome || "");
      setTipo(appointment.tipo);
      setDateStart(dt.toISOString().split("T")[0]);
      setTimeStart(dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      setDuracao(appointment.duracao);
      setLeadId(appointment.lead_id);
      setDescription(appointment.notas ?? "");
    } else {
      const d = defaultDate ?? new Date();
      setTitle("");
      setTipo("visita_presencial");
      setDateStart(d.toISOString().split("T")[0]);
      setTimeStart("10:00");
      setTimeEnd("11:00");
      setDuracao("1h");
      setLeadId("");
      setDescription("");
      setReminder("30min");
      setLeadSearch("");
    }
  }, [appointment, defaultDate, open]);

  const filteredLeads = leads.filter((l) =>
    leadSearch ? l.nome.toLowerCase().includes(leadSearch.toLowerCase()) : true
  ).slice(0, 10);

  const handleSave = () => {
    const dateTime = `${dateStart}T${timeStart}:00`;
    const selectedLead = leads.find((l) => l.id === leadId);

    if (isEdit && appointment) {
      updateAppointment.mutate({
        id: appointment.id,
        data_hora: dateTime,
        tipo,
        duracao,
        notas: description,
      });
    } else {
      createAppointment.mutate({
        lead_id: leadId || "00000000-0000-0000-0000-000000000000",
        lead_nome: selectedLead?.nome ?? (title || "Evento"),
        lead_telefone: selectedLead?.telefone,
        data_hora: dateTime,
        duracao,
        tipo,
        notas: description,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label>Titulo</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo do evento" />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as AppointmentTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(APPOINTMENT_TIPO_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Horario</Label>
              <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Duracao</Label>
            <Select value={duracao} onValueChange={(v) => setDuracao(v as AppointmentDuracao)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DURACAO_LABEL).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Lead</Label>
            <Input
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              placeholder="Buscar lead pelo nome..."
            />
            {leadSearch && filteredLeads.length > 0 && (
              <div className="border rounded-md max-h-32 overflow-auto">
                {filteredLeads.map((l) => (
                  <button
                    key={l.id}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted ${leadId === l.id ? "bg-primary/10" : ""}`}
                    onClick={() => { setLeadId(l.id); setLeadSearch(l.nome); setTitle(l.nome); }}
                  >
                    {l.nome} {l.telefone && <span className="text-muted-foreground">- {l.telefone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Descricao</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Lembrete</Label>
            <Select value={reminder} onValueChange={setReminder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const CrmAgenda: React.FC = () => {
  const { data: appointments = [], isLoading } = useAppointments();
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Weekly view dates
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Monthly view dates
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const monthWeekStart = startOfWeek(monthStart);
  const monthDays: Date[] = [];
  let d = new Date(monthWeekStart);
  while (d <= monthEnd || monthDays.length % 7 !== 0) {
    monthDays.push(new Date(d));
    d = addDays(d, 1);
    if (monthDays.length > 42) break;
  }

  const getAppointmentsForDay = (date: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.data_hora), date));

  // Side panel: today + next 7 days
  const upcomingAppointments = useMemo(() => {
    const next7 = addDays(today, 7);
    return appointments
      .filter((a) => {
        const dt = new Date(a.data_hora);
        return dt >= today && dt <= next7;
      })
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
  }, [appointments, today]);

  const todayAppointments = appointments.filter((a) => isSameDay(new Date(a.data_hora), today));

  const navigate = (dir: number) => {
    if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, dir * 7));
    } else {
      const nd = new Date(currentDate);
      nd.setMonth(nd.getMonth() + dir);
      setCurrentDate(nd);
    }
  };

  const openNewEvent = (date?: Date) => {
    setSelectedAppointment(null);
    setSelectedDate(date);
    setEventModalOpen(true);
  };

  const openEditEvent = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setEventModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 md:p-6 min-h-[calc(100vh-80px)]">
      {/* Main calendar area (70%) */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agenda</h1>
            <p className="text-sm text-muted-foreground">
              {viewMode === "week"
                ? `${weekDays[0].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} - ${weekDays[6].toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`
                : currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex border rounded-md ml-2">
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Mes
              </Button>
            </div>
            <Button onClick={() => openNewEvent()} className="ml-2">
              <Plus className="h-4 w-4 mr-1" /> Novo evento
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : viewMode === "week" ? (
          /* ─── Weekly view ─── */
          <div className="grid grid-cols-7 gap-1 flex-1">
            {weekDays.map((day) => {
              const dayApts = getAppointmentsForDay(day);
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={`border rounded-lg flex flex-col min-h-[200px] ${isToday ? "border-primary bg-primary/5" : ""}`}
                >
                  <div className={`text-center py-2 border-b text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    <div>{day.toLocaleDateString("pt-BR", { weekday: "short" })}</div>
                    <div className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  <div
                    className="flex-1 p-1 space-y-1 cursor-pointer"
                    onClick={() => openNewEvent(day)}
                  >
                    {dayApts.map((apt) => (
                      <div
                        key={apt.id}
                        className={`rounded px-1.5 py-1 text-[10px] leading-tight cursor-pointer truncate ${EVENT_COLORS[apt.tipo] || "bg-gray-200"}`}
                        onClick={(e) => { e.stopPropagation(); openEditEvent(apt); }}
                      >
                        <div className="font-medium truncate">{formatTime(apt.data_hora)}</div>
                        <div className="truncate">{apt.lead_nome}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Monthly view ─── */
          <div className="border rounded-lg overflow-hidden flex-1">
            <div className="grid grid-cols-7 bg-muted/50">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const dayApts = getAppointmentsForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[80px] border-t border-r p-1 cursor-pointer hover:bg-muted/30 ${
                      !isCurrentMonth ? "opacity-40" : ""
                    } ${isToday ? "bg-primary/5" : ""}`}
                    onClick={() => openNewEvent(day)}
                  >
                    <div className={`text-xs font-medium mb-0.5 ${isToday ? "text-primary" : ""}`}>
                      {day.getDate()}
                    </div>
                    {dayApts.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className={`rounded px-1 py-0.5 text-[9px] leading-tight truncate mb-0.5 cursor-pointer ${EVENT_COLORS[apt.tipo] || "bg-gray-200"}`}
                        onClick={(e) => { e.stopPropagation(); openEditEvent(apt); }}
                      >
                        {formatTime(apt.data_hora)} {apt.lead_nome}
                      </div>
                    ))}
                    {dayApts.length > 3 && (
                      <div className="text-[9px] text-muted-foreground">+{dayApts.length - 3} mais</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Side panel (30%) */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
        {/* Today */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {todayAppointments.length > 0 ? (
              <div className="space-y-2">
                {todayAppointments.map((apt) => {
                  const statusCfg = APPOINTMENT_STATUS_CONFIG[apt.status];
                  return (
                    <div
                      key={apt.id}
                      className="border rounded-lg p-2.5 cursor-pointer hover:bg-muted/30"
                      onClick={() => openEditEvent(apt)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{apt.lead_nome}</span>
                        <Badge className={`text-[9px] ${statusCfg.bgColor}`}>{statusCfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(apt.data_hora)}
                        <span className="text-[10px]">{APPOINTMENT_TIPO_CONFIG[apt.tipo]?.emoji}</span>
                        {APPOINTMENT_TIPO_CONFIG[apt.tipo]?.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum evento hoje</p>
            )}
          </CardContent>
        </Card>

        {/* Next 7 days */}
        <Card className="flex-1">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Proximos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <ScrollArea className="max-h-[400px]">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border rounded-lg p-2.5 cursor-pointer hover:bg-muted/30"
                      onClick={() => openEditEvent(apt)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{apt.lead_nome}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(apt.data_hora).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(apt.data_hora)}
                        <User className="h-3 w-3 ml-1" />
                        {apt.lead_nome}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum evento nos proximos 7 dias</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Event Modal */}
      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        appointment={selectedAppointment}
        defaultDate={selectedDate}
      />
    </div>
  );
};

export default CrmAgenda;
