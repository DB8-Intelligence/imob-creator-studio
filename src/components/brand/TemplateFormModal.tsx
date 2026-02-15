import { useState, useEffect, useRef } from "react";
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
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import type { BrandTemplate, BrandTemplateInput } from "@/types/brandTemplate";
import { useBrandAssetUpload } from "@/hooks/useBrandAssetUpload";
import { toast } from "@/hooks/use-toast";

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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);

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
            <div className="flex items-center gap-3">
              {form.logo_url ? (
                <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => set("logo_url", "")}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground">ou cole uma URL abaixo</p>
                <Input
                  value={form.logo_url}
                  onChange={(e) => set("logo_url", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, "logo_url", "logos");
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {/* Frame upload */}
          <div className="space-y-2">
            <Label>Frame Overlay (PNG 1080×1080)</Label>
            <div className="flex items-center gap-3">
              {form.frame_url ? (
                <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                  <img src={form.frame_url} alt="Frame" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set("frame_url", "")}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => frameInputRef.current?.click()}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                  Upload Frame
                </Button>
                <p className="text-xs text-muted-foreground">ou cole uma URL abaixo</p>
                <Input
                  value={form.frame_url}
                  onChange={(e) => set("frame_url", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <input
                ref={frameInputRef}
                type="file"
                accept="image/png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, "frame_url", "frames");
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor Primária</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={(e) => set("secondary_color", e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} className="flex-1" />
              </div>
            </div>
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
