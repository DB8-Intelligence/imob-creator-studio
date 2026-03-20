import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Coins, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleValueStripProps {
  creditsCost: number;
  estimatedOutput: string;
  upgradeHint: string;
}

const ModuleValueStrip = ({ creditsCost, estimatedOutput, upgradeHint }: ModuleValueStripProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/10 to-transparent">
      <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-accent text-accent-foreground">
            <Coins className="w-3.5 h-3.5 mr-1" />
            Custo estimado: {creditsCost} crédito{creditsCost > 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Saída esperada: {estimatedOutput}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{upgradeHint}</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/plano")}>
            Ver upgrade
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleValueStrip;
