/**
 * NewAppointmentDialog.tsx — Modal para criar novo agendamento
 *
 * Campos: Lead, Imóvel, Data/Hora, Duração, Tipo, Corretor, Notas, Toggle WhatsApp
 */
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateAppointmentInput, AppointmentTipo, AppointmentDuracao } from "@/types/appointment";
import { APPOINTMENT_TIPO_CONFIG } from "@/types/appointment";
import type { Lead } from "@/types/lead";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  prefillLeadId?: string;
  prefillLeadNome?: string;
  onSubmit: (data: CreateAppointmentInput) => void;
  isSubmitting?: boolean;
}

export function NewAppointmentDialog({
  open,
  onOpenChange,
  leads,
  prefillLeadId,
  prefillLeadNome,
  onSubmit,
  isSubmitting,
}: NewAppointmentDialogProps) {
  const [leadId, setLeadId] = useState(prefillLeadId ?? "");
  const [propertyNome, setPropertyNome] = useState("");
  const [propertyEndereco, setPropertyEndereco] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [duracao, setDuracao] = useState<AppointmentDuracao>("1h");
  const [tipo, setTipo] = useState<AppointmentTipo>("visita_presencial");
  const [corretor, setCorretor] = useState("");
  const [notas, setNotas] = useState("");
  const [enviarConfirmacao, setEnviarConfirmacao] = useState(true);

  useEffect(() => {
    if (open) {
      setLeadId(prefillLeadId ?? "");
      setPropertyNome(""); setPropertyEndereco(""); setNotas(""); setCorretor("");
      setDuracao("1h"); setTipo("visita_presencial"); setEnviarConfirmacao(true);
      // Default to tomorrow 10:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setDataHora(tomorrow.toISOString().slice(0, 16));
    }
  }, [open, prefillLeadId]);

  const selectedLead = leads.find((l) => l.id === leadId);
  const isValid = leadId && dataHora;

  const handleSubmit = () => {
    if (!isValid || !selectedLead) return;
    onSubmit({
      lead_id: leadId,
      lead_nome: selectedLead.nome,
      lead_telefone: selectedLead.telefone,
      property_nome: propertyNome || selectedLead.imovel_interesse_nome || null,
      property_endereco: propertyEndereco || null,
      data_hora: new Date(dataHora).toISOString(),
      duracao,
      tipo,
      corretor_responsavel: corretor || null,
      notas: notas || undefined,
      enviar_confirmacao: enviarConfirmacao,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Lead */}
          <div>
            <Label>Lead *</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue placeholder="Selecione o lead..." /></SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.nome} {l.telefone ? `— ${l.telefone}` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Imóvel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Imóvel</Label>
              <Input value={propertyNome} onChange={(e) => setPropertyNome(e.target.value)} placeholder={selectedLead?.imovel_interesse_nome ?? "Nome do imóvel"} />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={propertyEndereco} onChange={(e) => setPropertyEndereco(e.target.value)} placeholder="Rua, nº — Bairro" />
            </div>
          </div>

          {/* Data/Hora + Duração */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data e hora *</Label>
              <Input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
            </div>
            <div>
              <Label>Duração</Label>
              <Select value={duracao} onValueChange={(v) => setDuracao(v as AppointmentDuracao)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Label className="mb-2 block">Tipo</Label>
            <div className="flex gap-2">
              {(Object.entries(APPOINTMENT_TIPO_CONFIG) as [AppointmentTipo, { label: string; emoji: string }][]).map(([id, cfg]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTipo(id)}
                  className={cn(
                    "flex-1 rounded-lg border p-2.5 text-center text-xs font-medium transition-all",
                    tipo === id ? "border-accent bg-accent/10 text-accent ring-1 ring-accent" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="block text-lg mb-0.5">{cfg.emoji}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corretor */}
          <div>
            <Label>Corretor responsável</Label>
            <Input value={corretor} onChange={(e) => setCorretor(e.target.value)} placeholder="Nome do corretor (opcional)" />
          </div>

          {/* Notas */}
          <div>
            <Label>Notas da visita</Label>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observações, lembretes..." rows={2} />
          </div>

          {/* Toggle WhatsApp */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Enviar confirmação por WhatsApp</p>
                <p className="text-[11px] text-muted-foreground">Dispara mensagem automática via Evolution API</p>
              </div>
            </div>
            <Switch checked={enviarConfirmacao} onCheckedChange={setEnviarConfirmacao} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
