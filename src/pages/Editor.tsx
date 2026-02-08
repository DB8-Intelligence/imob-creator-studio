import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/app/AppLayout";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { usePropertyWithCover } from "@/hooks/usePropertyWithCover";
import { 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  Copy,
  Check,
  Wand2,
  Type,
  Palette,
  ImageIcon,
  Loader2
} from "lucide-react";

const formatPrice = (price: number | null) => {
  if (!price) return "Consulte";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
};

const Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = (location.state as { propertyId?: string } | null) ?? {};
  const { data: property, isLoading } = usePropertyWithCover(propertyId ?? null);

  const [copied, setCopied] = useState(false);
  const [caption, setCaption] = useState("");
  const [formData, setFormData] = useState({
    title: "🏡 Casa Moderna no Alphaville",
    subtitle: "5 suítes · 630m² · Condomínio com segurança 24h",
    price: "R$ 3.200.000",
    cta: "Agende sua Visita",
    aiPrompt: ""
  });

  // Pre-fill form with property data when loaded
  useEffect(() => {
    if (property) {
      const details = [
        property.bedrooms ? `${property.bedrooms} quartos` : null,
        property.area_sqm ? `${property.area_sqm}m²` : null,
        property.city || null,
      ].filter(Boolean).join(" · ");

      setFormData(prev => ({
        ...prev,
        title: property.title || prev.title,
        subtitle: details || prev.subtitle,
        price: formatPrice(property.price),
      }));
    }
  }, [property]);

  const { isGenerating, generateCaption, adjustTexts, regenerateCaption } = useAIGeneration();

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCaption = async () => {
    const result = await generateCaption(formData);
    if (result) setCaption(result);
  };

  const handleRegenerateCaption = async () => {
    const result = await regenerateCaption(formData);
    if (result) setCaption(result);
  };

  const handleApplyAI = async () => {
    if (!formData.aiPrompt.trim()) return;
    const result = await adjustTexts(formData, formData.aiPrompt);
    if (result) {
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        subtitle: result.subtitle || prev.subtitle,
        price: result.price || prev.price,
        cta: result.cta || prev.cta,
        aiPrompt: ""
      }));
    }
  };

  const coverUrl = property?.coverUrl;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Editor de Criativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize seu criativo e ajuste os textos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/templates")}>
              Voltar
            </Button>
            <Button 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate("/export")}
            >
              Exportar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,450px] gap-6">
          {/* Preview Area */}
          <Card className="order-2 lg:order-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Preview</h3>
              </div>

              {/* Main Preview */}
              <div className="bg-muted rounded-xl p-8 flex items-center justify-center min-h-[400px]">
                <div className="w-full max-w-[320px] aspect-square bg-card rounded-xl shadow-elevated p-6 flex flex-col justify-between text-card-foreground overflow-hidden">
                  {/* Cover Image or Placeholder */}
                  {isLoading ? (
                    <div className="h-[45%] bg-muted rounded-lg flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-muted-foreground/50 animate-spin" />
                    </div>
                  ) : coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Imagem do imóvel"
                      className="h-[45%] w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-[45%] bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold mb-1">{formData.title}</h2>
                    <p className="text-sm text-muted-foreground">{formData.subtitle}</p>
                    <p className="text-lg font-bold text-accent mt-2">{formData.price}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-accent text-accent-foreground font-semibold px-4 py-2 rounded-full text-sm">
                      {formData.cta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Variation Thumbnails */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 ${i === 1 ? 'border-accent' : 'border-transparent'} bg-muted flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors overflow-hidden`}
                  >
                    {i === 1 && coverUrl ? (
                      <img src={coverUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground">V{i}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Panel */}
          <div className="order-1 lg:order-2 space-y-4">
            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">
                  <Type className="w-4 h-4 mr-1" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="style">
                  <Palette className="w-4 h-4 mr-1" />
                  Estilo
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Sparkles className="w-4 h-4 mr-1" />
                  IA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtítulo/Detalhes</Label>
                      <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço</Label>
                      <Input id="price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="cta">Botão CTA</Label>
                      <Input id="cta" value={formData.cta} onChange={(e) => setFormData({...formData, cta: e.target.value})} className="mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="style" className="mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label>Estilo Selecionado</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button variant="outline" size="sm" className="border-accent">Express</Button>
                        <Button variant="ghost" size="sm">Mágico</Button>
                        <Button variant="ghost" size="sm">Conversão</Button>
                      </div>
                    </div>
                    <div>
                      <Label>Cores da Marca</Label>
                      <div className="flex gap-2 mt-2">
                        <div className="w-10 h-10 rounded-lg bg-primary border-2 border-accent" />
                        <div className="w-10 h-10 rounded-lg bg-accent" />
                        <div className="w-10 h-10 rounded-lg bg-background border" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="aiPrompt">Ajustar com IA</Label>
                      <Textarea 
                        id="aiPrompt"
                        placeholder="Ex: Deixe mais urgente, adicione emojis, foque no luxo..."
                        value={formData.aiPrompt}
                        onChange={(e) => setFormData({...formData, aiPrompt: e.target.value})}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <Button 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={handleApplyAI}
                      disabled={isGenerating || !formData.aiPrompt.trim()}
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Aplicando...</>
                      ) : (
                        <><Wand2 className="w-4 h-4 mr-2" />Aplicar IA</>
                      )}
                    </Button>
                    
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas:</p>
                      <div className="flex flex-wrap gap-1">
                        {["Mais urgente", "Mais elegante", "Adicionar emojis", "Foco em luxo"].map((suggestion) => (
                          <Badge 
                            key={suggestion}
                            variant="outline" 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => setFormData({...formData, aiPrompt: suggestion})}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Caption Generator */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <Label>Legenda Gerada por IA</Label>
                  </div>
                  {caption && (
                    <Button variant="ghost" size="sm" onClick={handleCopyCaption}>
                      {copied ? (
                        <><Check className="w-4 h-4 mr-1 text-green-500" />Copiado!</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-1" />Copiar</>
                      )}
                    </Button>
                  )}
                </div>

                {caption ? (
                  <div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-body">{caption}</pre>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Clique em "Gerar Legenda" para criar uma legenda com IA</p>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button 
                    variant={caption ? "outline" : "default"}
                    size="sm" 
                    className={caption ? "flex-1" : "flex-1 bg-accent text-accent-foreground hover:bg-accent/90"}
                    onClick={caption ? handleRegenerateCaption : handleGenerateCaption}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Gerando...</>
                    ) : caption ? (
                      <><RefreshCw className="w-4 h-4 mr-1" />Regenerar</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-1" />Gerar Legenda</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Editor;
