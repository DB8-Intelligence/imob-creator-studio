import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clapperboard, ImageIcon, LayoutTemplate, Sparkles, Wand2 } from "lucide-react";

const actions = [
  {
    title: "Criar Criativo",
    description: "Gere posts imobiliários com IA, template e CTA em um fluxo guiado.",
    badge: "Principal",
    icon: Sparkles,
    href: "/create",
  },
  {
    title: "Criar Sequência",
    description: "Monte carrosséis e narrativas visuais para destacar benefícios do imóvel.",
    badge: "Carrossel",
    icon: LayoutTemplate,
    href: "/create/sequence",
  },
  {
    title: "Criar Thumbnail",
    description: "Prepare capas para anúncios, vídeos e peças com maior taxa de clique.",
    badge: "Conversão",
    icon: ImageIcon,
    href: "/create/thumbnail",
  },
  {
    title: "Animar Criativo",
    description: "Evolua o criativo em reels e assets em movimento para ampliar impacto.",
    badge: "Vídeo",
    icon: Clapperboard,
    href: "/create/animate",
  },
  // Vídeo IA — implementação futura (oculto do dashboard)
];

const ActionCardsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Comece por aqui</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha um modo de criação e entre no fluxo mais rápido para produzir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="group border-border/60 hover:border-accent/40 hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline">{action.badge}</Badge>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{action.description}</p>
                </div>

                <Button className="mt-6 w-full group" onClick={() => navigate(action.href)}>
                  Abrir modo
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 to-transparent p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Próximo nível recomendado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Depois da geração, leve o criativo para aprovação, publicação e automação operacional.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/inbox")}>Ir para inbox</Button>
      </div>
    </section>
  );
};

export default ActionCardsSection;
