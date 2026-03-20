import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Layers, Sparkles } from "lucide-react";

const CreateSequencePage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Badge className="bg-accent text-accent-foreground mb-3">Módulo dedicado</Badge>
          <h1 className="text-3xl font-display font-bold text-foreground">Criar Sequência</h1>
          <p className="text-muted-foreground mt-1">
            Estruture carrosséis e narrativas imobiliárias como produto próprio, não só como template solto.
          </p>
        </div>

        <ModuleValueStrip creditsCost={2} estimatedOutput="carrossel/sequência de maior retenção" upgradeHint="Volume recorrente pede plano Pro ou superior." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "2 créditos", description: "Mais valor quando há vários slides e narrativa." },
          { label: "Uso ideal", value: "Carrossel", description: "Perfeito para diferenciais e explicação do imóvel." },
          { label: "Objetivo", value: "Retenção", description: "Mais espaço para storytelling e CTA final." },
        ]} />

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Layers className="w-6 h-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Carrossel de Benefícios</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Ideal para quebrar diferenciais por slide, conduzindo a leitura até o CTA.
                </p>
              </div>
              <Button onClick={() => navigate("/templates")}>Escolher estilo<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Sparkles className="w-6 h-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sequência guiada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Próxima etapa recomendada: fluxo com número de slides, narrativa e CTA por sequência.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/upload")}>Voltar ao fluxo base</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateSequencePage;
