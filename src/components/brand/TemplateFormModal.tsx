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
import { useBrandAssetUpload } from "@/hooks/useBrandAssetUpload";
import { toast } from "@/hooks/use-toast";
import AssetDropZone from "./AssetDropZone";

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
  const { upload, isUploading } = useBrandAssetUpload();

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

  const handleFileUpload = async (file: File, field: "logo_url" | "frame_url", folder: "logos" | "frames") => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Envie apenas imagens (PNG, JPG, SVG)", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" });
      return;
    }
    try {
      const result = await upload(file, folder);
      set(field, result.url);
      toast({ title: `${folder === "logos" ? "Logo" : "Frame"} enviado com sucesso` });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  const busy = isSubmitting || isUploading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Template" : "Novo Template"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Marca Premium" required />
          </div>

          {/* Logo upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <AssetDropZone
              label="Logo"
              value={form.logo_url || ""}
              accept="image/*"
              isUploading={isUploading}
              onChange={(v) => set("logo_url", v)}
              onFileSelect={(f) => handleFileUpload(f, "logo_url", "logos")}
            />
          </div>

          {/* Frame upload */}
          <div className="space-y-2">
            <Label>Frame Overlay (PNG 1080×1080)</Label>
            <AssetDropZone
              label="Frame"
              value={form.frame_url || ""}
              accept="image/png"
              isUploading={isUploading}
              onChange={(v) => set("frame_url", v)}
              onFileSelect={(f) => handleFileUpload(f, "frame_url", "frames")}
            />
          </div>

          {/* Footer + Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Texto do Rodapé</Label>
              <Input value={form.footer_text} onChange={(e) => set("footer_text", e.target.value)} placeholder="CRECI 12345" />
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

          {/* Live Preview */}
          <div className="space-y-2">
            <Label>Preview da Arte</Label>
            <div
              className="relative w-full aspect-square max-w-[320px] mx-auto rounded-xl border border-border overflow-hidden"
              style={{ backgroundColor: form.primary_color || "#1a1a2e" }}
            >
              {/* Simulated property image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2 px-6">
                  <div className="w-20 h-14 mx-auto rounded bg-white/10 flex items-center justify-center">
                    <span className="text-white/40 text-xs">Foto do imóvel</span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: form.secondary_color || "#e2b93b" }}>
                    Apartamento 3 quartos
                  </p>
                  <p className="text-[10px] text-white/60">Centro, São Paulo • R$ 850.000</p>
                </div>
              </div>

              {/* Frame overlay */}
              {form.frame_url && (
                <img src={form.frame_url} alt="Frame" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              )}

              {/* Logo */}
              {form.logo_url && (
                <img
                  src={form.logo_url}
                  alt="Logo"
                  className={`absolute w-12 h-12 object-contain drop-shadow-md ${
                    form.logo_position === "top-left" ? "top-3 left-3" :
                    form.logo_position === "top-right" ? "top-3 right-3" :
                    form.logo_position === "bottom-left" ? "bottom-8 left-3" :
                    "bottom-8 right-3"
                  }`}
                />
              )}

              {/* Footer bar */}
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-center"
                style={{ backgroundColor: form.secondary_color || "#e2b93b" }}
              >
                <span className="text-[10px] font-semibold" style={{ color: form.primary_color || "#1a1a2e" }}>
                  {form.footer_text || "Seu texto de rodapé aqui"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Simulação da arte final • 1080×1080
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={busy || !form.name.trim()}>
              {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateFormModal;
