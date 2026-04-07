/**
 * CaptionResultCards.tsx — Cards de resultado da geração de legendas
 *
 * Cards editáveis: Legenda, Hashtags (chips), CTA, Stories.
 * Botões: Copiar / Regenerar / Salvar.
 */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCw, Save, X, Hash, Type, Sparkles, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CaptionResult } from "@/hooks/useCaptionGenerator";

interface CaptionResultCardsProps {
  result: CaptionResult;
  onRegenerateField: (field: "legenda" | "hashtags" | "cta" | "storiesVersion") => void;
}

function CharCounter({ text, max }: { text: string; max: number }) {
  const len = text.length;
  return (
    <span className={`text-[10px] ${len > max ? "text-red-500" : "text-muted-foreground"}`}>
      {len}/{max}
    </span>
  );
}

export function CaptionResultCards({ result, onRegenerateField }: CaptionResultCardsProps) {
  const { toast } = useToast();
  const [legenda, setLegenda] = useState(result.legenda);
  const [hashtags, setHashtags] = useState(result.hashtags);
  const [cta, setCta] = useState(result.cta);
  const [stories, setStories] = useState(result.storiesVersion);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  const removeHashtag = (h: string) => setHashtags(hashtags.filter((x) => x !== h));

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-semibold text-foreground">Legenda Instagram</h4>
            </div>
            <CharCounter text={legenda} max={2200} />
          </div>
          <Textarea value={legenda} onChange={(e) => setLegenda(e.target.value)} rows={5} className="text-sm" />
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copy(legenda, "Legenda")}>
              <Copy className="w-3 h-3 mr-1" /> Copiar
            </Button>
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onRegenerateField("legenda")}>
              <RefreshCw className="w-3 h-3 mr-1" /> Regenerar
            </Button>
            <Button size="sm" variant="ghost" className="text-xs h-7">
              <Save className="w-3 h-3 mr-1" /> Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-foreground">Hashtags</h4>
              <Badge variant="secondary" className="text-[10px]">{hashtags.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {hashtags.map((h) => (
                <Badge key={h} variant="secondary" className="gap-1 pr-1 text-xs">
                  {h}
                  <button type="button" title={`Remover ${h}`} onClick={() => removeHashtag(h)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copy(hashtags.join(" "), "Hashtags")}>
                <Copy className="w-3 h-3 mr-1" /> Copiar todas
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onRegenerateField("hashtags")}>
                <RefreshCw className="w-3 h-3 mr-1" /> Regenerar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      {cta && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-foreground">Call to Action</h4>
            </div>
            <Textarea value={cta} onChange={(e) => setCta(e.target.value)} rows={2} className="text-sm" />
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copy(cta, "CTA")}>
                <Copy className="w-3 h-3 mr-1" /> Copiar
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onRegenerateField("cta")}>
                <RefreshCw className="w-3 h-3 mr-1" /> Regenerar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stories version */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-pink-500" />
            <h4 className="text-sm font-semibold text-foreground">Versão Stories</h4>
            <CharCounter text={stories} max={250} />
          </div>
          <Textarea value={stories} onChange={(e) => setStories(e.target.value)} rows={3} className="text-sm" />
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copy(stories, "Stories")}>
              <Copy className="w-3 h-3 mr-1" /> Copiar
            </Button>
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onRegenerateField("storiesVersion")}>
              <RefreshCw className="w-3 h-3 mr-1" /> Regenerar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
