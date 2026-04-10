import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { VideoJob, VideoStatus } from "@/types/video";
import {
  Film,
  Plus,
  Clock,
  CheckCircle2,
  Zap,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  VideoStatus,
  { label: string; color: string; pulse?: boolean }
> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600" },
  queued: { label: "Na fila", color: "bg-yellow-100 text-yellow-700" },
  processing: {
    label: "Processando",
    color: "bg-blue-100 text-blue-700",
    pulse: true,
  },
  completed: { label: "Concluído", color: "bg-green-100 text-green-700" },
  failed: { label: "Falhou", color: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: VideoStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <Badge
      className={cn(
        "text-[11px] font-semibold border-0",
        cfg.color,
        cfg.pulse && "animate-pulse"
      )}
    >
      {cfg.label}
    </Badge>
  );
}

const STYLE_LABELS: Record<string, string> = {
  cinematic: "Cinematic",
  moderno: "Moderno",
  luxury: "Luxury",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Skeleton rows for loading ───────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4"
        >
          <Skeleton className="h-14 w-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

const DashboardVideosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();

  const {
    data: jobs = [],
    isLoading,
  } = useQuery<VideoJob[]>({
    queryKey: ["dashboard-video-jobs", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("video_jobs")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
    enabled: !!workspaceId && !!user,
  });

  // ── Stats ───────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = jobs.length;
    const processing = jobs.filter(
      (j) => j.status === "processing" || j.status === "queued"
    ).length;
    const completed = jobs.filter((j) => j.status === "completed").length;
    const creditsUsed = jobs.reduce(
      (sum, j) => sum + (j.credits_used ?? 0),
      0
    );
    return { total, processing, completed, creditsUsed };
  }, [jobs]);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div
        className="space-y-8 max-w-5xl"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#002B5B" }}>
              Meus Videos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie e acompanhe a criacao dos seus videos imobiliarios.
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/videos/novo")}
            className="text-white font-semibold"
            style={{ backgroundColor: "#002B5B" }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Video
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Film,
              label: "Total",
              value: stats.total,
              iconBg: "bg-[#002B5B]/10",
              iconColor: "text-[#002B5B]",
            },
            {
              icon: Clock,
              label: "Em processamento",
              value: stats.processing,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
            },
            {
              icon: CheckCircle2,
              label: "Concluidos",
              value: stats.completed,
              iconBg: "bg-green-50",
              iconColor: "text-green-600",
            },
            {
              icon: Zap,
              label: "Creditos usados",
              value: stats.creditsUsed,
              iconBg: "bg-[#FFD700]/15",
              iconColor: "text-[#B8960C]",
            },
          ].map((s) => (
            <Card key={s.label} className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      s.iconBg
                    )}
                  >
                    <s.icon className={cn("w-4 h-4", s.iconColor)} />
                  </div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: "#002B5B" }}>
                  {s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job list */}
        <div>
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "#002B5B" }}
          >
            Videos
          </h2>

          {/* Loading */}
          {isLoading && <SkeletonRows />}

          {/* Empty state */}
          {!isLoading && jobs.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
              <Film className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p
                className="text-lg font-semibold mb-1"
                style={{ color: "#002B5B" }}
              >
                Nenhum video criado
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Crie seu primeiro Reel imobiliario agora mesmo!
              </p>
              <Button
                onClick={() => navigate("/dashboard/videos/novo")}
                className="text-white font-semibold"
                style={{ backgroundColor: "#002B5B" }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro video
              </Button>
            </div>
          )}

          {/* Job rows */}
          {!isLoading && jobs.length > 0 && (
            <div className="space-y-3">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() =>
                    navigate(`/dashboard/videos/${job.id}`)
                  }
                  className="w-full flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:shadow-md hover:border-[#002B5B]/20 group"
                >
                  {/* Thumbnail placeholder */}
                  <div
                    className="h-14 w-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{
                      background:
                        job.thumbnail_url
                          ? `url(${job.thumbnail_url}) center/cover no-repeat`
                          : job.style === "luxury"
                          ? "linear-gradient(135deg, #FFD700, #B8960C)"
                          : job.style === "cinematic"
                          ? "linear-gradient(135deg, #002B5B, #004E9A)"
                          : "linear-gradient(135deg, #6B7280, #374151)",
                    }}
                  >
                    {!job.thumbnail_url && (
                      <Film className="w-5 h-5 text-white/70" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm truncate group-hover:text-[#002B5B]"
                      style={{ color: "#002B5B" }}
                    >
                      {job.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{STYLE_LABELS[job.style] ?? job.style}</span>
                      <span className="text-gray-300">|</span>
                      <span>{job.duration_seconds}s</span>
                      <span className="text-gray-300">|</span>
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={job.status} />

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Ver"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/videos/${job.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </span>
                    {job.status === "completed" && job.output_url && (
                      <a
                        href={job.output_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Baixar"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                      </a>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardVideosPage;
