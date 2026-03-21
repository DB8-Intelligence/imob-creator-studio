import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useActivateVideoAddon, useVideoModuleOverview } from "@/hooks/useVideoModule";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { Check, X, Film, Zap, Star, Crown, ChevronRight, ToggleLeft, ToggleRight, CheckCircle2, ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { dispatchN8nEvent } from "@/services/n8nBridgeApi";

type Billing = "monthly" | "yearly";

const PLANS = {
  monthly: [
    {
      id: "starter",
      icon: Zap,
      name: "Starter",
      badge: null,
      price: "R$ 297",
      period: "/mês",
      saving: null,
      description: "Entrada rápida para transformar fotos em vídeos curtos com baixo atrito operacional.",
      credits: "5 vídeos/ciclo",
      resolution: "HD / 1080p básico",
      features: [
        { label: "5 vídeos por ciclo", ok: true },
        { label: "Até 10 fotos por vídeo", ok: true },
        { label: "Até 30 segundos", ok: true },
        { label: "Feed e Reels", ok: true },
        { label: "YouTube / vídeos longos", ok: false },
        { label: "Full HD", ok: false },
        { label: "4K Ultra HD", ok: false },
        { label: "Render prioritário", ok: false },
      ],
      cta: "Ativar Starter",
      featured: false,
    },
    {
      id: "pro",
      icon: Star,
      name: "Pro",
      badge: "Mais escolhido",
      price: "R$ 497",
      period: "/mês",
      saving: null,
      description: "Plano operacional para produção recorrente com mais fotos, mais duração e melhor qualidade.",
      credits: "20 vídeos/ciclo",
      resolution: "Full HD",
      features: [
        { label: "20 vídeos por ciclo", ok: true },
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Até 60 segundos", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Full HD", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Render prioritário", ok: false },
        { label: "Ideal para operação semanal", ok: true },
      ],
      cta: "Ativar Pro",
      featured: true,
    },
    {
      id: "enterprise",
      icon: Crown,
      name: "Enterprise",
      badge: "90s + 4K",
      price: "R$ 1.697",
      period: "/mês",
      saving: null,
      description: "Escala premium para imobiliárias com alto volume, vídeos de até 90s e padrão cinematográfico.",
      credits: "Volume alto / ilimitado",
      resolution: "4K Ultra HD",
      features: [
        { label: "Volume alto ou ilimitado", ok: true },
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Até 90 segundos", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "4K Ultra HD", ok: true },
        { label: "Render prioritário", ok: true },
        { label: "Suporte dedicado", ok: true },
        { label: "Uso premium / multioperação", ok: true },
      ],
      cta: "Ativar Enterprise",
      featured: false,
    },
  ],
  yearly: [
    {
      id: "starter",
      icon: Zap,
      name: "Starter",
      badge: "2 meses grátis",
      price: "R$ 2.970",
      period: "/ano",
      saving: "Economia de R$ 594",
      description: "Versão anual para validar o módulo com menor custo recorrente.",
      credits: "5 vídeos/ciclo",
      resolution: "HD / 1080p básico",
      features: [
        { label: "5 vídeos por ciclo", ok: true },
        { label: "Até 10 fotos por vídeo", ok: true },
        { label: "Até 30 segundos", ok: true },
        { label: "Feed e Reels", ok: true },
        { label: "YouTube / vídeos longos", ok: false },
        { label: "Full HD", ok: false },
        { label: "4K Ultra HD", ok: false },
        { label: "Render prioritário", ok: false },
      ],
      cta: "Ativar Starter",
      featured: false,
    },
    {
      id: "pro",
      icon: Star,
      name: "Pro",
      badge: "Mais escolhido",
      price: "R$ 4.970",
      period: "/ano",
      saving: "Economia de R$ 994",
      description: "Melhor custo para times que geram vídeos toda semana e precisam de operação consistente.",
      credits: "20 vídeos/ciclo",
      resolution: "Full HD",
      features: [
        { label: "20 vídeos por ciclo", ok: true },
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Até 60 segundos", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Full HD", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Render prioritário", ok: false },
        { label: "Ideal para operação semanal", ok: true },
      ],
      cta: "Ativar Pro",
      featured: true,
    },
    {
      id: "enterprise",
      icon: Crown,
      name: "Enterprise",
      badge: "2 meses grátis",
      price: "R$ 16.970",
      period: "/ano",
      saving: "Economia de R$ 3.394",
      description: "Contrato anual para operação premium com 90s, 4K e priorização de render.",
      credits: "Volume alto / ilimitado",
      resolution: "4K Ultra HD",
      features: [
        { label: "Volume alto ou ilimitado", ok: true },
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Até 90 segundos", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "4K Ultra HD", ok: true },
        { label: "Render prioritário", ok: true },
        { label: "Suporte dedicado", ok: true },
        { label: "Uso premium / multioperação", ok: true },
      ],
      cta: "Ativar Enterprise",
      featured: false,
    },
  ],
} as const;

const COMPARISON = [
  { label: "Vídeos / ciclo", starter: "5", pro: "20", enterprise: "alto volume" },
  { label: "Resolução máxima", starter: "HD / 1080p", pro: "Full HD", enterprise: "4K" },
  { label: "Fotos por vídeo", starter: "até 10", pro: "até 20", enterprise: "até 20" },
  { label: "Duração máxima", starter: "30s", pro: "60s", enterprise: "90s" },
  { label: "Formatos (Reels/Feed/YT)", starter: false, pro: true, enterprise: true },
  { label: "Render prioritário", starter: false, pro: false, enterprise: true },
  { label: "Suporte dedicado", starter: false, pro: false, enterprise: true },
];

const VIDEO_FAQS = [
  { question: "Como funciona o módulo de vídeo?", answer: "Você envia fotos, escolhe formato, duração e estilo. A IA gera o vídeo automaticamente e libera preview e download no dashboard." },
  { question: "Qual o mínimo recomendado de fotos?", answer: "Recomendamos pelo menos 6 fotos para garantir uma narrativa visual mais completa. O limite técnico atual é de 20 fotos por vídeo." },
  { question: "Qual a diferença entre Starter, Pro e Enterprise?", answer: "Starter é a porta de entrada para vídeos curtos. Pro amplia volume, fotos e duração. Enterprise libera 90 segundos, 4K e prioridade operacional." },
  { question: "Como funcionam os limites por plano?", answer: "Cada add-on controla fotos por vídeo, duração máxima, resolução e volume disponível no ciclo. Opções acima do plano atual devem solicitar upgrade." },
  { question: "O módulo já suporta YouTube?", answer: "Sim. Os planos Pro e Enterprise já consideram uso para Reels, Feed e YouTube como parte da proposta comercial do módulo." },
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
  const { workspaceId, workspaceRole, workspacePlan, workspaceName } = useWorkspaceContext();
  const { data: overview } = useVideoModuleOverview(workspaceId);
  const activateAddonMutation = useActivateVideoAddon(workspaceId);
  const [billing, setBilling] = useState<Billing>("monthly");

  const currentPlan = plan?.user_plan;
  const activePlans = PLANS[billing];
  const isAdminWorkspace = workspaceRole === "owner" || workspaceRole === "admin";

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="bg-accent/10 text-accent mb-4">Módulo Vídeo IA</Badge>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Planos de vídeo do ImobCreator AI</h1>
          <p className="text-muted-foreground">Escolha entre Starter, Pro e Enterprise para alinhar fotos, duração, resolução e escala operacional do seu time.</p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
            <button type="button" onClick={() => setBilling("monthly")} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors", billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{billing === "monthly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}Mensal</button>
            <button type="button" onClick={() => setBilling("yearly")} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors", billing === "yearly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}>{billing === "yearly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}Anual</button>
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-semibold">{billing === "yearly" ? "2 meses grátis" : "Economize no anual"}</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Workspace: <span className="font-semibold text-foreground">{workspaceName ?? "N/D"}</span> · plano base <span className="font-semibold text-foreground uppercase">{workspacePlan ?? currentPlan ?? "N/D"}</span></p>
          <p className="text-sm text-muted-foreground">Add-on ativo: <span className="font-semibold text-foreground">{overview?.addOn?.addon_type?.toUpperCase?.() ?? "N/D"}</span>{overview?.addOn?.credits_total === null ? " · volume alto ou ilimitado" : ` · ${Math.max((overview?.addOn?.credits_total ?? 0) - (overview?.addOn?.credits_used ?? 0), 0)} vídeos restantes de ${overview?.addOn?.credits_total ?? 0}`}</p>
          {!isAdminWorkspace && <p className="text-xs text-muted-foreground">Somente owner/admin do workspace pode ativar ou trocar o add-on de vídeo.</p>}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {activePlans.map((p) => {
            const Icon = p.icon;
            const isCurrent = overview?.addOn?.addon_type === p.id;
            const canActivate = isAdminWorkspace && (p.id === "starter" || (p.id === "pro" && (workspacePlan === "pro" || workspacePlan === "vip" || currentPlan === "pro" || currentPlan === "vip")) || (p.id === "enterprise" && (workspacePlan === "vip" || currentPlan === "vip")));
            return (
              <div key={p.id} className={cn("rounded-3xl border p-8 flex flex-col transition-all", p.featured ? "border-accent/40 bg-primary text-primary-foreground shadow-xl scale-[1.01]" : p.id === "enterprise" ? "border-amber-400/30 bg-gradient-to-b from-card to-amber-500/5" : "border-border bg-card")}>
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", p.featured ? "bg-accent text-primary" : p.id === "enterprise" ? "bg-amber-500/10 text-amber-600" : "bg-accent/10 text-accent")}><Icon className="w-6 h-6" /></div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500">Plano atual</span>}
                    {p.badge && <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", p.featured ? "bg-accent text-primary" : p.id === "enterprise" ? "bg-amber-500/10 text-amber-600" : "bg-accent/10 text-accent")}>{p.badge}</span>}
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold mb-1">{p.name}</h3>
                <p className={cn("text-sm mb-5", p.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>{p.description}</p>
                <div className="mb-6"><div className="flex items-baseline gap-1"><span className="font-display text-3xl font-bold">{p.price}</span><span className={cn("text-sm", p.featured ? "text-primary-foreground/60" : "text-muted-foreground")}>{p.period}</span></div>{p.saving && <span className="text-xs text-emerald-500 font-semibold">{p.saving}</span>}</div>
                <div className={cn("rounded-xl p-3 mb-5 flex gap-4", p.featured ? "bg-white/5" : "bg-muted/50")}><div className="text-center flex-1"><p className="font-bold text-sm">{p.credits}</p><p className={cn("text-[10px]", p.featured ? "text-primary-foreground/50" : "text-muted-foreground")}>capacidade</p></div><div className="w-px bg-border" /><div className="text-center flex-1"><p className="font-bold text-sm">{p.resolution}</p><p className={cn("text-[10px]", p.featured ? "text-primary-foreground/50" : "text-muted-foreground")}>resolução</p></div></div>
                <ul className="space-y-2.5 mb-8 flex-1">{p.features.map((f) => <li key={f.label} className="flex items-center gap-2.5">{f.ok ? <Check className="w-4 h-4 text-accent flex-shrink-0" /> : <X className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />}<span className={cn("text-sm", f.ok ? p.featured ? "text-primary-foreground/90" : "text-foreground/80" : "text-muted-foreground/40")}>{f.label}</span></li>)}</ul>
                {isCurrent ? (
                  <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/video-dashboard")}><CheckCircle2 className="w-4 h-4 mr-2" />Add-on ativo</Button>
                ) : canActivate ? (
                  <Button variant={p.featured ? "hero" : "default"} size="lg" className="w-full group" disabled={activateAddonMutation.isPending} onClick={() => activateAddonMutation.mutate({ addonType: p.id as "starter" | "pro" | "enterprise", billingCycle: billing }, { onSuccess: async () => { if (workspaceId) await dispatchN8nEvent("video_addon_activated", { workspace_id: workspaceId, addon_type: p.id, billing_cycle: billing, workspace_plan: workspacePlan ?? currentPlan ?? null }); navigate("/video-dashboard"); } })}>{p.cta}<ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" /></Button>
                ) : (
                  <Button variant={p.featured ? "hero" : "default"} size="lg" className="w-full group" onClick={() => navigate("/plano")}>{p.id === "starter" ? "Ver condições" : "Fazer upgrade do plano base"}<ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" /></Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">Ao clicar em ativar, você concorda com nossos <Link to="/termos" className="underline hover:text-accent transition-colors">Termos de Uso</Link>, <Link to="/termos#privacidade" className="underline hover:text-accent transition-colors">Política de Privacidade</Link> e <Link to="/termos#cancelamento" className="underline hover:text-accent transition-colors">Política de Cancelamento</Link>.</p>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-5">Comparativo completo</h2>
          <div className="rounded-2xl border border-border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/30"><th className="text-left p-4 text-muted-foreground font-medium">Recurso</th>{(["starter", "pro", "enterprise"] as const).map((id) => <th key={id} className="p-4 text-center min-w-[120px]"><span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", id === "pro" ? "bg-accent text-accent-foreground" : id === "enterprise" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground")}>{id === "starter" ? "Starter" : id === "pro" ? "Pro" : "Enterprise"}</span></th>)}</tr></thead><tbody>{COMPARISON.map((row, i) => <tr key={row.label} className={cn("border-b border-border last:border-0", i % 2 === 0 && "bg-muted/20")}><td className="p-4 font-medium text-foreground">{row.label}</td>{(["starter", "pro", "enterprise"] as const).map((id) => { const val = row[id]; return <td key={id} className="p-4 text-center">{typeof val === "boolean" ? val ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" /> : <span className="text-sm text-muted-foreground">{val}</span>}</td>; })}</tr>)}</tbody></table></div></div>
        </div>

        <div>
          <div className="text-center mb-8"><h2 className="font-display text-2xl font-bold text-foreground mb-2">Perguntas frequentes</h2><p className="text-muted-foreground">Tire suas dúvidas sobre os planos do módulo</p></div>
          <div className="space-y-3 max-w-3xl mx-auto">{VIDEO_FAQS.map((faq) => <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />)}</div>
          <div className="mt-10 rounded-3xl border border-border bg-muted/30 p-8 text-center max-w-3xl mx-auto"><h3 className="font-display text-lg font-bold text-foreground mb-2">Ainda tem dúvidas?</h3><p className="text-muted-foreground text-sm mb-5">Nossa equipe pode ajudar a escolher o add-on ideal para o volume e a qualidade que você precisa.</p><Button variant="outline" size="lg" onClick={() => window.open("https://wa.me/5511999999999?text=Olá!+Tenho+dúvidas+sobre+os+planos+de+vídeo+IA", "_blank")}><MessageCircle className="w-4 h-4 mr-2" />Entre em contato</Button></div>
        </div>

        <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 text-center"><Film className="w-10 h-10 text-accent mx-auto mb-4" /><h3 className="font-display text-xl font-bold text-foreground mb-2">Pronto para criar seu próximo vídeo?</h3><p className="text-muted-foreground mb-6 max-w-md mx-auto">Escolha o add-on ideal e transforme fotos em vídeos com uma matriz clara de duração, resolução e capacidade.</p><Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/video-creator")}>Criar vídeo agora<ChevronRight className="w-4 h-4 ml-1" /></Button></div>
      </div>
    </AppLayout>
  );
};

export default VideosPricingPage;
