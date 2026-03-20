import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Star, Zap } from "lucide-react";

const upgrades = [
  {
    icon: Zap,
    title: "Créditos → Pro",
    description: "Para quem quer sair do uso pontual e entrar em produção recorrente.",
  },
  {
    icon: Star,
    title: "Pro → VIP",
    description: "Para times, múltiplas contas, governança e evolução de operação.",
  },
  {
    icon: Crown,
    title: "VIP → implantação",
    description: "Para imobiliárias que querem estrutura mais próxima de um SaaS dedicado.",
  },
];

const UpgradePlannerCard = () => {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground">Escada de evolução do plano</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Organize upgrades por maturidade operacional, não só por preço.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {upgrades.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-border/60 p-4 bg-muted/30">
                <Icon className="w-5 h-5 text-accent mb-3" />
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
              </div>
            );
          })}
        </div>

        <Button asChild variant="outline">
          <Link to="/plano">
            Ver estrutura do plano
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePlannerCard;
