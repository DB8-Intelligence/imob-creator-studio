import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan, useConsumeCredits } from "@/hooks/useUserPlan";
import {
  ArrowLeft,
  ArrowRight,
  Wand2,
  Sparkles,
  Loader2,
  CheckCircle2,
  Download,
  RefreshCw,
  ImageIcon,
  Square,
  RectangleVertical,
  Monitor,
} from "lucide-react";
import {
  CREATIVE_TEMPLATES,
  CREATIVE_CATEGORIES,
  type CreativeTemplate,
} from "@/data/creativeTemplates";
import { supabase } from "@/integrations/supabase/client";
import { useSavedPrompts } from "@/hooks/useSavedPrompts";
import { ScanSearch, Trash2 } from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────
type Canal = "instagram" | "facebook";
type Tipo = "post" | "anuncio";
type Formato = "quadrado" | "feed" | "stories" | "paisagem";
type Step = 1 | 2 | 3;

interface Formatos {
  id: Formato;
  label: string;
  ratio: string;
  icon: React.ElementType;
}

const FORMATOS: Formatos[] = [
  { id: "quadrado", label: "Quadrado", ratio: "1:1", icon: Square },
  { id: "feed", label: "Feed", ratio: "4:5", icon: RectangleVertical },
  { id: "stories", label: "Stories", ratio: "9:16", icon: RectangleVertical },
  { id: "paisagem", label: "Paisagem", ratio: "16:9", icon: Monitor },
];

// ── Componente Principal ────────────────────────────────────────────────────
const IdeaCreativePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: plan } = useUserPlan();
  const consumeCredits = useConsumeCredits();
  const { getAll: getSavedPrompts, remove: removeSavedPrompt } = useSavedPrompts();
  const [showLabPrompts, setShowLabPrompts] = useState(false);
  const savedPrompts = getSavedPrompts();

  // Navigation
  const [step, setStep] = useState<Step>(1);

  // Step 1 — configuração
  const [formatos, setFormatos] = useState<Formato[]>(["quadrado"]);
  const [canal, setCanal] = useState<Canal>("instagram");
  const [tipo, setTipo] = useState<Tipo>("post");
  const [quantidade, setQuantidade] = useState<1 | 5>(1);

  const creditsRemaining = plan?.credits_remaining ?? 0;
  const creditCost = quantidade;
  const [selectedTemplate, setSelectedTemplate] = useState<CreativeTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState("top");
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);

  // Step 2 — texto
  const [conceito, setConceito] = useState("");
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [cta, setCta] = useState("");
  const [isRefiningText, setIsRefiningText] = useState(false);

  // Step 3 — resultado
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const toggleFormato = (f: Formato) => {
    setFormatos((prev) =>
      prev.includes(f)
        ? prev.length > 1 ? prev.filter((x) => x !== f) : prev
        : prev.length < 3 ? [...prev, f] : prev
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUserImage(file);
    setUserImagePreview(URL.createObjectURL(file));
  };

  const filteredTemplates = activeCategory === "all"
    ? CREATIVE_TEMPLATES
    : CREATIVE_TEMPLATES.filter((t) => t.categories.includes(activeCategory));

  // ── IA: Refinar Texto (Gemini) ────────────────────────────────────────────
  const handleRefinarTexto = async () => {
    if (!conceito.trim()) {
      toast({ title: "Digite sua ideia primeiro", variant: "destructive" });
      return;
    }
    setIsRefiningText(true);
    try {
      const { data, error } = await supabase.functions.invoke("refinar-texto-criativo", {
        body: {
          conceito,
          canal,
          tipo,
          template: selectedTemplate?.name ?? "genérico",
        },
      });
      if (error) throw error;
      setTitulo(data.titulo ?? "");
      setSubtitulo(data.subtitulo ?? "");
      setCta(data.cta ?? "");
      toast({ title: "Texto refinado pela IA!" });
    } catch {
      toast({ title: "Erro ao refinar texto", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsRefiningText(false);
    }
  };

  // ── IA: Gerar Criativo (DALL-E 3) ────────────────────────────────────────
  const handleGerar = async () => {
    if (!selectedTemplate) {
      toast({ title: "Selecione um template antes de gerar", variant: "destructive" });
      return;
    }
    if (!titulo.trim()) {
      toast({ title: "Preencha o título antes de gerar", variant: "destructive" });
      return;
    }
    if (creditsRemaining < creditCost) {
      toast({
        title: "Créditos insuficientes",
        description: `Você precisa de ${creditCost} crédito(s) mas tem apenas ${creditsRemaining}. Compre mais créditos.`,
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setStep(3);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-criativo", {
        body: {
          prompt_base: selectedTemplate.prompt,
          titulo,
          subtitulo,
          cta,
          canal,
          tipo,
          formatos,
          quantidade,
        },
      });
      if (error) throw error;
      setGeneratedUrls(data.urls ?? []);
      await consumeCredits.mutateAsync(creditCost);
      toast({ title: "Criativo gerado com sucesso!", description: `${creditCost} crédito(s) consumido(s).` });
    } catch {
      toast({ title: "Erro ao gerar criativo", description: "Tente novamente.", variant: "destructive" });
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  const canAdvanceStep1 = formatos.length > 0 && selectedTemplate !== null;
  const canAdvanceStep2 = titulo.trim().length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : navigate("/create")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Criar a partir de uma ideia</h1>
            <p className="text-sm text-muted-foreground">Etapa {step}/3</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* ══════════════════════ STEP 1 ══════════════════════ */}
        {step === 1 && (
          <div className="space-y-8">

            {/* Formato */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Formatos do criativo</Label>
                <span className="text-xs text-muted-foreground">
                  {formatos.length} selecionado{formatos.length !== 1 && "s"} · máx. 3
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {FORMATOS.map((f) => {
                  const Icon = f.icon;
                  const selected = formatos.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFormato(f.id)}
                      className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${
                        selected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border/60 bg-card text-muted-foreground hover:border-accent/40"
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-4 h-4 absolute self-end" />}
                      <Icon className="w-6 h-6" />
                      <div className="text-center">
                        <p className="text-xs font-medium">{f.label}</p>
                        <p className="text-[10px] opacity-70">{f.ratio}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatos.length} formato{formatos.length !== 1 && "s"} selecionado{formatos.length !== 1 && "s"} (1 crédito)
              </p>
            </section>

            {/* Canal */}
            <section className="space-y-3">
              <Label className="text-base font-semibold">Canal de destino</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["instagram", "facebook"] as Canal[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCanal(c)}
                    className={`rounded-xl border p-4 flex items-center gap-3 transition-all ${
                      canal === c
                        ? "border-accent bg-accent/10"
                        : "border-border/60 bg-card hover:border-accent/40"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c === "instagram" ? "bg-pink-500" : "bg-blue-500"}`} />
                    <span className="text-sm font-medium capitalize text-foreground">{c === "instagram" ? "Instagram" : "Facebook"}</span>
                    {canal === c && <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Tipo */}
            <section className="space-y-3">
              <Label className="text-base font-semibold">Tipo de entregável</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["post", "anuncio"] as Tipo[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`rounded-xl border p-4 flex items-center gap-3 transition-all ${
                      tipo === t
                        ? "border-accent bg-accent/10"
                        : "border-border/60 bg-card hover:border-accent/40"
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {t === "post" ? "Post Profissional" : "Anúncio"}
                    </span>
                    {tipo === t && <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Quantidade */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Quantos criativos gerar?</Label>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="font-semibold text-foreground">{creditsRemaining}</span> créditos disponíveis
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setQuantidade(1)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    quantidade === 1 ? "border-accent bg-accent/10" : "border-border/60 bg-card hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">1 Criativo</p>
                    {quantidade === 1 && <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />}
                  </div>
                  <p className="text-xs text-muted-foreground">1 crédito</p>
                </button>
                <button
                  type="button"
                  onClick={() => setQuantidade(5)}
                  className={`rounded-xl border p-4 text-left transition-all relative ${
                    quantidade === 5 ? "border-accent bg-accent/10" : "border-border/60 bg-card hover:border-accent/40"
                  }`}
                >
                  <Badge className="absolute top-2 right-2 text-[10px] bg-accent text-accent-foreground">5 variações</Badge>
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">5 Criativos</p>
                  </div>
                  <p className="text-xs text-muted-foreground">5 créditos</p>
                </button>
              </div>
              {creditsRemaining < creditCost && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  ⚠ Créditos insuficientes para esta opção. <button type="button" onClick={() => navigate("/plano")} className="underline">Comprar mais</button>
                </p>
              )}
            </section>

            {/* Imagem do usuário */}
            <section className="space-y-3">
              <Label className="text-base font-semibold">Sua imagem <span className="text-muted-foreground font-normal text-sm">(opcional)</span></Label>
              <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 cursor-pointer hover:border-accent/40 transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {userImagePreview ? (
                  <img src={userImagePreview} alt="preview" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Clique para enviar PNG, JPG ou WEBP</p>
                  </>
                )}
              </label>
            </section>

            {/* Templates */}
            <section className="space-y-3">
              <Label className="text-base font-semibold">Escolha o estilo visual</Label>

              {/* Categorias */}
              <div className="flex gap-2 flex-wrap">
                {CREATIVE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeCategory === cat.id
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-muted-foreground border-border/60 hover:border-accent/40"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid de templates */}
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`rounded-xl border p-3 text-left transition-all relative ${
                        isSelected
                          ? "border-accent bg-accent/10"
                          : "border-border/60 bg-card hover:border-accent/40"
                      }`}
                    >
                      {template.isNew && (
                        <Badge className="absolute top-2 right-2 text-[10px] bg-accent text-accent-foreground">Novo</Badge>
                      )}
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-accent absolute top-2 right-2" />
                      )}
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${template.previewGradient} mb-2`} />
                      <p className="text-xs font-semibold text-foreground">{template.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <Button
              className="w-full"
              size="lg"
              disabled={!canAdvanceStep1}
              onClick={() => setStep(2)}
            >
              Avançar para o texto
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ══════════════════════ STEP 2 ══════════════════════ */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                <Wand2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Conte sobre o que você vende</h2>
              <p className="text-sm text-muted-foreground">Deixe a IA escrever ou preencha você mesmo</p>
            </div>

            {/* Prompts do Reverse Prompt Lab */}
            {savedPrompts.length > 0 && (
              <section className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 text-left"
                  onClick={() => setShowLabPrompts((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <ScanSearch className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground">Prompts do Reverse Prompt Lab</span>
                    <Badge className="text-[10px] bg-accent text-accent-foreground">{savedPrompts.length}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{showLabPrompts ? "▲ fechar" : "▼ ver prompts"}</span>
                </button>

                {showLabPrompts && (
                  <div className="space-y-2 pt-1">
                    {savedPrompts.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono uppercase tracking-wide text-accent">{p.style}</span>
                            <span className="text-[10px] text-muted-foreground">{p.model_family}</span>
                            <span className="text-[10px] text-muted-foreground">· confiança {p.confidence}</span>
                          </div>
                          <button
                            type="button"
                            title="Remover prompt"
                            onClick={() => removeSavedPrompt(p.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono line-clamp-2">{p.final_prompt}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-7"
                          onClick={() => {
                            setConceito(p.final_prompt);
                            setShowLabPrompts(false);
                          }}
                        >
                          Usar este prompt como base
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Conceito livre → IA escreve */}
            <section className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                O que você está vendendo?
                <Badge className="text-[10px] bg-accent/10 text-accent border-accent/20">IA</Badge>
              </Label>
              <Textarea
                placeholder="Ex: 3 erros que fazem compradores perder R$ 200 mil em Alphaville"
                className="min-h-24 resize-none"
                value={conceito}
                onChange={(e) => setConceito(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handleRefinarTexto}
                disabled={isRefiningText || !conceito.trim()}
              >
                {isRefiningText ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refinando com IA...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Deixar a IA escrever</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                A IA cria textos prontos para o seu criativo
              </p>
            </section>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-xs text-muted-foreground">ou preencha manualmente</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* Campos manuais */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Título principal *
                </Label>
                <Input
                  placeholder="Ex: Transforme seu Negócio em 30 Dias"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                {!titulo && <p className="text-xs text-destructive">Campo obrigatório</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Subtítulo
                </Label>
                <Input
                  placeholder="Ex: Estratégias práticas para corretores de alto desempenho"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Call to Action (CTA)
                </Label>
                <Input
                  placeholder="Ex: Saiba mais | Agende uma visita | Fale conosco"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                />
              </div>
            </section>

            {/* Resumo da seleção */}
            {selectedTemplate && (
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedTemplate.previewGradient} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Template selecionado</p>
                  <p className="text-sm font-semibold text-foreground">{selectedTemplate.name}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{canal === "instagram" ? "Instagram" : "Facebook"}</p>
                  <p>{tipo === "post" ? "Post" : "Anúncio"}</p>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!canAdvanceStep2}
              onClick={handleGerar}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar criativo
            </Button>
          </div>
        )}

        {/* ══════════════════════ STEP 3 ══════════════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Gerando seu criativo...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    A IA está aplicando layout, tipografia e cores. Isso leva alguns segundos.
                  </p>
                </div>
                <div className="flex gap-2">
                  {["Layout", "Tipografia", "Cores", "Finalização"].map((s, i) => (
                    <div key={s} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ) : generatedUrls.length > 0 ? (
              <>
                <div className="text-center space-y-1">
                  <CheckCircle2 className="w-10 h-10 text-accent mx-auto" />
                  <h2 className="text-lg font-semibold text-foreground">Criativo gerado!</h2>
                  <p className="text-sm text-muted-foreground">Pronto para {canal === "instagram" ? "Instagram" : "Facebook"}</p>
                </div>

                <div className="grid gap-4">
                  {generatedUrls.map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-border/60">
                      <img src={url} alt={`Criativo ${i + 1}`} className="w-full object-cover" />
                      <div className="p-3 flex gap-2 bg-card border-t border-border/40">
                        <Button size="sm" className="flex-1" asChild>
                          <a href={url} download={`criativo-${i + 1}.png`}>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setGeneratedUrls([]); setStep(2); }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar nova versão
                  </Button>
                  <Button className="flex-1" onClick={() => navigate("/library")}>
                    Ver na Biblioteca
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 space-y-3">
                <p className="text-muted-foreground">Algo deu errado. Tente novamente.</p>
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default IdeaCreativePage;
