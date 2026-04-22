import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  CalendarClock,
  Send,
  Hash,
  MessageSquare,
  Sparkles,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePlanGate } from "@/hooks/usePlanGate";
import { PlanGateBanner } from "@/components/dashboard/PlanGateBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CreativeStatus =
  | "analyzing"
  | "generating"
  | "pending_approval"
  | "ready"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published"
  | "expired"
  | "error";

interface CreativeDetail {
  id: string;
  template_name: string;
  template_slug: string;
  status: CreativeStatus;
  format_feed: string | null;
  format_story: string | null;
  format_square: string | null;
  format_reel: string | null;
  caption: string | null;
  hashtags: string | null;
  cta_text: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  property_id: string | null;
  credits_used: number | null;
  created_at: string;
  approval_deadline?: string | null;
  approval_reminders_sent?: number | null;
  ig_post_id?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Status badge config                                                */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<CreativeStatus, { label: string; bg: string; text: string }> = {
  analyzing:        { label: "Analisando",       bg: "bg-slate-100",  text: "text-slate-600" },
  generating:       { label: "Gerando",          bg: "bg-gray-100",   text: "text-gray-600"  },
  pending_approval: { label: "Aguarda aprovação", bg: "bg-amber-100", text: "text-amber-700" },
  ready:            { label: "Pronto",           bg: "bg-blue-100",   text: "text-blue-700"  },
  approved:         { label: "Aprovado",         bg: "bg-green-100",  text: "text-green-700" },
  rejected:         { label: "Rejeitado",        bg: "bg-rose-100",   text: "text-rose-700"  },
  scheduled:        { label: "Agendado",         bg: "bg-yellow-100", text: "text-yellow-700" },
  published:        { label: "Publicado",        bg: "bg-purple-100", text: "text-purple-700" },
  expired:          { label: "Expirado",         bg: "bg-red-100",    text: "text-red-600"   },
  error:            { label: "Erro",             bg: "bg-red-100",    text: "text-red-700"   },
};

/* ------------------------------------------------------------------ */
/*  Format preview config                                              */
/* ------------------------------------------------------------------ */

const FORMAT_CONFIG = {
  feed:  { label: "Feed 4:5", w: "w-full", aspect: "aspect-[4/5]", gradient: "from-[#002B5B] to-[#0055a5]" },
  story: { label: "Story 9:16", w: "w-full max-w-[280px] mx-auto", aspect: "aspect-[9/16]", gradient: "from-[#002B5B] via-[#1a3a6b] to-[#FFD700]" },
  reels: { label: "Reels 9:16", w: "w-full max-w-[280px] mx-auto", aspect: "aspect-[9/16]", gradient: "from-[#0d0d0d] to-[#002B5B]" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CriativoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { check } = usePlanGate();
  const canPublish = check.publish({ publicationsThisMonth: 0, channel: "instagram" }).allowed;

  const [creative, setCreative] = useState<CreativeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  /* ---- Fetch single creative ---- */
  useEffect(() => {
    if (!id || !user) return;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("creatives_gallery")
        .select("*")
        .eq("id", id!)
        .single();

      if (error || !data) {
        console.error("Erro ao buscar criativo:", error);
        toast({ title: "Criativo nao encontrado", variant: "destructive" });
        navigate("/dashboard/criativos");
        return;
      }

      const c = data as CreativeDetail;
      setCreative(c);
      setCaption(c.caption ?? "");
      setLoading(false);
    }

    load();
  }, [id, user]);

  /* ---- Realtime: sincroniza quando status muda via WhatsApp (corretor
         responde 👍 no Zap, ou pipeline-criativo termina de gerar) ---- */
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`creative:${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "creatives_gallery", filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as CreativeDetail;
          setCreative((prev) => (prev ? { ...prev, ...updated } : updated));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  /* ---- Countdown de approval_deadline (quando pending_approval) ---- */
  useEffect(() => {
    if (creative?.status !== "pending_approval" || !creative.approval_deadline) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const ms = new Date(creative.approval_deadline!).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(ms / 1000)));
    };

    tick();
    const int = setInterval(tick, 1000);
    return () => clearInterval(int);
  }, [creative?.status, creative?.approval_deadline]);

  /* ---- Actions ---- */
  const updateStatus = async (newStatus: CreativeStatus) => {
    if (!creative) return;
    const { error } = await supabase
      .from("creatives_gallery")
      .update({ status: newStatus })
      .eq("id", creative.id);

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      setCreative({ ...creative, status: newStatus });
      toast({ title: `Status atualizado para "${STATUS_STYLES[newStatus]?.label}"` });
    }
  };

  /* ---- Criativos Pro: aprovação → dispara edge function criativos-publish.
         Ela muda status pra published + publica no Instagram + notifica Zap. */
  const handleApprovePro = async () => {
    if (!creative) return;
    setPublishing(true);
    try {
      // Marca approved; o edge function também checa, mas UI fica imediata
      await supabase
        .from("creatives_gallery")
        .update({ status: "approved" })
        .eq("id", creative.id);

      const { error } = await supabase.functions.invoke("criativos-publish", {
        body: { creative_job_id: creative.id },
      });

      if (error) {
        toast({
          title: "Falhou publicar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Aprovado — publicando no Instagram..." });
      }
    } catch (e) {
      toast({
        title: "Erro inesperado",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleRejectPro = async () => {
    if (!creative) return;
    await supabase
      .from("creatives_gallery")
      .update({ status: "rejected" })
      .eq("id", creative.id);
    toast({ title: "Criativo rejeitado" });
  };

  const saveCaption = async () => {
    if (!creative) return;
    const { error } = await supabase
      .from("creatives_gallery")
      .update({ caption })
      .eq("id", creative.id);

    if (error) {
      toast({ title: "Erro ao salvar legenda", variant: "destructive" });
    } else {
      setCreative({ ...creative, caption });
      toast({ title: "Legenda salva!" });
    }
  };

  /* ---- Loading skeleton ---- */
  if (loading || !creative) {
    return (
      <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const style = STATUS_STYLES[creative.status] ?? STATUS_STYLES.ready;

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back button + title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-gray-600 hover:text-[#002B5B]"
            onClick={() => navigate("/dashboard/criativos")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-[#002B5B]">{creative.template_name}</h1>
          <Badge className={`${style.bg} ${style.text} border-0`}>{style.label}</Badge>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Preview area (60%) */}
          <div className="lg:col-span-3">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <Tabs defaultValue="feed">
                  <TabsList className="mb-4">
                    <TabsTrigger value="feed">Feed</TabsTrigger>
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="reels">Reels</TabsTrigger>
                  </TabsList>

                  {(Object.entries(FORMAT_CONFIG) as [keyof typeof FORMAT_CONFIG, typeof FORMAT_CONFIG.feed][]).map(
                    ([key, cfg]) => {
                      const url =
                        key === "feed"  ? creative.format_feed  :
                        key === "story" ? creative.format_story :
                        creative.format_reel;
                      const isImageUrl = !!url && /^https?:/i.test(url);
                      const processing =
                        creative.status === "analyzing" || creative.status === "generating";

                      return (
                        <TabsContent key={key} value={key}>
                          {isImageUrl ? (
                            <div className={`${cfg.w} ${cfg.aspect} rounded-xl overflow-hidden bg-gray-100 border border-gray-200`}>
                              <img
                                src={url!}
                                alt={cfg.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={`${cfg.w} ${cfg.aspect} rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}
                            >
                              <div className="text-center text-white/80 space-y-2 px-4">
                                {processing ? (
                                  <>
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    <p className="text-sm font-medium">Gerando criativo...</p>
                                    <p className="text-xs opacity-70">
                                      Geralmente leva 20-40 segundos
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-medium">{cfg.label}</p>
                                    <p className="text-xs opacity-60">{creative.template_name}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      );
                    }
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right: Info panel (40%) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status card */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#002B5B]">Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Status</span>
                  <Badge className={`${style.bg} ${style.text} border-0`}>{style.label}</Badge>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block mb-1">Template</span>
                  <p className="text-sm font-medium text-gray-900">{creative.template_name}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block mb-1">Criado em</span>
                  <p className="text-sm text-gray-700">
                    {new Date(creative.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {creative.credits_used != null && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Creditos utilizados</span>
                    <p className="text-sm font-medium text-[#FFD700]">{creative.credits_used}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Caption */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#002B5B] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Legenda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escreva a legenda do criativo..."
                  rows={4}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  className="bg-[#002B5B] hover:bg-[#001d3d] text-white text-xs"
                  onClick={saveCaption}
                >
                  Salvar Legenda
                </Button>
              </CardContent>
            </Card>

            {/* Hashtags + CTA */}
            {(creative.hashtags || creative.cta_text) && (
              <Card className="border border-gray-200">
                <CardContent className="p-4 space-y-3">
                  {creative.hashtags && (
                    <div>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Hash className="h-3 w-3" />
                        Hashtags
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{creative.hashtags}</p>
                    </div>
                  )}
                  {creative.cta_text && (
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">CTA</span>
                      <p className="text-sm font-medium text-[#002B5B]">{creative.cta_text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Criativos Pro: banner de aprovação com countdown + botões grandes */}
            {creative.status === "pending_approval" && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Pronto pra publicar</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Criativo gerado pelo pipeline Criativos Pro. Aprove aqui ou responda 👍 no WhatsApp.
                  </p>
                  {secondsLeft != null && secondsLeft > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Expira em <strong>{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</strong>
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleApprovePro}
                      disabled={publishing}
                    >
                      {publishing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Aprovar e publicar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-50"
                      onClick={handleRejectPro}
                      disabled={publishing}
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estado: publicado — link do post no Instagram */}
            {creative.status === "published" && creative.ig_post_id && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Publicado no Instagram</span>
                  </div>
                  <a
                    href={`https://instagram.com/p/${creative.ig_post_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-700 underline hover:text-purple-900"
                  >
                    Ver post ao vivo →
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Estado: rejeitado */}
            {creative.status === "rejected" && (
              <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-rose-900">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Criativo rejeitado</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    Envie outra foto pelo WhatsApp pra gerar um novo criativo.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Estado: erro no pipeline */}
            {creative.status === "error" && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-red-900">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Erro ao gerar criativo</span>
                  </div>
                  <p className="text-xs text-red-700 break-words">
                    {creative.caption?.startsWith("ERRO") ? creative.caption : "Tente novamente enviando outra foto."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Estado: expirado sem aprovação */}
            {creative.status === "expired" && (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-semibold">Expirado</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Prazo de aprovação esgotado. Envie outra foto pra gerar um novo.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions (fluxo tradicional — escondido em estados do pipeline Pro) */}
            {(creative.status === "ready" ||
              creative.status === "approved" ||
              creative.status === "scheduled") && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-1.5 border-gray-300 text-sm"
                  onClick={() => toast({ title: "Download iniciado" })}
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>

                {canPublish ? (
                  <>
                    {creative.status === "ready" && (
                      <Button
                        className="gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm"
                        onClick={() => updateStatus("approved")}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aprovar
                      </Button>
                    )}

                    {(creative.status === "ready" || creative.status === "approved") && (
                      <Button
                        className="gap-1.5 bg-[#FFD700] hover:bg-[#e6c200] text-[#002B5B] text-sm font-semibold"
                        onClick={() => updateStatus("scheduled")}
                      >
                        <CalendarClock className="h-4 w-4" />
                        Agendar
                      </Button>
                    )}

                    {(creative.status === "approved" || creative.status === "scheduled") && (
                      <Button
                        className="gap-1.5 bg-[#002B5B] hover:bg-[#001d3d] text-white text-sm"
                        onClick={() => updateStatus("published")}
                      >
                        <Send className="h-4 w-4" />
                        Publicar
                      </Button>
                    )}
                  </>
                ) : (
                  <PlanGateBanner module="criativos" featureName="Publicar e agendar" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
