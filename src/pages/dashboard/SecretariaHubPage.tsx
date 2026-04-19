// ============================================================
// SecretariaHubPage — Sprint 10: Hub consolidado da Secretária Virtual
// Rota: /dashboard/secretaria
//
// Mostra pro corretor o que a IA está fazendo: métricas das últimas 24h/7d
// e activity feed com os eventos recentes (leads qualificados, msgs
// respondidas, visitas agendadas, follow-ups enviados).
// ============================================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot, Mic, MessageSquare, Users, Calendar, Bell, ArrowRight,
  TrendingUp, Inbox, Sparkles, Flame, PhoneCall,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Metrics {
  messages_today:      number;
  ai_replies_today:    number;
  qualified_leads:     number;
  bookings_this_week:  number;
  followups_sent:      number;
  avg_confidence:      number; // 0-1
}

interface ActivityEvent {
  id:        string;
  kind:      "message_received" | "ai_replied" | "lead_qualified" | "booking_created" | "followup_sent" | "voice_sent";
  title:     string;
  subtitle:  string;
  at:        string;
}

const DEFAULTS: Metrics = {
  messages_today: 0, ai_replies_today: 0, qualified_leads: 0,
  bookings_this_week: 0, followups_sent: 0, avg_confidence: 0,
};

export default function SecretariaHubPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>(DEFAULTS);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [agentName, setAgentName] = useState<string>("Secretária Virtual");
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [whatsappConnected, setWhatsappConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - 7);

      const [instRes, inboxTodayRes, sentTodayRes, convsRes, bookingsRes, followupsRes] = await Promise.all([
        supabase
          .from("user_whatsapp_instances")
          .select("ai_agent_name, ai_enabled, status")
          .eq("user_id", user!.id)
          .maybeSingle(),
        workspaceId
          ? supabase
              .from("whatsapp_inbox")
              .select("id", { count: "exact", head: true })
              .eq("workspace_id", workspaceId)
              .gte("received_at", todayStart.toISOString())
          : Promise.resolve({ count: 0 }),
        supabase
          .from("whatsapp_sent_messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .gte("created_at", todayStart.toISOString()),
        supabase
          .from("whatsapp_conversations")
          .select("lead_qualification")
          .eq("user_id", user!.id),
        supabase
          .from("calendar_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .gte("created_at", weekStart.toISOString()),
        supabase
          .from("whatsapp_followup_log")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("outcome", "sent")
          .gte("created_at", todayStart.toISOString()),
      ]);

      if (cancelled) return;

      const qualified = (convsRes.data ?? []).filter((c) => {
        const q = (c as { lead_qualification?: { confidence?: number } }).lead_qualification;
        return q?.confidence && q.confidence >= 0.5;
      });
      const totalConfidence = (convsRes.data ?? []).reduce((sum, c) => {
        const q = (c as { lead_qualification?: { confidence?: number } }).lead_qualification;
        return sum + (q?.confidence ?? 0);
      }, 0);
      const avgConfidence = convsRes.data?.length
        ? totalConfidence / convsRes.data.length
        : 0;

      setMetrics({
        messages_today:     inboxTodayRes.count ?? 0,
        ai_replies_today:   sentTodayRes.count ?? 0,
        qualified_leads:    qualified.length,
        bookings_this_week: bookingsRes.count ?? 0,
        followups_sent:     followupsRes.count ?? 0,
        avg_confidence:     avgConfidence,
      });

      if (instRes.data) {
        setAgentName((instRes.data.ai_agent_name as string) ?? "Secretária Virtual");
        setAiEnabled(Boolean(instRes.data.ai_enabled));
        setWhatsappConnected(instRes.data.status === "connected");
      }

      // Activity feed: pega os últimos 20 eventos misturados
      const [recentSent, recentBookings, recentFollowups] = await Promise.all([
        supabase
          .from("whatsapp_sent_messages")
          .select("id, to_phone, body, created_at, evolution_response")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("calendar_events")
          .select("id, summary, start_at, created_at")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("whatsapp_followup_log")
          .select("id, phone, created_at, outcome")
          .eq("user_id", user!.id)
          .eq("outcome", "sent")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const events: ActivityEvent[] = [];

      for (const m of (recentSent.data ?? [])) {
        const evo = (m as { evolution_response?: Record<string, unknown> }).evolution_response ?? {};
        const isVoice = (evo as { _voice?: boolean })._voice === true;
        const isAi    = (evo as { _source?: string })._source === "ai_reply" || isVoice;
        events.push({
          id:       String(m.id),
          kind:     isVoice ? "voice_sent" : isAi ? "ai_replied" : "ai_replied",
          title:    isVoice ? "Enviou áudio com voz clonada" : "IA respondeu",
          subtitle: `${String(m.to_phone)} — "${String(m.body ?? "").slice(0, 60)}${String(m.body ?? "").length > 60 ? "…" : ""}"`,
          at:       String(m.created_at),
        });
      }

      for (const b of (recentBookings.data ?? [])) {
        events.push({
          id:       String(b.id),
          kind:     "booking_created",
          title:    "Visita agendada",
          subtitle: `${String(b.summary ?? "Visita")} — ${new Date(String(b.start_at)).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`,
          at:       String(b.created_at),
        });
      }

      for (const f of (recentFollowups.data ?? [])) {
        events.push({
          id:       String(f.id),
          kind:     "followup_sent",
          title:    "Follow-up automático",
          subtitle: `Reengajou ${String(f.phone)}`,
          at:       String(f.created_at),
        });
      }

      events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setActivity(events.slice(0, 20));
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [user, workspaceId]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#002B5B] mb-1">
              <Bot className="h-3.5 w-3.5" />
              Secretária Virtual 24h
            </div>
            <h1 className="text-2xl font-bold text-[#002B5B]">{agentName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                whatsappConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${whatsappConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                WhatsApp {whatsappConnected ? "conectado" : "não conectado"}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                aiEnabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${aiEnabled ? "bg-emerald-500" : "bg-gray-400"}`} />
                IA {aiEnabled ? "ativa" : "pausada"}
              </span>
            </div>
          </div>
          <Link to="/dashboard/whatsapp/ai-config">
            <Button variant="outline" className="gap-2">
              <Bot className="h-4 w-4" /> Configurar IA
            </Button>
          </Link>
        </div>

        {/* Warning banner se IA não tá ativa */}
        {!whatsappConnected && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <PhoneCall className="h-4 w-4 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Conecte seu WhatsApp</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  A IA só responde quando o WhatsApp estiver conectado. Leva menos de 30 segundos.
                </p>
              </div>
              <Link to="/dashboard/whatsapp">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Conectar agora</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            icon={Inbox} label="Mensagens hoje"
            value={metrics.messages_today} loading={loading}
            color="blue"
          />
          <MetricCard
            icon={Sparkles} label="Respostas IA hoje"
            value={metrics.ai_replies_today} loading={loading}
            color="purple"
          />
          <MetricCard
            icon={Users} label="Leads qualificados"
            value={metrics.qualified_leads} loading={loading}
            color="emerald"
          />
          <MetricCard
            icon={Calendar} label="Visitas 7 dias"
            value={metrics.bookings_this_week} loading={loading}
            color="teal"
          />
          <MetricCard
            icon={Bell} label="Follow-ups hoje"
            value={metrics.followups_sent} loading={loading}
            color="amber"
          />
          <MetricCard
            icon={TrendingUp} label="Confiança média"
            value={`${Math.round(metrics.avg_confidence * 100)}%`}
            loading={loading} color="rose"
          />
        </div>

        {/* Layout 2 colunas: atalhos + activity feed */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Atalhos */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Atalhos</h2>
            <QuickAction
              icon={Bot}
              title="Configurar IA"
              description="Nome, tom, instruções, modelo"
              href="/dashboard/whatsapp/ai-config"
              color="blue"
            />
            <QuickAction
              icon={Mic}
              title="Voz Clonada"
              description="Gravar amostra + preview (Plus)"
              href="/dashboard/whatsapp/voz"
              color="purple"
            />
            <QuickAction
              icon={MessageSquare}
              title="Conversas"
              description="Inbox WhatsApp + chat"
              href="/dashboard/whatsapp/inbox"
              color="emerald"
            />
            <QuickAction
              icon={Calendar}
              title="Agendamentos"
              description="Visitas criadas pela IA"
              href="/dashboard/secretaria/agenda"
              color="teal"
            />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Últimos eventos</h2>
              {activity.length > 0 && (
                <span className="text-xs text-gray-400">{activity.length} registros</span>
              )}
            </div>
            <Card className="border-gray-200">
              <CardContent className="p-0">
                {loading ? (
                  <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4">
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : activity.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Flame className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Nada aconteceu ainda</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Assim que um lead mandar mensagem, você verá aqui tudo que a IA faz em tempo real.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activity.map((e) => (
                      <ActivityItem key={`${e.kind}-${e.id}`} event={e} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ─── subcomponents ─────────────────────────────────────────── */

interface MetricColorClasses {
  bg:   string;
  text: string;
  icon: string;
}

const METRIC_COLORS: Record<string, MetricColorClasses> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-900",    icon: "text-blue-600"    },
  purple:  { bg: "bg-purple-50",  text: "text-purple-900",  icon: "text-purple-600"  },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-900", icon: "text-emerald-600" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-900",    icon: "text-teal-600"    },
  amber:   { bg: "bg-amber-50",   text: "text-amber-900",   icon: "text-amber-600"   },
  rose:    { bg: "bg-rose-50",    text: "text-rose-900",    icon: "text-rose-600"    },
};

function MetricCard({
  icon: Icon, label, value, loading, color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  loading: boolean;
  color: keyof typeof METRIC_COLORS;
}) {
  const c = METRIC_COLORS[color];
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${c.bg} mb-3`}>
          <Icon className={`h-4 w-4 ${c.icon}`} />
        </div>
        {loading ? (
          <Skeleton className="h-6 w-10 mb-1" />
        ) : (
          <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  icon: Icon, title, description, href, color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: keyof typeof METRIC_COLORS;
}) {
  const c = METRIC_COLORS[color];
  return (
    <Link
      to={href}
      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#002B5B] hover:shadow-[0_2px_12px_rgba(0,43,91,0.08)] transition-all group"
    >
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} shrink-0`}>
        <Icon className={`h-4 w-4 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#002B5B]">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#002B5B] shrink-0 mt-1" />
    </Link>
  );
}

const KIND_ICON: Record<ActivityEvent["kind"], { icon: React.ElementType; color: keyof typeof METRIC_COLORS }> = {
  message_received: { icon: Inbox,        color: "blue"    },
  ai_replied:       { icon: Sparkles,     color: "purple"  },
  lead_qualified:   { icon: Users,        color: "emerald" },
  booking_created:  { icon: Calendar,     color: "teal"    },
  followup_sent:    { icon: Bell,         color: "amber"   },
  voice_sent:       { icon: Mic,          color: "rose"    },
};

function ActivityItem({ event }: { event: ActivityEvent }) {
  const { icon: Icon, color } = KIND_ICON[event.kind];
  const c = METRIC_COLORS[color];
  const when = (() => {
    try {
      return formatDistanceToNow(new Date(event.at), { addSuffix: true, locale: ptBR });
    } catch {
      return event.at;
    }
  })();

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${c.bg} shrink-0`}>
        <Icon className={`h-4 w-4 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#002B5B]">{event.title}</p>
          <span className="text-xs text-gray-400">{when}</span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5 truncate">{event.subtitle}</p>
      </div>
    </div>
  );
}
