import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, PlayCircle, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";

const pillars = [
  {
    title: "Vídeo como upsell real",
    description:
      "Transforme o ImobCreator AI em plataforma de criativo + copy + vídeo, aumentando ticket médio por corretor e por imobiliária.",
    icon: Sparkles,
  },
  {
    title: "3 passos com baixa fricção",
    description:
      "Upload das fotos, escolha do estilo e download do vídeo. Uma experiência simples, parecida com a do concorrente, mas integrada ao nosso ecossistema.",
    icon: Wand2,
  },
  {
    title: "Venda recorrente por créditos",
    description:
      "Ofereça pacotes mensais, add-ons e enterprise com geração de vídeo direto no painel do cliente.",
    icon: PlayCircle,
  },
];

const comparisonRows = [
  {
    label: "Entrada do conteúdo",
    imovie: "Fotos → estilo → vídeo pronto",
    imobcreator: "Dashboard → upload → vídeo IA + copy + criativos",
  },
  {
    label: "Modelo comercial",
    imovie: "Assinatura por volume de vídeos",
    imobcreator: "Plano base + add-on de vídeo + enterprise",
  },
  {
    label: "Diferencial competitivo",
    imovie: "Vídeo rápido com IA",
    imobcreator: "Criativo, copy, aprovação e vídeo na mesma plataforma",
  },
  {
    label: "Monetização",
    imovie: "Créditos de vídeo",
    imobcreator: "Créditos de conteúdo + créditos de vídeo + multi-tenant",
  },
];

const rollout = [
  "Adicionar módulo 'Vídeos com IA' como produto complementar no dashboard",
  "Oferecer compra de pacotes Starter, Pro e Enterprise dentro do plano do cliente",
  "Posicionar como upsell para Reels, anúncios e apresentação de imóveis premium",
  "Integrar com biblioteca para armazenar vídeos gerados por imóvel/campanha",
];

const VideoModuleComparisonSection = () => {
  return (
    <section id="video-upsell" className="py-24 bg-muted/40">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/10">Nova frente de receita</Badge>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Oportunidade clara: vender <span className="text-gradient">vídeos IA</span> como módulo adicional
          </h2>
          <p className="text-lg text-muted-foreground">
            O iMOVIE provou a demanda. O ImobCreator AI pode capturar esse mercado com uma oferta mais forte: vídeo,
            criativo e copy dentro do mesmo painel.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft overflow-hidden">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Comparativo estratégico</p>
              <h3 className="font-display text-2xl font-bold text-foreground mt-2">iMOVIE vs ImobCreator AI com módulo de vídeo</h3>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60">
              <div className="grid grid-cols-[0.9fr,1fr,1fr] bg-muted/60 text-sm font-semibold text-foreground">
                <div className="p-4">Critério</div>
                <div className="p-4 border-l border-border/60">iMOVIE</div>
                <div className="p-4 border-l border-border/60 bg-accent/10 text-accent">ImobCreator AI</div>
              </div>
              {comparisonRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[0.9fr,1fr,1fr] text-sm border-t border-border/60">
                  <div className="p-4 font-medium text-foreground">{row.label}</div>
                  <div className="p-4 border-l border-border/60 text-muted-foreground">{row.imovie}</div>
                  <div className="p-4 border-l border-border/60 text-foreground bg-accent/5">{row.imobcreator}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-accent/20 bg-primary text-primary-foreground p-6 shadow-elevated">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60 mb-3">Plano de produto</p>
            <h3 className="font-display text-2xl font-bold mb-5">Como vender esse módulo</h3>
            <ul className="space-y-3 mb-8">
              {rollout.map((item) => (
                <li key={item} className="flex items-start gap-3 text-primary-foreground/85">
                  <Check className="w-5 h-5 mt-0.5 text-accent flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-6">
              <p className="text-sm text-primary-foreground/65">Posicionamento recomendado</p>
              <p className="font-semibold mt-1">
                “Posts, reels e vídeos de imóveis com IA no mesmo sistema — com brand kit, aprovação e biblioteca.”
              </p>
            </div>

            <Button asChild variant="hero" size="lg" className="w-full group">
              <Link to="/video-creator">
                Ver módulo de vídeo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoModuleComparisonSection;
