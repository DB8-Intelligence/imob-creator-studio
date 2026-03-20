import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Clapperboard, Video, Eye } from "lucide-react";
import ModuleValueStrip from "@/components/modules/ModuleValueStrip";
import ModuleMetricCards from "@/components/modules/ModuleMetricCards";

const AnimateCreativePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    duration: "15",
    rhythm: "dinâmico",
    prompt: "Transformar o criativo em reels com zooms suaves, cortes rápidos e CTA final.",
    cta: "Agende sua visita agora",
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-card to-muted/40 p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-3">Módulo dedicado</Badge>
              <h1 className="text-3xl font-display font-bold text-foreground">Animar Criativo</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Transforme peças estáticas em ativos para reels, vídeo curto e campanhas com mais retenção.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 min-w-[220px]">
              <p className="text-xs text-muted-foreground">Resultado esperado</p>
              <p className="text-lg font-semibold text-foreground mt-1">Mais movimento, mais atenção</p>
            </div>
          </div>
        </section>

        <ModuleValueStrip creditsCost={3} estimatedOutput="ativo em movimento para reels/vídeo curto" upgradeHint="Esse módulo tende a exigir mais créditos e plano com escala." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "3 créditos", description: "Maior custo por envolver etapa de animação/render." },
          { label: "Objetivo", value: "Retenção", description: "Ideal para conteúdo com mais atenção e dinâmica." },
          { label: "Destino", value: "Vídeo", description: "Base para reels, anúncio curto e teaser do imóvel." },
        ]} />

        <div className="grid xl:grid-cols-[1fr,380px] gap-6">
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

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border/60 bg-gradient-to-br from-accent/10 to-transparent">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Resumo do render</h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground min-h-[220px] flex flex-col justify-between shadow-elevated">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-accent text-accent-foreground">{form.duration}s</Badge>
                    <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-white/10">{form.rhythm}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-primary-foreground/70">Preview de handoff</p>
                    <p className="text-lg font-display font-bold mt-2">{form.cta}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-muted/30 text-sm text-muted-foreground">
                  <Video className="w-4 h-4 text-accent mb-2" />
                  Esse MVP já deixa animação com briefing real e handoff operacional para a próxima etapa.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnimateCreativePage;
