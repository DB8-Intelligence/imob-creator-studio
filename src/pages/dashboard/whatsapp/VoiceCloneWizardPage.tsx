// ============================================================
// VoiceCloneWizardPage — Sprint 3: Voz clonada (Plus)
// Rota: /dashboard/whatsapp/voz
//
// Permite ao corretor clonar a voz via ElevenLabs e escolher como a IA
// responde no WhatsApp (texto / voz / auto).
// ============================================================
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mic, Play, Square, Upload,
  RefreshCw, Volume2, Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useModules } from "@/hooks/useModuleAccess";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { handleKiwifyCheckout, KIWIFY_CHECKOUT_AGENT_AI } from "@/lib/kiwify-links";

interface ExistingClone {
  id:           string;
  display_name: string;
  created_at:   string;
}

type VoiceMode = "texto" | "voz" | "auto";

const SCRIPT_SUGESTAO = `Oi! Aqui é o João, corretor especialista em apartamentos de alto padrão em Salvador. Trabalho com a Imobiliária Litoral Norte há dez anos atendendo famílias que querem morar de frente pro mar. Se você me mandar o bairro e a faixa de orçamento que faz sentido, eu te mostro as melhores oportunidades em menos de vinte e quatro horas.`;

export default function VoiceCloneWizardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const modules = useModules();

  const [loading, setLoading] = useState(true);
  const [clone, setClone] = useState<ExistingClone | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("texto");
  const [savingMode, setSavingMode] = useState(false);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Clone naming + submission
  const [displayName, setDisplayName] = useState("Minha voz");
  const [submitting, setSubmitting] = useState(false);

  // Preview
  const [previewText, setPreviewText] = useState("Oi tudo bem? Obrigado pelo contato, já te mando as opções.");
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data: isSuperAdmin } = useIsSuperAdmin();

  const hasPlus =
    isSuperAdmin ||
    (modules.hasModule("whatsapp") &&
      ["pro", "max"].includes(modules.getModule("whatsapp")?.plan_slug ?? ""));

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [cloneRes, instRes] = await Promise.all([
        supabase
          .from("voice_clones")
          .select("id, display_name, created_at")
          .eq("user_id", user.id)
          .eq("status", "ready")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("user_whatsapp_instances")
          .select("voice_mode")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      if (cloneRes.data) setClone(cloneRes.data as ExistingClone);
      if (instRes.data?.voice_mode) setVoiceMode(instRes.data.voice_mode as VoiceMode);
      setLoading(false);
    })();
  }, [user]);

  /* ── Recording ───────────────────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
      setRecordDuration(0);
      intervalRef.current = window.setInterval(() => setRecordDuration((d) => d + 1), 1000);
    } catch (e) {
      console.error(e);
      toast({ title: "Microfone bloqueado", description: "Permita acesso ao microfone e tente de novo.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setRecording(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25_000_000) {
      toast({ title: "Arquivo muito grande", description: "Máximo 25MB.", variant: "destructive" });
      return;
    }
    setRecordedBlob(file);
  };

  /* ── Submit ───────────────────────────────────────────────── */
  const submitClone = async () => {
    if (!user || !recordedBlob) return;
    if (recordDuration && recordDuration < 30) {
      toast({ title: "Muito curto", description: "Grave ao menos 30s (o ideal é 60–90s).", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const ext = recordedBlob.type.includes("webm") ? "webm" : "m4a";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("voice-samples").upload(path, recordedBlob, {
        contentType: recordedBlob.type || "audio/webm",
        upsert: false,
      });
      if (up.error) throw new Error(up.error.message);

      const { data, error } = await supabase.functions.invoke("voice-clone-create", {
        body: { sample_path: path, display_name: displayName },
      });
      if (error || !data?.ok) {
        const msg = (data as { message?: string; error?: string })?.message ??
                    (data as { error?: string })?.error ??
                    error?.message ?? "Falha ao criar clone";
        throw new Error(msg);
      }
      setClone({ id: data.clone.id, display_name: data.clone.display_name, created_at: new Date().toISOString() });
      setRecordedBlob(null);
      setRecordDuration(0);
      toast({ title: "Voz clonada!", description: "Agora ative o modo voz para usar no WhatsApp." });
    } catch (e) {
      toast({ title: "Erro ao clonar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const discardRecording = () => { setRecordedBlob(null); setRecordDuration(0); };

  /* ── Preview ──────────────────────────────────────────────── */
  const playPreview = async () => {
    if (!previewText.trim()) return;
    setPreviewLoading(true);
    setPreviewAudio(null);
    try {
      const { data, error } = await supabase.functions.invoke("voice-clone-preview", {
        body: { text: previewText },
      });
      if (error || !data?.ok) throw new Error((data as { error?: string })?.error ?? error?.message ?? "Falha");
      setPreviewAudio(`data:${data.mime};base64,${data.audio_base64}`);
    } catch (e) {
      toast({ title: "Erro no preview", description: (e as Error).message, variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ── Modo ────────────────────────────────────────────────── */
  const saveVoiceMode = async (mode: VoiceMode) => {
    if (!user) return;
    setSavingMode(true);
    setVoiceMode(mode);
    const { error } = await supabase
      .from("user_whatsapp_instances")
      .update({ voice_mode: mode })
      .eq("user_id", user.id);
    setSavingMode(false);
    if (error) {
      toast({ title: "Erro ao salvar modo", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Modo salvo", description: modeLabel(mode) });
  };

  /* ── Render ──────────────────────────────────────────────── */
  if (loading || modules.loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-6 w-6 animate-spin text-[#002B5B]" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPlus) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link to="/dashboard/secretaria" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#002B5B] mb-2">
            <ArrowLeft className="h-3 w-3" /> Voltar ao Hub da Secretária
          </Link>
          <Card className="border border-amber-200 bg-amber-50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-200">
                <Lock className="h-7 w-7 text-amber-700" />
              </div>
              <h1 className="text-2xl font-bold text-amber-900">Voz clonada é do Plus</h1>
              <p className="text-sm text-amber-800 max-w-md mx-auto">
                O clone de voz com IA faz parte do plano <strong>Secretária Virtual Plus</strong> (R$ 79,90/mês).
                Faça upgrade para enviar áudios no WhatsApp com a sua própria voz, automaticamente.
              </p>
              <Button
                className="bg-[#002B5B] hover:bg-[#001d3d] text-white"
                onClick={() => handleKiwifyCheckout(KIWIFY_CHECKOUT_AGENT_AI.plus, { plan: "plus", module: "secretaria" })}
              >
                Fazer upgrade para Plus
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <Link to="/dashboard/whatsapp/ai-config" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#002B5B] mb-2">
            <ArrowLeft className="h-3 w-3" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-[#002B5B] flex items-center gap-2">
            <Mic className="h-6 w-6 text-[#002B5B]" /> Voz clonada
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">Plus</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Clone sua voz e deixe a IA responder no WhatsApp em áudio — como se fosse você mesmo.
          </p>
        </div>

        {/* ESTADO 1: Sem clone — wizard de gravação */}
        {!clone && (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-base text-[#002B5B]">Passo 1 — Grave sua voz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
                <p className="font-semibold mb-2">💡 Como gravar a melhor amostra</p>
                <ul className="space-y-1 text-xs list-disc pl-4">
                  <li>Fale por <strong>60 a 90 segundos</strong> em ambiente silencioso</li>
                  <li>Use o tom natural que você usa com clientes — nem lendo nem exagerado</li>
                  <li>Leia o roteiro sugerido abaixo ou fale livremente sobre você/sua imobiliária</li>
                </ul>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#374151]">Roteiro sugerido</Label>
                <Textarea
                  value={SCRIPT_SUGESTAO}
                  readOnly
                  className="mt-1.5 text-xs h-32 bg-gray-50 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!recording && !recordedBlob && (
                  <>
                    <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                      <Mic className="h-4 w-4" /> Começar gravação
                    </Button>
                    <span className="text-xs text-gray-400">ou</span>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-[#002B5B] cursor-pointer hover:underline">
                      <Upload className="h-4 w-4" /> Enviar arquivo (.mp3, .m4a, .webm)
                      <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
                    </label>
                  </>
                )}

                {recording && (
                  <Button onClick={stopRecording} variant="destructive" className="gap-2">
                    <Square className="h-4 w-4 fill-current" /> Parar ({recordDuration}s)
                  </Button>
                )}

                {recordedBlob && !recording && (
                  <div className="w-full flex flex-col gap-3">
                    <audio controls src={URL.createObjectURL(recordedBlob)} className="w-full" />
                    <div className="flex items-center gap-3">
                      <Button onClick={discardRecording} variant="outline" size="sm">Descartar</Button>
                      {recordDuration > 0 && <span className="text-xs text-gray-500">{recordDuration}s gravados</span>}
                    </div>
                  </div>
                )}
              </div>

              {recordedBlob && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <Label htmlFor="clone-name" className="text-sm font-medium text-[#374151]">
                      Nome do clone
                    </Label>
                    <Input
                      id="clone-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={60}
                      className="mt-1.5"
                    />
                  </div>
                  <Button
                    onClick={submitClone}
                    disabled={submitting}
                    className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                    {submitting ? "Clonando voz..." : "Criar clone"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ESTADO 2: Clone existe — preview + modo */}
        {clone && (
          <>
            <Card className="border border-emerald-200 bg-emerald-50">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">{clone.display_name}</p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Clone ativo desde {new Date(clone.created_at).toLocaleDateString("pt-BR")}.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setClone(null)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Regravar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base text-[#002B5B] flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Testar clone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="preview-text" className="text-sm font-medium text-[#374151]">
                    Texto a falar (máx 300 caracteres)
                  </Label>
                  <Textarea
                    id="preview-text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value.slice(0, 300))}
                    className="mt-1.5 h-20"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">{previewText.length}/300</p>
                </div>
                <Button onClick={playPreview} disabled={previewLoading} className="gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white">
                  {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {previewLoading ? "Gerando..." : "Gerar preview"}
                </Button>
                {previewAudio && <audio controls autoPlay src={previewAudio} className="w-full" />}
              </CardContent>
            </Card>

            {/* Modo de resposta */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base text-[#002B5B]">Modo de resposta no WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["texto", "voz", "auto"] as VoiceMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => saveVoiceMode(mode)}
                    disabled={savingMode}
                    className={`w-full text-left rounded-xl border p-4 transition-colors ${
                      voiceMode === mode
                        ? "border-[#002B5B] bg-[#F0F4FF] ring-2 ring-[#002B5B]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#002B5B]">{modeLabel(mode)}</span>
                      {voiceMode === mode && (
                        <CheckCircle2 className="h-4 w-4 text-[#002B5B]" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{modeDescription(mode)}</p>
                  </button>
                ))}
                {savingMode && <p className="text-xs text-gray-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Salvando...</p>}
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                O uso de voz clonada deve ser <strong>explícito</strong> e <strong>consentido</strong> pelos leads
                quando eles interagirem. Não use para enganar pessoas sobre quem está falando.
              </p>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function modeLabel(m: VoiceMode): string {
  return { texto: "Apenas texto", voz: "Sempre em voz", auto: "Automático (inteligente)" }[m];
}
function modeDescription(m: VoiceMode): string {
  return {
    texto: "IA responde sempre em texto. Use quando você ainda não confia no clone ou prefere o canal escrito.",
    voz:   "IA responde todo lead em áudio com a sua voz clonada. Consome créditos a cada resposta.",
    auto:  "IA decide sozinha: respostas curtas em voz, respostas com listas ou links em texto. Recomendado.",
  }[m];
}
