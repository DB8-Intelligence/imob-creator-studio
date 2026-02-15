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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { BrandTemplate, BrandTemplateInput } from "@/types/brandTemplate";

const LOGO_POSITIONS = [
  { value: "bottom-right", label: "Inferior direito" },
  { value: "bottom-left", label: "Inferior esquerdo" },
  { value: "top-right", label: "Superior direito" },
  { value: "top-left", label: "Superior esquerdo" },
] as const;

const emptyForm: BrandTemplateInput = {
  name: "",
  logo_url: "",
  frame_url: "",
  primary_color: "#1a1a2e",
  secondary_color: "#e2b93b",
  footer_text: "",
  logo_position: "bottom-right",
};

interface TemplateFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BrandTemplateInput) => void;
  isSubmitting: boolean;
  initial?: BrandTemplate | null;
}

const TemplateFormModal = ({ open, onClose, onSubmit, isSubmitting, initial }: TemplateFormModalProps) => {
  const [form, setForm] = useState<BrandTemplateInput>(emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        logo_url: initial.logo_url || "",
        frame_url: initial.frame_url || "",
        primary_color: initial.primary_color,
        secondary_color: initial.secondary_color,
        footer_text: initial.footer_text || "",
        logo_position: initial.logo_position,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial, open]);

  const set = (key: keyof BrandTemplateInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Template" : "Novo Template"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Marca Premium" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input id="logo_url" value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frame_url">URL do Frame (1080×1080)</Label>
              <Input id="frame_url" value={form.frame_url} onChange={(e) => set("frame_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input id="primary_color" value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={(e) => set("secondary_color", e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input id="secondary_color" value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footer_text">Texto do Rodapé</Label>
              <Input id="footer_text" value={form.footer_text} onChange={(e) => set("footer_text", e.target.value)} placeholder="CRECI 12345" />
            </div>
            <div className="space-y-2">
              <Label>Posição do Logo</Label>
              <Select value={form.logo_position} onValueChange={(v) => set("logo_position", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOGO_POSITIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {(form.logo_url || form.frame_url) && (
            <div className="relative w-32 h-32 mx-auto rounded-lg border border-border overflow-hidden bg-muted">
              {form.frame_url && (
                <img src={form.frame_url} alt="Frame" className="absolute inset-0 w-full h-full object-cover" />
              )}
              {form.logo_url && (
                <img
                  src={form.logo_url}
                  alt="Logo"
                  className={`absolute w-8 h-8 object-contain ${
                    form.logo_position === "top-left" ? "top-1 left-1" :
                    form.logo_position === "top-right" ? "top-1 right-1" :
                    form.logo_position === "bottom-left" ? "bottom-1 left-1" :
                    "bottom-1 right-1"
                  }`}
                />
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateFormModal;
