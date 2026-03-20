import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ImageIcon, MousePointerClick } from "lucide-react";

const CreateThumbnailPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Badge className="bg-accent text-accent-foreground mb-3">Módulo dedicado</Badge>
          <h1 className="text-3xl font-display font-bold text-foreground">Criar Thumbnail</h1>
          <p className="text-muted-foreground mt-1">
            Organize capas com mais impacto para anúncios, reels covers e campanhas de clique.
          </p>
        </div>

        <ModuleValueStrip creditsCost={1} estimatedOutput="thumbnail/capa orientada por clique" upgradeHint="Bom para operações com muito volume de criativo curto." />

        <ModuleMetricCards items={[
          { label: "Custo", value: "1 crédito", description: "Entrada leve para capas e peças de atenção." },
          { label: "Objetivo", value: "Clique", description: "Mais contraste, texto curto e impacto visual." },
          { label: "Destino", value: "Campanhas", description: "Útil para anúncios, covers e chamadas fortes." },
        ]} />

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <ImageIcon className="w-6 h-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Thumbnail orientada por clique</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Use títulos curtos, contraste e expressão visual forte para aumentar atenção.
                </p>
              </div>
              <Button onClick={() => navigate("/brand-templates")}>Abrir templates<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <MousePointerClick className="w-6 h-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Próxima evolução</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Etapa futura: fluxo dedicado com headline, subtítulo, imagens e custo por ação.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Voltar ao dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateThumbnailPage;
