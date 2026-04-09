import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  attendanceId?: string;
  clientName?: string;
  propertyReference?: string;
}

export function AppointmentModal({
  open,
  onClose,
  attendanceId,
  clientName,
  propertyReference,
}: AppointmentModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(
    `Visita${propertyReference ? ` - ${propertyReference}` : ""}${clientName ? ` - ${clientName}` : ""}`
  );
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [notifyClient, setNotifyClient] = useState(true);
  const [notifyBroker, setNotifyBroker] = useState(true);
  const [notifyOwner, setNotifyOwner] = useState(false);
  const [addGoogle, setAddGoogle] = useState(false);

  const handleSave = async () => {
    if (!date || !title) return;
    setSaving(true);

    const scheduledAt = new Date(`${date}T${startTime}`);
    const endsAt = new Date(`${date}T${endTime}`);

    const { error } = await supabase.from("appointments").insert({
      attendance_id: attendanceId,
      title,
      scheduled_at: scheduledAt.toISOString(),
      ends_at: endsAt.toISOString(),
      notify_client: notifyClient,
      notify_broker: notifyBroker,
      notify_owner: notifyOwner,
    });

    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Visita agendada!" });
      onClose();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Agendar Visita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Data</Label>
            <Input type="date" className="mt-1" value={date} onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Início</Label>
              <Input type="time" className="mt-1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>Fim</Label>
              <Input type="time" className="mt-1" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={notifyClient} onCheckedChange={(v) => setNotifyClient(!!v)} />
              Enviar e-mail para o cliente
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={notifyBroker} onCheckedChange={(v) => setNotifyBroker(!!v)} />
              Enviar cópia para o corretor
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={notifyOwner} onCheckedChange={(v) => setNotifyOwner(!!v)} />
              Enviar e-mail para o proprietário
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={addGoogle} onCheckedChange={(v) => setAddGoogle(!!v)} />
              Adicionar na Google Agenda
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !date || !title}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarDays className="h-4 w-4 mr-2" />}
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
