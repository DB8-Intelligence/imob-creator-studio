// ============================================================
// SecretariaAgendaPage — Sprint 12a: Agendamentos criados pela IA
// Rota: /dashboard/secretaria/agenda
//
// Lista calendar_events (Google Calendar) criados pela Secretária Virtual
// com filtros (próximos, passados, todos) e link cruzado para a conversa
// do lead no WhatsApp inbox.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, ArrowLeft, MessageSquare, MapPin, Phone, Clock, ExternalLink,
  CheckCircle2, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CalEvent {
  id:               string;
  summary:          string | null;
  description:      string | null;
  location:         string | null;
  start_at:         string;
  end_at:           string;
  phone:            string | null;
  status:           string | null;
  google_event_id:  string | null;
  conversation_id:  string | null;
  created_at:       string;
}

type FilterMode = "upcoming" | "past" | "all";

export default function SecretariaAgendaPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("upcoming");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("calendar_events")
        .select("id, summary, description, location, start_at, end_at, phone, status, google_event_id, conversation_id, created_at")
        .eq("user_id", user.id)
        .order("start_at", { ascending: false });

      if (!cancelled) {
        setEvents((data ?? []) as CalEvent[]);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const filtered = useMemo(() => {
    const now = Date.now();
    if (filter === "upcoming") {
      return events.filter((e) => new Date(e.start_at).getTime() >= now)
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    }
    if (filter === "past") {
      return events.filter((e) => new Date(e.start_at).getTime() < now);
    }
    return events;
  }, [events, filter]);

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: events.filter((e) => new Date(e.start_at).getTime() >= now).length,
      past:     events.filter((e) => new Date(e.start_at).getTime() <  now).length,
      all:      events.length,
    };
  }, [events]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <Link to="/dashboard/secretaria" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#002B5B] mb-2">
            <ArrowLeft className="h-3 w-3" /> Voltar ao Hub
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-[#002B5B] mb-1">
            <Calendar className="h-3.5 w-3.5" />
            Agendamentos da IA
          </div>
          <h1 className="text-2xl font-bold text-[#002B5B]">Visitas agendadas pela Secretária</h1>
          <p className="text-sm text-gray-500 mt-1">
            Toda visita que a IA confirmou com um lead via WhatsApp aparece aqui, sincronizada com o Google Agenda.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {([
            { id: "upcoming", label: "Próximas", count: counts.upcoming },
            { id: "past",     label: "Passadas", count: counts.past },
            { id: "all",      label: "Todas",    count: counts.all },
          ] as Array<{ id: FilterMode; label: string; count: number }>).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                filter === tab.id
                  ? "border-[#002B5B] text-[#002B5B]"
                  : "border-transparent text-gray-500 hover:text-[#002B5B]"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {filter === "upcoming" && "Nenhuma visita agendada"}
                {filter === "past" && "Nenhuma visita passada"}
                {filter === "all" && "A IA ainda não agendou nenhuma visita"}
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Quando um lead confirmar data e hora no WhatsApp, a IA cria o evento automaticamente aqui e no seu Google Agenda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((ev) => (
              <AgendaItem key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function AgendaItem({ event }: { event: CalEvent }) {
  const start = new Date(event.start_at);
  const end   = new Date(event.end_at);
  const isPast = start.getTime() < Date.now();
  const isToday = start.toDateString() === new Date().toDateString();

  const dateLabel = start.toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "short", year: start.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
  const timeLabel = `${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    + (end ? ` – ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "");

  return (
    <Card className={`border ${isToday && !isPast ? "border-blue-300 bg-blue-50/50" : "border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Date box */}
          <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-[64px] shrink-0 ${
            isPast ? "bg-gray-100 text-gray-500" :
            isToday ? "bg-blue-600 text-white" :
            "bg-[#002B5B] text-white"
          }`}>
            <span className="text-[10px] uppercase font-semibold tracking-wide">{start.toLocaleDateString("pt-BR", { month: "short" })}</span>
            <span className="text-xl font-bold">{start.getDate()}</span>
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-[#002B5B] truncate">{event.summary ?? "Visita"}</h3>
              {isToday && !isPast && (
                <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">Hoje</Badge>
              )}
              {isPast ? (
                <Badge variant="outline" className="text-gray-500 text-[10px] gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Passada
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Agendada</Badge>
              )}
              {event.status === "cancelled" && (
                <Badge variant="outline" className="text-red-600 border-red-200 text-[10px] gap-1">
                  <XCircle className="h-2.5 w-2.5" /> Cancelada
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{dateLabel} · {timeLabel}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <Phone className="h-3 w-3" />
                <span>{event.phone}</span>
              </div>
            )}

            {event.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.description}</p>
            )}

            <div className="flex items-center gap-2 mt-3">
              {event.conversation_id && (
                <Link to={`/dashboard/whatsapp/inbox?phone=${event.phone ?? ""}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Ver conversa
                  </Button>
                </Link>
              )}
              {event.google_event_id && (
                <a
                  href={`https://calendar.google.com/calendar/event?eid=${event.google_event_id}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5">
                    <ExternalLink className="h-3 w-3" /> Google Agenda
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
