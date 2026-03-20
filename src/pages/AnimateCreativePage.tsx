import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Clapperboard, Video } from "lucide-react";
import ModuleValueStrip from "@/components/modules/ModuleValueStrip";
import ModuleMetricCards from "@/components/modules/ModuleMetricCards";

const AnimateCreativePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    duration: "15",
    rhythm: "dinamico",
    prompt: "Transformar o criativo em reels com zooms suaves, cortes rápidos e CTA final.",
    cta: "Agende sua visita agora",
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Badge className="bg-accent text-accent-foreground mb-3">Módulo dedicado</Badge>
          <h1 className="text-3xl font-display font-bold text-foreground">Animar Criativo</h1>
          <p className="text-muted-foreground mt-1">
            Transforme peças estáticas em ativos para reels, vídeo curto e campanhas com mais retenção.
          </p>
        </div>

        <ModuleValueStrip creditsCost={3} estimatedOutput="ativo em movimento para reels/vídeo curto" upgradeHint="Esse módulo tende a exigir mais créditos e plano com escala." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "3 créditos", description: "Maior custo por envolver etapa de animação/render." },
          { label: "Objetivo", value: "Retenção", description: "Ideal para conteúdo com mais atenção e dinâmica." },
          { label: "Destino", value: "Vídeo", description: "Base para reels, anúncio curto e teaser do imóvel." },
        ]} />

        <div className="grid xl:grid-cols-[1fr,360px] gap-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Configuração da animação</h2>
                <p className="text-sm text-muted-foreground mt-1">Defina o comportamento base para o vídeo antes de mandar para produção.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Duração (segundos)</Label>
                  <Input className="mt-1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div>
                  <Label>Ritmo</Label>
                  <Input className="mt-1" value={form.rhythm} onChange={(e) => setForm({ ...form, rhythm: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Prompt de animação</Label>
                  <Textarea className="mt-1" rows={4} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>CTA final</Label>
                  <Input className="mt-1" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/library")}>Escolher criativo</Button>
                <Button onClick={() => navigate("/export", { state: { animationMode: true, animationBrief: form } })}>
                  Preparar handoff
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Resumo do render</h3>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="font-medium text-foreground mt-1">{form.duration}s</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Ritmo</p>
                  <p className="font-medium text-foreground mt-1 capitalize">{form.rhythm}</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">CTA final</p>
                  <p className="font-medium text-foreground mt-1">{form.cta}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-4 bg-muted/30 text-sm text-muted-foreground">
                <Video className="w-4 h-4 text-accent mb-2" />
                Esse MVP já deixa animação com briefing real e handoff operacional para a próxima etapa.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnimateCreativePage;
