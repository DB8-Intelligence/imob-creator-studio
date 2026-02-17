import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  Building2,
  Star,
  FileText
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "video";
  preview: string;
  file: File;
}

const PROPERTY_TYPES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "lancamento", label: "Lançamento" },
  { value: "terreno", label: "Terreno" },
  { value: "oportunidade", label: "Oportunidade" },
];

const PROPERTY_STANDARDS = [
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "luxo", label: "Luxo" },
];

const formatCurrency = (value: string) => {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
};

const parseCurrency = (formatted: string) => {
  return formatted.replace(/\D/g, "");
};

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
    description: "",
    property_type: "apartamento",
    property_standard: "medio",
    city: "",
    neighborhood: "",
    investment_value: "",
    investment_value_display: "",
    built_area_m2: "",
    highlights: "",
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
      navigate("/inbox");
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

        {/* Dados Estratégicos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                Dados Estratégicos do Imóvel
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Esses dados alimentam a IA para gerar legendas e criativos otimizados
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <Label>Tipo do Imóvel *</Label>
                <Select value={propertyData.property_type} onValueChange={(v) => setPropertyData({...propertyData, property_type: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Padrão */}
              <div>
                <Label>Padrão do Imóvel</Label>
                <Select value={propertyData.property_standard} onValueChange={(v) => setPropertyData({...propertyData, property_standard: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_STANDARDS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cidade */}
              <div>
                <Label htmlFor="city">Cidade *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="city" placeholder="Ex: São Paulo" className="pl-10" value={propertyData.city} onChange={(e) => setPropertyData({...propertyData, city: e.target.value})} />
                </div>
              </div>

              {/* Bairro */}
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="neighborhood" placeholder="Ex: Alphaville" className="pl-10" value={propertyData.neighborhood} onChange={(e) => setPropertyData({...propertyData, neighborhood: e.target.value})} />
                </div>
              </div>

              {/* Valor do Investimento */}
              <div>
                <Label htmlFor="investment_value">Valor do Investimento *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="investment_value"
                    placeholder="R$ 0"
                    className="pl-10"
                    value={propertyData.investment_value_display}
                    onChange={(e) => {
                      const raw = parseCurrency(e.target.value);
                      setPropertyData({
                        ...propertyData,
                        investment_value: raw,
                        investment_value_display: raw ? formatCurrency(raw) : "",
                      });
                    }}
                  />
                </div>
              </div>

              {/* Área construída */}
              <div>
                <Label htmlFor="built_area_m2">Área construída (m²) *</Label>
                <div className="relative mt-1">
                  <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="built_area_m2" placeholder="Ex: 120" className="pl-10" type="number" value={propertyData.built_area_m2} onChange={(e) => setPropertyData({...propertyData, built_area_m2: e.target.value})} />
                </div>
              </div>

              {/* Diferenciais */}
              <div className="md:col-span-2">
                <Label htmlFor="highlights">Diferenciais</Label>
                <div className="relative mt-1">
                  <Textarea
                    id="highlights"
                    placeholder="Ex: Piscina aquecida, churrasqueira gourmet, 3 vagas de garagem, condomínio com segurança 24h..."
                    rows={3}
                    value={propertyData.highlights}
                    onChange={(e) => setPropertyData({...propertyData, highlights: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Complementares */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                Dados Complementares
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Informações adicionais do imóvel
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
                <Label htmlFor="address">Endereço Completo</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="address" placeholder="Ex: Rua das Flores, 123" className="pl-10" value={propertyData.address} onChange={(e) => setPropertyData({...propertyData, address: e.target.value})} />
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
                <Label htmlFor="area">Área Total (m²)</Label>
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
            disabled={files.length === 0 || !propertyData.title.trim() || !propertyData.city.trim() || !propertyData.investment_value || !propertyData.built_area_m2 || isUploading}
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
            ) : (
              <>Salvar e Ir para Inbox<ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;
