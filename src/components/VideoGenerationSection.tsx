import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Sliders, Download, Zap, Clock, Film, Star, Layers3, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Suba suas fotos",
    description: "Envie de 6 a 20 fotos do imóvel direto na plataforma. Quanto mais fotos, mais completo o vídeo.",
  },
  {
    number: "02",
    icon: Sliders,
    title: "Escolha o estilo",
    description: "Selecione o formato (Reels, Feed, YouTube), estilo visual (Cinematic, Moderno, Luxury) e duração.",
  },
  {
    number: "03",
    icon: Download,
    title: "Baixe o vídeo",
    description: "Em minutos, seu vídeo está renderizado em até 4K Ultra HD, pronto para publicar nas redes.",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Velocidade",
    description: "Vídeo pronto em poucos minutos. Sem editor, sem equipe de filmagem.",
  },
  {
    icon: Film,
    title: "Qualidade Cinema",
    description: "Renderização em até 4K Ultra HD com transições e trilha profissional.",
  },
  {
    icon: Zap,
    title: "Multi-formato",
    description: "Um clique gera versões para Reels, YouTube e Feed automaticamente.",
  },
  {
    icon: Star,
    title: "Sem edição manual",
    description: "A IA monta o vídeo com as fotos e dados do imóvel. Zero linha do tempo.",
  },
];

const videoPricingPlans = [
  {
    name: "Vídeo Starter",
    videos: "5 vídeos/mês",
    resolution: "1080p Full HD",
    price: "Add-on do plano Créditos",
    badge: "Entrada",
    featured: false,
  },
  {
    name: "Vídeo Pro",
    videos: "20 vídeos/mês",
    resolution: "4K Ultra HD",
    price: "Add-on do plano Pro",
    badge: "Mais escolhido",
    featured: true,
  },
  {
    name: "Vídeo Enterprise",
    videos: "Volume customizado",
    resolution: "4K + suporte dedicado",
    price: "Sob proposta",
    badge: "Imobiliárias",
    featured: false,
  },
];

const VideoGenerationSection = () => {
  return (
    <section id="videos-ia" className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary text-sm font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            Novo módulo vendável
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Transforme fotos de imóveis em <span className="text-gradient">vídeos cinematográficos</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Agora dentro do ImobCreator AI: gere vídeos profissionais em 4K para Reels, YouTube e Feed — sem equipe, sem edição e com possibilidade de vender como add-on para seus clientes.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,0.9fr] gap-6 mb-16">
          <div className="rounded-3xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Layers3 className="w-5 h-5 text-accent" />
              <h3 className="font-display text-2xl font-bold text-primary-foreground">Complemento ideal do ImobCreator AI</h3>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed mb-5">
              O módulo de vídeo amplia o posicionamento do produto: em vez de vender só posts e reels, o sistema passa a vender uma linha completa de produção imobiliária com IA.
            </p>
            <ul className="space-y-3 text-primary-foreground/75">
              <li>• Use como upsell para clientes que já compram criativos e copy</li>
              <li>• Ofereça pacotes mensais e enterprise com geração de vídeo dentro do painel</li>
              <li>• Centralize biblioteca, formatos e histórico no mesmo workspace</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-accent/20 bg-accent/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <h3 className="font-display text-2xl font-bold text-primary-foreground">Mensagem comercial recomendada</h3>
            </div>
            <p className="text-primary-foreground/75 leading-relaxed mb-4">
              “Gere posts, reels e vídeos de imóveis com IA em um único sistema — com identidade visual, aprovação e biblioteca organizada.”
            </p>
            <div className="rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-4 text-sm text-primary-foreground/70">
              Isso posiciona o produto acima de ferramentas focadas apenas em vídeo, porque conecta mídia estática, copy e vídeo em uma operação só.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-20 pb-16 border-b border-primary-foreground/10">
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-primary-foreground">&lt; 3 min</p>
            <p className="text-sm text-primary-foreground/50 mt-1">do upload ao vídeo pronto</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-primary-foreground">4K Ultra HD</p>
            <p className="text-sm text-primary-foreground/50 mt-1">qualidade cinematográfica</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-primary-foreground">100% IA</p>
            <p className="text-sm text-primary-foreground/50 mt-1">sem edição manual</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-primary-foreground">Novo ticket</p>
            <p className="text-sm text-primary-foreground/50 mt-1">add-on por créditos de vídeo</p>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-center text-primary-foreground/60 text-sm font-semibold uppercase tracking-widest mb-10">
            Como funciona
          </h3>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-gradient shadow-glow mb-5">
                    <span className="font-display text-xl font-bold text-primary">{step.number}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-4 mx-auto">
                    <step.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-primary-foreground mb-2">{step.title}</h4>
                  <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm hover:bg-primary-foreground/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-semibold text-primary-foreground mb-1">{b.title}</h4>
              <p className="text-primary-foreground/55 text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>

        <div id="planos-videos" className="mb-14">
          <h3 className="text-center text-primary-foreground/60 text-sm font-semibold uppercase tracking-widest mb-10">
            Planos de vídeo
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {videoPricingPlans.map((p) => (
              <div
                key={p.name}
                className={[
                  "rounded-2xl border p-6 transition-all",
                  p.featured
                    ? "border-accent/50 bg-accent/10 scale-[1.02] shadow-glow"
                    : "border-primary-foreground/15 bg-primary-foreground/5",
                ].join(" ")}
              >
                {p.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent text-primary text-xs font-bold mb-3">
                    {p.badge}
                  </span>
                )}
                <h4 className="font-display font-bold text-primary-foreground text-lg mb-1">{p.name}</h4>
                <p className="text-primary-foreground/60 text-sm mb-4">{p.videos} · {p.resolution}</p>
                <p className="font-semibold text-accent">{p.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button asChild variant="hero" size="xl" className="group">
            <Link to="/video-creator">
              Criar meu primeiro vídeo
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <p className="text-primary-foreground/40 text-sm mt-4">
            Disponível nos planos Pro e VIP · Starter disponível como add-on
          </p>
        </div>
      </div>
    </section>
  );
};

export default VideoGenerationSection;
