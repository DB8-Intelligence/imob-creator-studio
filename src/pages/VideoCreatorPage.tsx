import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { VideoCreatorPrefill } from "@/pages/VideosDashboardPage";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useToast } from "@/hooks/use-toast";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useCreateVideoJob, useReleaseVideoCredit, useUpdateVideoJobStatus, useVideoModuleOverview } from "@/hooks/useVideoModule";
import { createVideoJobSegments, renderVideoJob, renderVideoJobV2, generateVideoClipFromImage } from "@/services/videoModuleApi";
import { pollJobUntilDone } from "@/services/generationApi";
import { useVeoPolling } from "@/hooks/useVeoPolling";
import { dispatchN8nEvent } from "@/services/n8nBridgeApi";
import { getUploadSummary, getVideoPlanRule, resolveVideoPlanTier } from "@/lib/video-plan-rules";
import { getDefaultVideoMotionPreset, getVideoMotionPresetConfig } from "@/lib/video-motion-presets";
import { VIDEO_TEMPLATE_LIST, getVideoTemplate, getDefaultVideoTemplate, estimateVideoDuration, type VideoTemplateId } from "@/lib/video-templates";
import { VISUAL_PRESET_LIST, getVisualPreset, type VisualPresetId } from "@/lib/video-visual-presets";
import { MUSIC_MOOD_LIST, getMusicMood, getDefaultMusicMood, moodToPayloadValue, type MusicMoodId } from "@/lib/video-music-moods";
import { resolvePresetForTemplate, resolveLegacyPresetId, getVideoPreset, type VideoPresetId } from "@/modules/presets";
import {
  estimateVideoCost,
  checkBeforeGenerate,
  logVideoStarted,
  logVideoCompleted,
  logVideoFailed,
} from "@/modules/monetization";
import {
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Film,
  Download,
  Zap,
  Lock,
  Crown,
  Star,
  CheckCircle2,
  Loader2,
  ImageIcon,
  Music,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Format = "reels" | "feed" | "youtube";
interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FORMATS: { id: Format; label: string; ratio: string; platforms: string }[] = [
  { id: "reels", label: "Reels / TikTok", ratio: "9:16", platforms: "Instagram · TikTok" },
  { id: "feed", label: "Feed Quadrado", ratio: "1:1", platforms: "Instagram · Facebook" },
  { id: "youtube", label: "YouTube / TV", ratio: "16:9", platforms: "YouTube · Stories Landscape" },
];

const STEPS = ["Upload de fotos", "Template & estilo", "Trilha & gerar"];

// ── Plan Gate ─────────────────────────────────────────────────────────────────

const PlanGate = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-9 h-9 text-accent" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        Geração de vídeo disponível nos planos Plus e Premium
      </h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Este módulo transforma fotos de imóveis em vídeos profissionais com IA, respeitando os limites comerciais de Standard, Plus e Premium.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">Plus</span>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✓ 600 créditos por mês</li>
            <li>✓ Até 15 fotos por vídeo</li>
            <li>✓ Resolução 1080p Full HD</li>
            <li>✓ Até 75s por vídeo</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-foreground">Premium</span>
            <Badge className="bg-amber-500/10 text-amber-600 text-xs">4K + prioridade</Badge>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✓ 800 créditos por mês</li>
            <li>✓ Até 20 fotos por vídeo</li>
            <li>✓ 4K Ultra HD</li>
            <li>✓ Renderização prioritária</li>
          </ul>
        </div>
      </div>
      <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/plano")}>
        Ver planos e fazer upgrade
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const VideoCreatorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as Partial<VideoCreatorPrefill> & { format?: Format };
  const prefill = locationState.prefill ? locationState : null;
  const { toast } = useToast();
  const { data: plan } = useUserPlan();
  const { workspaceId } = useWorkspaceContext();
  const { data: overview } = useVideoModuleOverview(workspaceId);
  const createVideoJobMutation = useCreateVideoJob(workspaceId);
  const updateVideoJobStatusMutation = useUpdateVideoJobStatus(workspaceId);
  const releaseVideoCreditMutation = useReleaseVideoCredit(workspaceId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [templateId, setTemplateId] = useState<VideoTemplateId>(prefill?.templateId ?? getDefaultVideoTemplate());
  const [presetId, setPresetId] = useState<VisualPresetId>(prefill?.presetId ?? "default");
  const [moodId, setMoodId] = useState<MusicMoodId>(prefill?.moodId ?? getDefaultMusicMood());
  const [format, setFormat] = useState<Format>(prefill?.format ?? locationState.format ?? "reels");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Engine selection: FFmpeg (Ken Burns) is the default production engine.
  // Veo is available as optional but NOT default.
  type VideoEngine = "ffmpeg_kenburns" | "veo_video";
  const [engine, setEngine] = useState<VideoEngine>("ffmpeg_kenburns");

  // Veo-specific state (only used when engine === "veo_video")
  const [veoProgress, setVeoProgress] = useState<{ current: number; total: number } | null>(null);
  const { startPolling, results: pollResults, isPolling } = useVeoPolling();
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  // Plan gate
  const hasVideoAccess = plan?.user_plan === "pro" || plan?.user_plan === "vip";
  const activeAddonType = resolveVideoPlanTier(overview?.addOn?.addon_type ?? (plan?.user_plan === "vip" ? "premium" : plan?.user_plan === "pro" ? "plus" : "standard"));
  const planRule = getVideoPlanRule(activeAddonType);
  const uploadSummary = getUploadSummary(photos.length, activeAddonType);
  const motionPreset = getDefaultVideoMotionPreset();
  const motionPresetConfig = getVideoMotionPresetConfig(motionPreset);
  const maxPhotosAllowed = planRule.maxUploadImages;
  const resolutionLabel = planRule.resolution;

  // Derived from template + photos
  const selectedTemplate = getVideoTemplate(templateId);
  const selectedPreset = getVisualPreset(presetId);
  const selectedMood = getMusicMood(moodId);
  const computedDurationSeconds = photos.length > 0
    ? estimateVideoDuration(templateId, photos.length)
    : uploadSummary.computedDurationSeconds;

  // Notify user when prefill is active
  useEffect(() => {
    if (prefill) {
      toast({
        title: "Configurações carregadas",
        description: "Template, estilo e trilha foram preenchidos com base no vídeo anterior. Suba as fotos para continuar.",
      });
      // Clear location state to avoid re-triggering
      window.history.replaceState({}, "");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When all polled clips finish, update the job status
  useEffect(() => {
    if (!pendingJobId || isPolling) return;
    // All polling done — check if we got any completed video
    const allResults = Object.values(pollResults);
    const anyCompleted = allResults.some((r) => r.status === "completed" && r.videoUrl);
    if (anyCompleted) {
      const firstVideo = allResults.find((r) => r.status === "completed" && r.videoUrl);
      if (firstVideo?.videoUrl) {
        setVideoUrl((prev) => prev ?? firstVideo.videoUrl!);
        updateVideoJobStatusMutation.mutateAsync({ id: pendingJobId, status: "completed", outputUrl: firstVideo.videoUrl });
      }
    }
    setPendingJobId(null);
  }, [isPolling, pendingJobId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (plan && !hasVideoAccess) {
    return (
      <AppLayout>
        <PlanGate />
      </AppLayout>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 20 - photos.length);

    const newPhotos: UploadedPhoto[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, maxPhotosAllowed));
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  /** Convert a File to base64 data URL */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  /** Map video format to Veo aspect ratio */
  const formatToAspectRatio = (f: Format): "16:9" | "9:16" | "1:1" => {
    if (f === "reels") return "9:16";
    if (f === "youtube") return "16:9";
    return "16:9"; // feed defaults to 16:9 for Veo (1:1 not supported)
  };

  const handleGenerate = async () => {
    if (!workspaceId) {
      toast({
        title: "Workspace não disponível",
        description: "Carregue o workspace antes de gerar o vídeo.",
        variant: "destructive",
      });
      return;
    }

    // ── Monetization: control point (before generate) ──────────────
    const resolvedPresetId = resolveLegacyPresetId(presetId);
    const costEstimate = estimateVideoCost({
      durationSeconds: computedDurationSeconds,
      resolution: resolutionLabel,
      photoCount: photos.length,
      presetId: resolvedPresetId,
    });

    const generateCheck = checkBeforeGenerate({
      plan: activeAddonType,
      creditsUsed: overview?.addOn?.credits_used ?? 0,
      photoCount: photos.length,
      durationSeconds: computedDurationSeconds,
      presetId: resolvedPresetId,
      costEstimate,
    });

    if (!generateCheck.allowed) {
      toast({
        title: "Ação bloqueada",
        description: generateCheck.reason ?? "Verifique seu plano.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setVeoProgress(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);

    let jobId: string | null = null;

    try {
      const createdJob = await createVideoJobMutation.mutateAsync({
        title: `${selectedTemplate.name} - ${FORMATS.find((f) => f.id === format)?.label ?? format}`,
        style: presetId,
        format,
        durationSeconds: computedDurationSeconds,
        photosCount: photos.length,
        resolution: resolutionLabel,
        motionPreset,
        metadata: {
          source: "video-creator-page",
          photoNames: photos.map((photo) => photo.file.name),
          motion_preset: motionPreset,
          motion_preset_config: motionPresetConfig,
          render_engine: engine,
          template_id: templateId,
          template_name: selectedTemplate.name,
          visual_preset: presetId,
          // Preset Engine v2
          video_preset_id: resolvedPresetId,
          video_preset_motion: getVideoPreset(resolvedPresetId).motion.id,
          video_preset_transition: getVideoPreset(resolvedPresetId).transition.id,
          music_mood: moodId,
          music_payload: moodToPayloadValue(moodId),
          // Monetization: cost estimate
          estimated_cost: costEstimate.estimatedCost,
          cost_breakdown: costEstimate.breakdown,
          cost_formula_version: costEstimate.formulaVersion,
        },
      });
      jobId = createdJob.id;

      await createVideoJobSegments({
        videoJobId: jobId,
        workspaceId,
        imageNames: photos.map((photo) => photo.file.name),
        renderedSegments: uploadSummary.renderedSegments,
      });

      await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "processing" });

      // ── Monetization: log video_started ─────────────────────────────
      logVideoStarted({
        jobId,
        workspaceId,
        generationType: "video_compose_v2",
        engineId: engine === "veo_video" ? "veo_video" : "ffmpeg_kenburns",
        durationSeconds: computedDurationSeconds,
        resolution: resolutionLabel,
        templateId,
        templateName: selectedTemplate.name,
        presetId: resolvedPresetId,
        moodId,
        photoCount: photos.length,
        format,
        estimatedCost: costEstimate,
        plan: activeAddonType,
        addonType: activeAddonType,
        creditsUsed: overview?.addOn?.credits_used ?? 0,
      });

      if (engine === "ffmpeg_kenburns") {
        // ── FFmpeg Ken Burns pipeline (default) ──────────────────────
        // Upload photos + dispatch to generate-video-v2 (async)
        const v2Result = await renderVideoJobV2({
          workspaceId,
          videoJobId: jobId,
          title: `${selectedTemplate.name} - ${FORMATS.find((f) => f.id === format)?.label ?? format}`,
          style: presetId,
          format,
          photos: photos.map((p) => p.file),
          addonType: activeAddonType,
          audioMood: moodToPayloadValue(moodId),
        });

        toast({
          title: "Vídeo em processamento",
          description: `${v2Result.total_clips} clips, ${v2Result.total_duration.toFixed(0)}s — pipeline FFmpeg ativo.`,
        });

        // Poll generation_jobs until done (backend calls generation-callback)
        const doneJob = await pollJobUntilDone(v2Result.job_id, {
          intervalMs: 3000,
          timeoutMs: 300_000, // 5 min max
        });

        if (doneJob.status === "done" && doneJob.result_url) {
          setVideoUrl(doneJob.result_url);
          setGenerated(true);

          await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "completed", outputUrl: doneJob.result_url });
          await dispatchN8nEvent("video_completed", {
            workspace_id: workspaceId,
            video_job_id: jobId,
            output_url: doneJob.result_url,
            status: "completed",
            addon_type: activeAddonType,
            render_engine: "ffmpeg_kenburns",
            pipeline_version: "v2",
          });
          toast({ title: "Vídeo gerado com sucesso!", description: "Vídeo profissional criado via FFmpeg." });
          // ── Monetization: log video_completed ─────────────────────────
          logVideoCompleted({
            jobId,
            workspaceId,
            generationType: "video_compose_v2",
            engineId: "ffmpeg_kenburns",
            durationSeconds: computedDurationSeconds,
            resolution: resolutionLabel,
            templateId,
            presetId: resolvedPresetId,
            moodId,
            photoCount: photos.length,
            format,
            estimatedCost: costEstimate,
            plan: activeAddonType,
            outputUrl: doneJob.result_url,
          });
        } else {
          throw new Error(doneJob.error_message || "O vídeo não foi concluído a tempo.");
        }

      } else if (engine === "veo_video") {
        // ── Veo pipeline (optional, NOT default) ─────────────────────
        const segmentPhotos = photos.slice(0, uploadSummary.renderedSegments);
        const aspectRatio = formatToAspectRatio(format);
        const veoStyle = presetId === "luxury" ? "luxury" : presetId === "fast_sales" ? "moderno" : "cinematic" as "cinematic" | "moderno" | "luxury";

        setVeoProgress({ current: 0, total: segmentPhotos.length });

        const clipResults: { index: number; videoUrl?: string; operationName?: string; status: string }[] = [];

        for (let i = 0; i < segmentPhotos.length; i++) {
          setVeoProgress({ current: i + 1, total: segmentPhotos.length });

          const base64 = await fileToBase64(segmentPhotos[i].file);
          const result = await generateVideoClipFromImage({
            imageBase64: base64,
            style: veoStyle,
            aspectRatio,
            workspaceId,
            jobId,
            segmentIndex: i,
          });

          clipResults.push({
            index: i,
            videoUrl: result.videoUrl,
            operationName: result.operationName,
            status: result.status,
          });
        }

        const completedClips = clipResults.filter((c) => c.status === "completed" && c.videoUrl);
        const processingClips = clipResults.filter((c) => c.status === "processing");

        if (completedClips.length > 0 && processingClips.length === 0) {
          const firstClipUrl = completedClips[0].videoUrl!;
          setVideoUrl(firstClipUrl);
          setGenerated(true);

          await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "completed", outputUrl: firstClipUrl });
          await dispatchN8nEvent("video_completed", {
            workspace_id: workspaceId,
            video_job_id: jobId,
            output_url: firstClipUrl,
            status: "completed",
            addon_type: activeAddonType,
            render_engine: "veo_video",
            total_clips: completedClips.length,
          });
          toast({ title: "Vídeo gerado com sucesso!", description: `${completedClips.length} clip(s) gerado(s) com Veo.` });
        } else if (processingClips.length > 0) {
          setPendingJobId(jobId);
          setGenerated(true);

          for (const clip of processingClips) {
            if (clip.operationName) {
              startPolling(
                { operationName: clip.operationName, workspaceId, jobId: jobId!, segmentIndex: clip.index },
                (result) => {
                  if (result.status === "completed" && result.videoUrl) {
                    toast({ title: `Clip ${clip.index + 1} pronto!` });
                    setVideoUrl((prev) => prev ?? result.videoUrl!);
                  } else if (result.status === "failed") {
                    toast({ title: `Clip ${clip.index + 1} falhou`, variant: "destructive" });
                  }
                }
              );
            }
          }

          if (completedClips.length > 0) {
            setVideoUrl(completedClips[0].videoUrl!);
          }

          toast({ title: "Clips em processamento", description: `${processingClips.length} clip(s) renderizando.` });
        }

      } else {
        // ── Legacy pipeline (generate-video v1) ──────────────────────
        const result = await renderVideoJob({
          workspaceId,
          videoJobId: jobId,
          title: `${selectedTemplate.name} - ${FORMATS.find((f) => f.id === format)?.label ?? format}`,
          style: presetId,
          format,
          duration: String(computedDurationSeconds),
          addonType: activeAddonType,
          photos: photos.map((photo) => photo.file),
        });

        setVideoUrl(result.videoUrl);
        setGenerated(true);

        await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "completed", outputUrl: result.videoUrl });
        toast({ title: "Vídeo gerado com sucesso!" });
      }
    } catch (e: unknown) {
      if (jobId) {
        try {
          await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "failed" });
        } catch {
          // noop
        }
      } else if (workspaceId) {
        try {
          await releaseVideoCreditMutation.mutateAsync();
        } catch {
          // noop
        }
      }
      if (workspaceId) {
        await dispatchN8nEvent("video_failed", {
          workspace_id: workspaceId,
          video_job_id: jobId,
          status: "failed",
          error_type: "render_or_pipeline",
          message: e instanceof Error ? e.message : "Tente novamente.",
        });
      }
      // ── Monetization: log video_failed ──────────────────────────────
      logVideoFailed({
        jobId: jobId ?? "unknown",
        workspaceId: workspaceId ?? "unknown",
        generationType: "video_compose_v2",
        engineId: engine === "veo_video" ? "veo_video" : "ffmpeg_kenburns",
        durationSeconds: computedDurationSeconds,
        resolution: resolutionLabel,
        templateId,
        presetId: resolvedPresetId,
        photoCount: photos.length,
        format,
        estimatedCost: costEstimate,
        plan: activeAddonType,
        errorMessage: e instanceof Error ? e.message : "Unknown error",
        errorType: "render_or_pipeline",
      });

      toast({
        title: "Erro ao gerar vídeo",
        description: e instanceof Error ? e.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setVeoProgress(null);
    }
  };

  const canProceedStep0 = photos.length >= 6;
  const canProceedStep1 = true;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-card to-muted/40 p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-3">Novo módulo</Badge>
              <h1 className="text-3xl font-display font-bold text-foreground">Criador de Vídeos IA</h1>
              <p className="text-muted-foreground mt-1 max-w-xl">
                Transforme fotos do imóvel em vídeos profissionais para Reels, YouTube e Feed com regras claras por plano, duração e resolução.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "< 3 min", label: "por vídeo" },
                { value: resolutionLabel, label: "resolução do plano" },
                { value: `${computedDurationSeconds || 0}s`, label: "duração estimada" },
                { value: motionPresetConfig.label, label: "movimento padrão IA" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                  <p className="text-base font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={[
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  i === step
                    ? "bg-accent text-accent-foreground"
                    : i < step
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Photo upload ──────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Suba as fotos do imóvel</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mínimo recomendado 6 fotos · máximo {maxPhotosAllowed} fotos neste plano · formatos JPG, PNG, WEBP · max 200MB por arquivo
                  </p>
                </div>

                {/* Content prohibition notice */}
                <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 flex gap-3">
                  <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-1">Conteúdo proibido — leia antes de fazer upload</p>
                    <p>
                      Não envie fotos com <strong>pessoas identificáveis</strong> (rosto/corpo), <strong>documentos</strong> (CPF, RG, CNH, contratos), <strong>dados pessoais/sensíveis</strong> ou qualquer conteúdo ilegal/ofensivo.
                      Violações podem resultar em suspensão da conta sem reembolso.{" "}
                      <a href="/termos" target="_blank" className="underline text-accent hover:text-accent/80">
                        Ver Termos de Uso
                      </a>
                    </p>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={[
                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors",
                    dragging
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50 hover:bg-muted/40",
                  ].join(" ")}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground">Arraste e solte ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mt-1">Até {maxPhotosAllowed} fotos neste plano</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>

                {/* Photo grid */}
                {photos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">
                        {photos.length}/{maxPhotosAllowed} fotos {photos.length < 6 && <span className="text-amber-500">(mínimo recomendado 6)</span>}
                      </p>
                      <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => setPhotos([])}>
                        Remover todas
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {photos.map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={p.preview} alt="" className="w-full h-full object-cover" />
                          <button
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); removePhoto(p.id); }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {photos.length < maxPhotosAllowed && (
                        <button
                          className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                size="lg"
              >
                Próximo: escolher estilo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Template & estilo ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-7">
                {/* Template */}
                <div>
                  <Label className="text-base font-semibold">Tipo de video</Label>
                  <p className="text-sm text-muted-foreground mb-4">Escolha o estilo de narrativa visual do seu video.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {VIDEO_TEMPLATE_LIST.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTemplateId(t.id);
                          // Use Preset Engine to resolve best preset for this template + format
                          const resolvedPresetId = resolvePresetForTemplate(t.id, format);
                          const legacyPreset = resolvedPresetId === "luxury" ? "luxury" : resolvedPresetId === "fast_sales" ? "fast_sales" : "default";
                          setPresetId(legacyPreset as VisualPresetId);
                          const presetObj = getVideoPreset(resolvedPresetId);
                          // Set mood from preset default or template recommendation
                          const recMood = t.recommended_mood as MusicMoodId;
                          if (MUSIC_MOOD_LIST.some((m) => m.id === recMood)) setMoodId(recMood);
                        }}
                        className={[
                          "rounded-xl border p-4 text-left transition-all",
                          templateId === t.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{t.icon}</span>
                          <Badge variant="outline" className="text-[10px]">{t.estimated_duration_label}</Badge>
                        </div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.tagline}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-2">{t.best_for}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Preset */}
                <div>
                  <Label className="text-base font-semibold">Estilo visual</Label>
                  <p className="text-sm text-muted-foreground mb-4">Define como a camera se movimenta sobre suas fotos.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {VISUAL_PRESET_LIST.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPresetId(p.id)}
                        className={[
                          "rounded-xl border p-4 text-left transition-all",
                          presetId === p.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{p.icon}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{p.rhythm}</Badge>
                        </div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{p.feeling}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <Label className="text-base font-semibold">Formato de saida</Label>
                  <p className="text-sm text-muted-foreground mb-4">Proporcoes ideais para a rede social alvo.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FORMATS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={[
                          "rounded-xl border p-4 text-left transition-all",
                          format === f.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/40",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-foreground">{f.label}</p>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                            {f.ratio}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{f.platforms}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration summary */}
                <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fotos</span>
                    <span className="font-semibold text-foreground">{photos.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Segundos por foto</span>
                    <span className="font-semibold text-foreground">{selectedTemplate.seconds_per_photo}s</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duracao estimada</span>
                    <span className="font-semibold text-foreground">{computedDurationSeconds}s</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Resolucao</span>
                    <span className="font-semibold text-foreground">{resolutionLabel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <Button onClick={() => setStep(2)} size="lg">
                Proximo: trilha e gerar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Trilha & gerar ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Music mood selector */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-accent" />
                    <Label className="text-base font-semibold">Trilha sonora</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Escolha a ambientacao musical do video.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MUSIC_MOOD_LIST.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMoodId(m.id)}
                        className={[
                          "rounded-xl border p-3 text-left transition-all",
                          moodId === m.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{m.icon}</span>
                          <p className="font-semibold text-foreground text-sm">{m.name}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{m.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-[1fr,320px] gap-6">
              {/* Summary */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <h2 className="text-xl font-semibold text-foreground">Resumo do video</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Template</p>
                      <p className="font-semibold text-foreground">{selectedTemplate.icon} {selectedTemplate.name}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedTemplate.tagline}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Estilo visual</p>
                      <p className="font-semibold text-foreground">{selectedPreset.icon} {selectedPreset.name}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedPreset.feeling}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Trilha</p>
                      <p className="font-semibold text-foreground">{selectedMood.icon} {selectedMood.name}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedMood.emotion}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Formato</p>
                      <p className="font-semibold text-foreground">{FORMATS.find((f) => f.id === format)?.label}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Fotos</p>
                      <p className="font-semibold text-foreground">{photos.length} fotos</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Duracao</p>
                      <p className="font-semibold text-foreground">{computedDurationSeconds}s · {resolutionLabel}</p>
                    </div>
                  </div>

                  {/* Mini photo preview */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Fotos incluidas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {photos.slice(0, 12).map((p) => (
                        <img key={p.id} src={p.preview} alt="" className="w-10 h-10 rounded object-cover" />
                      ))}
                      {photos.length > 12 && (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                          +{photos.length - 12}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} disabled={generating}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Editar configuracoes
                    </Button>
                    {!generated && (
                      <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        size="lg"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando vídeo…
                          </>
                        ) : (
                          <>
                            <Film className="w-4 h-4 mr-2" />
                            Gerar vídeo com IA
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status panel */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 border-b border-border/60 bg-gradient-to-br from-accent/10 to-transparent">
                    <div className="flex items-center gap-2">
                      <Film className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Status da geração</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {!generating && !generated && (
                      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground min-h-[200px] flex flex-col justify-between shadow-elevated">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-accent text-primary">{computedDurationSeconds}s</Badge>
                          <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-white/10">
                            {selectedTemplate.name}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-white/10">
                            {selectedPreset.name}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-white/10">
                            {selectedMood.icon} {selectedMood.name}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-primary-foreground/60">Pronto para gerar</p>
                          <p className="font-display text-lg font-bold mt-1">
                            {FORMATS.find((f) => f.id === format)?.label}
                          </p>
                          <p className="text-xs text-primary-foreground/40 mt-1">{photos.length} fotos · {resolutionLabel}</p>
                        </div>
                      </div>
                    )}

                    {generating && (
                      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground min-h-[200px] flex flex-col items-center justify-center gap-4 shadow-elevated">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <div className="text-center">
                          <p className="font-semibold">Renderizando com IA…</p>
                          <p className="text-sm text-primary-foreground/60 mt-1">Isso pode levar alguns segundos</p>
                        </div>
                        <div className="w-full bg-primary-foreground/10 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-accent rounded-full animate-pulse w-3/5" />
                        </div>
                      </div>
                    )}

                    {generated && (
                      <div className="space-y-3">
                        {videoUrl && (
                          <video
                            src={videoUrl}
                            controls
                            className="w-full rounded-xl bg-black"
                          />
                        )}
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white flex items-center gap-3 shadow-elevated">
                          <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                          <div>
                            <p className="font-display font-bold">Vídeo pronto!</p>
                            <p className="text-sm text-white/70">
                              {computedDurationSeconds}s · {FORMATS.find((f) => f.id === format)?.label} · {resolutionLabel}
                            </p>
                          </div>
                        </div>
                        {videoUrl ? (
                          <a href={videoUrl} download={`video-imob-${format}-${computedDurationSeconds}s.mp4`} className="block">
                            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar vídeo
                            </Button>
                          </a>
                        ) : (
                          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar vídeo
                          </Button>
                        )}
                        <Button variant="outline" className="w-full" onClick={() => navigate("/library")}>
                          Ver na Biblioteca
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-sm"
                          onClick={() => {
                            if (videoUrl) URL.revokeObjectURL(videoUrl);
                            setVideoUrl(null);
                            setGenerated(false);
                            setPhotos([]);
                            setStep(0);
                          }}
                        >
                          Criar outro vídeo
                        </Button>
                      </div>
                    )}

                    {!generated && (
                      <div className="space-y-2">
                        <div className="rounded-xl border border-border/60 p-3 bg-muted/30 text-xs text-muted-foreground flex gap-2">
                          <Zap className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>
                            Cada vídeo consome créditos do add-on ativo. Starter libera vídeos curtos, Pro amplia duração e volume, e Enterprise desbloqueia 90s, 4K e operação premium.
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 leading-relaxed px-1">
                          Ao gerar, você confirma que possui os direitos sobre as fotos enviadas e que elas não contêm pessoas identificáveis, documentos ou dados pessoais/sensíveis, conforme os{" "}
                          <a href="/termos" target="_blank" className="underline hover:text-accent transition-colors">
                            Termos de Uso
                          </a>.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VideoCreatorPage;
