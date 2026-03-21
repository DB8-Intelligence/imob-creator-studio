import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

const PLANS = {
  monthly: [
    {
      id: "starter",
      icon: Zap,
      name: "Vídeo Starter",
      badge: "Add-on",
      price: "R$ 97",
      period: "/mês",
      saving: null,
      description: "Para corretores que querem experimentar vídeo IA com baixo volume e custo de entrada.",
      requires: "Requer plano Créditos",
      videos: "5 vídeos/mês",
      resolution: "1080p Full HD",
      features: [
        { label: "5 vídeos por mês", ok: true },
        { label: "1080p Full HD", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Overlay IA (título + CTA)", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Suporte prioritário", ok: false },
        { label: "Volume customizado", ok: false },
      ],
      cta: "Contratar add-on",
      featured: false,
      enterpriseContact: false,
    },
    {
      id: "pro",
      icon: Star,
      name: "Vídeo Pro",
      badge: "Mais escolhido",
      price: "R$ 497",
      period: "/mês",
      saving: null,
      description: "Incluído no plano Pro. Volume e qualidade profissional para operação de conteúdo frequente.",
      requires: "Incluído no plano Pro",
      videos: "20 vídeos/mês",
      resolution: "4K Ultra HD",
      features: [
        { label: "20 vídeos por mês", ok: true },
        { label: "4K Ultra HD", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Overlay IA (título + CTA)", ok: true },
        { label: "Histórico de vídeos", ok: true },
        { label: "Suporte prioritário", ok: true },
        { label: "Volume customizado", ok: false },
      ],
      cta: "Ver plano Pro",
      featured: true,
      enterpriseContact: false,
    },
    {
      id: "enterprise",
      icon: Crown,
      name: "Vídeo Enterprise",
      badge: "Imobiliárias",
      price: "Sob proposta",
      period: "",
      saving: null,
      description: "Para imobiliárias com alto volume. Vídeos ilimitados em 4K, multi-workspace e suporte dedicado.",
      requires: "Requer plano VIP",
      videos: "Volume customizado",
      resolution: "4K + suporte dedicado",
      features: [
        { label: "Volume customizado de vídeos", ok: true },
        { label: "4K Ultra HD garantido", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Overlay IA avançada", ok: true },
        { label: "Histórico completo", ok: true },
        { label: "Suporte dedicado", ok: true },
        { label: "SLA e implantação", ok: true },
      ],
      cta: "Falar com especialista",
      featured: false,
      enterpriseContact: true,
    },
  ],
  yearly: [
    {
      id: "starter",
      icon: Zap,
      name: "Vídeo Starter",
      badge: "1 mês grátis",
      price: "R$ 970",
      period: "/ano",
      saving: "Economia de R$194",
      description: "Add-on anual com custo reduzido para testar vídeo IA com consistência.",
      requires: "Requer plano Créditos",
      videos: "5 vídeos/mês",
      resolution: "1080p Full HD",
      features: [
        { label: "5 vídeos por mês", ok: true },
        { label: "1080p Full HD", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Overlay IA (título + CTA)", ok: true },
        { label: "4K Ultra HD", ok: false },
        { label: "Suporte prioritário", ok: false },
        { label: "Volume customizado", ok: false },
      ],
      cta: "Assinar anual",
      featured: false,
      enterpriseContact: false,
    },
    {
      id: "pro",
      icon: Star,
      name: "Vídeo Pro",
      badge: "2 meses grátis",
      price: "R$ 4.970",
      period: "/ano",
      saving: "Economia de R$994",
      description: "Melhor custo por vídeo. Ideal para times que geram conteúdo toda semana.",
      requires: "Incluído no plano Pro anual",
      videos: "20 vídeos/mês",
      resolution: "4K Ultra HD",
      features: [
        { label: "20 vídeos por mês", ok: true },
        { label: "4K Ultra HD", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Overlay IA (título + CTA)", ok: true },
        { label: "Histórico de vídeos", ok: true },
        { label: "Suporte prioritário", ok: true },
        { label: "Volume customizado", ok: false },
      ],
      cta: "Garantir anual",
      featured: true,
      enterpriseContact: false,
    },
    {
      id: "enterprise",
      icon: Crown,
      name: "Vídeo Enterprise",
      badge: "Implantação estratégica",
      price: "Sob proposta",
      period: "",
      saving: null,
      description: "Contrato anual com escopo enterprise, SLA, multi-tenant e vídeos em volume.",
      requires: "Requer plano VIP anual",
      videos: "Volume customizado",
      resolution: "4K + SLA dedicado",
      features: [
        { label: "Volume customizado de vídeos", ok: true },
        { label: "4K Ultra HD garantido", ok: true },
        { label: "3 estilos visuais", ok: true },
        { label: "Reels, Feed e YouTube", ok: true },
        { label: "Overlay IA avançada", ok: true },
        { label: "Histórico completo", ok: true },
        { label: "Suporte dedicado + SLA", ok: true },
        { label: "Implantação e consultoria", ok: true },
      ],
      cta: "Montar proposta",
      featured: false,
      enterpriseContact: true,
    },
  ],
} as const;

// Feature comparison rows
const COMPARISON = [
  { label: "Vídeos / mês", starter: "5", pro: "20", enterprise: "Ilimitado" },
  { label: "Resolução máxima", starter: "1080p", pro: "4K", enterprise: "4K" },
  { label: "Estilos visuais", starter: "3", pro: "3", enterprise: "3" },
  { label: "Formatos (Reels/Feed/YT)", starter: true, pro: true, enterprise: true },
  { label: "Overlay IA (título + CTA)", starter: true, pro: true, enterprise: true },
  { label: "Histórico de vídeos", starter: false, pro: true, enterprise: true },
  { label: "Suporte prioritário", starter: false, pro: true, enterprise: true },
  { label: "SLA e implantação", starter: false, pro: false, enterprise: true },
  { label: "Volume enterprise", starter: false, pro: false, enterprise: true },
];

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
            Add-ons de geração de vídeo para cada tamanho de operação. Disponíveis nos planos Créditos, Pro e VIP.
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
              {billing === "yearly" ? "Até 2 meses grátis" : "Economize no anual"}
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Workspace: <span className="font-semibold text-foreground">{workspaceName ?? "N/D"}</span> · plano base <span className="font-semibold text-foreground uppercase">{workspacePlan ?? currentPlan ?? "N/D"}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Add-on ativo: <span className="font-semibold text-foreground">{overview?.addOn?.addon_type?.toUpperCase?.() ?? "N/D"}</span>
            {overview?.addOn?.credits_total === null
              ? " · créditos ilimitados"
              : ` · ${Math.max((overview?.addOn?.credits_total ?? 0) - (overview?.addOn?.credits_used ?? 0), 0)} créditos restantes de ${(overview?.addOn?.credits_total ?? 0)}`}
          </p>
          {!isAdminWorkspace && (
            <p className="text-xs text-muted-foreground">Somente owner/admin do workspace pode ativar ou trocar o add-on de vídeo.</p>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {activePlans.map((p) => {
            const Icon = p.icon;
            const isCurrent = overview?.addOn?.addon_type === p.id;
            const canActivate =
              isAdminWorkspace &&
              ((p.id === "starter") ||
                (p.id === "pro" && (workspacePlan === "pro" || workspacePlan === "vip" || currentPlan === "pro" || currentPlan === "vip")) ||
                (p.id === "enterprise" && (workspacePlan === "vip" || currentPlan === "vip")));
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-3xl border p-8 flex flex-col transition-all",
                  p.featured
                    ? "border-accent/40 bg-primary text-primary-foreground shadow-xl scale-[1.01]"
                    : p.id === "enterprise"
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
                        : p.id === "enterprise"
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
                    <span
                      className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-full",
                        p.featured
                          ? "bg-accent text-primary"
                          : p.id === "enterprise"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-accent/10 text-accent"
                      )}
                    >
                      {p.badge}
                    </span>
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
                  <p className={cn("text-xs mt-1", p.featured ? "text-primary-foreground/50" : "text-muted-foreground/60")}>
                    {p.requires}
                  </p>
                </div>

                {/* Quick specs */}
                <div className={cn("rounded-xl p-3 mb-5 flex gap-4", p.featured ? "bg-white/5" : "bg-muted/50")}>
                  <div className="text-center flex-1">
                    <p className="font-bold text-sm">{p.videos}</p>
                    <p className={cn("text-[10px]", p.featured ? "text-primary-foreground/50" : "text-muted-foreground")}>volume</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center flex-1">
                    <p className="font-bold text-sm">{p.resolution}</p>
                    <p className={cn("text-[10px]", p.featured ? "text-primary-foreground/50" : "text-muted-foreground")}>qualidade</p>
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
                            ? p.featured ? "text-primary-foreground/90" : "text-foreground/80"
                            : "text-muted-foreground/40"
                        )}
                      >
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {p.enterpriseContact && !canActivate ? (
                  <Button
                    variant={p.featured ? "hero" : "outline"}
                    size="lg"
                    className="w-full"
                    onClick={() => window.open("https://wa.me/5511999999999?text=Tenho+interesse+no+plano+enterprise+de+vídeo", "_blank")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {p.cta}
                  </Button>
                ) : isCurrent ? (
                  <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/video-dashboard")}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Add-on ativo
                  </Button>
                ) : canActivate ? (
                  <Button
                    variant={p.featured ? "hero" : "default"}
                    size="lg"
                    className="w-full group"
                    disabled={activateAddonMutation.isPending}
                    onClick={() =>
                      activateAddonMutation.mutate(
                        { addonType: p.id as "starter" | "pro" | "enterprise", billingCycle: billing },
                        {
                          onSuccess: () => navigate("/video-dashboard"),
                        },
                      )
                    }
                  >
                    Ativar add-on
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <Button
                    variant={p.featured ? "hero" : "default"}
                    size="lg"
                    className="w-full group"
                    onClick={() => navigate("/plano")}
                  >
                    {p.id === "starter" ? "Ver condições" : "Fazer upgrade do plano base"}
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-5">Comparativo completo</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-muted-foreground font-medium">Recurso</th>
                    {(["starter", "pro", "enterprise"] as const).map((id) => (
                      <th key={id} className="p-4 text-center min-w-[120px]">
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          id === "pro" ? "bg-accent text-accent-foreground" :
                          id === "enterprise" ? "bg-amber-500/10 text-amber-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {id === "starter" ? "Starter" : id === "pro" ? "Pro" : "Enterprise"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.label} className={cn("border-b border-border last:border-0", i % 2 === 0 && "bg-muted/20")}>
                      <td className="p-4 font-medium text-foreground">{row.label}</td>
                      {(["starter", "pro", "enterprise"] as const).map((id) => {
                        const val = row[id];
                        return (
                          <td key={id} className="p-4 text-center">
                            {typeof val === "boolean" ? (
                              val
                                ? <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                                : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
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

        {/* Bottom CTA */}
        <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 text-center">
          <Film className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Pronto para criar seu primeiro vídeo?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload das fotos, escolha o estilo e em menos de 3 minutos seu vídeo está em 4K pronto para publicar.
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
