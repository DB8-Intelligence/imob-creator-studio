import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app/AppLayout";
import MockupPreviewGallery from "@/components/templates/MockupPreviewGallery";
import StylePresetGallery from "@/components/templates/StylePresetGallery";
import { mockupsByFormat } from "@/data/templateMockups";
import { realEstateStylePresets } from "@/data/realEstateStylePresets";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Square,
  Smartphone,
} from "lucide-react";

const formats = [
  { id: "feed", label: "Feed", icon: Square, size: "1080×1080", description: "Post principal para venda e branding" },
  { id: "story", label: "Stories/Reels", icon: Smartphone, size: "1080×1920", description: "Formato vertical para retenção e ação rápida" },
  { id: "carousel", label: "Carrossel", icon: Layers, size: "Multi", description: "Sequência de diferenciais e narrativa" },
];

const Templates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propertyId = (location.state as { propertyId?: string })?.propertyId ?? null;
  const [selectedFormat, setSelectedFormat] = useState("feed");
  const [selectedStyle, setSelectedStyle] = useState("captacao-express");

  const selectedPreset = realEstateStylePresets.find((preset) => preset.id === selectedStyle);

  const handleContinue = () => {
    navigate("/editor", {
      state: {
        propertyId,
        selectedFormat,
        selectedStyle,
        preset: selectedPreset,
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Biblioteca de Estilos</h1>
          <p className="text-muted-foreground mt-1">
            Escolha o formato e um preset imobiliário vendável para acelerar a criação com consistência.
          </p>
        </div>

        <div className="grid xl:grid-cols-[1fr,380px] gap-8 items-start">
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <h2 className="text-lg font-semibold text-foreground">Formato da peça</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {formats.map((format) => (
                  <Card
                    key={format.id}
                    className={`cursor-pointer transition-all ${selectedFormat === format.id ? "ring-2 ring-accent shadow-glow" : "hover:border-accent/50"}`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
                        <format.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">{format.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{format.size}</p>
                      <p className="text-xs text-muted-foreground mt-2">{format.description}</p>
                      {selectedFormat === format.id && <CheckCircle2 className="w-5 h-5 text-accent mx-auto mt-3" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <h2 className="text-lg font-semibold text-foreground">Preset visual imobiliário</h2>
              </div>
              <StylePresetGallery presets={realEstateStylePresets} selectedId={selectedStyle} onSelect={setSelectedStyle} />
            </section>
          </div>

          <div className="space-y-4 xl:sticky xl:top-8">
            <Card>
              <CardContent className="p-5 space-y-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preview do modo selecionado</p>
                  <h3 className="text-xl font-display font-bold text-foreground mt-1">{selectedPreset?.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{selectedPreset?.headline}</p>
                </div>

                <div className="flex justify-center">
                  <MockupPreviewGallery
                    mockups={mockupsByFormat[selectedFormat] || []}
                    isVertical={selectedFormat !== "feed"}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{formats.find((f) => f.id === selectedFormat)?.label}</Badge>
                  {(selectedPreset?.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary">#{tag}</Badge>
                  ))}
                </div>

                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Ideal para</p>
                    <p className="text-sm font-medium text-foreground">{selectedPreset?.idealFor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CTA recomendado</p>
                    <p className="text-sm font-medium text-foreground">{selectedPreset?.ctaStyle}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                    <p>
                      Esse preset ajuda a IA a manter linguagem visual e objetivo de conversão mais próximos do resultado esperado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/upload")}>Voltar</Button>
              <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleContinue}>
                Usar preset
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
