import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/app/AppLayout";
import MockupPreviewGallery from "@/components/templates/MockupPreviewGallery";
import { mockupsByFormat } from "@/data/templateMockups";
import { 
  ArrowRight, 
  Square, 
  Smartphone, 
  Layers,
  Sparkles,
  Zap,
  Target,
  CheckCircle2
} from "lucide-react";

// Template formats
const formats = [
  { id: "feed", label: "Feed", icon: Square, size: "1080×1080", description: "Post quadrado para Instagram e Facebook" },
  { id: "story", label: "Stories/Reels", icon: Smartphone, size: "1080×1920", description: "Formato vertical para Stories e Reels" },
  { id: "carousel", label: "Carrossel", icon: Layers, size: "Multi", description: "Múltiplas imagens para Instagram" },
];

// Creative types
const creativeTypes = [
  { id: "sale", label: "Venda", emoji: "🏷️" },
  { id: "rent", label: "Locação", emoji: "🔑" },
  { id: "launch", label: "Lançamento", emoji: "🚀" },
  { id: "sold", label: "Vendido", emoji: "✅" },
  { id: "tip", label: "Dica", emoji: "💡" },
];

// Visual styles
const styles = [
  { 
    id: "express", 
    label: "IA Express", 
    icon: Zap, 
    description: "Minimalista e direto ao ponto",
    color: "bg-blue-500/10 text-blue-600"
  },
  { 
    id: "magic", 
    label: "IA Mágico", 
    icon: Sparkles, 
    description: "Elegante com gradientes e efeitos",
    color: "bg-purple-500/10 text-purple-600"
  },
  { 
    id: "conversion", 
    label: "Conversão", 
    icon: Target, 
    description: "Foco em CTA e urgência",
    color: "bg-orange-500/10 text-orange-600"
  },
];

const Templates = () => {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState("feed");
  const [selectedType, setSelectedType] = useState("sale");
  const [selectedStyle, setSelectedStyle] = useState("express");

  const handleContinue = () => {
    navigate("/editor");
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Escolha o Template
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione o formato, tipo e estilo do seu criativo
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Left Column - Options */}
          <div className="space-y-8">
            {/* Format Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Formato
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {formats.map((format) => (
                  <Card
                    key={format.id}
                    className={`cursor-pointer transition-all ${
                      selectedFormat === format.id
                        ? "ring-2 ring-accent shadow-glow"
                        : "hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
                        <format.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">{format.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{format.size}</p>
                      {selectedFormat === format.id && (
                        <CheckCircle2 className="w-5 h-5 text-accent mx-auto mt-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Type Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Tipo de Criativo
              </h2>
              <div className="flex flex-wrap gap-2">
                {creativeTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    className={selectedType === type.id ? "bg-accent text-accent-foreground" : ""}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <span className="mr-2">{type.emoji}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </section>

            {/* Style Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Estilo Visual
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {styles.map((style) => (
                  <Card
                    key={style.id}
                    className={`cursor-pointer transition-all ${
                      selectedStyle === style.id
                        ? "ring-2 ring-accent shadow-glow"
                        : "hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-lg ${style.color} flex items-center justify-center mb-3`}>
                        <style.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-foreground">{style.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                      {selectedStyle === style.id && (
                        <Badge className="mt-2 bg-accent text-accent-foreground">
                          Selecionado
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* AI Prompt Info */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Prompt IA Interno</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      "Crie um layout {selectedFormat === 'feed' ? 'quadrado 1:1' : selectedFormat === 'story' ? 'vertical 9:16' : 'carrossel'} para 
                      anúncio de {selectedType === 'sale' ? 'venda' : selectedType === 'rent' ? 'locação' : selectedType === 'launch' ? 'lançamento' : selectedType === 'sold' ? 'imóvel vendido' : 'dica imobiliária'}, 
                      estilo {selectedStyle === 'express' ? 'minimalista Express' : selectedStyle === 'magic' ? 'elegante Mágico com gradientes' : 'Conversão com CTA destacado'}, 
                      usando cores da marca DB8 (preto #18181B e amarelo #FACC15). 
                      Destaque o preço e adicione CTA persuasivo."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Preview</h3>
                <div className="flex justify-center">
                  <MockupPreviewGallery
                    mockups={mockupsByFormat[selectedFormat] || []}
                    isVertical={selectedFormat !== "feed"}
                  />
                </div>
                <div className="mt-4 text-center">
                  <Badge variant="outline">
                    {formats.find(f => f.id === selectedFormat)?.label} • {styles.find(s => s.id === selectedStyle)?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/upload")}>
                Voltar
              </Button>
              <Button 
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleContinue}
              >
                Personalizar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Templates;
