import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Instagram, MessageCircle, Sparkles } from "lucide-react";

const steps = [
  { icon: MessageCircle, title: "WhatsApp", desc: "entrada do imóvel e dos materiais" },
  { icon: Sparkles, title: "IA", desc: "geração do criativo e copy" },
  { icon: CheckCircle2, title: "Aprovação", desc: "validação antes da publicação" },
  { icon: Instagram, title: "Instagram", desc: "postagem e acompanhamento" },
];

const OperationPipelineBanner = () => {
  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/10 to-transparent overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <Badge className="bg-accent text-accent-foreground">Pipeline operacional</Badge>
          <p className="text-sm text-muted-foreground">Diferencial do produto frente a geradores mais genéricos</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-2xl border border-border/60 bg-card p-4">
                <Icon className="w-5 h-5 text-accent mb-3" />
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationPipelineBanner;
