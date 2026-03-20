import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { RealEstateStylePreset } from "@/data/realEstateStylePresets";

interface StylePresetGalleryProps {
  presets: RealEstateStylePreset[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const categoryLabel: Record<RealEstateStylePreset["category"], string> = {
  captacao: "Captação",
  conversao: "Conversão",
  luxo: "Luxo",
  conteudo: "Conteúdo",
  video: "Vídeo",
};

const StylePresetGallery = ({ presets, selectedId, onSelect }: StylePresetGalleryProps) => {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {presets.map((preset) => (
        <Card
          key={preset.id}
          className={[
            "transition-all duration-300 border-border/60 hover:border-accent/40 hover:shadow-elevated",
            selectedId === preset.id ? "ring-2 ring-accent shadow-soft" : "",
          ].join(" ")}
        >
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline">{categoryLabel[preset.category]}</Badge>
              <Button size="sm" variant={selectedId === preset.id ? "default" : "outline"} onClick={() => onSelect(preset.id)}>
                {selectedId === preset.id ? "Selecionado" : "Usar preset"}
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">{preset.title}</h3>
              <p className="text-sm text-accent mt-1">{preset.headline}</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{preset.description}</p>

            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-foreground">Ideal para</p>
                <p className="text-muted-foreground">{preset.idealFor}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Direção visual</p>
                <p className="text-muted-foreground">{preset.visualDirection}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">CTA</p>
                <p className="text-muted-foreground">{preset.ctaStyle}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {preset.tags.map((tag) => (
                <span key={tag} className="text-xs rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <Button variant="ghost" size="sm" className="px-0" onClick={() => onSelect(preset.id)}>
                Aplicar na criação
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StylePresetGallery;
