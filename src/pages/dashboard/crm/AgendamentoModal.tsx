/**
 * AgendamentoModal.tsx — Modal for creating new appointments
 * Reusable component, used by AgendaPage and potentially DashboardCRMPage.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAppointment } from "@/hooks/useAppointments";
import type {
  AppointmentTipo,
  AppointmentDuracao,
  CreateAppointmentInput,
} from "@/types/appointment";

interface AgendamentoModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  /** Pre-fill with lead data */
  defaultLeadNome?: string;
  defaultLeadId?: string;
}

const INITIAL_FORM = {
  lead_nome: "",
  lead_id: "",
  property_nome: "",
  data_hora: "",
  duracao: "1h" as AppointmentDuracao,
  tipo: "visita_presencial" as AppointmentTipo,
  notas: "",
  enviar_confirmacao: true,
};

export default function AgendamentoModal({
  open,
  onClose,
  onCreated,
  defaultLeadNome,
  defaultLeadId,
}: AgendamentoModalProps) {
  const createAppointment = useCreateAppointment();

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    lead_nome: defaultLeadNome ?? "",
    lead_id: defaultLeadId ?? "",
  });

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.lead_nome.trim() || !form.data_hora) return;

    const input: CreateAppointmentInput = {
      lead_id: form.lead_id || crypto.randomUUID(), // fallback if no lead_id
      lead_nome: form.lead_nome,
      property_nome: form.property_nome || null,
      data_hora: new Date(form.data_hora).toISOString(),
      duracao: form.duracao,
      tipo: form.tipo,
      notas: form.notas || undefined,
      enviar_confirmacao: form.enviar_confirmacao,
    };

    createAppointment.mutate(input, {
      onSuccess: () => {
        setForm({
          ...INITIAL_FORM,
          lead_nome: defaultLeadNome ?? "",
          lead_id: defaultLeadId ?? "",
        });
        onCreated?.();
      },
    });
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      // Reset form when closing
      setForm({
        ...INITIAL_FORM,
        lead_nome: defaultLeadNome ?? "",
        lead_id: defaultLeadId ?? "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white font-['Plus_Jakarta_Sans']">
        <DialogHeader>
          <DialogTitle className="text-[#002B5B]">Novo Agendamento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Lead name */}
          <div>
            <Label>Lead *</Label>
            <Input
              value={form.lead_nome}
              onChange={(e) => set("lead_nome", e.target.value)}
              placeholder="Nome do lead"
            />
          </div>

          {/* Property */}
          <div>
            <Label>Imovel</Label>
            <Input
              value={form.property_nome}
              onChange={(e) => set("property_nome", e.target.value)}
              placeholder="Nome ou endereco do imovel"
            />
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data / Hora *</Label>
              <Input
                type="datetime-local"
                value={form.data_hora}
                onChange={(e) => set("data_hora", e.target.value)}
              />
            </div>
            <div>
              <Label>Duracao</Label>
              <Select
                value={form.duracao}
                onValueChange={(v) => set("duracao", v as AppointmentDuracao)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30min">30 minutos</SelectItem>
                  <SelectItem value="1h">1 hora</SelectItem>
                  <SelectItem value="2h">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tipo */}
          <div>
            <Label>Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(v) => set("tipo", v as AppointmentTipo)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visita_presencial">Visita presencial</SelectItem>
                <SelectItem value="visita_virtual">Visita virtual</SelectItem>
                <SelectItem value="reuniao_apresentacao">Reuniao de apresentacao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div>
            <Label>Notas</Label>
            <Textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Observacoes sobre a visita..."
              rows={3}
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="enviar_confirmacao"
              checked={form.enviar_confirmacao}
              onCheckedChange={(v) => set("enviar_confirmacao", Boolean(v))}
            />
            <Label htmlFor="enviar_confirmacao" className="text-sm text-gray-600 cursor-pointer">
              Enviar confirmacao ao lead
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !form.lead_nome.trim() || !form.data_hora || createAppointment.isPending
            }
            className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
          >
            {createAppointment.isPending ? "Agendando..." : "Agendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
