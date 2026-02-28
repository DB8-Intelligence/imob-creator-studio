import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArtGeneration, usePropertyCreatives, type ArtFormat } from "@/hooks/useArtGeneration";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Loader2,
  ImageIcon,
  Download,
  RefreshCw,
  Clock,
} from "lucide-react";

interface ArtGenerationPanelProps {
  propertyId: string;
  images: string[];
  title?: string;
  description?: string;
  brandId?: string;
  templateId?: string;
}

const FORMAT_OPTIONS = [
  { value: "feed", label: "Feed (1080×1080)", aspect: "aspect-square" },
  { value: "story", label: "Story (1080×1920)", aspect: "aspect-[9/16]" },
  { value: "reels", label: "Reels (1080×1920)", aspect: "aspect-[9/16]" },
];

const ArtGenerationPanel = ({
  propertyId,
  images,
  title,
  description,
  brandId,
}: ArtGenerationPanelProps) => {
  const [format, setFormat] = useState<ArtFormat>("feed");
  const [customPrompt, setCustomPrompt] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { isGenerating, generateArt } = useArtGeneration();
  const { data: creatives, isLoading: loadingCreatives } = usePropertyCreatives(propertyId);
  const queryClient = useQueryClient();

  const selectedImage = images[selectedImageIndex] || images[0];

  const handleGenerate = async () => {
    if (!selectedImage) return;

    const result = await generateArt({
      propertyId,
      imageUrl: selectedImage,
      title,
      description,
      brandId,
      format,
      customPrompt: customPrompt.trim() || undefined,
    });

    if (result) {
      setPreviewUrl(result.artUrl);
      queryClient.invalidateQueries({ queryKey: ["property-creatives", propertyId] });
    }
  };

  const aspectClass = format === "feed" ? "aspect-square" : "aspect-[9/16]";

  return (
    <div className="space-y-4">
      {/* Generator */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Gerar Arte com IA</h3>
          </div>

          {/* Source image selector */}
          {images.length > 1 && (
            <div>
              <Label className="text-xs text-muted-foreground">Imagem base</Label>
              <div className="flex gap-2 mt-1 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                      i === selectedImageIndex ? "border-accent" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Format */}
          <div>
            <Label>Formato</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ArtFormat)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom prompt */}
          <div>
            <Label>Instruções extras (opcional)</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Estilo minimalista, foco no jardim, tons quentes..."
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1">
            {["Minimalista", "Luxo dourado", "Moderno escuro", "Tons quentes"].map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="cursor-pointer hover:bg-muted text-xs"
                onClick={() => setCustomPrompt(s)}
              >
                {s}
              </Badge>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedImage}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando arte...</>
            ) : previewUrl ? (
              <><RefreshCw className="w-4 h-4 mr-2" /> Regenerar arte</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gerar arte</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Preview</h3>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" /> Baixar
                </Button>
              </a>
            </div>
            <div className={`${aspectClass} max-h-[400px] bg-muted rounded-lg overflow-hidden mx-auto`} style={{ maxWidth: format === "feed" ? "400px" : "225px" }}>
              <img src={previewUrl} alt="Arte gerada" className="w-full h-full object-contain" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Artes Geradas</h3>
            {creatives && creatives.length > 0 && (
              <Badge variant="secondary" className="text-xs">{creatives.length}</Badge>
            )}
          </div>

          {loadingCreatives ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !creatives || creatives.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Nenhuma arte gerada ainda
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {creatives.map((c) => (
                <button
                  key={c.id}
                  onClick={() => c.exported_url && setPreviewUrl(c.exported_url)}
                  className="group relative rounded-lg overflow-hidden border hover:border-accent transition-colors"
                >
                  {c.exported_url ? (
                    <img src={c.exported_url} alt={c.name} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {c.format}
                      </Badge>
                      <span className="text-[10px] text-white/70 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtGenerationPanel;
