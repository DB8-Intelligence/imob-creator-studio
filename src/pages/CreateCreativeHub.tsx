import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ImageIcon, LayoutTemplate, Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import ModuleValueStrip from "@/components/modules/ModuleValueStrip";
import ModuleMetricCards from "@/components/modules/ModuleMetricCards";

const CreateCreativeHub = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Fluxo guiado",
      desc: "Objetivo → formato → estilo → assets → texto → envio para operação.",
      icon: Sparkles,
      action: () => navigate("/upload"),
      cta: "Iniciar fluxo",
      proof: "melhor para primeira criação",
    },
    {
      title: "Escolher preset visual",
      desc: "Entre direto na biblioteca de estilos imobiliários para acelerar a decisão.",
      icon: Wand2,
      action: () => navigate("/templates"),
      cta: "Abrir presets",
      proof: "mais rápido para operação recorrente",
    },
    {
      title: "Biblioteca operacional",
      desc: "Reabra criativos recentes e reutilize o que já foi produzido.",
      icon: ImageIcon,
      action: () => navigate("/library"),
      cta: "Ver biblioteca",
      proof: "melhor para reaproveitamento",
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
          <div className="relative grid xl:grid-cols-[1.2fr,420px] gap-6 items-center">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-4">Módulo principal</Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                Crie peças imobiliárias com <span className="text-accent">cara de campanha pronta</span>
              </h1>
              <p className="text-primary-foreground/75 mt-4 max-w-2xl">
                Um módulo pensado para tirar você da tela em branco e levar direto para criação, operação e publicação com mais clareza visual.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mt-6">
                {[
                  ["1 crédito", "custo de entrada"],
                  ["2-5 min", "tempo médio do fluxo"],
                  ["Inbox", "destino operacional"],
                ].map(([value, label]) => (
                  <div key={value} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-primary-foreground/70 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Badge className="bg-accent text-accent-foreground">Luxo Premium</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-white/10">Preview</Badge>
                </div>
                <div className="space-y-3">
                  <div className="h-40 rounded-xl bg-white/10 border border-white/10" />
                  <div>
                    <p className="text-2xl font-display font-bold">Casa moderna em Alphaville</p>
                    <p className="text-sm text-primary-foreground/70 mt-1">5 suítes • 630m² • condomínio premium</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-accent">R$ 3,2 mi</p>
                    <span className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold">Agendar visita</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ModuleValueStrip creditsCost={1} estimatedOutput="post imobiliário pronto para operação" upgradeHint="Planos maiores destravam volume e recorrência." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "1 crédito", description: "Melhor entrada para iniciar produção rápida." },
          { label: "Tempo", value: "2-5 min", description: "Fluxo guiado para reduzir fricção de criação." },
          { label: "Destino", value: "Inbox", description: "Segue para operação, revisão e publicação." },
        ]} />

        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="hover:shadow-elevated transition-all border-border/60 hover:border-accent/40 overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-28 bg-gradient-to-br from-accent/10 to-transparent border-b border-border/60 p-6 flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline">{item.proof}</Badge>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                    </div>
                    <Button className="w-full" onClick={item.action}>
                      {item.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <LayoutTemplate className="w-6 h-6 text-accent mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Como esse módulo se conecta ao resto do produto</p>
              <p className="text-sm text-muted-foreground mt-2">
                O criativo nasce aqui, segue para inbox/aprovação e depois pode virar publicação, biblioteca, sequência, thumbnail ou peça animada.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                {[
                  "briefing guiado",
                  "presets imobiliários",
                  "aprovação operacional",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateCreativeHub;
