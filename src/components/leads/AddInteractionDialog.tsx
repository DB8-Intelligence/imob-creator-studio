/**
 * AddInteractionDialog.tsx — Modal para registrar interação com lead
 *
 * Campos:
 * - Tipo: Ligação / WhatsApp / Email / Visita Presencial / Outro
 * - Descrição (texto livre)
 * - Resultado: Positivo / Neutro / Negativo
 * - Próximo passo (texto livre)
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadActivityType, LeadActivityResultado, CreateLeadActivityInput } from "@/types/lead";

interface AddInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadNome: string;
  onSubmit: (data: CreateLeadActivityInput) => void;
  isSubmitting?: boolean;
}

const INTERACTION_TYPES: { id: LeadActivityType; label: string; emoji: string }[] = [
  { id: "ligacao",           label: "Ligação",    emoji: "📞" },
  { id: "mensagem_whatsapp", label: "WhatsApp",   emoji: "💬" },
  { id: "mensagem_email",    label: "E-mail",     emoji: "📧" },
  { id: "visita_presencial", label: "Visita",     emoji: "🏠" },
  { id: "nota_adicionada",   label: "Nota",       emoji: "📝" },
  { id: "outro",             label: "Outro",      emoji: "📌" },
];

const RESULTADO_OPTIONS: { id: LeadActivityResultado; label: string; emoji: string; color: string; activeColor: string }[] = [
  { id: "positivo", label: "Positivo", emoji: "✅", color: "border-emerald-300/30 text-emerald-500", activeColor: "border-emerald-400 bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-400" },
  { id: "neutro",   label: "Neutro",   emoji: "➖", color: "border-slate-300/30 text-slate-400",     activeColor: "border-slate-400 bg-slate-400/15 text-slate-500 ring-1 ring-slate-400" },
  { id: "negativo", label: "Negativo", emoji: "❌", color: "border-red-300/30 text-red-400",         activeColor: "border-red-400 bg-red-500/15 text-red-500 ring-1 ring-red-400" },
];

export function AddInteractionDialog({
  open,
  onOpenChange,
  leadNome,
  onSubmit,
  isSubmitting,
}: AddInteractionDialogProps) {
  const [tipo, setTipo] = useState<LeadActivityType>("mensagem_whatsapp");
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<LeadActivityResultado>("neutro");
  const [proximoPasso, setProximoPasso] = useState("");

  const handleSubmit = () => {
    if (!descricao.trim()) return;
    onSubmit({
      tipo,
      descricao: descricao.trim(),
      resultado,
      proximo_passo: proximoPasso.trim() || undefined,
    });
    // Reset form
    setDescricao("");
    setProximoPasso("");
    setResultado("neutro");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Interação — {leadNome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Tipo */}
          <div>
            <Label className="mb-2 block">Tipo de interação</Label>
            <div className="flex flex-wrap gap-2">
              {INTERACTION_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                    tipo === t.id
                      ? "border-accent bg-accent/10 text-accent ring-1 ring-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="mr-1.5">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="O que aconteceu nesta interação..."
              rows={3}
            />
          </div>

          {/* Resultado */}
          <div>
            <Label className="mb-2 block">Resultado</Label>
            <div className="flex gap-2">
              {RESULTADO_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setResultado(r.id)}
                  className={cn(
                    "flex-1 rounded-xl border-2 p-3 text-center transition-all",
                    resultado === r.id ? r.activeColor : r.color
                  )}
                >
                  <span className="text-lg block mb-0.5">{r.emoji}</span>
                  <span className="text-xs font-semibold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Próximo passo */}
          <div>
            <Label htmlFor="proximo">Próximo passo</Label>
            <Input
              id="proximo"
              value={proximoPasso}
              onChange={(e) => setProximoPasso(e.target.value)}
              placeholder="Ex: Ligar na segunda para confirmar visita"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!descricao.trim() || isSubmitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
