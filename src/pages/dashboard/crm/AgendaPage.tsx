/**
 * AgendaPage.tsx — Calendar view of appointments grouped by date
 * Route: /dashboard/crm/agenda
 */
import { useState, useMemo } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Plus,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import AgendamentoModal from "./AgendamentoModal";
import type { Appointment } from "@/types/appointment";
import {
  APPOINTMENT_STATUS_CONFIG,
  APPOINTMENT_TIPO_CONFIG,
  DURACAO_LABEL,
} from "@/types/appointment";

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(appointments: Appointment[]): Record<string, Appointment[]> {
  const groups: Record<string, Appointment[]> = {};
  for (const apt of appointments) {
    const dateKey = new Date(apt.data_hora).toISOString().split("T")[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(apt);
  }
  // Sort dates ascending
  const sorted: Record<string, Appointment[]> = {};
  for (const key of Object.keys(groups).sort()) {
    sorted[key] = groups[key].sort(
      (a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
    );
  }
  return sorted;
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid TZ issues
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(d, today)) return "Hoje";
  if (isSameDay(d, tomorrow)) return "Amanha";

  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

// ── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({ apt }: { apt: Appointment }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = APPOINTMENT_STATUS_CONFIG[apt.status];
  const tipoCfg = APPOINTMENT_TIPO_CONFIG[apt.tipo];

  const time = new Date(apt.data_hora).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Time pill */}
        <div className="flex flex-col items-center justify-center bg-[#002B5B]/5 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-sm font-bold text-[#002B5B]">{time}</span>
          <span className="text-[10px] text-gray-400">{DURACAO_LABEL[apt.duracao]}</span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#002B5B] truncate">{apt.lead_nome}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge
              variant="outline"
              className={`text-[10px] ${statusCfg.bgColor} border`}
            >
              {statusCfg.emoji} {statusCfg.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {tipoCfg.emoji} {tipoCfg.label}
            </Badge>
          </div>
        </div>

        {/* Expand icon */}
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2 text-sm">
          {apt.property_nome && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{apt.property_nome}</span>
            </div>
          )}
          {apt.property_endereco && (
            <p className="text-gray-400 text-xs pl-5">{apt.property_endereco}</p>
          )}
          {apt.lead_telefone && (
            <p className="text-gray-500 text-xs">Tel: {apt.lead_telefone}</p>
          )}
          {apt.corretor_responsavel && (
            <p className="text-gray-500 text-xs">
              Corretor: {apt.corretor_responsavel}
            </p>
          )}
          {apt.notas && (
            <p className="text-gray-500 text-xs bg-gray-50 rounded-lg p-2">{apt.notas}</p>
          )}
          {apt.resultado && (
            <p className="text-xs text-gray-500">
              Resultado: <span className="font-medium">{apt.resultado}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const { data: appointments = [], isLoading } = useAppointments();
  const [modalOpen, setModalOpen] = useState(false);

  const grouped = useMemo(() => groupByDate(appointments), [appointments]);
  const dateKeys = Object.keys(grouped);

  return (
    <AppLayout>
      <div className="space-y-6 font-['Plus_Jakarta_Sans'] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#002B5B]">Agenda</h1>
            <p className="text-sm text-gray-500">
              {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Visita
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#002B5B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dateKeys.length === 0 ? (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#002B5B]/5 flex items-center justify-center mb-4">
                <CalendarDays className="w-8 h-8 text-[#002B5B]/40" />
              </div>
              <h3 className="text-lg font-semibold text-[#002B5B] mb-1">
                Nenhum agendamento
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Agende sua primeira visita para comecar.
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agendar visita
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {dateKeys.map((dateKey) => (
              <div key={dateKey}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <CalendarDays className="w-4 h-4 text-[#FFD700]" />
                  <h2 className="text-sm font-bold text-[#002B5B] uppercase tracking-wide">
                    {formatDateHeader(dateKey)}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {grouped[dateKey].length}
                  </Badge>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Appointment cards */}
                <div className="space-y-3">
                  {grouped[dateKey].map((apt) => (
                    <AppointmentCard key={apt.id} apt={apt} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AgendamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => setModalOpen(false)}
      />
    </AppLayout>
  );
}
