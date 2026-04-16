/**
 * ModuleWidgets — Cards de resumo por módulo no Dashboard Home.
 * Cada widget mostra créditos, stats rápidos e CTAs.
 */
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Palette,
  Film,
  MessageCircle,
  Globe,
  Users,
  Share2,
} from "lucide-react";
import type { UserSubscription } from "@/hooks/useUserSubscriptions";

// ── Shared widget shell ──────────────────────────────────────────────────────

interface WidgetProps {
  subscription: UserSubscription;
}

function WidgetShell({
  icon: Icon,
  label,
  accent,
  creditsUsed,
  creditsTotal,
  primaryPath,
  primaryLabel,
  secondaryPath,
  secondaryLabel,
  children,
}: {
  icon: React.ElementType;
  label: string;
  accent: string;
  creditsUsed: number;
  creditsTotal: number;
  primaryPath: string;
  primaryLabel: string;
  secondaryPath?: string;
  secondaryLabel?: string;
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const pct = creditsTotal > 0 ? Math.min((creditsUsed / creditsTotal) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-4 hover:border-accent/30 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}14` }}>
            <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{label}</p>
            <p className="text-[11px] text-muted-foreground">{creditsUsed}/{creditsTotal} créditos</p>
          </div>
        </div>
        <button
          onClick={() => navigate(primaryPath)}
          className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
        >
          Ver tudo <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Credits bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>

      {/* Module-specific content */}
      {children}

      {/* CTAs */}
      <div className="flex gap-2 mt-auto">
        {secondaryPath && secondaryLabel && (
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate(secondaryPath)}>
            {secondaryLabel}
          </Button>
        )}
        <Button size="sm" className="flex-1 text-xs" onClick={() => navigate(primaryPath)}>
          {primaryLabel} <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ── Criativos Widget ─────────────────────────────────────────────────────────

export function CriativosWidget({ subscription }: WidgetProps) {
  const { user } = useAuth();
  const { data: count = 0 } = useQuery({
    queryKey: ["widget-criativos-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("creatives_gallery")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  return (
    <WidgetShell
      icon={Palette}
      label="Criativos"
      accent="#7C3AED"
      creditsUsed={subscription.credits_used}
      creditsTotal={subscription.credits_total}
      primaryPath="/dashboard/criativos"
      primaryLabel="Galeria"
      secondaryPath="/dashboard/criativos/novo"
      secondaryLabel="+ Novo"
    >
      <p className="text-xs text-muted-foreground">{count} criativos gerados</p>
    </WidgetShell>
  );
}

// ── Vídeos Widget ────────────────────────────────────────────────────────────

export function VideosWidget({ subscription }: WidgetProps) {
  const { user } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ["widget-videos-stats", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("video_jobs")
        .select("status")
        .eq("created_by", user!.id);
      const total = data?.length ?? 0;
      const completed = data?.filter((v) => v.status === "completed").length ?? 0;
      return { total, completed };
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  return (
    <WidgetShell
      icon={Film}
      label="Vídeos"
      accent="#F59E0B"
      creditsUsed={subscription.credits_used}
      creditsTotal={subscription.credits_total}
      primaryPath="/dashboard/videos"
      primaryLabel="Meus Vídeos"
      secondaryPath="/dashboard/videos/novo"
      secondaryLabel="+ Novo"
    >
      <p className="text-xs text-muted-foreground">
        {stats?.completed ?? 0} vídeos prontos de {stats?.total ?? 0}
      </p>
    </WidgetShell>
  );
}

// ── WhatsApp Widget ──────────────────────────────────────────────────────────

export function WhatsAppWidget({ subscription }: WidgetProps) {
  return (
    <WidgetShell
      icon={MessageCircle}
      label="WhatsApp"
      accent="#25D366"
      creditsUsed={subscription.credits_used}
      creditsTotal={subscription.credits_total}
      primaryPath="/dashboard/whatsapp"
      primaryLabel="Inbox"
      secondaryPath="/dashboard/whatsapp/fluxos"
      secondaryLabel="Fluxos"
    >
      <p className="text-xs text-muted-foreground">Atendimento e automações</p>
    </WidgetShell>
  );
}

// ── Site/Imobiliária Widget ──────────────────────────────────────────────────

export function SiteWidget({ subscription }: WidgetProps) {
  return (
    <WidgetShell
      icon={Globe}
      label="Site Imobiliário"
      accent="#0EA5E9"
      creditsUsed={subscription.credits_used}
      creditsTotal={subscription.credits_total}
      primaryPath="/dashboard/site"
      primaryLabel="Meu Site"
    >
      <p className="text-xs text-muted-foreground">Sites e portais de imóveis</p>
    </WidgetShell>
  );
}

// ── CRM Widget ───────────────────────────────────────────────────────────────

export function CRMWidget({ subscription }: WidgetProps) {
  return (
    <WidgetShell
      icon={Users}
      label="CRM"
      accent="#10B981"
      creditsUsed={subscription.credits_used}
      creditsTotal={subscription.credits_total}
      primaryPath="/dashboard/crm"
      primaryLabel="Pipeline"
    >
      <p className="text-xs text-muted-foreground">Pipeline de leads e clientes</p>
    </WidgetShell>
  );
}

// ── Social Widget ────────────────────────────────────────────────────────────

export function SocialWidget({ subscription }: WidgetProps) {
  return (
    <WidgetShell
      icon={Share2}
      label="Redes Sociais"
      accent="#EC4899"
      creditsUsed={subscription.credits_used}
      creditsTotal={subscription.credits_total}
      primaryPath="/dashboard/social/calendario"
      primaryLabel="Calendário"
      secondaryPath="/dashboard/social/conectar"
      secondaryLabel="Conectar"
    >
      <p className="text-xs text-muted-foreground">Agendamento e publicação</p>
    </WidgetShell>
  );
}

// ── Module map ───────────────────────────────────────────────────────────────

export const MODULE_WIDGETS: Record<string, React.ComponentType<WidgetProps>> = {
  criativos: CriativosWidget,
  videos: VideosWidget,
  whatsapp: WhatsAppWidget,
  site: SiteWidget,
  crm: CRMWidget,
  social: SocialWidget,
};
