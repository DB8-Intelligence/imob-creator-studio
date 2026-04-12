import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clapperboard,
  FileText,
  ImageIcon,
  Instagram,
  Layers3,
  Library,
  Megaphone,
  RefreshCcw,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
type ObjectiveId = "instagram_post" | "paid_ad" | "carousel_sequence" | "property_video";
type AssetSourceId = "idea" | "property" | "brand_assets";
type FlowId = "assistant" | "direct_form" | "property_guided" | "video_guided";

interface WizardDraft {
  objective: ObjectiveId | null;
  assetSource: AssetSourceId | null;
  flow: FlowId | null;
  title: string;
  audience: string;
  cta: string;
  notes: string;
  campaignGoal: string;
  propertyType: string;
  location: string;
  slideCount: string;
  videoDuration: string;
}

interface DynamicBriefField {
  key: keyof Pick<WizardDraft, "campaignGoal" | "propertyType" | "location" | "slideCount" | "videoDuration">;
  label: string;
  placeholder?: string;
  type: "input" | "select";
  options?: string[];
}

const STORAGE_KEY = "create-creative-wizard-draft:v1";

const STEP_META = [
  { id: 1, label: "Objetivo" },
  { id: 2, label: "Assets" },
  { id: 3, label: "Fluxo" },
  { id: 4, label: "Briefing" },
  { id: 5, label: "Preview" },
  { id: 6, label: "Aprovacao" },
] as const;

const OBJECTIVES: Array<{
  id: ObjectiveId;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  badge: string;
}> = [
  {
    id: "instagram_post",
    title: "Post para Instagram",
    description: "Feed, story ou peça rápida para manter consistência diária.",
    path: "/create/ideia",
    icon: Instagram,
    badge: "Rapido",
  },
  {
    id: "paid_ad",
    title: "Criativo para anuncio",
    description: "Peça orientada a conversão com copy, CTA e layout de campanha.",
    path: "/create/studio",
    icon: Megaphone,
    badge: "Conversao",
  },
  {
    id: "carousel_sequence",
    title: "Sequencia ou carrossel",
    description: "Narrativa em multiplas paginas para explicar, comparar ou vender.",
    path: "/create/sequence",
    icon: Layers3,
    badge: "Storytelling",
  },
  {
    id: "property_video",
    title: "Video do imovel",
    description: "Transforme fotos em um video orientado a Reels, feed e YouTube.",
    path: "/video-creator",
    icon: Clapperboard,
    badge: "Video IA",
  },
];

const ASSET_SOURCES: Array<{
  id: AssetSourceId;
  title: string;
  description: string;
  helper: string;
  icon: React.ElementType;
}> = [
  {
    id: "idea",
    title: "Comecar por uma ideia",
    description: "Voce ja sabe o que quer comunicar e precisa transformar isso em peça pronta.",
    helper: "Melhor para post rapido, anuncio e testes de angulo.",
    icon: Wand2,
  },
  {
    id: "property",
    title: "Comecar por um imovel",
    description: "Voce quer usar fotos e dados do imovel como base do conteudo.",
    helper: "Melhor para carrossel, criativo imobiliario e video.",
    icon: ImageIcon,
  },
  {
    id: "brand_assets",
    title: "Comecar por assets de marca",
    description: "Voce ja tem logo, campanha ou identidade e quer montar a peça em cima disso.",
    helper: "Melhor para campanhas e pecas em escala do time.",
    icon: Library,
  },
];

const FLOWS: Array<{
  id: FlowId;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: "assistant",
    title: "Assistente IA guiado",
    description: "A IA conduz o passo a passo, pede contexto e reduz decisoes tecnicas.",
    icon: Bot,
  },
  {
    id: "direct_form",
    title: "Formulario direto",
    description: "Voce ja sabe o que preencher e quer ganhar velocidade no setup.",
    icon: FileText,
  },
  {
    id: "property_guided",
    title: "Fluxo guiado por imovel",
    description: "Ideal para fotos, dados do imovel e geracao orientada ao contexto imobiliario.",
    icon: ImageIcon,
  },
  {
    id: "video_guided",
    title: "Fluxo guiado de video",
    description: "Encaminha direto para a jornada de video com presets e limites do plano.",
    icon: Clapperboard,
  },
];

const EMPTY_DRAFT: WizardDraft = {
  objective: null,
  assetSource: null,
  flow: null,
  title: "",
  audience: "",
  cta: "",
  notes: "",
  campaignGoal: "",
  propertyType: "",
  location: "",
  slideCount: "",
  videoDuration: "",
};

const DYNAMIC_BRIEF_FIELDS: Record<ObjectiveId, DynamicBriefField[]> = {
  instagram_post: [
    {
      key: "propertyType",
      label: "Tipo de conteudo",
      type: "select",
      options: ["Imovel em destaque", "Prova social", "Captação", "Autoridade local"],
    },
  ],
  paid_ad: [
    {
      key: "campaignGoal",
      label: "Objetivo da campanha",
      type: "select",
      options: ["Gerar leads", "Captar WhatsApp", "Agendar visita", "Atrair investidores"],
    },
    {
      key: "location",
      label: "Regiao ou bairro",
      type: "input",
      placeholder: "Ex: Alphaville, Jardins, Praia do Forte",
    },
  ],
  carousel_sequence: [
    {
      key: "slideCount",
      label: "Numero de slides",
      type: "select",
      options: ["5 slides", "7 slides", "9 slides"],
    },
    {
      key: "propertyType",
      label: "Angulo da narrativa",
      type: "select",
      options: ["Tour do imovel", "Quebra de objecoes", "Comparativo", "Passo a passo"],
    },
  ],
  property_video: [
    {
      key: "videoDuration",
      label: "Duracao alvo",
      type: "select",
      options: ["30s", "45s", "60s", "90s"],
    },
    {
      key: "location",
      label: "Bairro ou regiao",
      type: "input",
      placeholder: "Ex: Riviera, Horto Florestal, Centro",
    },
  ],
};

function getRecommendedFlow(objective: ObjectiveId | null, assetSource: AssetSourceId | null): FlowId | null {
  if (objective === "property_video") return "video_guided";
  if (assetSource === "property") return "property_guided";
  if (objective === "paid_ad") return "assistant";
  if (assetSource === "brand_assets") return "direct_form";
  return "assistant";
}

function getResolvedPath(draft: WizardDraft): string {
  if (draft.objective === "property_video") return "/video-creator";
  if (draft.flow === "video_guided") return "/video-creator";
  if (draft.flow === "property_guided") return "/upload";
  if (draft.flow === "direct_form") return "/create/studio";
  if (draft.objective === "carousel_sequence") return "/create/sequence";

  const objective = OBJECTIVES.find((item) => item.id === draft.objective);
  return objective?.path ?? "/create/ideia";
}

const CreateCreativeHub = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<WizardDraft>(EMPTY_DRAFT);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { step?: WizardStep; draft?: WizardDraft };
      if (parsed.step && parsed.step >= 1 && parsed.step <= 6) setStep(parsed.step);
      if (parsed.draft) setDraft({ ...EMPTY_DRAFT, ...parsed.draft });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, draft }));
  }, [step, draft]);

  const recommendedFlow = getRecommendedFlow(draft.objective, draft.assetSource);
  const objectiveMeta = OBJECTIVES.find((item) => item.id === draft.objective) ?? null;
  const assetSourceMeta = ASSET_SOURCES.find((item) => item.id === draft.assetSource) ?? null;
  const flowMeta = FLOWS.find((item) => item.id === draft.flow) ?? null;
  const dynamicFields = draft.objective ? DYNAMIC_BRIEF_FIELDS[draft.objective] : [];
  const hasDynamicBriefValue = dynamicFields.some((field) => String(draft[field.key]).trim().length > 0);

  const canAdvance =
    (step === 1 && Boolean(draft.objective)) ||
    (step === 2 && Boolean(draft.assetSource)) ||
    (step === 3 && Boolean(draft.flow)) ||
    (step === 4 && (draft.title.trim().length > 0 || draft.notes.trim().length > 0 || hasDynamicBriefValue)) ||
    step >= 5;

  const handleNext = () => {
    if (!canAdvance || step === 6) return;
    setStep((current) => Math.min(6, current + 1) as WizardStep);
  };

  const handleBack = () => {
    if (step === 1) return;
    setStep((current) => Math.max(1, current - 1) as WizardStep);
  };

  const handleReset = () => {
    setStep(1);
    setDraft(EMPTY_DRAFT);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const handleObjectiveSelect = (objective: ObjectiveId) => {
    setDraft((current) => {
      const nextFlow = getRecommendedFlow(objective, current.assetSource);
      return {
        ...EMPTY_DRAFT,
        ...current,
        objective,
        assetSource: objective === "property_video" ? "property" : current.assetSource,
        flow: objective === "property_video" ? "video_guided" : current.flow ?? nextFlow,
        slideCount: objective === "carousel_sequence" ? current.slideCount || "7 slides" : "",
        videoDuration: objective === "property_video" ? current.videoDuration || "45s" : "",
      };
    });
  };

  const handleAssetSelect = (assetSource: AssetSourceId) => {
    setDraft((current) => ({
      ...current,
      assetSource,
      flow: current.objective === "property_video"
        ? "video_guided"
        : current.flow ?? getRecommendedFlow(current.objective, assetSource),
    }));
  };

  const handleContinueToFlow = () => {
    navigate(getResolvedPath(draft), {
      state: {
        fromUnifiedWizard: true,
        wizardDraft: draft,
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        <section className="space-y-4 pt-4">
          <Badge className="bg-accent/10 text-accent border border-accent/20">
            Wizard Unico de Criacao
          </Badge>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-display font-bold text-foreground leading-tight">
                Planeje seu criativo em um fluxo unico e siga direto para a execucao.
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Defina objetivo, ativos, fluxo e briefing. O sistema persiste seu progresso e encaminha para o criador ideal com o contexto ja organizado.
              </p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reiniciar wizard
            </Button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-6">
          {STEP_META.map((item) => {
            const active = item.id === step;
            const completed = item.id < step;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all ${
                  active
                    ? "border-accent bg-accent/5"
                    : completed
                      ? "border-accent/30 bg-accent/10"
                      : "border-border/60 bg-card"
                }`}
              >
                <p className="text-xs font-mono text-muted-foreground/60">0{item.id}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{item.label}</p>
              </div>
            );
          })}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">1. Qual resultado voce quer gerar?</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Esta escolha define o fluxo de producao mais eficiente para o seu caso.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {OBJECTIVES.map((objective) => {
                      const Icon = objective.icon;
                      const selected = draft.objective === objective.id;
                      return (
                        <button
                          key={objective.id}
                          type="button"
                          onClick={() => handleObjectiveSelect(objective.id)}
                          className={`rounded-2xl border p-5 text-left transition-all ${
                            selected ? "border-accent bg-accent/5" : "border-border/60 bg-card hover:border-accent/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                              <Icon className="w-5 h-5" />
                            </div>
                            <Badge className="bg-muted text-muted-foreground">{objective.badge}</Badge>
                          </div>
                          <p className="font-semibold text-foreground mt-4">{objective.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">2. De onde vem o material base?</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      O wizard usa isso para priorizar ideia, formulario, upload de imovel ou video.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {ASSET_SOURCES.map((source) => {
                      const Icon = source.icon;
                      const selected = draft.assetSource === source.id;
                      return (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => handleAssetSelect(source.id)}
                          className={`rounded-2xl border p-5 text-left transition-all ${
                            selected ? "border-accent bg-accent/5" : "border-border/60 bg-card hover:border-accent/40"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{source.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                              <p className="text-xs text-accent mt-2">{source.helper}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">3. Qual experiencia voce prefere?</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recomendamos um fluxo com base no objetivo e nos assets, mas voce pode ajustar manualmente.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {FLOWS.map((flow) => {
                      const Icon = flow.icon;
                      const selected = draft.flow === flow.id;
                      const recommended = recommendedFlow === flow.id;
                      const disabled = draft.objective === "property_video" && flow.id !== "video_guided";
                      return (
                        <button
                          key={flow.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => setDraft((current) => ({ ...current, flow: flow.id }))}
                          className={`rounded-2xl border p-5 text-left transition-all ${
                            selected ? "border-accent bg-accent/5" : "border-border/60 bg-card hover:border-accent/40"
                          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                              <Icon className="w-5 h-5" />
                            </div>
                            {recommended && <Badge className="bg-accent text-accent-foreground">Recomendado</Badge>}
                          </div>
                          <p className="font-semibold text-foreground mt-4">{flow.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{flow.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">4. Monte o briefing minimo</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Os campos mudam conforme o tipo de conteudo escolhido. Preencha so o necessario para destravar a execucao.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Titulo ou angulo principal</label>
                      <Input
                        value={draft.title}
                        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Ex: Apartamento de luxo com vista mar"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Publico principal</label>
                      <Input
                        value={draft.audience}
                        onChange={(event) => setDraft((current) => ({ ...current, audience: event.target.value }))}
                        placeholder="Ex: investidores, leads frios, compradores de alto padrao"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">CTA desejado</label>
                      <Input
                        value={draft.cta}
                        onChange={(event) => setDraft((current) => ({ ...current, cta: event.target.value }))}
                        placeholder="Ex: Agende uma visita, fale com um especialista, confira o video"
                      />
                    </div>
                    {dynamicFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{field.label}</label>
                        {field.type === "select" ? (
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={String(draft[field.key])}
                            onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                          >
                            <option value="">Selecione</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            value={String(draft[field.key])}
                            onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Contexto adicional</label>
                      <Textarea
                        rows={6}
                        value={draft.notes}
                        onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                        placeholder="Descreva campanha, diferencial do imovel, oferta, restricao visual ou qualquer contexto importante."
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">5. Preview do plano de criacao</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Antes de abrir o fluxo final, revise como o sistema organizou o seu pedido.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Objetivo</p>
                        <p className="font-semibold text-foreground mt-1">{objectiveMeta?.title ?? "Nao definido"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Assets de entrada</p>
                        <p className="font-semibold text-foreground mt-1">{assetSourceMeta?.title ?? "Nao definido"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fluxo selecionado</p>
                        <p className="font-semibold text-foreground mt-1">{flowMeta?.title ?? "Nao definido"}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Titulo</p>
                        <p className="font-semibold text-foreground mt-1">{draft.title || "Sem titulo definido"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Publico</p>
                        <p className="text-sm text-foreground mt-1">{draft.audience || "Sem publico definido"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">CTA</p>
                        <p className="text-sm text-foreground mt-1">{draft.cta || "Sem CTA definido"}</p>
                      </div>
                      {dynamicFields.map((field) => (
                        <div key={field.key}>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{field.label}</p>
                          <p className="text-sm text-foreground mt-1">{String(draft[field.key]) || "Nao definido"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Resumo do briefing</p>
                    <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">
                      {draft.notes || "Sem contexto adicional. O proximo fluxo vai comecar com briefing minimo."}
                    </p>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">6. Aprovar e seguir para producao</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu planejamento esta persistido. Agora voce pode abrir o fluxo recomendado ou ir direto para biblioteca e agenda.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-accent bg-accent/5 p-5">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground mt-3">Fluxo recomendado</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {flowMeta?.title ?? "Fluxo principal"} com o briefing ja preparado.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground mt-3">Estado persistido</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Se voce sair agora, o wizard pode ser retomado depois do mesmo ponto.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5">
                      <Send className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground mt-3">Aprovacao pronta</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Depois da geracao, siga para biblioteca, calendario ou publicacao.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" onClick={handleContinueToFlow}>
                      Abrir fluxo recomendado
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate("/library")}>
                      Ir para biblioteca
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate("/calendario/publicacoes")}>
                      Ver publicacao
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/60 pt-6">
                <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleNext} disabled={!canAdvance || step === 6}>
                  Proximo passo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recomendacao atual</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {flowMeta?.title ?? "Complete as etapas para receber uma recomendacao"}
                  </p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Objetivo: <span className="text-foreground font-medium">{objectiveMeta?.title ?? "Pendente"}</span></p>
                  <p>Assets: <span className="text-foreground font-medium">{assetSourceMeta?.title ?? "Pendente"}</span></p>
                  <p>Rota final: <span className="text-foreground font-medium">{getResolvedPath(draft)}</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Definicao de pronto</p>
                <div className="space-y-2 text-sm text-foreground">
                  <p className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Objetivo definido</p>
                  <p className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Contexto de entrada escolhido</p>
                  <p className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Navegacao persistida e retomavel</p>
                  <p className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Preview antes da execucao</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateCreativeHub;
