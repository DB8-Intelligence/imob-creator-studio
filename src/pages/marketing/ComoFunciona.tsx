import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Instagram, ArrowRight, ImageIcon, Type, Layers, Send } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MessageSquare,
    title: "Corretor envia fotos + texto no WhatsApp",
    desc: "Basta mandar as fotos do imóvel e uma breve descrição pelo WhatsApp. Não precisa de app, login ou complicação.",
    details: ["Envie até 20 fotos por imóvel", "Texto livre com dados do imóvel", "Funciona no WhatsApp comum"],
  },
  {
    num: "02",
    icon: Sparkles,
    title: "IA processa automaticamente",
    desc: "Nossa inteligência artificial faz upscale das fotos, gera legendas otimizadas para engajamento e aplica o template da sua marca.",
    details: ["Upscale em alta resolução", "Legenda com hashtags e CTA", "Template com sua identidade visual"],
  },
  {
    num: "03",
    icon: Instagram,
    title: "Aprove e publique no Instagram",
    desc: "Revise o post pronto no painel, edite se necessário e publique direto no Instagram com um clique.",
    details: ["Preview antes de publicar", "Edição de legenda e CTA", "Publicação automática no feed"],
  },
];

const creditActions = [
  { icon: ImageIcon, action: "Upscale de imagem", credits: 1 },
  { icon: Type, action: "Geração de legenda", credits: 1 },
  { icon: Layers, action: "Montagem de template", credits: 1 },
  { icon: Send, action: "Publicação no Instagram", credits: 1 },
];

const ComoFunciona = () => (
  <MarketingLayout>
    <section className="pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Do WhatsApp ao Instagram em{" "}
            <span className="text-gradient">3 passos</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Um fluxo simples e poderoso para automatizar sua presença digital.
          </p>
        </div>

        <div className="space-y-16 max-w-4xl mx-auto">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-accent-gradient shadow-glow flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-primary">{s.num}</span>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold text-foreground mb-3">{s.title}</h2>
                <p className="text-muted-foreground text-lg mb-4">{s.desc}</p>
                <ul className="space-y-2">
                  {s.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Credits breakdown */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Consumo de Créditos por Ação
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creditActions.map((c) => (
              <div key={c.action} className="p-6 rounded-xl bg-card border border-border/50 text-center shadow-soft">
                <c.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">{c.action}</p>
                <p className="text-2xl font-bold text-accent">{c.credits}</p>
                <p className="text-xs text-muted-foreground">crédito{c.credits > 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="xl" asChild className="group">
            <Link to="/auth">
              Começar Agora
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  </MarketingLayout>
);

export default ComoFunciona;
