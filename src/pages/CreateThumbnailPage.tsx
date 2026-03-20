import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ImageIcon, MousePointerClick, Eye } from "lucide-react";
import ModuleValueStrip from "@/components/modules/ModuleValueStrip";
import ModuleMetricCards from "@/components/modules/ModuleMetricCards";

const CreateThumbnailPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    headline: "Casa moderna com 5 suítes em Alphaville",
    subheadline: "Tour completo + área gourmet + condomínio premium",
    emphasis: "ALTO PADRÃO",
    notes: "Manter contraste forte, texto grande e foco em clique.",
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-card to-muted/40 p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-3">Módulo dedicado</Badge>
              <h1 className="text-3xl font-display font-bold text-foreground">Criar Thumbnail</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Monte capas orientadas por clique para anúncios, reels covers e campanhas visuais.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 min-w-[220px]">
              <p className="text-xs text-muted-foreground">Percepção</p>
              <p className="text-lg font-semibold text-foreground mt-1">Mais contraste, mais atenção</p>
            </div>
          </div>
        </section>

        <ModuleValueStrip creditsCost={1} estimatedOutput="thumbnail/capa orientada por clique" upgradeHint="Bom para operações com muito volume de criativo curto." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "1 crédito", description: "Entrada leve para capas e peças de atenção." },
          { label: "Objetivo", value: "Clique", description: "Mais contraste, texto curto e impacto visual." },
          { label: "Destino", value: "Campanhas", description: "Útil para anúncios, covers e chamadas fortes." },
        ]} />

        <div className="grid xl:grid-cols-[1fr,380px] gap-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Briefing da thumbnail</h2>
                <p className="text-sm text-muted-foreground mt-1">Defina a mensagem principal e leve isso para template/editor.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Headline principal</Label>
                  <Input className="mt-1" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
                </div>
                <div>
                  <Label>Subheadline</Label>
                  <Input className="mt-1" value={form.subheadline} onChange={(e) => setForm({ ...form, subheadline: e.target.value })} />
                </div>
                <div>
                  <Label>Texto de destaque</Label>
                  <Input className="mt-1" value={form.emphasis} onChange={(e) => setForm({ ...form, emphasis: e.target.value })} />
                </div>
                <div>
                  <Label>Notas para IA</Label>
                  <Textarea className="mt-1" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/brand-templates")}>Abrir templates</Button>
                <Button onClick={() => navigate("/editor", { state: { thumbnailMode: true, thumbnailBrief: form } })}>
                  Levar para editor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border/60 bg-gradient-to-br from-accent/10 to-transparent">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Preview de estrutura</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground flex flex-col justify-between shadow-elevated">
                  <div>
                    <Badge className="bg-accent text-accent-foreground">{form.emphasis}</Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold leading-tight">{form.headline}</p>
                    <p className="text-sm text-primary-foreground/70 mt-2">{form.subheadline}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30 text-sm text-muted-foreground">
                  <MousePointerClick className="w-4 h-4 text-accent mb-2" />
                  Esse MVP já permite estruturar uma thumbnail real e reutilizar isso no editor/export.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateThumbnailPage;
