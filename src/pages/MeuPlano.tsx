import { useEffect, useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Plus, Zap, FileText, Video, Palette } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface UserPlan {
  id: string;
  user_id: string;
  status: string;
  plan_slug: string;
  next_billing_at: string | null;
  addon_videos_ffmpeg: boolean;
  addon_videos_shotstack_credits: number;
  addon_whatsapp_pro: boolean;
  addon_social_autopilot: boolean;
  addon_portais_xml: boolean;
  addon_bundle: boolean;
  usage_posts_ai: number;
  usage_words_ai: number;
  usage_videos: number;
  usage_criativos: number;
  usage_reset_at: string | null;
  [key: string]: unknown;
}

interface BillingEvent {
  id: string;
  created_at: string;
  product_name: string;
  amount: number;
  status: string;
}

// ── Env URLs ─────────────────────────────────────────────────────────────────
const KIWIFY_PROFISSIONAL = import.meta.env.VITE_KIWIFY_PROFISSIONAL_URL || "#";
const KIWIFY_VIDEOS_FFMPEG = import.meta.env.VITE_KIWIFY_ADDON_VIDEOS_FFMPEG_URL || "#";
const KIWIFY_WHATSAPP_PRO = import.meta.env.VITE_KIWIFY_ADDON_WHATSAPP_PRO_URL || "#";
const KIWIFY_SOCIAL_AUTOPILOT = import.meta.env.VITE_KIWIFY_ADDON_SOCIAL_AUTOPILOT_URL || "#";
const KIWIFY_PORTAIS_XML = import.meta.env.VITE_KIWIFY_ADDON_PORTAIS_XML_URL || "#";
const KIWIFY_BUNDLE = import.meta.env.VITE_KIWIFY_ADDON_BUNDLE_URL || "#";

const addonsMeta = [
  { key: "addon_videos_ffmpeg", label: "Videos com IA", icon: "🎬", url: KIWIFY_VIDEOS_FFMPEG },
  { key: "addon_whatsapp_pro", label: "WhatsApp Pro", icon: "💬", url: KIWIFY_WHATSAPP_PRO },
  { key: "addon_social_autopilot", label: "Social Autopilot", icon: "📣", url: KIWIFY_SOCIAL_AUTOPILOT },
  { key: "addon_portais_xml", label: "Portais XML", icon: "🏠", url: KIWIFY_PORTAIS_XML },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MeuPlano() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [billing, setBilling] = useState<BillingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data: planData } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setPlan(planData as UserPlan | null);

      const { data: billingData } = await supabase
        .from("billing_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setBilling((billingData as BillingEvent[] | null) ?? []);
      setLoading(false);
    };

    load();
  }, [user]);

  const isActive = plan?.status === "active";
  const hasBundle = plan?.addon_bundle ?? false;

  const activeAddons = addonsMeta.filter(
    (a) => hasBundle || (plan && plan[a.key] === true)
  );
  const inactiveAddons = addonsMeta.filter(
    (a) => !hasBundle && (!plan || plan[a.key] !== true)
  );

  const usagePosts = plan?.usage_posts_ai ?? 0;
  const usageWords = plan?.usage_words_ai ?? 0;
  const usageVideos = plan?.usage_videos ?? 0;
  const usageCriativos = plan?.usage_criativos ?? 0;
  const resetDate = plan?.usage_reset_at
    ? new Date(plan.usage_reset_at).toLocaleDateString("pt-BR")
    : "—";

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-10">
        <h1 className="text-2xl font-bold text-[#0A1628]">Meu Plano</h1>

        {/* ── Seu Plano ────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#0A1628] text-white hover:bg-[#162038]">Profissional</Badge>
                <Badge variant={isActive ? "default" : "destructive"} className={isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                  {isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              {plan?.next_billing_at && (
                <p className="text-sm text-[#6B7280]">
                  Próxima cobrança:{" "}
                  <span className="font-medium text-[#374151]">
                    {new Date(plan.next_billing_at).toLocaleDateString("pt-BR")}
                  </span>
                </p>
              )}
            </div>
            <a href={KIWIFY_PROFISSIONAL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                Gerenciar assinatura <ExternalLink size={14} />
              </Button>
            </a>
          </div>
        </section>

        {/* ── Seus Módulos Ativos ──────────────────────────────────────────── */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Seus módulos ativos</h2>

          {hasBundle && (
            <div className="mb-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-full border border-amber-200">
              🎯 Bundle Completo ativo — todos os módulos inclusos
            </div>
          )}

          {activeAddons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeAddons.map((a) => (
                <div key={a.key} className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <span className="text-xl">{a.icon}</span>
                  <span className="font-medium text-[#0A1628] text-sm">{a.label}</span>
                  <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-100">Ativo</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF] mb-4">Nenhum módulo ativo.</p>
          )}

          {inactiveAddons.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-[#6B7280] mb-3">Módulos disponíveis:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inactiveAddons.map((a) => (
                  <a
                    key={a.key}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-dashed border-[#D1D5DB] rounded-lg p-3 hover:border-[#0A1628] hover:bg-[#F9FAFB] transition-colors group"
                  >
                    <span className="text-xl opacity-50 group-hover:opacity-100">{a.icon}</span>
                    <span className="text-sm text-[#6B7280] group-hover:text-[#0A1628]">{a.label}</span>
                    <Plus size={14} className="ml-auto text-[#9CA3AF] group-hover:text-[#0A1628]" />
                  </a>
                ))}
              </div>

              {!hasBundle && (
                <a
                  href={KIWIFY_BUNDLE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  🎯 Contratar Bundle Completo e economizar R$69 <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── Uso este mês ─────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0A1628]">Uso este mês</h2>
            <span className="text-xs text-[#9CA3AF]">Renova em {resetDate}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UsageBar icon={<FileText size={16} />} label="Posts IA" used={usagePosts} limit={200} />
            <UsageBar icon={<Zap size={16} />} label="Palavras IA" used={usageWords} limit={500000} format />
            <UsageBar icon={<Video size={16} />} label="Vídeos" used={usageVideos} limit={null} />
            <UsageBar icon={<Palette size={16} />} label="Criativos" used={usageCriativos} limit={null} />
          </div>
        </section>

        {/* ── Histórico ────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Histórico</h2>

          {billing.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left text-[#6B7280]">
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Produto</th>
                    <th className="pb-2 font-medium">Valor</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.map((b) => (
                    <tr key={b.id} className="border-b border-[#F3F4F6]">
                      <td className="py-2.5 text-[#374151]">
                        {new Date(b.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2.5 text-[#374151]">{b.product_name}</td>
                      <td className="py-2.5 text-[#374151]">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(b.amount / 100)}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant="outline"
                          className={
                            b.status === "paid" || b.status === "approved"
                              ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                              : "text-[#6B7280] border-[#E5E7EB]"
                          }
                        >
                          {b.status === "paid" || b.status === "approved" ? "Pago" : b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF]">Nenhum pagamento registrado.</p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

// ── UsageBar ─────────────────────────────────────────────────────────────────
function UsageBar({
  icon,
  label,
  used,
  limit,
  format = false,
}: {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number | null;
  format?: boolean;
}) {
  const fmt = (n: number) => (format ? n.toLocaleString("pt-BR") : String(n));
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-[#374151] font-medium">
          {icon} {label}
        </span>
        <span className="text-[#6B7280]">
          {fmt(used)}{limit ? ` / ${fmt(limit)}` : ""}
        </span>
      </div>
      {limit ? (
        <Progress value={pct} className="h-2" />
      ) : (
        <div className="h-2 bg-[#F3F4F6] rounded-full" />
      )}
    </div>
  );
}
