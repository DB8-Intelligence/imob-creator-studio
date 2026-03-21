import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useActivateVideoAddon, useVideoModuleOverview } from "@/hooks/useVideoModule";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import {
  Check,
  X,
  Film,
  Zap,
  Star,
  Crown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dispatchN8nEvent } from "@/services/n8nBridgeApi";

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
      description: "Para corretores que querem começar a criar vídeos imobiliários com IA.",
      credits: "300 créditos/mês",
      resolution: "720p HD",
      features: [
        { label: "300 créditos por mês", ok: true },
        { label: "Vídeos em 720p HD", ok: true },
        { label: "Até 10 fotos por vídeo", ok: true },
        { label: "Logo + texto overlay", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "1080p Full HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar",
      featured: false,
      enterpriseContact: false,
    },
    {
      id: "plus",
      icon: Star,
      name: "Plus",
      badge: "Mais escolhido",
      price: "R$ 497",
      period: "/mês",
      saving: null,
      description: "Qualidade profissional em Full HD para corretores e pequenas imobiliárias.",
      credits: "600 créditos/mês",
      resolution: "1080p Full HD",
      features: [
        { label: "600 créditos por mês", ok: true },
        { label: "Vídeos em 1080p Full HD", ok: true },
        { label: "Até 15 fotos por vídeo", ok: true },
        { label: "Logo + texto overlay", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar",
      featured: true,
      enterpriseContact: false,
    },
    {
      id: "premium",
      icon: Crown,
      name: "Premium",
      badge: null,
      price: "R$ 1.697",
      period: "/mês",
      saving: null,
      description: "Para imobiliárias com alto volume. Vídeos 4K com renderização prioritária.",
      credits: "800 créditos/mês",
      resolution: "4K Ultra HD",
      features: [
        { label: "800 créditos por mês", ok: true },
        { label: "Vídeos em 4K Ultra HD", ok: true },
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Logo + texto overlay", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Renderização prioritária", ok: true },
        { label: "Suporte dedicado", ok: true },
      ],
      cta: "Assinar",
      featured: false,
      enterpriseContact: false,
    },
  ],
  yearly: [
    {
      id: "standard",
      icon: Zap,
      name: "Standard",
      badge: "2 meses grátis",
      price: "R$ 2.970",
      period: "/ano",
      saving: "Economia de R$ 594",
      description: "Plano anual com custo reduzido para começar a criar vídeos com consistência.",
      credits: "300 créditos/mês",
      resolution: "720p HD",
      features: [
        { label: "300 créditos por mês", ok: true },
        { label: "Vídeos em 720p HD", ok: true },
        { label: "Até 10 fotos por vídeo", ok: true },
        { label: "Logo + texto overlay", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "1080p Full HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar",
      featured: false,
      enterpriseContact: false,
    },
    {
      id: "plus",
      icon: Star,
      name: "Plus",
      badge: "Mais escolhido",
      price: "R$ 4.970",
      period: "/ano",
      saving: "Economia de R$ 994",
      description: "Melhor custo por crédito. Ideal para times que geram conteúdo toda semana.",
      credits: "600 créditos/mês",
      resolution: "1080p Full HD",
      features: [
        { label: "600 créditos por mês", ok: true },
        { label: "Vídeos em 1080p Full HD", ok: true },
        { label: "Até 15 fotos por vídeo", ok: true },
        { label: "Logo + texto overlay", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Renderização prioritária", ok: false },
      ],
      cta: "Assinar",
      featured: true,
      enterpriseContact: false,
    },
    {
      id: "premium",
      icon: Crown,
      name: "Premium",
      badge: "2 meses grátis",
      price: "R$ 16.970",
      period: "/ano",
      saving: "Economia de R$ 3.394",
      description: "Contrato anual com 4K, renderização prioritária e suporte dedicado.",
      credits: "800 créditos/mês",
      resolution: "4K Ultra HD",
      features: [
        { label: "800 créditos por mês", ok: true },
        { label: "Vídeos em 4K Ultra HD", ok: true },
        { label: "Até 20 fotos por vídeo", ok: true },
        { label: "Logo + texto overlay", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Renderização prioritária", ok: true },
        { label: "Suporte dedicado", ok: true },
      ],
      cta: "Assinar",
      featured: false,
      enterpriseContact: false,
    },
  ],
} as const;

// Feature comparison rows
const COMPARISON = [
  { label: "Créditos / mês", standard: "300", plus: "600", premium: "800" },
  { label: "Resolução máxima", standard: "720p", plus: "1080p", premium: "4K" },
  { label: "Fotos por vídeo", standard: "até 10", plus: "até 15", premium: "até 20" },
  { label: "Estilos visuais", standard: "3", plus: "3", premium: "3" },
  { label: "Formatos (Reels/Feed/YT)", standard: true, plus: true, premium: true },
  { label: "Logo + texto overlay", standard: true, plus: true, premium: true },
  { label: "Renderização prioritária", standard: false, plus: false, premium: true },
  { label: "Suporte dedicado", standard: false, plus: false, premium: true },
];

// FAQ items
const VIDEO_FAQS = [
  {
    question: "O que é o ImobCreatorVideo?",
    answer:
      "É uma plataforma que transforma suas fotos de imóveis em vídeos profissionais de forma automática, usando inteligência artificial.",
  },
  {
    question: "Preciso ter conhecimento em edição de vídeo?",
    answer:
      "Não! Nossa plataforma é totalmente automatizada. Você só precisa enviar as fotos e escolher o estilo desejado.",
  },
  {
    question: "Como funcionam os créditos?",
    answer:
      "Cada vídeo gerado consome 100 créditos (planos Standard e Plus) ou 200 créditos (plano Premium com qualidade 4K). Seus créditos são renovados a cada ciclo de cobrança.",
  },
  {
    question: "Os créditos acumulam?",
    answer:
      "Sim! Os créditos não utilizados permanecem na sua conta mesmo após o cancelamento da assinatura.",
  },
  {
    question: "Quanto tempo leva para gerar um vídeo?",
    answer:
      "Em média, um vídeo é gerado em 2 a 5 minutos, dependendo da quantidade de fotos e da duração escolhida.",
  },
  {
    question: "Posso editar o vídeo depois de pronto?",
    answer:
      "Atualmente não oferecemos edição pós-geração, mas você pode criar um novo vídeo com configurações diferentes quantas vezes quiser (dentro do seu saldo de créditos).",
  },
  {
    question: "Posso trocar de plano a qualquer momento?",
    answer:
      "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor será calculado proporcionalmente ao período restante.",
  },
  {
    question: "Como funciona o plano anual?",
    answer:
      "No plano anual você paga 10 meses e ganha 2 meses grátis, economizando aproximadamente 17% em relação ao plano mensal. O valor é cobrado à vista e o acesso liberado imediatamente por 12 meses.",
  },
];

// Accordion item
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
          {answer}
        </div>
      )}
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

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="bg-accent/10 text-accent mb-4">Módulo Vídeo IA</Badge>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            Planos de Vídeo para ImobCreator AI
          </h1>
          <p className="text-muted-foreground">
            Gere vídeos imobiliários cinematográficos com IA. Escolha o plano ideal para o seu volume de produção.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {billing === "monthly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                billing === "yearly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {billing === "yearly" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              Anual
            </button>
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-semibold">
              {billing === "yearly" ? "2 meses grátis · -17%" : "Economize no anual"}
            </span>
          </div>
        </div>

        {/* Current plan info */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Workspace: <span className="font-semibold text-foreground">{workspaceName ?? "N/D"}</span> · plano base{" "}
            <span className="font-semibold text-foreground uppercase">{workspacePlan ?? currentPlan ?? "N/D"}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Add-on ativo:{" "}
            <span className="font-semibold text-foreground">
              {overview?.addOn?.addon_type?.toUpperCase?.() ?? "N/D"}
            </span>
            {overview?.addOn?.credits_total === null
              ? " · créditos ilimitados"
              : ` · ${Math.max(
                  (overview?.addOn?.credits_total ?? 0) - (overview?.addOn?.credits_used ?? 0),
                  0
                )} créditos restantes de ${overview?.addOn?.credits_total ?? 0}`}
          </p>
          {!isAdminWorkspace && (
            <p className="text-xs text-muted-foreground">
              Somente owner/admin do workspace pode ativar ou trocar o add-on de vídeo.
            </p>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {activePlans.map((p) => {
            const Icon = p.icon;
            const isCurrent = overview?.addOn?.addon_type === p.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-3xl border p-8 flex flex-col transition-all",
                  p.featured
                    ? "border-accent/40 bg-primary text-primary-foreground shadow-xl scale-[1.01]"
                    : p.id === "premium"
                    ? "border-amber-400/30 bg-gradient-to-b from-card to-amber-500/5"
                    : "border-border bg-card"
                )}
              >
                {/* Plan header */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      p.featured
                        ? "bg-accent text-primary"
                        : p.id === "premium"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-accent/10 text-accent"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500">
                        Plano atual
                      </span>
                    )}
                    {p.badge && (
                      <span
                        className={cn(
                          "text-xs font-semibold px-3 py-1 rounded-full",
                          p.featured
                            ? "bg-accent text-primary"
                            : p.id === "premium"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-accent/10 text-accent"
                        )}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold mb-1">{p.name}</h3>
                <p className={cn("text-sm mb-5", p.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {p.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold">{p.price}</span>
                    <span className={cn("text-sm", p.featured ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {p.period}
                    </span>
                  </div>
                  {p.saving && (
                    <span className="text-xs text-emerald-500 font-semibold">{p.saving}</span>
                  )}
                </div>

                {/* Quick specs */}
                <div className={cn("rounded-xl p-3 mb-5 flex gap-4", p.featured ? "bg-white/5" : "bg-muted/50")}>
                  <div className="text-center flex-1">
                    <p className="font-bold text-sm">{p.credits}</p>
                    <p className={cn("text-[10px]", p.featured ? "text-primary-foreground/50" : "text-muted-foreground")}>
                      créditos
                    </p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center flex-1">
                    <p className="font-bold text-sm">{p.resolution}</p>
                    <p className={cn("text-[10px]", p.featured ? "text-primary-foreground/50" : "text-muted-foreground")}>
                      qualidade
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5">
                      {f.ok ? (
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          f.ok
                            ? p.featured
                              ? "text-primary-foreground/90"
                              : "text-foreground/80"
                            : "text-muted-foreground/40"
                        )}
                      >
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/video-dashboard")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Add-on ativo
                  </Button>
                ) : (
                  <Button
                    variant={p.featured ? "hero" : "default"}
                    size="lg"
                    className="w-full group"
                    disabled={activateAddonMutation.isPending}
                    onClick={() =>
                      isAdminWorkspace
                        ? activateAddonMutation.mutate(
                            {
                              addonType: p.id as "standard" | "plus" | "premium",
                              billingCycle: billing,
                            },
                            {
                              onSuccess: async () => {
                                if (workspaceId) {
                                  await dispatchN8nEvent("video_addon_activated", {
                                    workspace_id: workspaceId,
                                    addon_type: p.id,
                                    billing_cycle: billing,
                                    workspace_plan: workspacePlan ?? currentPlan ?? null,
                                  });
                                }
                                navigate("/video-dashboard");
                              },
                            }
                          )
                        : navigate("/plano")
                    }
                  >
                    {p.cta}
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Legal disclaimer */}
        <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Ao clicar em "Assinar", você declara que leu e concorda com nossos{" "}
          <Link to="/termos" className="underline hover:text-accent transition-colors">Termos de Uso</Link>,{" "}
          <Link to="/termos#privacidade" className="underline hover:text-accent transition-colors">Política de Privacidade</Link>,{" "}
          <Link to="/termos#reembolso" className="underline hover:text-accent transition-colors">Política de Reembolso</Link> e{" "}
          <Link to="/termos#cancelamento" className="underline hover:text-accent transition-colors">Política de Cancelamento</Link>.
        </p>

        {/* Comparison table */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-5">Comparativo completo</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-muted-foreground font-medium">Recurso</th>
                    {(["standard", "plus", "premium"] as const).map((id) => (
                      <th key={id} className="p-4 text-center min-w-[120px]">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            id === "plus"
                              ? "bg-accent text-accent-foreground"
                              : id === "premium"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {id === "standard" ? "Standard" : id === "plus" ? "Plus" : "Premium"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr
                      key={row.label}
                      className={cn("border-b border-border last:border-0", i % 2 === 0 && "bg-muted/20")}
                    >
                      <td className="p-4 font-medium text-foreground">{row.label}</td>
                      {(["standard", "plus", "premium"] as const).map((id) => {
                        const val = row[id];
                        return (
                          <td key={id} className="p-4 text-center">
                            {typeof val === "boolean" ? (
                              val ? (
                                <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-muted-foreground">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Perguntas frequentes</h2>
            <p className="text-muted-foreground">Tire suas dúvidas sobre nossos planos</p>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {VIDEO_FAQS.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          {/* Still have questions CTA */}
          <div className="mt-10 rounded-3xl border border-border bg-muted/30 p-8 text-center max-w-3xl mx-auto">
            <h3 className="font-display text-lg font-bold text-foreground mb-2">Ainda tem dúvidas?</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Nossa equipe está disponível para ajudar você a escolher o plano ideal.
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                window.open(
                  "https://wa.me/5511999999999?text=Olá!+Tenho+dúvidas+sobre+os+planos+de+vídeo+IA",
                  "_blank"
                )
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Entre em contato
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 text-center">
          <Film className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Pronto para criar seu primeiro vídeo?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload das fotos, escolha o estilo e em menos de 3 minutos seu vídeo está pronto para publicar.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/video-creator")}
          >
            Criar vídeo agora
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

      </div>
    </AppLayout>
  );
};

export default VideosPricingPage;
