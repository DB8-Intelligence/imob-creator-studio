/**
 * AppointmentsListView.tsx — Tabela de agendamentos com filtros
 */
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil, MessageCircle, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_CONFIG,
  APPOINTMENT_TIPO_CONFIG,
  type Appointment,
  type AppointmentStatus,
} from "@/types/appointment";

interface AppointmentsListViewProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onComplete: (appointment: Appointment) => void;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function AppointmentsListView({ appointments, onUpdateStatus, onComplete }: AppointmentsListViewProps) {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "today" | "week" | "month">("all");

  const filtered = useMemo(() => {
    let result = [...appointments];

    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);

    if (periodFilter !== "all") {
      const now = new Date();
      result = result.filter((a) => {
        const d = new Date(a.data_hora);
        if (periodFilter === "today") return d.toDateString() === now.toDateString();
        if (periodFilter === "week") {
          const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
          const weekAhead = new Date(now); weekAhead.setDate(weekAhead.getDate() + 7);
          return d >= weekAgo && d <= weekAhead;
        }
        if (periodFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      });
    }

    return result.sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
  }, [appointments, statusFilter, periodFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as typeof periodFilter)}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AppointmentStatus | "all")}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(APPOINTMENT_STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Data/Hora</TableHead>
              <TableHead className="text-xs">Lead</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Imóvel</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Tipo</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((apt) => {
              const statusCfg = APPOINTMENT_STATUS_CONFIG[apt.status];
              const tipoCfg = APPOINTMENT_TIPO_CONFIG[apt.tipo];

              return (
                <TableRow key={apt.id}>
                  <TableCell className="text-sm font-medium">{formatDateTime(apt.data_hora)}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{apt.lead_nome}</p>
                    {apt.lead_telefone && <p className="text-[11px] text-muted-foreground">{apt.lead_telefone}</p>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[180px]">
                    {apt.property_nome ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs">{tipoCfg.emoji} {tipoCfg.label}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", statusCfg.bgColor)}>
                      {statusCfg.emoji} {statusCfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {apt.status === "agendado" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-500" title="Confirmar" onClick={() => onUpdateStatus(apt.id, "confirmado")}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {apt.status === "em_andamento" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-500" title="Concluir" onClick={() => onComplete(apt)}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {apt.lead_telefone && (
                        <Button
                          size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-500" title="WhatsApp"
                          onClick={() => window.open(`https://wa.me/55${apt.lead_telefone!.replace(/\D/g, "")}`, "_blank")}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} agendamento{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
