import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { usePropertyUpload } from "@/hooks/usePropertyUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  Check,
  Clapperboard,
  DollarSign,
  FileText,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Sparkles,
  Square,
  Upload as UploadIcon,
  Wand2,
  X,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "video";
  preview: string;
  file: File;
}

const goals = [
  { id: "captacao", title: "Captação", desc: "Atrair proprietários e destacar autoridade." },
  { id: "venda", title: "Venda", desc: "Apresentar imóvel com foco em conversão." },
  { id: "engajamento", title: "Engajamento", desc: "Gerar alcance e atenção no Instagram." },
  { id: "reels", title: "Reels", desc: "Transformar o imóvel em conteúdo curto e dinâmico." },
];

const formats = [
  { id: "feed", title: "Feed", desc: "Peça principal para publicação." },
  { id: "carousel", title: "Carrossel", desc: "Sequência com diferenciais do imóvel." },
  { id: "story", title: "Story", desc: "Mensagem rápida e vertical." },
  { id: "reels", title: "Reels", desc: "Base para vídeo e animação." },
];

const styles = [
  { id: "captacao-express", title: "Captação Express", desc: "Direto ao ponto, comercial e rápido." },
  { id: "luxo-premium", title: "Luxo Premium", desc: "Editorial, elegante e alto padrão." },
  { id: "oportunidade-quente", title: "Oportunidade Quente", desc: "Urgência e percepção de oferta." },
  { id: "tour-imobiliario", title: "Tour Imobiliário", desc: "Narrativa visual do espaço." },
  { id: "carrossel-beneficios", title: "Carrossel de Benefícios", desc: "Ideal para explicar diferenciais." },
  { id: "reels-conversao", title: "Reels de Conversão", desc: "Mais dinâmico, pensado para retenção." },
];

const propertyTypes = ["apartamento", "casa", "lancamento", "terreno", "oportunidade"];
const propertyStandards = ["baixo", "medio", "luxo"];

const steps = [
  { id: 1, title: "Objetivo" },
  { id: 2, title: "Formato" },
  { id: 3, title: "Estilo" },
  { id: 4, title: "Assets" },
  { id: 5, title: "Texto" },
  { id: 6, title: "Finalizar" },
];

const Upload = () => {
  const navigate = useNavigate();
  const { isUploading, progress, createPropertyWithMedia } = usePropertyUpload();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
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

  const canAdvance = useMemo(() => {
    if (step === 1) return !!goal;
    if (step === 2) return !!format;
    if (step === 3) return !!style;
    if (step === 4) return files.length > 0;
    if (step === 5) return propertyData.title.trim().length > 0 && propertyData.city.trim().length > 0;
    return true;
  }, [step, goal, format, style, files.length, propertyData.title, propertyData.city]);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((f) => f.size <= 20 * 1024 * 1024);
    const uploadedFiles: UploadedFile[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: file.type.startsWith("video/") ? "video" : "image",
      preview: URL.createObjectURL(file),
      file,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

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

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  const handleGenerate = async () => {
    const property = await createPropertyWithMedia(propertyData, files);
    if (property) navigate("/inbox");
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-3 -ml-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao dashboard
            </Button>
            <h1 className="text-3xl font-display font-bold text-foreground">Criar Criativo</h1>
            <p className="text-muted-foreground mt-1">
              Fluxo guiado para sair do briefing e chegar ao criativo com menos fricção.
            </p>
          </div>
          <Badge className="bg-accent text-accent-foreground">Fase 2 • guided flow</Badge>
        </div>

        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {steps.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={[
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border",
                    step >= item.id ? "bg-accent text-accent-foreground border-accent" : "bg-muted text-muted-foreground border-border",
                  ].join(" ")}>
                    {step > item.id ? <Check className="w-4 h-4" /> : item.id}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs text-muted-foreground">Etapa {item.id}</p>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
            {isUploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Processando seu imóvel...</span>
                  <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {step === 1 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Qual é o objetivo da peça?</h2>
                <p className="text-sm text-muted-foreground mt-1">Escolha o resultado esperado para a IA orientar a produção.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {goals.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id)}
                    className={[
                      "rounded-2xl border p-5 text-left transition-all",
                      goal === item.id ? "border-accent bg-accent/5 shadow-soft" : "border-border/60 hover:border-accent/40",
                    ].join(" ")}
                  >
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Escolha o formato</h2>
                <p className="text-sm text-muted-foreground mt-1">Defina o tipo de saída para orientar layout, ritmo e expectativa.</p>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {formats.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id)}
                    className={[
                      "rounded-2xl border p-5 text-left transition-all",
                      format === item.id ? "border-accent bg-accent/5 shadow-soft" : "border-border/60 hover:border-accent/40",
                    ].join(" ")}
                  >
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Escolha o estilo</h2>
                <p className="text-sm text-muted-foreground mt-1">Use um modo de criação mais próximo do resultado que você quer vender.</p>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {styles.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStyle(item.id)}
                    className={[
                      "rounded-2xl border p-5 text-left transition-all",
                      style === item.id ? "border-accent bg-accent/5 shadow-soft" : "border-border/60 hover:border-accent/40",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Wand2 className="w-4 h-4 text-accent" />
                      <p className="font-semibold text-foreground">{item.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Envie os assets</h2>
                <p className="text-sm text-muted-foreground mt-1">Fotos e vídeos do imóvel alimentam o fluxo criativo e a etapa visual.</p>
              </div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={[
                  "border-2 border-dashed rounded-2xl p-12 text-center transition-colors",
                  isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/40",
                ].join(" ")}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <UploadIcon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Arraste fotos e vídeos do imóvel</h3>
                <p className="text-muted-foreground mb-4">ou clique para selecionar arquivos</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild className="cursor-pointer">
                    <span>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Selecionar arquivos
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-4">JPG, PNG, WebP, MP4 • até 20MB por arquivo</p>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {files.map((file, idx) => (
                    <div key={file.id} className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted">
                      <div className="aspect-square">
                        {file.type === "image" ? (
                          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Clapperboard className="w-8 h-8 text-muted-foreground/60" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {idx === 0 && <Badge className="text-xs bg-accent text-accent-foreground">Capa</Badge>}
                        <Badge variant="secondary" className="text-xs">{file.type === "video" ? "Vídeo" : "Foto"}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Texto e contexto</h2>
                <p className="text-sm text-muted-foreground mt-1">Agora alimente a IA com os dados que fazem diferença no resultado.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Título do imóvel</Label>
                  <div className="relative mt-1">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" value={propertyData.title} onChange={(e) => setPropertyData({ ...propertyData, title: e.target.value })} placeholder="Ex: Casa de Alto Padrão no Alphaville" />
                  </div>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" value={propertyData.city} onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })} placeholder="Ex: São Paulo" />
                  </div>
                </div>
                <div>
                  <Label>Bairro</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" value={propertyData.neighborhood} onChange={(e) => setPropertyData({ ...propertyData, neighborhood: e.target.value })} placeholder="Ex: Alphaville" />
                  </div>
                </div>
                <div>
                  <Label>Tipo do imóvel</Label>
                  <Input value={propertyData.property_type} onChange={(e) => setPropertyData({ ...propertyData, property_type: e.target.value })} list="property-types" className="mt-1" />
                  <datalist id="property-types">{propertyTypes.map((item) => <option key={item} value={item} />)}</datalist>
                </div>
                <div>
                  <Label>Padrão</Label>
                  <Input value={propertyData.property_standard} onChange={(e) => setPropertyData({ ...propertyData, property_standard: e.target.value })} list="property-standards" className="mt-1" />
                  <datalist id="property-standards">{propertyStandards.map((item) => <option key={item} value={item} />)}</datalist>
                </div>
                <div>
                  <Label>Valor do investimento</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={propertyData.investment_value_display}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPropertyData({
                          ...propertyData,
                          investment_value: raw,
                          investment_value_display: raw ? formatCurrency(raw) : "",
                        });
                      }}
                      placeholder="R$ 0"
                    />
                  </div>
                </div>
                <div>
                  <Label>Área construída (m²)</Label>
                  <div className="relative mt-1">
                    <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" value={propertyData.built_area_m2} onChange={(e) => setPropertyData({ ...propertyData, built_area_m2: e.target.value })} placeholder="Ex: 120" />
                  </div>
                </div>
                <div>
                  <Label>Quartos</Label>
                  <div className="relative mt-1">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" value={propertyData.bedrooms} onChange={(e) => setPropertyData({ ...propertyData, bedrooms: e.target.value })} placeholder="Ex: 4" />
                  </div>
                </div>
                <div>
                  <Label>Banheiros</Label>
                  <div className="relative mt-1">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" value={propertyData.bathrooms} onChange={(e) => setPropertyData({ ...propertyData, bathrooms: e.target.value })} placeholder="Ex: 5" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Diferenciais</Label>
                  <Textarea value={propertyData.highlights} onChange={(e) => setPropertyData({ ...propertyData, highlights: e.target.value })} className="mt-1" rows={3} placeholder="Ex: Piscina aquecida, churrasqueira gourmet, vista livre..." />
                </div>
                <div className="md:col-span-2">
                  <Label>Descrição adicional</Label>
                  <div className="relative mt-1">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea value={propertyData.description} onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })} className="pl-10" rows={4} placeholder="Informações extras para enriquecer a copy e o criativo." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 6 && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Resumo antes de gerar</h2>
                <p className="text-sm text-muted-foreground mt-1">Confira a estrutura escolhida antes de enviar para o fluxo operacional.</p>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Objetivo</p>
                  <p className="font-semibold text-foreground mt-1">{goals.find((item) => item.id === goal)?.title}</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Formato</p>
                  <p className="font-semibold text-foreground mt-1">{formats.find((item) => item.id === format)?.title}</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Estilo</p>
                  <p className="font-semibold text-foreground mt-1">{styles.find((item) => item.id === style)?.title}</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Assets</p>
                  <p className="font-semibold text-foreground mt-1">{files.length} arquivo(s)</p>
                </div>
              </div>

              <Separator />

              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
                <p className="font-semibold text-foreground mb-2">O que acontece ao continuar</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• o imóvel e os assets serão salvos no fluxo</li>
                  <li>• o conteúdo seguirá para a operação do inbox</li>
                  <li>• a base fica pronta para próxima etapa de IA e aprovação</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => (step === 1 ? navigate("/dashboard") : setStep(step - 1))} disabled={isUploading}>
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <div className="flex items-center gap-3">
            {step < 6 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance || isUploading}>
                Avançar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleGenerate} disabled={isUploading || !propertyData.title.trim() || files.length === 0}>
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando fluxo...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Salvar e enviar para inbox</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;
