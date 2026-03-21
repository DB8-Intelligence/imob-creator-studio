import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-hero opacity-[0.03]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-hero rounded-3xl p-12 sm:p-16 shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-[60px]" />

            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                Pronto para publicar seu próximo imóvel{" "}
                <span className="text-gradient">em menos de 5 minutos</span>?
              </h2>

              <p className="text-primary-foreground/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
                Entre, conecte seu WhatsApp e comece a gerar posts e reels imobiliários com template profissional, legenda com IA e aprovação antes de publicar.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Button asChild variant="hero" size="xl" className="group">
                  <Link to="/auth">
                    Começar gratuitamente
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="heroOutline" size="xl" className="group">
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5" />
                    Falar com especialista
                  </a>
                </Button>
              </div>

              <p className="text-primary-foreground/40 text-sm">
                Fluxo guiado · sem contrato · aprovação antes de publicar
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
