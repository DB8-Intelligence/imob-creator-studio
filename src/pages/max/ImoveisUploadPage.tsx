/**
 * ImoveisUploadPage.tsx — Upload / Cadastro rápido de imóvel
 *
 * Fluxo simplificado: Fotos + Dados básicos → Salvar no Supabase.
 * Fotos vão para Storage bucket 'property-media'.
 * Dados vão para tabela 'properties' + 'property_media'.
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
import { ArrowLeft, Upload, X, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "property-media";

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

export default function ImoveisUploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
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

  const uploadPhoto = async (file: File): Promise<string> => {
    const uid = user?.id ?? "anonymous";
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${uid}/properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!titulo.trim()) return;
    if (!user?.id) {
      toast({ title: "Erro", description: "Voce precisa estar logado.", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      // 1. Upload all photos to Supabase Storage
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const url = await uploadPhoto(photo.file);
        photoUrls.push(url);
      }

      // 2. Insert property record
      const { data: property, error: insertError } = await supabase
        .from("properties")
        .insert({
          title: titulo.trim(),
          property_type: tipo,
          city: city.trim() || null,
          price: price ? parseFloat(price) : null,
          images: photoUrls.length > 0 ? photoUrls : null,
          status: "available",
          user_id: user.id,
          workspace_id: workspaceId || null,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // 3. Insert property_media records for each photo
      if (photoUrls.length > 0 && property?.id) {
        const mediaRows = photoUrls.map((url, idx) => ({
          property_id: property.id,
          file_url: url,
          file_type: "image",
          is_cover: idx === 0,
          sort_order: idx,
        }));

        const { error: mediaError } = await supabase
          .from("property_media")
          .insert(mediaRows);

        if (mediaError) {
          console.warn("Erro ao salvar property_media:", mediaError.message);
        }
      }

      toast({ title: "Imovel cadastrado!", description: "Redirecionando para seus imoveis..." });
      navigate("/imoveis");
    } catch (err: any) {
      console.error("Erro ao cadastrar imovel:", err);
      toast({
        title: "Erro ao cadastrar",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/imoveis" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Imoveis
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Upload</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastrar Imovel</h1>
          <p className="text-sm text-muted-foreground mt-1">Suba as fotos e preencha os dados basicos. Voce podera completar depois no editor.</p>
        </div>

        {/* Photos upload */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Fotos do imovel</h3>

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
              <p className="text-xs text-muted-foreground mt-1">Ate 20 fotos — JPG, PNG, WEBP</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" title="Selecionar fotos do imovel" onChange={(e) => addFiles(e.target.files)} />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {photos.map((p, idx) => (
                  <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        Capa
                      </span>
                    )}
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
            <h3 className="font-semibold text-foreground">Dados basicos</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Titulo *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Apt Vila Mariana 3Q 120m2" />
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
                    <SelectItem value="lancamento">Lancamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sao Paulo" />
              </div>
              <div>
                <Label>Preco (R$)</Label>
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
