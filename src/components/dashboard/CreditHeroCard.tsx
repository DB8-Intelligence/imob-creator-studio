import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreditHeroCardProps {
  credits: number | null;
  firstName: string;
}

const CreditHeroCard = ({ credits, firstName }: CreditHeroCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-accent/20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
      <CardContent className="p-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[90px]" />
        <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-accent text-accent-foreground">Dashboard criativo</Badge>
              <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-white/10">
                Benchmark-inspired UX
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              {firstName}, transforme imóveis em <span className="text-accent">posts, sequências e reels</span> com mais velocidade.
            </h1>
            <p className="text-primary-foreground/75 mt-4 max-w-xl">
              Uma home pensada para começar rápido: escolha o tipo de criação, entre no fluxo e acompanhe sua operação visual sem perder contexto.
            </p>
          </div>

          <div className="xl:min-w-[320px] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-sm font-medium">Saldo operacional</p>
            </div>
            <p className="text-4xl font-bold">{credits ?? 0}</p>
            <p className="text-sm text-primary-foreground/70 mt-1">créditos disponíveis para gerar novas peças</p>
            <div className="flex gap-3 mt-5">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1" onClick={() => navigate("/upload")}>
                <Zap className="w-4 h-4 mr-2" />
                Criar agora
              </Button>
              <Button variant="outline" className="border-white/20 text-primary-foreground hover:bg-white/10" onClick={() => navigate("/plano")}>
                Upgrade
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditHeroCard;
