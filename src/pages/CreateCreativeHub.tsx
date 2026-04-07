import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Wand2,
  ImageIcon,
  Bot,
  Zap,
  Diamond,
  MousePointer2,
  CheckCircle2,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";

const PILARES = [
  {
    icon: Zap,
    title: "Agilidade Extrema",
    desc: "Criativos incríveis gerados em questão de segundos. Nunca perca o timing de uma tendência.",
  },
  {
    icon: Diamond,
    title: "Qualidade Profissional",
    desc: "Designs de impacto que elevam o padrão da sua presença digital no Instagram e Facebook.",
  },
  {
    icon: MousePointer2,
    title: "Simplicidade Absoluta",
    desc: "Interface projetada para empreendedores. Resultados profissionais sem conhecimento técnico.",
  },
];

const COMPARATIVO = [
  { criterio: "Velocidade de Execução", tradicional: "Horas ou dias", ia: "Pronto em segundos" },
  { criterio: "Barreira Técnica", tradicional: "Exige software e habilidades", ia: "Interface simples, zero técnica" },
  { criterio: "Custo de Entrada", tradicional: "Alto custo de produção", ia: "Incluído no seu plano" },
  { criterio: "Consistência", tradicional: "Depende do designer", ia: "Padrão profissional sempre" },
  { criterio: "Escalabilidade", tradicional: "Mais pessoal = mais volume", ia: "1 gestor → volume massivo" },
];

const FLUXOS = [
  {
    id: "studio",
    icon: Bot,
    badge: "Novo",
    badgePrimary: true,
    title: "Assistente IA ou Formulário",
    desc: "Dois modos: deixe a IA te guiar passo a passo, ou preencha o formulário direto. Escolha template, faça upload, defina copy e gere criativos profissionais.",
    steps: ["Upload + tema", "IA gera copy", "Criativo pronto na biblioteca"],
    cta: "Abrir Criador de Criativos",
    path: "/create/studio",
  },
  {
    id: "ideia",
    icon: Wand2,
    badge: "Rápido",
    badgePrimary: false,
    title: "A partir de uma ideia",
    desc: "Digite seu conceito ou ideia. A IA refina o texto e gera o post ou anúncio profissional em segundos — sem precisar saber design.",
    steps: ["Descreva sua ideia", "Escolha canal e formato", "IA gera o criativo"],
    cta: "Criar a partir de ideia",
    path: "/create/ideia",
  },
  {
    id: "imovel",
    icon: ImageIcon,
    badge: "Fluxo completo",
    badgePrimary: false,
    title: "A partir de um imóvel",
    desc: "Envie fotos e dados do imóvel. A IA cria posts, anúncios e carrosséis imobiliários com identidade visual profissional.",
    steps: ["Dados e fotos do imóvel", "Escolha estilo e formato", "IA gera o criativo"],
    cta: "Criar a partir de imóvel",
    path: "/upload",
  },
];

const CreateCreativeHub = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-12">

        {/* ── HERO ── */}
        <section className="text-center space-y-4 pt-4">
          <Badge className="bg-accent/10 text-accent border border-accent/20">
            Automação Criativa com IA
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
            Do pensamento ao{" "}
            <span className="text-accent">post profissional</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A inteligência artificial assume a complexidade técnica. Você fornece a ideia —
            nós entregamos o criativo pronto em segundos.
          </p>
          <div className="flex items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
              Instagram
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Facebook
            </span>
          </div>
        </section>

        {/* ── DIAGRAMA 3 PASSOS ── */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { step: "01", label: "Sua Ideia", desc: "Digite o conceito ou objetivo" },
            { step: "02", label: "Automação Criativa (IA)", desc: "Layout, tipografia e cores aplicados automaticamente", highlight: true },
            { step: "03", label: "Postagem Profissional", desc: "Pronto para Instagram e Facebook" },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className={`rounded-2xl border p-5 text-center space-y-2 h-full ${
                item.highlight
                  ? "bg-accent/5 border-accent/30"
                  : "bg-card border-border/60"
              }`}>
                <p className="text-xs font-mono text-muted-foreground/50">{item.step}</p>
                <p className="font-semibold text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {i < 2 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 absolute top-1/2 -right-2 -translate-y-1/2 z-10" />
              )}
            </div>
          ))}
        </section>

        {/* ── DOIS FLUXOS DE ENTRADA ── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Como você quer começar?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {FLUXOS.map((fluxo) => {
              const Icon = fluxo.icon;
              return (
                <Card
                  key={fluxo.id}
                  className="border-border/60 hover:border-accent/40 hover:shadow-elevated transition-all overflow-hidden cursor-pointer"
                  onClick={() => navigate(fluxo.path)}
                >
                  <CardContent className="p-0">
                    <div className="h-24 bg-gradient-to-br from-accent/10 to-transparent border-b border-border/60 p-5 flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={fluxo.badgePrimary
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground border border-border"
                      }>
                        {fluxo.badge}
                      </Badge>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{fluxo.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{fluxo.desc}</p>
                      </div>
                      <div className="space-y-1.5">
                        {fluxo.steps.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                            {s}
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        variant={fluxo.badgePrimary ? "default" : "outline"}
                        onClick={(e) => { e.stopPropagation(); navigate(fluxo.path); }}
                      >
                        {fluxo.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── 3 PILARES ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Os três pilares da automação criativa</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PILARES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── COMPARATIVO ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Uma mudança drástica no fluxo de trabalho</h2>
          <div className="rounded-2xl border border-border/60 overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 border-b border-border/60">
              <div className="p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Critério</div>
              <div className="p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-l border-border/60">Criação Tradicional</div>
              <div className="p-4 text-xs font-semibold uppercase tracking-wide text-accent border-l border-border/60">Automação com IA</div>
            </div>
            {COMPARATIVO.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 text-sm border-b border-border/40 last:border-0 ${
                  i % 2 === 0 ? "bg-card" : "bg-muted/20"
                }`}
              >
                <div className="p-4 font-medium text-foreground">{row.criterio}</div>
                <div className="p-4 border-l border-border/40 text-muted-foreground">{row.tradicional}</div>
                <div className="p-4 border-l border-border/40 text-accent font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  {row.ia}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROVA SOCIAL ── */}
        <section className="rounded-2xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/20 p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-4xl font-bold text-foreground">+1.000</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">profissionais ativos</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-border/60" />
            <div className="grid grid-cols-3 gap-4 flex-1 text-center">
              {[
                { icon: Clock, label: "Tempo médio", value: "Segundos" },
                { icon: TrendingUp, label: "Entregáveis", value: "Posts e Anúncios" },
                { icon: CheckCircle2, label: "Exigência técnica", value: "Zero" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label}>
                    <Icon className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="text-center space-y-4 pb-8">
          <h2 className="text-2xl font-bold text-foreground">
            O futuro do seu marketing está a{" "}
            <span className="text-accent">uma ideia de distância.</span>
          </h2>
          <p className="text-muted-foreground">
            Comece a gerar criativos incríveis em segundos e escale suas redes sociais com o poder da automação.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/create/ideia")}>
              <Wand2 className="w-4 h-4 mr-2" />
              Criar a partir de ideia
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/upload")}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Criar a partir de imóvel
            </Button>
          </div>
        </section>

      </div>
    </AppLayout>
  );
};

export default CreateCreativeHub;
