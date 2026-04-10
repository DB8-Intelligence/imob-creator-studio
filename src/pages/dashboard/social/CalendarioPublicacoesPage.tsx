import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Instagram,
  Facebook,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AgendarPostModal from "./AgendarPostModal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PublicationEntry {
  id: string;
  platform: string;
  format: string | null;
  caption: string | null;
  hashtags: string | null;
  scheduled_at: string;
  status: "scheduled" | "published" | "failed";
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ------------------------------------------------------------------ */
/*  Status styles                                                      */
/* ------------------------------------------------------------------ */

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-blue-500",
  published: "bg-green-500",
  failed: "bg-red-500",
};

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: "Agendado", bg: "bg-blue-100", text: "text-blue-700" },
  published: { label: "Publicado", bg: "bg-green-100", text: "text-green-700" },
  failed: { label: "Falhou", bg: "bg-red-100", text: "text-red-600" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CalendarioPublicacoesPage() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [posts, setPosts] = useState<PublicationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  /* ---- Fetch ---- */
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("publication_queue" as any)
          .select("*")
          .order("scheduled_at", { ascending: true });

        if (error) {
          console.warn("publication_queue query:", error.message);
          setPosts([]);
        } else {
          setPosts((data ?? []) as unknown as PublicationEntry[]);
        }
      } catch {
        setPosts([]);
      }
      setLoading(false);
    }

    load();
  }, [user]);

  /* ---- Calendar grid ---- */
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const cells = useMemo(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    // Pad to complete last week
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [firstDay, daysInMonth]);

  /* ---- Posts by date ---- */
  const postsByDate = useMemo(() => {
    const map: Record<string, PublicationEntry[]> = {};
    posts.forEach((p) => {
      const key = new Date(p.scheduled_at).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [posts]);

  const selectedDayPosts = selectedDate
    ? postsByDate[selectedDate.toDateString()] ?? []
    : [];

  /* ---- Navigation ---- */
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  /* ---- Platform icon ---- */
  const PlatformIcon = ({ platform }: { platform: string }) => {
    if (platform === "instagram")
      return <Instagram className="h-4 w-4 text-pink-500" />;
    if (platform === "facebook")
      return <Facebook className="h-4 w-4 text-blue-600" />;
    return <CalendarDays className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#002B5B]">
              Calendario de Publicacoes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Visualize e agende posts para suas redes sociais.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === "calendar" ? "bg-[#002B5B] text-white" : "bg-gray-100 text-gray-600"}`}>
                Calendario
              </button>
              <button type="button" onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === "list" ? "bg-[#002B5B] text-white" : "bg-gray-100 text-gray-600"}`}>
                Lista
              </button>
            </div>
            <Button
              className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Novo Post
            </Button>
          </div>
        </div>

        {viewMode === "calendar" && (
          <>
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
                Mes anterior
              </Button>
              <span className="font-semibold text-[#002B5B]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                Proximo mes
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar grid */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 bg-gray-50">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-semibold text-gray-500 uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="h-20 border-t border-r border-gray-100 last:border-r-0"
                      />
                    );
                  }

                  const cellDate = new Date(currentYear, currentMonth, day);
                  const dayKey = cellDate.toDateString();
                  const dayPosts = postsByDate[dayKey] ?? [];
                  const isToday = sameDay(cellDate, now);
                  const isSelected = selectedDate
                    ? sameDay(cellDate, selectedDate)
                    : false;

                  return (
                    <div
                      key={day}
                      className={`h-20 border-t border-r border-gray-100 last:border-r-0 p-1.5 cursor-pointer transition-colors
                        ${isSelected ? "bg-[#002B5B]/5" : "hover:bg-gray-50"}
                      `}
                      onClick={() => setSelectedDate(cellDate)}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                          ${isToday ? "bg-[#002B5B] text-white" : "text-gray-700"}
                        `}
                      >
                        {day}
                      </span>
                      {/* Dots */}
                      {dayPosts.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap">
                          {dayPosts.slice(0, 4).map((p) => (
                            <span
                              key={p.id}
                              className={`h-1.5 w-1.5 rounded-full ${
                                STATUS_DOT[p.status] ?? "bg-gray-400"
                              }`}
                            />
                          ))}
                          {dayPosts.length > 4 && (
                            <span className="text-[9px] text-gray-400 ml-0.5">
                              +{dayPosts.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Agendado
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Publicado
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Falhou
              </span>
            </div>

            {/* Selected day posts */}
            {selectedDate && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-[#002B5B]">
                  Posts em{" "}
                  {selectedDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>

                {selectedDayPosts.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Nenhuma publicacao nesta data.
                  </p>
                ) : (
                  selectedDayPosts.map((post) => {
                    const style =
                      STATUS_BADGE[post.status] ?? STATUS_BADGE.scheduled;
                    return (
                      <Card key={post.id} className="border border-gray-200">
                        <CardContent className="p-4 flex items-center gap-4">
                          <PlatformIcon platform={post.platform} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#002B5B] font-medium truncate">
                              {post.caption ?? "Sem legenda"}
                            </p>
                            <span className="text-[11px] text-gray-400">
                              {new Date(post.scheduled_at).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                              {post.format ? ` · ${post.format}` : ""}
                            </span>
                          </div>
                          <Badge
                            className={`${style.bg} ${style.text} border-0 text-[11px]`}
                          >
                            {style.label}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}

        {viewMode === "list" && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <p className="text-center py-12 text-[#6B7280]">Nenhuma publicacao encontrada</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F8FAFF] text-[#6B7280]">
                    <th className="px-4 py-3 text-left">Data/Hora</th>
                    <th className="px-4 py-3 text-left">Plataforma</th>
                    <th className="px-4 py-3 text-left">Formato</th>
                    <th className="px-4 py-3 text-left">Legenda</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Acoes</th>
                  </tr></thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id} className="border-t border-[#E5E7EB]">
                        <td className="px-4 py-3 text-[#374151]">{new Date(post.scheduled_at).toLocaleString("pt-BR")}</td>
                        <td className="px-4 py-3">{post.platform === "instagram" ? "IG" : "FB"}</td>
                        <td className="px-4 py-3 text-[#374151]">{post.format || "Feed"}</td>
                        <td className="px-4 py-3 text-[#374151] max-w-[200px] truncate">{post.caption || "\u2014"}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${post.status === "published" ? "bg-green-100 text-green-700" : post.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{post.status === "published" ? "Publicado" : post.status === "failed" ? "Falhou" : "Agendado"}</span></td>
                        <td className="px-4 py-3">
                          {post.status === "scheduled" && <button type="button" onClick={() => { supabase.from("publication_queue" as any).update({ status: "cancelled" }).eq("id", post.id); }} className="text-xs text-red-600 hover:underline">Cancelar</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empty state (no posts at all) */}
        {!loading && posts.length === 0 && !selectedDate && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#002B5B]/10 flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-[#002B5B]/40" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              Nenhuma publicacao agendada
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Conecte suas redes sociais primeiro.
            </p>
            <Link to="/dashboard/social/conectar">
              <Button className="bg-[#002B5B] hover:bg-[#001d3d] text-white">
                Conectar Redes Sociais
              </Button>
            </Link>
          </div>
        )}

        {/* Agendar Post Modal */}
        <AgendarPostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}
