import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    credits: 30,
    price: "49",
    desc: "Ideal para corretores autônomos começando a automatizar.",
    features: [
      "30 créditos/mês",
      "Upscale de imagens",
      "Geração de legendas com IA",
      "1 template personalizado",
      "Suporte por email",
    ],
  },
  {
    name: "Pro",
    credits: 120,
    price: "149",
    popular: true,
    desc: "Para corretores que publicam com frequência e querem resultados.",
    features: [
      "120 créditos/mês",
      "Upscale de imagens",
      "Geração de legendas com IA",
      "Templates ilimitados",
      "Publicação automática no Instagram",
      "Histórico completo de publicações",
      "Suporte prioritário",
    ],
  },
  {
    name: "Agência",
    credits: 300,
    price: "349",
    desc: "Para imobiliárias e equipes que precisam de escala.",
    features: [
      "300 créditos/mês",
      "Tudo do plano Pro",
      "Multi-contas Instagram",
      "Relatórios de desempenho",
      "Gerente de conta dedicado",
      "White-label (em breve)",
    ],
  },
];

const creditBreakdown = [
  { action: "Upscale de imagem", cost: "1 crédito" },
  { action: "Geração de legenda", cost: "1 crédito" },
  { action: "Montagem do post (template)", cost: "1 crédito" },
  { action: "Publicação no Instagram", cost: "1 crédito" },
];

const Planos = () => (
  <MarketingLayout>
    <section className="pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Planos e Créditos
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Invista no que{" "}
            <span className="text-gradient">traz resultado</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Cada ação consome créditos. Escolha o plano que se encaixa na sua rotina.
          </p>
        </div>

        {/* Credits explanation */}
        <div className="max-w-2xl mx-auto mb-16 p-6 rounded-2xl bg-muted/50 border border-border/50">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
            Como funcionam os créditos?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {creditBreakdown.map((c) => (
              <div key={c.action} className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm text-foreground">{c.action}</span>
                <span className="text-sm font-bold text-accent">{c.cost}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Um post completo (upscale + legenda + template + publicação) = 4 créditos
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border shadow-soft flex flex-col ${
                p.popular
                  ? "bg-primary text-primary-foreground border-accent shadow-glow scale-105"
                  : "bg-card border-border/50"
              }`}
            >
              {p.popular && (
                <span className="inline-block px-3 py-1 rounded-full bg-accent text-primary text-xs font-bold mb-4 self-start">
                  Mais Popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold mb-1">{p.name}</h3>
              <p className={`text-sm mb-4 ${p.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {p.desc}
              </p>
              <div className="mb-6">
                <span className="text-xs align-top">a partir de </span>
                <span className="text-4xl font-bold">R$ {p.price}</span>
                <span className={`text-sm ${p.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/mês</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${p.popular ? "text-accent" : "text-accent"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={p.popular ? "hero" : "outline"} className="w-full" asChild>
                <Link to="/auth">Criar conta</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  </MarketingLayout>
);

export default Planos;
