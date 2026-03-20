import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Sparkles } from "lucide-react";

interface CreativeSpotlightProps {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
}

const CreativeSpotlight = ({ title, subtitle, imageUrl }: CreativeSpotlightProps) => {
  return (
    <Card className="overflow-hidden border-accent/20 bg-gradient-to-br from-card to-muted/30">
      <CardContent className="p-0 grid lg:grid-cols-[1.2fr,360px] gap-0">
        <div className="p-8">
          <Badge className="bg-accent text-accent-foreground mb-4">Destaque visual</Badge>
          <h2 className="text-3xl font-display font-bold text-foreground leading-tight">
            Biblioteca com aparência de <span className="text-accent">campanhas prontas</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Use a biblioteca como vitrine operacional: revise, reaproveite, publique e transforme histórico em prova de qualidade.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            {[
              ["rascunho", "para refino e aprovação"],
              ["agendado", "pronto para entrar no calendário"],
              ["publicado", "vira prova de operação"],
            ].map(([status, desc]) => (
              <div key={status} className="rounded-2xl border border-border/60 bg-card p-4">
                <p className="font-semibold text-foreground capitalize">{status}</p>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-8 border-t lg:border-t-0 lg:border-l border-border/60 bg-gradient-to-br from-accent/10 to-transparent">
          <div className="aspect-square rounded-3xl bg-card shadow-elevated overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-6">
                <ImageIcon className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-accent text-sm">
                  <Sparkles className="w-4 h-4" />
                  preview premium da biblioteca
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreativeSpotlight;
