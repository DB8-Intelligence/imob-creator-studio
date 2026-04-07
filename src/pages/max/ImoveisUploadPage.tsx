/**
 * ImoveisUploadPage.tsx — Upload / Cadastro rápido de imóvel
 *
 * Fluxo simplificado: Fotos + Dados básicos → Salvar.
 * Redireciona para o editor completo após criação.
 */
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X, ImageIcon, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

export default function ImoveisUploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("apartamento");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 20 - photos.length);
    const newPhotos = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 20));
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSave = async () => {
    if (!titulo.trim()) return;
    setSaving(true);
    // TODO: real Supabase upload + property creation
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast({ title: "Imóvel cadastrado!", description: "Redirecionando para o editor..." });
    navigate("/imoveis");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/imoveis" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Imóveis
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Upload</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastrar Imóvel</h1>
          <p className="text-sm text-muted-foreground mt-1">Suba as fotos e preencha os dados básicos. Você poderá completar depois no editor.</p>
        </div>

        {/* Photos upload */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Fotos do imóvel</h3>

            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Arraste fotos ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-1">Até 20 fotos — JPG, PNG, WEBP</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" title="Selecionar fotos do imóvel" onChange={(e) => addFiles(e.target.files)} />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {photos.map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      title="Remover foto"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(p.id)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic data */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Dados básicos</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Título *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Apt Vila Mariana 3Q 120m²" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="lancamento">Lançamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" />
              </div>
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="850000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/imoveis")}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!titulo.trim() || saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChevronRight className="w-4 h-4 mr-2" />}
            {saving ? "Salvando..." : "Cadastrar e continuar"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
