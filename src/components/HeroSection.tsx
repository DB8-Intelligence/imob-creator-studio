import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroProperty from "@/assets/hero-property.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-hero" />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroProperty})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[80px] animate-float animation-delay-300" />

      <div className="relative container mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="opacity-0 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/80 text-sm font-medium backdrop-blur-sm mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            WhatsApp → IA → aprovação → Instagram
          </span>
        </div>

        <h1 className="opacity-0 animate-fade-up animation-delay-100 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground max-w-5xl leading-tight mb-6">
          Gere <span className="text-gradient">posts e reels imobiliários</span> com IA
          <br className="hidden md:block" />
          sem depender de processo manual
        </h1>

        <p className="opacity-0 animate-fade-up animation-delay-200 text-lg sm:text-xl text-primary-foreground/70 max-w-3xl mb-10 font-body">
          Receba fotos e informações do imóvel, gere criativos com template profissional, legenda com CTA e publique com aprovação. Uma operação mais rápida para corretores e imobiliárias.
        </p>

        <div className="opacity-0 animate-fade-up animation-delay-300 flex flex-col sm:flex-row items-center gap-4">
          <Button asChild variant="hero" size="xl" className="group">
            <Link to="/auth">
              Começar agora
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="heroOutline" size="xl" className="group">
            <a href="#como-funciona">
              <Play className="w-5 h-5" />
              Ver fluxo da automação
            </a>
          </Button>
        </div>

        <div className="opacity-0 animate-fade-up animation-delay-400 flex flex-wrap justify-center gap-8 sm:gap-16 mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">1 fluxo</p>
            <p className="text-sm text-primary-foreground/60 mt-1">do WhatsApp ao Instagram</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">IA + templates</p>
            <p className="text-sm text-primary-foreground/60 mt-1">para acelerar produção</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">Aprovação</p>
            <p className="text-sm text-primary-foreground/60 mt-1">antes de publicar</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 40C1440 40 1320 0 720 0C120 0 0 40 0 40L0 80Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
