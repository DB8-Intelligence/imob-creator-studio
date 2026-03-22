import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Loader2,
  Sparkles,
  RefreshCw,
  Search,
  Wand2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Film,
  LayoutTemplate,
} from "lucide-react";
import {
  useCreateAIAgentJob,
  useAIAgentJobPoller,
  useSelectAIAgentOption,
  type AIAgentFormat,
  type AIAgentCanal,
  type AIAgentOption,
  type AIAgentJob,
} from "@/hooks/useAIAgent";

// ── Types ────────────────────────────────────────────────────────────────────

type PageStep = 1 | 2 | 3 | 4 | 5;

const FORMATS: { id: AIAgentFormat; label: string; description: string; icon: React.ElementType }[] = [
  { id: "post",      label: "Post",      description: "Post único com copy e imagem",         icon: ImageIcon },
  { id: "carousel",  label: "Carrossel",  description: "Sequência de 5 slides com roteiro",   icon: LayoutTemplate },
  { id: "reel",      label: "Reels",      description: "Roteiro de vídeo de 30s",             icon: Film },
];

const TOPIC_SUGGESTIONS = [
  "Valorização de imóveis em 2026",
  "Como escolher o bairro ideal",
  "Financiamento imobiliário desmistificado",
  "Diferenças entre apartamento e casa",
  "Mercado de luxo no Brasil",
  "Erros comuns ao comprar imóvel",
  "Tendências de decoração para valorizar",
  "Retorno de investimento em imóveis",
];

// ── Status Helpers ────────────────────────────────────────────────────────────

function statusLabel(status: AIAgentJob["status"] | undefined): string {
  switch (status) {
    case "queued":             return "Aguardando agente...";
    case "researching":        return "Pesquisando mercado com Serper...";
    case "generating":         return "Gerando conteúdo com Claude...";
    case "awaiting_selection": return "Aguardando sua seleção";
    case "completed":          return "Conteúdo gerado!";
    case "failed":             return "Erro no processamento";
    default:                   return "Processando...";
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

const AIAgentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<PageStep>(1);
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [format, setFormat] = useState<AIAgentFormat>("post");
  const [canal, setCanal] = useState<AIAgentCanal>("instagram");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<AIAgentOption | null>(null);

  const createJob = useCreateAIAgentJob();
  const selectOption = useSelectAIAgentOption();
  const { data: job, isError } = useAIAgentJobPoller(activeJobId);

  // ── Navigation helpers ───────────────────────────────────────────────────────

  const goBack = () => {
    if (step === 1) navigate("/create");
    else setStep((s) => (s - 1) as PageStep);
  };

  // Auto-advance when job status changes
  if (job && step === 2 && job.status === "awaiting_selection") {
    setStep(3);
  }
  if (job && step === 4 && (job.status === "completed" || job.status === "failed")) {
    setStep(5);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleStartJob = async () => {
    if (!topic.trim()) {
      toast({ title: "Digite um tema antes de continuar", variant: "destructive" });
      return;
    }
    const newJob = await createJob.mutateAsync({ topic, subtopic, format, canal });
    setActiveJobId(newJob.id);
    setStep(2);
  };

  const handleSelectOption = async (option: AIAgentOption) => {
    if (!activeJobId) return;
    setSelectedOption(option);
    await selectOption.mutateAsync({ jobId: activeJobId, selectedOption: option });
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setActiveJobId(null);
    setSelectedOption(null);
    setTopic("");
    setSubtopic("");
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Conteúdo copiado para a área de transferência." });
  };

  const canStartJob = topic.trim().length >= 3;
  const totalSteps = 5;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" />
              Agentes de Conteúdo IA
            </h1>
            <p className="text-sm text-muted-foreground">Etapa {step}/{totalSteps}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i + 1 <= step ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* ══════════════════ STEP 1 — Tema e configuração ══════════════════ */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Qual o tema do seu conteúdo?</h2>
              <p className="text-sm text-muted-foreground">
                O agente vai pesquisar os melhores ângulos do mercado e criar 3 opções de copy alinhadas ao seu branding.
              </p>
            </div>

            {/* Topic */}
            <section className="space-y-3">
              <Label className="text-base font-semibold">Tema principal *</Label>
              <Textarea
                placeholder="Ex: Valorização de imóveis em Alphaville nos próximos 5 anos"
                className="min-h-20 resize-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {TOPIC_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    className="px-2.5 py-1 rounded-full text-xs border border-border/60 bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Subtopic */}
            <section className="space-y-2">
              <Label className="text-sm font-semibold">
                Subtema / Detalhe <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                placeholder="Ex: com foco em imóveis de alto padrão acima de R$ 2 milhões"
                className="min-h-14 resize-none text-sm"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
              />
            </section>

            {/* Format */}
            <section className="space-y-3">
              <Label className="text-base font-semibold">Formato de entregável</Label>
              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map((f) => {
                  const Icon = f.icon;
                  const selected = format === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id)}
                      className={`rounded-xl border p-4 flex flex-col items-center gap-2 text-center transition-all ${
                        selected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border/60 bg-card text-muted-foreground hover:border-accent/40"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <p className="text-xs font-semibold">{f.label}</p>
                      <p className="text-[10px] opacity-70 leading-tight">{f.description}</p>
                      {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Canal */}
            <section className="space-y-3">
              <Label className="text-base font-semibold">Canal</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["instagram", "facebook"] as AIAgentCanal[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCanal(c)}
                    className={`rounded-xl border p-3 flex items-center gap-3 transition-all ${
                      canal === c ? "border-accent bg-accent/10" : "border-border/60 bg-card hover:border-accent/40"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c === "instagram" ? "bg-pink-500" : "bg-blue-500"}`} />
                    <span className="text-sm font-medium text-foreground capitalize">
                      {c === "instagram" ? "Instagram" : "Facebook"}
                    </span>
                    {canal === c && <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />}
                  </button>
                ))}
              </div>
            </section>

            <Button
              className="w-full"
              size="lg"
              disabled={!canStartJob || createJob.isPending}
              onClick={handleStartJob}
            >
              {createJob.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Iniciando agentes...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Pesquisar e criar opções</>
              )}
            </Button>
          </div>
        )}

        {/* ══════════════════ STEP 2 — Aguardando Workflow 1 ══════════════════ */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center relative">
              <Bot className="w-8 h-8 text-accent" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-ping" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {isError ? "Erro de conexão" : statusLabel(job?.status)}
              </p>
              <p className="text-sm text-muted-foreground">
                {isError
                  ? "Não foi possível verificar o status. Aguarde..."
                  : "O agente está pesquisando o mercado e preparando 3 ângulos únicos para o seu tema."}
              </p>
            </div>
            <div className="flex gap-3">
              {["Pesquisa", "Análise", "Copy"].map((s, i) => {
                const isActive = job?.status === "researching";
                return (
                  <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div
                      className={`w-2 h-2 rounded-full ${isActive ? "bg-accent animate-pulse" : "bg-muted"}`}
                      style={{ animationDelay: `${i * 250}ms` }}
                    />
                    {s}
                  </div>
                );
              })}
            </div>
            {job?.status === "failed" && (
              <div className="text-center space-y-2">
                <p className="text-sm text-destructive">{job.error_message || "Erro desconhecido"}</p>
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ STEP 3 — Escolher uma das 3 opções ══════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                <Wand2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Escolha o ângulo do seu conteúdo</h2>
              <p className="text-sm text-muted-foreground">
                O agente criou 3 opções baseadas na pesquisa de mercado e no seu branding. Selecione a que mais combina.
              </p>
            </div>

            <div className="space-y-4">
              {(job?.options ?? []).map((option, idx) => {
                const angleLabel: Record<string, string> = {
                  educacional: "Educacional",
                  emocional:   "Emocional",
                  autoridade:  "Autoridade",
                };
                const angleColor: Record<string, string> = {
                  educacional: "bg-blue-500/10 text-blue-600 border-blue-200",
                  emocional:   "bg-pink-500/10 text-pink-600 border-pink-200",
                  autoridade:  "bg-amber-500/10 text-amber-600 border-amber-200",
                };
                return (
                  <div
                    key={option.id}
                    className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 hover:border-accent/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">Opção {idx + 1}</span>
                        <Badge className={`text-[10px] border ${angleColor[option.angle] ?? ""}`}>
                          {angleLabel[option.angle] ?? option.angle}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground leading-snug">{option.headline}</p>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-4">{option.body}</p>
                      <p className="text-xs font-medium text-accent mt-2">CTA: {option.cta}</p>
                    </div>
                    {option.research_sources?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {option.research_sources.slice(0, 3).map((src, si) => (
                          <span
                            key={si}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => handleSelectOption(option)}
                      disabled={selectOption.isPending}
                    >
                      {selectOption.isPending && selectedOption?.id === option.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                      ) : (
                        <>
                          Usar esta opção
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════ STEP 4 — Aguardando Workflow 2 ══════════════════ */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center relative">
              <Sparkles className="w-8 h-8 text-accent" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-ping" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {statusLabel(job?.status)}
              </p>
              <p className="text-sm text-muted-foreground">
                Gerando seu {format === "post" ? "post" : format === "carousel" ? "carrossel" : "roteiro de reels"} final para {canal === "instagram" ? "Instagram" : "Facebook"}.
              </p>
            </div>
            {job?.status === "failed" && (
              <div className="text-center space-y-2">
                <p className="text-sm text-destructive">{job.error_message || "Erro na geração"}</p>
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Escolher outra opção
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ STEP 5 — Resultado final ══════════════════ */}
        {step === 5 && job?.status === "completed" && job.output_metadata && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Conteúdo gerado!</h2>
              <p className="text-sm text-muted-foreground">
                Seu {format} está pronto para publicação no {canal === "instagram" ? "Instagram" : "Facebook"}.
              </p>
            </div>

            {/* Post output */}
            {job.output_type === "post" && (
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Caption do Post</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyContent(String((job.output_metadata as Record<string, unknown>)?.caption ?? ""))}
                  >
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copiar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {String((job.output_metadata as Record<string, unknown>)?.caption ?? "")}
                </p>
                {(job.output_metadata as Record<string, unknown>)?.image_prompt && (
                  <div className="rounded-xl bg-muted/30 p-3 border border-border/40">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Sugestão de imagem</p>
                    <p className="text-xs text-muted-foreground italic">
                      {String((job.output_metadata as Record<string, unknown>)?.image_prompt ?? "")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => navigate("/create/ideia")}
                    >
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                      Gerar imagem com este prompt
                      <ExternalLink className="w-3 h-3 ml-1.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Carousel output */}
            {job.output_type === "carousel" && (
              <div className="space-y-3">
                {((job.output_metadata as Record<string, unknown>)?.slides as Array<Record<string, unknown>> ?? []).map((slide, i) => (
                  <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold text-foreground">{String(slide.title ?? "")}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{String(slide.text ?? "")}</p>
                    {slide.visual && (
                      <p className="text-xs text-accent italic mt-2">{String(slide.visual)}</p>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCopyContent(
                    JSON.stringify((job.output_metadata as Record<string, unknown>)?.slides ?? [], null, 2)
                  )}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar todos os slides como JSON
                </Button>
              </div>
            )}

            {/* Reel output */}
            {job.output_type === "reel" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Script narrado</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContent(String((job.output_metadata as Record<string, unknown>)?.script ?? ""))}
                    >
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {String((job.output_metadata as Record<string, unknown>)?.script ?? "")}
                  </p>
                </div>
                {(job.output_metadata as Record<string, unknown>)?.caption && (
                  <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Legenda do Reels</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyContent(String((job.output_metadata as Record<string, unknown>)?.caption ?? ""))}
                      >
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copiar
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {String((job.output_metadata as Record<string, unknown>)?.caption ?? "")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Criar novo conteúdo
              </Button>
              <Button className="flex-1" onClick={() => navigate("/inbox")}>
                Ir para inbox
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Error state in step 5 */}
        {step === 5 && job?.status === "failed" && (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">
              {job.error_message || "Algo deu errado. Tente novamente."}
            </p>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recomeçar
            </Button>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default AIAgentsPage;
