import AppLayout from "@/components/app/AppLayout";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Star, Crown, AlertCircle, Clock, Users, ShieldCheck, ArrowRight, Coins, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Substitua estes links pelos URLs reais dos seus produtos no Kiwify ───────
const KIWIFY_LINKS = {
  20: "https://kiwify.com.br/seu-produto-20",
  50: "https://kiwify.com.br/seu-produto-50",
  150: "https://kiwify.com.br/seu-produto-150",
};
// ─────────────────────────────────────────────────────────────────────────────

const plans = [
  {
    credits: 20,
    badge: "Oferta Especial",
    badgeColor: "bg-amber-500 text-white",
    description: "Ideal para começar",
    price: "R$ 59",
    perUnit: "R$ 2,95/criação",
    highlight: null,
    promo: "Promoção por tempo limitado",
    users: "312 pessoas já usam",
    featured: false,
  },
  {
    credits: 50,
    badge: "🔥 Mais Escolhido",
    badgeColor: "bg-indigo-500 text-white",
    description: "Mais escolhido",
    price: "R$ 97",
    perUnit: "R$ 1,94/criação",
    highlight: "Economize R$ 50",
    promo: null,
    users: "523 pessoas já usam",
    featured: true,
  },
  {
    credits: 150,
    badge: "Melhor custo-benefício",
    badgeColor: "bg-muted text-foreground",
    description: "Melhor custo-benefício",
    price: "R$ 197",
    perUnit: "R$ 1,31/criação",
    highlight: "Economize R$ 246",
    promo: null,
    users: "189 pessoas já usam",
    featured: false,
  },
];

const PlanPage = () => {
  const { data: plan, isLoading, isError } = useUserPlan();

  const creditsRemaining = plan?.credits_remaining ?? 0;
  const creditsTotal = plan?.credits_total ?? 0;
  const creditPct = creditsTotal > 0 ? Math.min((creditsRemaining / creditsTotal) * 100, 100) : 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Créditos</h1>
          <p className="text-sm text-muted-foreground mt-1">Compre créditos e acompanhe seu saldo</p>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Erro ao carregar informações do plano.
          </div>
        )}

        {plan && (
          <>
            {/* Saldo atual */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo atual</p>
                    <p className="text-3xl font-bold text-foreground">{creditsRemaining}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total comprado</p>
                  <p className="text-lg font-semibold text-foreground">{creditsTotal}</p>
                </div>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500",
                    creditPct > 50 ? "bg-accent" : creditPct > 20 ? "bg-amber-500" : "bg-red-500",
                  ].join(" ")}
                  style={{ width: `${creditPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {creditsRemaining} de {creditsTotal} créditos restantes · cada criativo consome 1 crédito
              </p>

              {creditsRemaining === 0 && (
                <div className="mt-3 flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Sem créditos disponíveis. Compre um pacote abaixo para continuar gerando criativos.
                </div>
              )}
              {creditsRemaining > 0 && creditsRemaining <= 5 && (
                <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Saldo baixo! Recarregue para não interromper sua produção.
                </div>
              )}
            </div>

            {/* Pacotes de créditos */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Comprar créditos</h2>
              <p className="text-sm text-muted-foreground mb-5 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
                Créditos nunca expiram · Pagamento instantâneo via PIX
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {plans.map((p) => (
                  <div
                    key={p.credits}
                    className={[
                      "relative rounded-2xl border p-5 flex flex-col transition-all duration-300",
                      p.featured
                        ? "border-indigo-500/50 bg-indigo-500/5 shadow-lg scale-[1.02]"
                        : "border-border/60 bg-card hover:-translate-y-1 hover:shadow-md",
                    ].join(" ")}
                  >
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-3 self-start ${p.badgeColor}`}>
                      {p.badge}
                    </span>

                    <p className="text-xl font-bold text-foreground mb-0.5">{p.credits} Créditos</p>
                    <p className="text-xs text-muted-foreground mb-4">{p.description}</p>

                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                      <span className="text-sm font-medium text-foreground">{p.credits} criações</span>
                    </div>

                    <p className="text-2xl font-bold text-foreground mt-2">{p.price}</p>
                    <p className="text-xs text-muted-foreground mb-3">{p.perUnit}</p>

                    {p.highlight && (
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 mb-3 text-center">
                        <span className="text-emerald-500 font-bold text-xs">{p.highlight}</span>
                      </div>
                    )}
                    {p.promo && (
                      <div className="flex items-center gap-1 mb-3">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 text-xs">{p.promo}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mb-4">
                      <Users className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground/60">{p.users}</span>
                    </div>

                    <div className="mt-auto">
                      <a
                        href={KIWIFY_LINKS[p.credits as keyof typeof KIWIFY_LINKS]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={[
                          "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all",
                          p.featured
                            ? "bg-indigo-500 text-white hover:bg-indigo-600"
                            : "bg-foreground text-background hover:bg-foreground/90",
                        ].join(" ")}
                      >
                        Comprar agora
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-5 text-muted-foreground/60 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Pagamento seguro via Kiwify · Créditos creditados automaticamente após confirmação
              </div>
            </div>

            {/* Como funciona */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Como funciona</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Star, step: "1", title: "Escolha o pacote", desc: "Selecione quantos créditos quer comprar acima." },
                  { icon: ShieldCheck, step: "2", title: "Pague via PIX", desc: "Pagamento seguro pelo Kiwify. Créditos creditados automaticamente." },
                  { icon: Zap, step: "3", title: "Gere criativos", desc: "Cada criativo gerado consome 1 crédito do seu saldo." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-sm font-bold text-accent">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA criar criativo */}
            {creditsRemaining > 0 && (
              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">Pronto para criar?</p>
                  <p className="text-sm text-muted-foreground">Você tem <strong>{creditsRemaining} crédito(s)</strong> disponível(eis).</p>
                </div>
                <Link
                  to="/create/ideia"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:scale-105 transition-all"
                >
                  Criar agora
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PlanPage;
