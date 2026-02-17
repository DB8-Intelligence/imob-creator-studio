import { Button } from "@/components/ui/button";
import { ArrowRight, ImageUp, MessageSquareText, LayoutTemplate, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: ImageUp, text: "Upscale automático de imagens" },
  { icon: MessageSquareText, text: "Legendas persuasivas com CTA inteligente" },
  { icon: LayoutTemplate, text: "Aplicação de template profissional" },
  { icon: Send, text: "Publicação automática no Instagram" },
];

const WhatsAppAutomationSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle contrasting background */}
      <div className="absolute inset-0 bg-muted/50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Title */}
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Posts de imóveis automáticos:{" "}
            <span className="text-gradient">do WhatsApp direto pro Instagram</span>
          </h2>

          {/* Subtitle */}
          <div className="space-y-1 text-muted-foreground text-lg font-body">
            <p>Você envia fotos e texto no WhatsApp.</p>
            <p>A IA faz upscale, cria a legenda e prepara o post.</p>
            <p>Você aprova e ele publica.</p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-4">
            {features.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-left bg-background rounded-xl border border-border p-4 shadow-soft"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Button
              variant="hero"
              size="lg"
              className="group"
              onClick={() => navigate("/planos")}
            >
              👉 Quero ativar essa automação
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppAutomationSection;
