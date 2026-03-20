import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { realEstateStylePresets } from "@/data/realEstateStylePresets";

const StylePresetPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Biblioteca de estilos imobiliários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use esses presets como referência para criar templates mais vendáveis e alinhados ao resultado esperado.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {realEstateStylePresets.slice(0, 4).map((preset) => (
            <div key={preset.id} className="rounded-xl border border-border/60 p-4 bg-muted/30">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-medium text-foreground">{preset.title}</p>
                <Badge variant="outline">{preset.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{preset.headline}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StylePresetPanel;
