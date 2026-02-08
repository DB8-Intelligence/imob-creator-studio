import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/app/AppLayout";
import { usePropertyUpload } from "@/hooks/usePropertyUpload";
import { 
  Upload as UploadIcon, 
  Image, 
  Video, 
  X, 
  ArrowRight,
  Sparkles,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Loader2
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "video";
  preview: string;
  file: File;
}

const Upload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [propertyData, setPropertyData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: ""
  });

  const { isUploading, progress, createPropertyWithMedia } = usePropertyUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.size <= 20 * 1024 * 1024);
    const uploadedFiles: UploadedFile[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: file.type.startsWith("video/") ? "video" : "image",
      preview: URL.createObjectURL(file),
      file,
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleContinue = async () => {
    const property = await createPropertyWithMedia(propertyData, files);
    if (property) {
      navigate("/templates", { state: { propertyId: property.id } });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Upload de Mídia
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie as fotos e vídeos do imóvel para criar seu criativo
          </p>
        </div>

        {/* Upload Area */}
        <Card>
          <CardContent className="p-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${isDragging 
                  ? "border-accent bg-accent/5" 
                  : "border-border hover:border-accent/50"
                }
              `}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <UploadIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Arraste suas fotos aqui
              </h3>
              <p className="text-muted-foreground mb-4">
                ou clique para selecionar arquivos
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild className="cursor-pointer">
                  <span>
                    <Image className="w-4 h-4 mr-2" />
                    Selecionar Arquivos
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Formatos: JPG, PNG, WebP, MP4 • Máximo 20MB por arquivo
              </p>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <Label>Arquivos selecionados ({files.length})</Label>
                  <Button variant="ghost" size="sm" onClick={() => {
                    files.forEach(f => URL.revokeObjectURL(f.preview));
                    setFiles([]);
                  }}>
                    Limpar todos
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {files.map((file, idx) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {file.type === "image" ? (
                          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {idx === 0 && <Badge className="text-xs bg-accent text-accent-foreground">Capa</Badge>}
                        <Badge variant="secondary" className="text-xs">
                          {file.type === "video" ? "Vídeo" : "Foto"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enviando arquivos...</span>
                  <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                Dados do Imóvel
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Preencha para salvar o imóvel e gerar legendas automáticas com IA
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Título do Imóvel *</Label>
                <div className="relative mt-1">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="title" placeholder="Ex: Casa de Alto Padrão no Alphaville" className="pl-10" value={propertyData.title} onChange={(e) => setPropertyData({...propertyData, title: e.target.value})} required />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Localização</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="address" placeholder="Ex: Alphaville 2, Santana de Parnaíba" className="pl-10" value={propertyData.address} onChange={(e) => setPropertyData({...propertyData, address: e.target.value})} />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Preço</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="price" placeholder="Ex: 3200000" className="pl-10" value={propertyData.price} onChange={(e) => setPropertyData({...propertyData, price: e.target.value})} />
                </div>
              </div>

              <div>
                <Label htmlFor="area">Área (m²)</Label>
                <div className="relative mt-1">
                  <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="area" placeholder="Ex: 630" className="pl-10" value={propertyData.area} onChange={(e) => setPropertyData({...propertyData, area: e.target.value})} />
                </div>
              </div>

              <div>
                <Label htmlFor="bedrooms">Quartos/Suítes</Label>
                <div className="relative mt-1">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="bedrooms" placeholder="Ex: 5" className="pl-10" value={propertyData.bedrooms} onChange={(e) => setPropertyData({...propertyData, bedrooms: e.target.value})} />
                </div>
              </div>

              <div>
                <Label htmlFor="bathrooms">Banheiros</Label>
                <div className="relative mt-1">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="bathrooms" placeholder="Ex: 6" className="pl-10" value={propertyData.bathrooms} onChange={(e) => setPropertyData({...propertyData, bathrooms: e.target.value})} />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição Adicional</Label>
                <Textarea id="description" placeholder="Características especiais, diferenciais do imóvel..." className="mt-1" rows={3} value={propertyData.description} onChange={(e) => setPropertyData({...propertyData, description: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")} disabled={isUploading}>
            Cancelar
          </Button>
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleContinue}
            disabled={files.length === 0 || !propertyData.title.trim() || isUploading}
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
            ) : (
              <>Salvar e Escolher Template<ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;
