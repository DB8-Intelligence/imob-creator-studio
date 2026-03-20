import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clapperboard, Video } from "lucide-react";
import ModuleValueStrip from "@/components/modules/ModuleValueStrip";
import ModuleMetricCards from "@/components/modules/ModuleMetricCards";

const AnimateCreativePage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Badge className="bg-accent text-accent-foreground mb-3">Módulo dedicado</Badge>
          <h1 className="text-3xl font-display font-bold text-foreground">Animar Criativo</h1>
          <p className="text-muted-foreground mt-1">
            Transforme peças estáticas em ativos para reels, vídeo curto e campanhas com mais retenção.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Clapperboard className="w-6 h-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Base para animação</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Reaproveite criativos prontos da biblioteca para transformar em peças em movimento.
                </p>
              </div>
              <Button onClick={() => navigate("/library")}>Escolher criativo<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Video className="w-6 h-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Próxima evolução</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Etapa futura: duração, ritmo, prompt de vídeo e custo operacional por render.
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

export default AnimateCreativePage;
