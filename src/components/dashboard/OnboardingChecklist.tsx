import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Defina sua marca",
    description: "Escolha a marca que vai orientar templates, identidade e produção.",
    href: "/dashboard",
    done: true,
  },
  {
    title: "Suba seu primeiro imóvel",
    description: "Envie fotos, dados estratégicos e inicie o fluxo da IA.",
    href: "/upload",
    done: false,
  },
  {
    title: "Revise no inbox",
    description: "Acompanhe o conteúdo recebido e avance o status de aprovação.",
    href: "/inbox",
    done: false,
  },
  {
    title: "Padronize templates",
    description: "Crie brand kits para manter consistência na produção.",
    href: "/brand-templates",
    done: false,
  },
];

const OnboardingChecklist = () => {
  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-accent mb-2">Onboarding inicial</p>
            <h2 className="text-2xl font-display font-bold text-foreground">Ative sua operação em 4 passos</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Use esse checklist para sair do setup e entrar no fluxo real de produção imobiliária.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <Link
              key={step.title}
              to={step.href}
              className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 hover:border-accent/40 hover:shadow-soft transition-all"
            >
              <div className="flex items-start gap-3">
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Passo {index + 1}</p>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
