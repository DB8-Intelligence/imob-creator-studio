import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useVideoModuleOverview } from "@/hooks/useVideoModule";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { Check, X, Film, Zap, Star, Crown, ChevronRight, ToggleLeft, ToggleRight, CheckCircle2, ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
// ─── Links Kiwify — checkout de planos de vídeo ──────────────────────────────
const KIWIFY_VIDEO_LINKS = {
  standard: {
    monthly: "https://pay.kiwify.com.br/4LRnoknhsh2Fpxr",
    yearly:  "https://pay.kiwify.com.br/4LRnoknhsh2Fpxr", // atualizar quando criar produto anual
  },
  plus: {
    monthly: "https://kiwify.com.br/video-plus-mensal",    // pendente
    yearly:  "https://kiwify.com.br/video-plus-anual",     // pendente
  },
  premium: {
    monthly: "https://kiwify.com.br/video-premium-mensal", // pendente
    yearly:  "https://kiwify.com.br/video-premium-anual",  // pendente
  },
};
// ─────────────────────────────────────────────────────────────────────────────

type Billing = "monthly" | "yearly";

const PLANS = {
  monthly: [
    {
      id: "standard",
      icon: Zap,
      name: "Standard",
      badge: null,
      price: "R$ 297",
      period: "/mês",
      saving: null,
      description: "Ideal para pequenos imóveis e anúncios simples.",
      credits: "300 créditos por mês",
      resolution: "720p",
      features: [
        { label: "Até 10 fotos por vídeo", ok: true },
        { label: "Resolução 720p", ok: true },
        { label: "Logo + texto overlay incluído", ok: true },
        { label: "Até 50s por vídeo", ok: true },
        { label: "1080p Full HD", ok: false },
        { label: "4K Ultra HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar agora",
      featured: false,
    },
    {
      id: "plus",
      icon: Star,
      name: "Plus",
      badge: "Mais escolhido",
      price: "R$ 497",
      period: "/mês",
      saving: null,
      description: "O mais escolhido pelos corretores.",
      credits: "600 créditos por mês",
      resolution: "1080p",
      features: [
        { label: "Até 15 fotos por vídeo", ok: true },
        { label: "Resolução 1080p Full HD", ok: true },
        { label: "Logo + texto overlay incluído", ok: true },
        { label: "Até 75s por vídeo", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar agora",
      featured: true,
    },
    {
      id: "premium",
      icon: Crown,
      name: "Premium",
      badge: null,
      price: "R$ 1.697",
      period: "/mês",
      saving: null,
      description: "Para imobiliárias de alto padrão e lançamentos premium.",
      credits: "800 créditos por mês",
      resolution: "4k",
      features: [
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Resolução 4K Ultra HD", ok: true },
        { label: "Logo + texto overlay incluído", ok: true },
        { label: "Renderização prioritária", ok: true },
        { label: "Até 90s com montagem otimizada", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Operação premium", ok: true },
      ],
      cta: "Assinar agora",
      featured: false,
    },
  ],
  yearly: [
    {
      id: "standard",
      icon: Zap,
      name: "Standard",
      badge: "1 mês grátis",
      price: "R$ 2.970",
      period: "/ano",
      saving: "Economia anual",
      description: "Ideal para pequenos imóveis e anúncios simples.",
      credits: "300 créditos por mês",
      resolution: "720p",
      features: [
        { label: "Até 10 fotos por vídeo", ok: true },
        { label: "Resolução 720p", ok: true },
        { label: "Logo + texto overlay incluído", ok: true },
        { label: "Até 50s por vídeo", ok: true },
        { label: "1080p Full HD", ok: false },
        { label: "4K Ultra HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar agora",
      featured: false,
    },
    {
      id: "plus",
      icon: Star,
      name: "Plus",
      badge: "Mais escolhido",
      price: "R$ 4.970",
      period: "/ano",
      saving: "1 mês grátis",
      description: "O mais escolhido pelos corretores.",
      credits: "600 créditos por mês",
      resolution: "1080p",
      features: [
        { label: "Até 15 fotos por vídeo", ok: true },
        { label: "Resolução 1080p Full HD", ok: true },
        { label: "Logo + texto overlay incluído", ok: true },
        { label: "Até 75s por vídeo", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar agora",
      featured: true,
    },
    {
      id: "premium",
      icon: Crown,
      name: "Premium",
      badge: "1 mês grátis",
      price: "R$ 16.970",
      period: "/ano",
      saving: "Economia anual",
      description: "Para imobiliárias de alto padrão e lançamentos premium.",
      credits: "800 créditos por mês",
      resolution: "4k",
      features: [
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Resolução 4K Ultra HD", ok: true },
        { label: "Logo + texto overlay incluído", ok: true },
        { label: "Renderização prioritária", ok: true },
        { label: "Até 90s com montagem otimizada", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Operação premium", ok: true },
      ],
      cta: "Assinar agora",
      featured: false,
    },
  ],
} as const;

const COMPARISON = [
  { label: "Créditos / mês", standard: "300", plus: "600", premium: "800" },
  { label: "Resolução máxima", standard: "720p", plus: "1080p", premium: "4K" },
  { label: "Fotos por vídeo", standard: "até 10", plus: "até 15", premium: "até 20" },
  { label: "Duração máxima", standard: "50s", plus: "75s", premium: "90s" },
  { label: "Logo + texto overlay", standard: true, plus: true, premium: true },
  { label: "Renderização prioritária", standard: false, plus: false, premium: true },
  { label: "Feed / Reels / YouTube", standard: false, plus: true, premium: true },
];

const VIDEO_FAQS = [
  { question: "Como os créditos funcionam?", answer: "Os planos seguem o padrão comercial da oferta: Standard com 300 créditos, Plus com 600 e Premium com 800 créditos por mês." },
  { question: "Qual o mínimo recomendado de fotos?", answer: "Recomendamos pelo menos 6 fotos para garantir narrativa visual mais completa. O limite por plano vai de 10 a 20 fotos por vídeo." },
  { question: "Qual a diferença entre Standard, Plus e Premium?", answer: "Standard é a entrada em 720p, Plus libera 1080p Full HD e mais fotos, e Premium libera 4K Ultra HD, render prioritário e o nível mais alto de produção." },
  { question: "A duração do vídeo depende das fotos?", answer: "Sim. O modelo do módulo evolui a duração conforme a quantidade de imagens usadas e a montagem final do vídeo, respeitando as regras de cada plano." },
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/40 transition-colors">
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">{answer}</div>}
    </div>
  );
};

const VideosPricingPage = () => {
  const navigate = useNavigate();
  const { data: plan } = useUserPlan();
  const { workspaceId, workspacePlan, workspaceName } = useWorkspaceContext();
  const { data: overview } = useVideoModuleOverview(workspaceId);
  const [billing, setBilling] = useState<Billing>("monthly");

  const currentPlan = plan?.user_plan;
  const activePlans = PLANS[billing];

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="bg-accent/10 text-accent mb-4">Módulo Vídeo IA</Badge>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Planos de vídeo do DB8 Intelligence</h1>
          <p className="text-muted-foreground">Aplicamos o padrão comercial Standard / Plus / Premium com resolução, créditos e limite de fotos alinhados ao benchmark visual.</p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
            <button type="button" onClick={() => setBilling("monthly")} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors", billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {billing === "monthly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}Mensal
            </button>
            <button type="button" onClick={() => setBilling("yearly")} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors", billing === "yearly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}>
              {billing === "yearly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}Anual
            </button>
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-semibold">1 mês grátis</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Workspace: <span className="font-semibold text-foreground">{workspaceName ?? "N/D"}</span> · plano base <span className="font-semibold text-foreground uppercase">{workspacePlan ?? currentPlan ?? "N/D"}</span></p>
          <p className="text-sm text-muted-foreground">Add-on ativo: <span className="font-semibold text-foreground">{overview?.addOn?.addon_type?.toUpperCase?.() ?? "N/D"}</span>{overview?.addOn?.credits_total === null ? " · volume flexível" : ` · ${Math.max((overview?.addOn?.credits_total ?? 0) - (overview?.addOn?.credits_used ?? 0), 0)} créditos restantes de ${overview?.addOn?.credits_total ?? 0}`}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {activePlans.map((p) => {
            const Icon = p.icon;
            const isCurrent = overview?.addOn?.addon_type === p.id;
            const kiwifyHref = KIWIFY_VIDEO_LINKS[p.id as keyof typeof KIWIFY_VIDEO_LINKS][billing];
            return (
              <div key={p.id} className={cn("rounded-3xl border p-8 flex flex-col transition-all", p.featured ? "border-accent/40 bg-primary text-primary-foreground shadow-xl scale-[1.01]" : p.id === "premium" ? "border-emerald-400/30 bg-gradient-to-b from-card to-emerald-500/5" : "border-border bg-card")}>
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", p.featured ? "bg-accent text-primary" : p.id === "premium" ? "bg-emerald-500/10 text-emerald-600" : "bg-accent/10 text-accent")}><Icon className="w-6 h-6" /></div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500">Plano atual</span>}
                    {p.badge && <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", p.featured ? "bg-accent text-primary" : p.id === "premium" ? "bg-emerald-500/10 text-emerald-600" : "bg-accent/10 text-accent")}>{p.badge}</span>}
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold mb-2">{p.name}</h3>
                <p className={cn("text-sm mb-6", p.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>{p.description}</p>
                <div className="mb-6"><div className="flex items-baseline gap-1"><span className="font-display text-4xl font-bold">{p.price}</span><span className={cn("text-sm", p.featured ? "text-primary-foreground/60" : "text-muted-foreground")}>{p.period}</span></div>{p.saving && <span className="text-xs text-emerald-500 font-semibold">{p.saving}</span>}</div>
                <div className={cn("rounded-xl p-4 mb-4 border", p.featured ? "bg-white/5 border-white/10" : "bg-muted/30 border-border/60")}><p className="text-center text-3xl font-bold text-foreground">{p.resolution}</p><p className={cn("text-center text-sm mt-1", p.featured ? "text-primary-foreground/60" : "text-muted-foreground")}>resolução</p></div>
                <div className="rounded-xl p-4 mb-6 bg-emerald-500/10 border border-emerald-500/10"><p className="text-center text-3xl font-bold text-emerald-500">{p.credits.split(" ")[0]}</p><p className="text-center text-sm mt-1 text-muted-foreground">{p.credits.replace(`${p.credits.split(" ")[0]} `, "")}</p></div>
                <ul className="space-y-3 mb-8 flex-1">{p.features.map((f) => <li key={f.label} className="flex items-center gap-2.5">{f.ok ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <X className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />}<span className={cn("text-sm", f.ok ? p.featured ? "text-primary-foreground/90" : "text-foreground/80" : "text-muted-foreground/40")}>{f.label}</span></li>)}</ul>

                {isCurrent ? (
                  <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/video-dashboard")}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />Plano ativo
                  </Button>
                ) : (
                  <a
                    href={kiwifyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 group",
                      p.featured
                        ? "bg-accent text-primary hover:bg-accent/90 hover:scale-[1.02]"
                        : "bg-muted text-foreground border border-border hover:bg-muted/70"
                    )}
                  >
                    {p.cta}
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">Ao clicar em "Assinar", você declara que leu e concorda com nossos <Link to="/termos" className="underline hover:text-accent transition-colors">Termos de Uso</Link>, <Link to="/termos#privacidade" className="underline hover:text-accent transition-colors">Política de Privacidade</Link>, <Link to="/termos#reembolso" className="underline hover:text-accent transition-colors">Política de Reembolso</Link> e <Link to="/termos#cancelamento" className="underline hover:text-accent transition-colors">Política de Cancelamento</Link>.</p>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-5">Comparativo completo</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-muted-foreground font-medium">Recurso</th>
                    {(["standard", "plus", "premium"] as const).map((id) => <th key={id} className="p-4 text-center min-w-[120px]"><span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", id === "plus" ? "bg-accent text-accent-foreground" : id === "premium" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>{id === "standard" ? "Standard" : id === "plus" ? "Plus" : "Premium"}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.label} className={cn("border-b border-border last:border-0", i % 2 === 0 && "bg-muted/20")}>
                      <td className="p-4 font-medium text-foreground">{row.label}</td>
                      {(["standard", "plus", "premium"] as const).map((id) => {
                        const val = row[id];
                        return <td key={id} className="p-4 text-center">{typeof val === "boolean" ? val ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" /> : <span className="text-sm text-muted-foreground">{val}</span>}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Perguntas frequentes</h2>
            <p className="text-muted-foreground">Tire suas dúvidas sobre os planos do módulo</p>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">{VIDEO_FAQS.map((faq) => <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />)}</div>
          <div className="mt-10 rounded-3xl border border-border bg-muted/30 p-8 text-center max-w-3xl mx-auto">
            <h3 className="font-display text-lg font-bold text-foreground mb-2">Ainda tem dúvidas?</h3>
            <p className="text-muted-foreground text-sm mb-5">Nossa equipe pode ajudar a escolher o plano de vídeo ideal para o volume e a qualidade que você precisa.</p>
            <Button variant="outline" size="lg" onClick={() => window.open("https://wa.me/5511999999999?text=Olá!+Tenho+dúvidas+sobre+os+planos+de+vídeo+IA", "_blank")}><MessageCircle className="w-4 h-4 mr-2" />Entre em contato</Button>
          </div>
        </div>

        <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 text-center">
          <Film className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Pronto para criar seu próximo vídeo?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Escolha o plano ideal e transforme fotos em vídeos com resolução, créditos e limites claros para sua operação.</p>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/video-creator")}>Criar vídeo agora<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default VideosPricingPage;
