/**
 * PostVisitDialog.tsx — Modal rápido pós-visita
 *
 * Aparece ao marcar visita como "Concluída".
 * Campos: Resultado, Próximo passo, Observações.
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RESULTADO_CONFIG,
  PROXIMO_PASSO_CONFIG,
  type Appointment,
  type AppointmentResultado,
  type AppointmentProximoPasso,
} from "@/types/appointment";

interface PostVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSubmit: (data: { resultado: AppointmentResultado; proximo_passo: AppointmentProximoPasso; observacoes: string }) => void;
  isSubmitting?: boolean;
}

export function PostVisitDialog({ open, onOpenChange, appointment, onSubmit, isSubmitting }: PostVisitDialogProps) {
  const [resultado, setResultado] = useState<AppointmentResultado>("neutro");
  const [proximoPasso, setProximoPasso] = useState<AppointmentProximoPasso>("aguardar");
  const [observacoes, setObservacoes] = useState("");

  if (!appointment) return null;

  const handleSubmit = () => {
    onSubmit({ resultado, proximo_passo: proximoPasso, observacoes: observacoes.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pós-visita — {appointment.lead_nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Resultado */}
          <div>
            <Label className="mb-2 block">Resultado da visita</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(RESULTADO_CONFIG) as [string, { label: string; emoji: string; color: string }][]).map(([id, cfg]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setResultado(id as AppointmentResultado)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all",
                    resultado === id
                      ? "border-accent bg-accent/10 ring-1 ring-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-xl block mb-1">{cfg.emoji}</span>
                  <span className="text-xs font-semibold">{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Próximo passo */}
          <div>
            <Label className="mb-2 block">Próximo passo</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PROXIMO_PASSO_CONFIG) as [string, { label: string; emoji: string }][]).map(([id, cfg]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProximoPasso(id as AppointmentProximoPasso)}
                  className={cn(
                    "rounded-lg border p-2.5 text-center text-xs font-medium transition-all",
                    proximoPasso === id
                      ? "border-accent bg-accent/10 text-accent ring-1 ring-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="mr-1">{cfg.emoji}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Como foi a visita? Detalhes relevantes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Registrar e atualizar lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
