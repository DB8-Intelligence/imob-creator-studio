import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import ModuleValueStrip from "@/components/modules/ModuleValueStrip";
import ModuleMetricCards from "@/components/modules/ModuleMetricCards";

const CreateSequencePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    theme: "Carrossel de Benefícios",
    slides: "5",
    headline: "5 motivos para morar neste imóvel",
    cta: "Chame no WhatsApp para agendar visita",
    notes: "Destaque localização, acabamento, lazer e segurança.",
  });

  const previewSlides = Array.from({ length: Number(form.slides) || 0 }).slice(0, 6);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Badge className="bg-accent text-accent-foreground mb-3">Módulo dedicado</Badge>
          <h1 className="text-3xl font-display font-bold text-foreground">Criar Sequência</h1>
          <p className="text-muted-foreground mt-1">
            Monte carrosséis imobiliários com narrativa, número de slides e CTA mais claros.
          </p>
        </div>

        <ModuleValueStrip creditsCost={2} estimatedOutput="carrossel/sequência de maior retenção" upgradeHint="Volume recorrente pede plano Pro ou superior." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "2 créditos", description: "Mais valor quando há vários slides e narrativa." },
          { label: "Uso ideal", value: "Carrossel", description: "Perfeito para diferenciais e explicação do imóvel." },
          { label: "Objetivo", value: "Retenção", description: "Mais espaço para storytelling e CTA final." },
        ]} />

        <div className="grid xl:grid-cols-[1fr,360px] gap-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Briefing da sequência</h2>
                <p className="text-sm text-muted-foreground mt-1">Defina a estrutura mínima para transformar isso em um carrossel operacional.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Tema</Label>
                  <Input className="mt-1" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
                </div>
                <div>
                  <Label>Número de slides</Label>
                  <Input className="mt-1" type="number" min="3" max="10" value={form.slides} onChange={(e) => setForm({ ...form, slides: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Headline</Label>
                  <Input className="mt-1" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>CTA</Label>
                  <Input className="mt-1" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Notas para IA</Label>
                  <Textarea className="mt-1" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/templates")}>Escolher estilo</Button>
                <Button onClick={() => navigate("/editor", { state: { sequenceMode: true, sequenceBrief: form } })}>
                  Levar para editor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Preview estrutural</h3>
              </div>
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <p className="font-medium text-foreground">{form.headline}</p>
                <p className="text-sm text-muted-foreground mt-2">{form.theme}</p>
              </div>
              <div className="space-y-2">
                {previewSlides.map((_, index) => (
                  <div key={index} className="rounded-xl border border-border/60 p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">Slide {index + 1}</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {index === previewSlides.length - 1 ? form.cta : `Ponto ${index + 1} da narrativa`}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border/60 p-4 bg-muted/30 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-accent mb-2" />
                Esse MVP já deixa sequência como recurso real com briefing e handoff para o editor.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateSequencePage;
