import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ImageIcon, LayoutTemplate, Sparkles, Wand2 } from "lucide-react";

const CreateCreativeHub = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Badge className="bg-accent text-accent-foreground mb-3">Módulo principal</Badge>
          <h1 className="text-3xl font-display font-bold text-foreground">Criar Criativo</h1>
          <p className="text-muted-foreground mt-1">
            Escolha a forma mais rápida de iniciar sua produção imobiliária com IA.
          </p>
        </div>

        <ModuleValueStrip creditsCost={1} estimatedOutput="post imobiliário pronto para operação" upgradeHint="Planos maiores destravam volume e recorrência." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "1 crédito", description: "Melhor entrada para iniciar produção rápida." },
          { label: "Tempo", value: "2-5 min", description: "Fluxo guiado para reduzir fricção de criação." },
          { label: "Destino", value: "Inbox", description: "Segue para operação, revisão e publicação." },
        ]} />

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Fluxo guiado",
              desc: "Objetivo → formato → estilo → assets → texto → envio para operação.",
              icon: Sparkles,
              action: () => navigate("/upload"),
              cta: "Iniciar fluxo",
            },
            {
              title: "Escolher preset visual",
              desc: "Entre direto na biblioteca de estilos imobiliários para acelerar a decisão.",
              icon: Wand2,
              action: () => navigate("/templates"),
              cta: "Abrir presets",
            },
            {
              title: "Biblioteca operacional",
              desc: "Reabra criativos recentes e reutilize o que já foi produzido.",
              icon: ImageIcon,
              action: () => navigate("/library"),
              cta: "Ver biblioteca",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="hover:shadow-elevated transition-all border-border/60 hover:border-accent/40">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                  </div>
                  <Button className="w-full" onClick={item.action}>
                    {item.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateCreativeHub;
