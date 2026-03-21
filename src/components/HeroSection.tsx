import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Video } from "lucide-react";
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/80 text-sm font-medium backdrop-blur-sm mb-4">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Dashboard → IA → aprovação → Instagram
          </span>
        </div>

        <div className="opacity-0 animate-fade-up animation-delay-100 mb-6 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-2 text-sm font-semibold text-accent">
            <Sparkles className="w-4 h-4" />
            Posts, reels e copy com IA
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-2 text-sm font-semibold text-primary-foreground/80">
            <Video className="w-4 h-4" />
            Novo add-on: vídeos de imóveis com IA
          </span>
        </div>

        <h1 className="opacity-0 animate-fade-up animation-delay-100 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground max-w-6xl leading-tight mb-6">
          Gere <span className="text-gradient">criativos, copy e vídeos imobiliários</span> com IA
          <br className="hidden md:block" />
          em uma única operação
        </h1>

        <p className="opacity-0 animate-fade-up animation-delay-200 text-lg sm:text-xl text-primary-foreground/70 max-w-4xl mb-10 font-body">
          Centralize upload, análise de imagem, geração de copy, aprovação e publicação. E agora adicione vídeos prontos para Reels, Feed e YouTube direto no ImobCreator AI.
        </p>

        <div className="opacity-0 animate-fade-up animation-delay-300 flex flex-col sm:flex-row items-center gap-4">
          <Button asChild variant="hero" size="xl" className="group">
            <Link to="/auth">
              Começar agora
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="heroOutline" size="xl" className="group">
            <a href="#videos-ia">
              <Play className="w-5 h-5" />
              Ver módulo de vídeo
            </a>
          </Button>
        </div>

        <div className="opacity-0 animate-fade-up animation-delay-400 flex flex-wrap justify-center gap-8 sm:gap-16 mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">&lt; 5 min</p>
            <p className="text-sm text-primary-foreground/60 mt-1">para gerar criativo e copy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">4 formatos</p>
            <p className="text-sm text-primary-foreground/60 mt-1">Feed, Story, Reels e vídeo</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">100% IA</p>
            <p className="text-sm text-primary-foreground/60 mt-1">copy, visual e fluxo de aprovação</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">Nova receita</p>
            <p className="text-sm text-primary-foreground/60 mt-1">vídeos IA como add-on vendável</p>
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
