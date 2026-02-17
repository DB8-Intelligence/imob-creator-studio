import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Clock, Instagram, Users } from "lucide-react";

const stats = [
  { icon: TrendingUp, value: "3x", label: "Mais engajamento nos posts" },
  { icon: Clock, value: "2h/dia", label: "Tempo economizado em média" },
  { icon: Instagram, value: "5.000+", label: "Posts publicados automaticamente" },
  { icon: Users, value: "500+", label: "Corretores ativos na plataforma" },
];

const cases = [
  {
    name: "Douglas Bonanzza Imóveis",
    city: "São Paulo, SP",
    before: "Gastava 3h por dia criando posts manualmente no Canva. Publicava 2 imóveis por semana.",
    after: "Agora publica 3 imóveis por dia pelo WhatsApp. Engajamento subiu 280% no Instagram.",
    metric: "+280% engajamento",
  },
  {
    name: "Imobiliária Horizonte",
    city: "Belo Horizonte, MG",
    before: "Equipe de 5 corretores sem presença digital consistente. Cada um postava de forma diferente.",
    after: "Identidade visual padronizada em todos os posts. 15 publicações por semana com qualidade profissional.",
    metric: "15 posts/semana",
  },
  {
    name: "Ana Reis Corretora",
    city: "Rio de Janeiro, RJ",
    before: "Trabalhava sozinha e não tinha tempo para criar conteúdo para Instagram.",
    after: "Agora publica diariamente enviando fotos pelo WhatsApp entre visitas. Leads triplicaram.",
    metric: "3x mais leads",
  },
];

const Resultados = () => (
  <MarketingLayout>
    <section className="pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Cases & Resultados
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Resultados reais de{" "}
            <span className="text-gradient">corretores reais</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-soft">
              <s.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-3xl font-bold font-display text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cases */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {cases.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border/50 overflow-hidden shadow-soft">
              <div className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.city}</p>
                  </div>
                  <span className="mt-2 sm:mt-0 inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm">
                    {c.metric}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                    <p className="text-xs font-medium text-destructive mb-2">ANTES</p>
                    <p className="text-sm text-foreground">{c.before}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <p className="text-xs font-medium text-accent mb-2">DEPOIS</p>
                    <p className="text-sm text-foreground">{c.after}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="xl" asChild className="group">
            <Link to="/auth">
              Quero esses resultados
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  </MarketingLayout>
);

export default Resultados;
