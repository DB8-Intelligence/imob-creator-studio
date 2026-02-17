import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  Instagram,
  Clock,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { useState } from "react";

/* ── Hero ── */
const Hero = () => (
  <section className="relative min-h-screen pt-16 overflow-hidden">
    <div className="absolute inset-0 bg-hero" />
    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
    <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />

    <div className="relative container mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center">
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/80 text-sm font-medium backdrop-blur-sm mb-8 opacity-0 animate-fade-up">
        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        Automação inteligente para corretores
      </span>

      <h1 className="opacity-0 animate-fade-up animation-delay-100 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground max-w-5xl leading-tight mb-6">
        Posts de imóveis automáticos:{" "}
        <span className="text-gradient">do WhatsApp direto pro Instagram</span>
      </h1>

      <p className="opacity-0 animate-fade-up animation-delay-200 text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mb-10 font-body">
        Você envia fotos e texto no WhatsApp. A IA faz upscale, cria a legenda e prepara o post.
        Você aprova e ele publica.
      </p>

      <div className="opacity-0 animate-fade-up animation-delay-300 flex flex-col sm:flex-row items-center gap-4">
        <Button variant="hero" size="xl" asChild className="group">
          <Link to="/auth">
            Começar Agora
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button variant="heroOutline" size="xl" asChild>
          <Link to="/planos">Ver Planos</Link>
        </Button>
      </div>

      <div className="opacity-0 animate-fade-up animation-delay-400 flex flex-wrap justify-center gap-8 sm:gap-16 mt-16 pt-8 border-t border-primary-foreground/10">
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">5.000+</p>
          <p className="text-sm text-primary-foreground/60 mt-1">Posts Publicados</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">98%</p>
          <p className="text-sm text-primary-foreground/60 mt-1">Aprovação</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">3x</p>
          <p className="text-sm text-primary-foreground/60 mt-1">Mais Engajamento</p>
        </div>
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 80" fill="none" className="w-full">
        <path d="M0 80L1440 80L1440 40C1440 40 1320 0 720 0C120 0 0 40 0 40L0 80Z" fill="hsl(var(--background))" />
      </svg>
    </div>
  </section>
);

/* ── Benefits ── */
const benefits = [
  { icon: Clock, title: "Economize Tempo", desc: "Publique imóveis em minutos, não horas. Automatize tudo pelo WhatsApp." },
  { icon: Sparkles, title: "IA Avançada", desc: "Upscale de imagens, legendas inteligentes e templates profissionais automaticamente." },
  { icon: Instagram, title: "Direto no Instagram", desc: "Publicação automática no feed do Instagram após sua aprovação." },
  { icon: TrendingUp, title: "Mais Vendas", desc: "Posts profissionais geram 3x mais engajamento e leads qualificados." },
  { icon: Shield, title: "Sua Marca", desc: "Templates personalizados com logo, cores e identidade visual da sua imobiliária." },
  { icon: MessageSquare, title: "Via WhatsApp", desc: "Fluxo natural: envie fotos pelo WhatsApp e a IA cuida do resto." },
];

const Benefits = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          Benefícios
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
          Por que corretores escolhem o{" "}
          <span className="text-gradient">ImobCreator AI</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((b) => (
          <div key={b.title} className="group p-8 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent-gradient group-hover:shadow-glow transition-all duration-500">
              <b.icon className="w-7 h-7 text-accent group-hover:text-primary transition-colors duration-500" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">{b.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── How It Works ── */
const steps = [
  { num: "01", icon: MessageSquare, title: "Envie pelo WhatsApp", desc: "Mande as fotos do imóvel + texto descritivo pelo WhatsApp. Simples assim." },
  { num: "02", icon: Sparkles, title: "IA Processa Tudo", desc: "Upscale das fotos, legenda otimizada e template da sua marca aplicado automaticamente." },
  { num: "03", icon: Instagram, title: "Aprove e Publique", desc: "Revise o post pronto, edite se quiser e publique no Instagram com um clique." },
];

const HowItWorks = () => (
  <section className="py-24 bg-muted/50">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          Como Funciona
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
          Três passos para{" "}
          <span className="text-gradient">automatizar seus posts</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((s, i) => (
          <div key={s.num} className="bg-card rounded-2xl p-8 border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-1 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-gradient shadow-glow mb-6">
              <span className="font-display text-2xl font-bold text-primary">{s.num}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 mx-auto">
              <s.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">{s.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── Social Proof ── */
const testimonials = [
  { name: "Carlos M.", role: "Corretor em SP", text: "Economizo 2h por dia desde que comecei a usar. Os posts ficam profissionais e os clientes elogiam." },
  { name: "Ana R.", role: "Imobiliária RJ", text: "Meu engajamento no Instagram triplicou. A IA gera legendas que convertem de verdade." },
  { name: "Pedro L.", role: "Corretor em BH", text: "Fluxo perfeito: mando pelo WhatsApp, aprovo no app e tá no Instagram. Simples e rápido." },
];

const SocialProof = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          Depoimentos
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
          O que dizem nossos{" "}
          <span className="text-gradient">corretores</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div key={t.name} className="p-8 rounded-2xl bg-card border border-border/50 shadow-soft">
            <p className="text-foreground mb-6 leading-relaxed italic">"{t.text}"</p>
            <div>
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── Plans Preview ── */
const plans = [
  { name: "Starter", credits: 30, price: "49", features: ["30 créditos/mês", "Upscale de imagens", "Geração de legendas", "1 template", "Suporte por email"] },
  { name: "Pro", credits: 120, price: "149", popular: true, features: ["120 créditos/mês", "Upscale de imagens", "Geração de legendas", "Templates ilimitados", "Publicação automática", "Suporte prioritário"] },
  { name: "Agência", credits: 300, price: "349", features: ["300 créditos/mês", "Tudo do Pro", "Multi-contas Instagram", "Relatórios avançados", "Gerente dedicado"] },
];

const PlansPreview = () => (
  <section className="py-24 bg-muted/50">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          Planos
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
          Escolha o plano{" "}
          <span className="text-gradient">ideal para você</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-2xl p-8 border shadow-soft ${p.popular ? "bg-primary text-primary-foreground border-accent shadow-glow scale-105" : "bg-card border-border/50"}`}>
            {p.popular && (
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-primary text-xs font-bold mb-4">
                Mais Popular
              </span>
            )}
            <h3 className="font-display text-2xl font-bold mb-2">{p.name}</h3>
            <p className={`text-sm mb-4 ${p.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {p.credits} créditos/mês
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">R$ {p.price}</span>
              <span className={`text-sm ${p.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/mês</span>
            </div>
            <ul className="space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className={`w-4 h-4 flex-shrink-0 ${p.popular ? "text-accent" : "text-accent"}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={p.popular ? "hero" : "outline"}
              className="w-full"
              asChild
            >
              <Link to="/auth">Criar conta</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── FAQ Preview ── */
const faqs = [
  { q: "Como funciona o sistema de créditos?", a: "Cada ação consome créditos: upscale de imagem, geração de legenda, montagem de template e publicação. Os créditos são renovados mensalmente conforme seu plano." },
  { q: "Preciso instalar algum app?", a: "Não! Você envia fotos pelo WhatsApp e gerencia tudo pelo navegador. Sem downloads." },
  { q: "Posso personalizar os templates?", a: "Sim! Sua logo, cores e tipografia são aplicadas automaticamente em todos os posts." },
];

const FAQPreview = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Perguntas Frequentes
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-foreground">{f.q}</span>
                {openIdx === i ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-muted-foreground">{f.a}</div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/faq">Ver todas as perguntas</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

/* ── CTA ── */
const CTA = () => (
  <section className="py-24 bg-background relative overflow-hidden">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
    <div className="container mx-auto px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-hero rounded-3xl p-12 sm:p-16 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
          <div className="relative text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Comece a automatizar seus{" "}
              <span className="text-gradient">posts hoje</span>
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto mb-10">
              Junte-se a milhares de corretores que já economizam horas por semana com o ImobCreator AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/auth">
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <p className="text-primary-foreground/50 text-sm">
                Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ── Page ── */
const Home = () => (
  <MarketingLayout>
    <Hero />
    <Benefits />
    <HowItWorks />
    <SocialProof />
    <PlansPreview />
    <FAQPreview />
    <CTA />
  </MarketingLayout>
);

export default Home;
