import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User, MapPin, Palette, Sparkles, ChevronRight, ChevronLeft,
  Upload, Check, Loader2, X, Plus, Building2, Target,
  Instagram, Facebook, TrendingUp, RefreshCw, Image,
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────
const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const PROPERTY_TYPES = [
  "Apartamento", "Casa", "Casa de Condomínio", "Cobertura",
  "Terreno", "Sala Comercial", "Loja", "Galpão", "Sítio / Chácara", "Flat / Studio",
];

const CHANNELS = ["Instagram", "Facebook", "WhatsApp", "Portais (ZAP/Vivareal)", "YouTube", "TikTok"];

const GOALS = [
  "Aumentar seguidores orgânicos",
  "Gerar mais leads de compradores",
  "Captar mais imóveis para vender",
  "Consolidar autoridade local",
  "Diversificar canais de venda",
  "Crescer a imobiliária / equipe",
];

const FREQUENCIES = [
  "1× por semana", "3× por semana", "5× por semana",
  "1× por dia", "2× por dia",
];

const STEPS = [
  { id: 1, label: "Perfil",     icon: User },
  { id: 2, label: "Atuação",   icon: MapPin },
  { id: 3, label: "Visual",    icon: Palette },
  { id: 4, label: "Estratégia",icon: Sparkles },
];

// ─── Componente de tag editável ────────────────────────────────
function TagInput({
  label, hint, values, onChange, suggestions,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");

  const add = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 pr-1">
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} className="ml-1 hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(input); } }}
          placeholder="Digite e pressione Enter"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={() => add(input)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {suggestions && (
        <div className="flex flex-wrap gap-1 mt-1">
          {suggestions.filter((s) => !values.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange([...values, s])}
              className="text-xs px-2 py-0.5 rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Renderizador de markdown simples ─────────────────────────
function StrategyRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-sm text-foreground leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-5 text-accent">{line.replace("### ", "")}</h3>;
        if (line.startsWith("## "))  return <h2 key={i} className="text-lg font-bold mt-6 border-b border-border pb-1">{line.replace("## ", "")}</h2>;
        if (line.startsWith("# "))   return <h1 key={i} className="text-xl font-bold mt-6">{line.replace("# ", "")}</h1>;
        if (line.startsWith("- "))   return <li key={i} className="ml-4 list-disc">{line.replace("- ", "")}</li>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold">{line.replace(/\*\*/g, "")}</p>;
        if (line === "") return <div key={i} className="h-1" />;
        // Bold inline
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j}>{part.replace(/\*\*/g, "")}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────
const BriefingPage = () => {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [generating, setGenerating] = useState(false);

  // Logo
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Formulário
  const [form, setForm] = useState({
    // Step 1 — Perfil
    full_name:    "",
    company_name: "",
    creci:        "",
    phone:        "",
    instagram:    "",
    facebook_url: "",
    bio_instagram: "",
    company_description: "",
    language_style: "formal",
    target_audience: "medio",
    // Step 2 — Atuação
    state:         "",
    city:          "",
    neighborhoods: [] as string[],
    property_types_worked: [] as string[],
    marketing_channels: [] as string[],
    audience_profile: "",
    competitive_differentials: "",
    growth_goal: "",
    posting_frequency: "",
    // Step 4 — Estratégia (lida do banco)
    ai_strategy: "",
    ai_strategy_generated_at: "",
  });

  // ── Carregar perfil existente ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select(`
          full_name, company_name, creci, phone, instagram, facebook_url,
          bio_instagram, company_description, language_style, target_audience,
          state, city, neighborhoods, property_types_worked,
          marketing_channels, audience_profile, competitive_differentials,
          growth_goal, posting_frequency, ai_strategy, ai_strategy_generated_at
        `)
        .eq("user_id", user.id)
        .single();

      if (data) {
        setForm({
          full_name:    data.full_name    ?? "",
          company_name: (data as Record<string, unknown>).company_name as string ?? "",
          creci:        data.creci        ?? "",
          phone:        data.phone        ?? "",
          instagram:    data.instagram    ?? "",
          facebook_url: (data as Record<string, unknown>).facebook_url as string ?? "",
          bio_instagram: (data as Record<string, unknown>).bio_instagram as string ?? "",
          company_description: (data as Record<string, unknown>).company_description as string ?? "",
          language_style:  data.language_style  ?? "formal",
          target_audience: data.target_audience ?? "medio",
          state: data.state ?? "",
          city:  data.city  ?? "",
          neighborhoods: ((data as Record<string, unknown>).neighborhoods as string[]) ?? [],
          property_types_worked: ((data as Record<string, unknown>).property_types_worked as string[]) ?? [],
          marketing_channels: ((data as Record<string, unknown>).marketing_channels as string[]) ?? [],
          audience_profile: (data as Record<string, unknown>).audience_profile as string ?? "",
          competitive_differentials: (data as Record<string, unknown>).competitive_differentials as string ?? "",
          growth_goal: (data as Record<string, unknown>).growth_goal as string ?? "",
          posting_frequency: (data as Record<string, unknown>).posting_frequency as string ?? "",
          ai_strategy: (data as Record<string, unknown>).ai_strategy as string ?? "",
          ai_strategy_generated_at: (data as Record<string, unknown>).ai_strategy_generated_at as string ?? "",
        });
      }

      // Carregar logo do workspace
      if (workspaceId) {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("logo_url")
          .eq("id", workspaceId)
          .single();
        if (ws?.logo_url) setLogoPreview(ws.logo_url);
      }

      setLoading(false);
    })();
  }, [user, workspaceId]);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Upload de logo ─────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Logo muito grande", description: "Máximo 2MB.", variant: "destructive" });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !workspaceId) return null;
    setUploadingLogo(true);
    const ext  = logoFile.name.split(".").pop();
    const path = `${workspaceId}/logo.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, logoFile, { upsert: true });
    if (error) {
      toast({ title: "Erro ao enviar logo", description: error.message, variant: "destructive" });
      setUploadingLogo(false);
      return null;
    }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    setUploadingLogo(false);
    return data.publicUrl;
  };

  // ── Salvar perfil ──────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Upload logo se houver novo arquivo
      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
        if (logoUrl && workspaceId) {
          await supabase.from("workspaces").update({ logo_url: logoUrl }).eq("id", workspaceId);
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name:    form.full_name    || null,
          company_name: form.company_name || null,
          creci:        form.creci        || null,
          phone:        form.phone        || null,
          instagram:    form.instagram    || null,
          facebook_url: form.facebook_url || null,
          bio_instagram: form.bio_instagram || null,
          company_description: form.company_description || null,
          language_style:  form.language_style,
          target_audience: form.target_audience,
          state: form.state || null,
          city:  form.city  || null,
          neighborhoods: form.neighborhoods,
          property_types_worked: form.property_types_worked,
          marketing_channels: form.marketing_channels,
          audience_profile: form.audience_profile || null,
          competitive_differentials: form.competitive_differentials || null,
          growth_goal: form.growth_goal || null,
          posting_frequency: form.posting_frequency || null,
        } as Record<string, unknown>)
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Briefing salvo!" });
      setLogoFile(null);
    } catch (e: unknown) {
      toast({ title: "Erro ao salvar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Gerar estratégia ───────────────────────────────────────
  const handleGenerateStrategy = async () => {
    setGenerating(true);
    try {
      // Salvar briefing antes de gerar
      await handleSave();

      const { data, error } = await supabase.functions.invoke("generate-strategy", {
        body: { briefing: form },
      });

      if (error) throw new Error(error.message);
      set("ai_strategy", data.strategy);
      set("ai_strategy_generated_at", new Date().toISOString());
      toast({ title: "Estratégia gerada com sucesso!" });
    } catch (e: unknown) {
      toast({ title: "Erro ao gerar estratégia", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // ── Navegação entre steps ──────────────────────────────────
  const next = async () => {
    await handleSave();
    setStep((s) => Math.min(s + 1, 4));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Briefing do Corretor</h1>
          <p className="text-muted-foreground mt-1">
            Preencha seu perfil completo. A IA usará essas informações em todas as postagens e gerará uma estratégia personalizada para seu crescimento.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive    = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    isActive    ? "bg-accent text-accent-foreground" :
                    isCompleted ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  {isCompleted
                    ? <Check className="w-4 h-4" />
                    : <Icon className="w-4 h-4" />
                  }
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? "bg-accent" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Perfil ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" /> Dados do Corretor
                </CardTitle>
                <CardDescription>Informações básicas de identificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input className="mt-1" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="João Silva" />
                  </div>
                  <div>
                    <Label>CRECI</Label>
                    <Input className="mt-1" value={form.creci} onChange={(e) => set("creci", e.target.value)} placeholder="123456-F" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Empresa / Imobiliária</Label>
                    <Input className="mt-1" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Minha Imobiliária" />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input className="mt-1" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1"><Instagram className="w-3.5 h-3.5" /> Instagram</Label>
                    <Input className="mt-1" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@seuinstagram" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1"><Facebook className="w-3.5 h-3.5" /> Facebook</Label>
                    <Input className="mt-1" value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="facebook.com/seuperfil" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" /> Descrição & Bio
                </CardTitle>
                <CardDescription>Usadas pela IA em todas as postagens e para montar sua estratégia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Bio do Instagram / Facebook</Label>
                  <p className="text-xs text-muted-foreground mb-1">Copie a bio atual ou escreva como quer ser visto pelo público</p>
                  <Textarea
                    className="mt-1 resize-none"
                    rows={3}
                    value={form.bio_instagram}
                    onChange={(e) => set("bio_instagram", e.target.value)}
                    placeholder="Ex: Especialista em apartamentos de alto padrão em Moema e Itaim. CRECI 123456. Realizando sonhos há 10 anos. 📲 (11) 99999-9999"
                  />
                </div>
                <div>
                  <Label>Sobre a empresa</Label>
                  <Textarea
                    className="mt-1 resize-none"
                    rows={3}
                    value={form.company_description}
                    onChange={(e) => set("company_description", e.target.value)}
                    placeholder="Descreva sua empresa, sua história, seus valores e o que a diferencia no mercado..."
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Tom de Voz</Label>
                    <Select value={form.language_style} onValueChange={(v) => set("language_style", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal e Sóbrio</SelectItem>
                        <SelectItem value="persuasivo">Persuasivo e Dinâmico</SelectItem>
                        <SelectItem value="luxo">Luxo e Sofisticado</SelectItem>
                        <SelectItem value="popular">Acessível e Próximo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Padrão do Público</Label>
                    <Select value={form.target_audience} onValueChange={(v) => set("target_audience", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixo">Econômico / Baixo</SelectItem>
                        <SelectItem value="medio">Médio Padrão</SelectItem>
                        <SelectItem value="alto">Alto Padrão / Luxo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Step 2: Área de Atuação ────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" /> Localização de Atuação
                </CardTitle>
                <CardDescription>Onde você atua e quais tipos de imóvel você vende</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Estado</Label>
                    <Select value={form.state} onValueChange={(v) => set("state", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BR.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cidade Principal</Label>
                    <Input className="mt-1" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ex: São Paulo" />
                  </div>
                </div>

                <TagInput
                  label="Bairros e Regiões de Atuação"
                  hint="Adicione todos os bairros onde você trabalha. A IA usará isso para criar hashtags e copy local."
                  values={form.neighborhoods}
                  onChange={(v) => set("neighborhoods", v)}
                />

                <TagInput
                  label="Tipos de Imóvel que Você Vende"
                  hint="Selecione ou adicione os tipos de imóvel do seu portfólio"
                  values={form.property_types_worked}
                  onChange={(v) => set("property_types_worked", v)}
                  suggestions={PROPERTY_TYPES}
                />

                <TagInput
                  label="Canais de Marketing Prioritários"
                  hint="Onde você mais investe sua presença digital?"
                  values={form.marketing_channels}
                  onChange={(v) => set("marketing_channels", v)}
                  suggestions={CHANNELS}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" /> Estratégia & Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Descrição do Público-Alvo</Label>
                  <Textarea
                    className="mt-1 resize-none"
                    rows={2}
                    value={form.audience_profile}
                    onChange={(e) => set("audience_profile", e.target.value)}
                    placeholder="Ex: Famílias de classe média alta, 30-50 anos, que buscam segurança e boas escolas para os filhos..."
                  />
                </div>
                <div>
                  <Label>Seus Diferenciais Competitivos</Label>
                  <Textarea
                    className="mt-1 resize-none"
                    rows={2}
                    value={form.competitive_differentials}
                    onChange={(e) => set("competitive_differentials", e.target.value)}
                    placeholder="Ex: Atendimento personalizado, 15 anos de experiência em Moema, parceria com os principais bancos..."
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Objetivo Principal</Label>
                    <Select value={form.growth_goal} onValueChange={(v) => set("growth_goal", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Frequência Desejada de Posts</Label>
                    <Select value={form.posting_frequency} onValueChange={(v) => set("posting_frequency", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Step 3: Identidade Visual ──────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-accent" /> Logomarca
                </CardTitle>
                <CardDescription>
                  Sua logo será inserida automaticamente em todas as imagens geradas pelo sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/webp,image/svg+xml,image/jpeg"
                  className="hidden"
                  onChange={handleLogoChange}
                />

                {logoPreview ? (
                  <div className="relative group w-fit">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-28 max-w-xs object-contain rounded-lg border border-border bg-muted p-3"
                    />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => logoInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5 mr-1" /> Trocar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { setLogoPreview(null); setLogoFile(null); }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">Clique para fazer upload da logo</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG com transparência (recomendado), SVG, WEBP ou JPEG • Máx. 2MB</p>
                    </div>
                  </button>
                )}

                {logoPreview && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {["Fundo escuro", "Fundo claro", "Sobre imagem"].map((label, i) => (
                      <div key={i} className={`rounded-lg p-4 flex items-center justify-center h-20 ${
                        i === 0 ? "bg-slate-900" : i === 1 ? "bg-white border border-border" : "bg-cover bg-center"
                      }`} style={i === 2 ? { backgroundImage: "linear-gradient(135deg,#1E3A5F,#D4AF37)" } : {}}>
                        <img src={logoPreview} alt="Preview" className="max-h-12 max-w-full object-contain" />
                      </div>
                    ))}
                    <p className="col-span-3 text-xs text-muted-foreground text-center">Preview de como a logo aparecerá nos criativos</p>
                  </div>
                )}

                <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Como a logomarca é aplicada</p>
                  <ul className="space-y-1 mt-2">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Em todas as 10 imagens após upscale do pipeline WhatsApp</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Nas 1-2 imagens geradas por IA com prompt de melhoria</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Em criativos gerados manualmente pelo editor</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    A posição, tamanho e opacidade podem ser ajustados em{" "}
                    <button className="text-accent underline" onClick={() => navigate("/settings")}>Configurações → Workspace</button>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Step 4: Estratégia IA ──────────────────────────── */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" /> Estratégia de Crescimento
                </CardTitle>
                <CardDescription>
                  Com base no seu briefing, a IA cria um plano personalizado para crescer no Instagram e Facebook
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!form.ai_strategy ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                      <Sparkles className="w-9 h-9 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Pronto para sua estratégia</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                        Com base no perfil que você preencheu, a IA vai criar um plano completo com
                        calendário de conteúdo, tipos de post, CTAs e metas de crescimento para 90 dias.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                      onClick={handleGenerateStrategy}
                      disabled={generating}
                    >
                      {generating
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Analisando seu perfil...</>
                        : <><Sparkles className="w-4 h-4" />Gerar Minha Estratégia com IA</>
                      }
                    </Button>
                    <p className="text-xs text-muted-foreground">Leva cerca de 15-20 segundos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                          <Check className="w-3 h-3 mr-1" /> Estratégia Gerada
                        </Badge>
                        {form.ai_strategy_generated_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(form.ai_strategy_generated_at).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateStrategy}
                        disabled={generating}
                        className="gap-1.5"
                      >
                        {generating
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Atualizando...</>
                          : <><RefreshCw className="w-3.5 h-3.5" />Regenerar Estratégia</>
                        }
                      </Button>
                    </div>

                    <div className="border border-border rounded-xl p-5 bg-muted/20">
                      <StrategyRenderer text={form.ai_strategy} />
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Esta estratégia é salva no seu perfil e atualizada automaticamente sempre que você regenerar.
                      As informações do briefing são usadas em todas as gerações de criativos e legendas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={prev} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || uploadingLogo}
            >
              {saving || uploadingLogo
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                : <><Check className="w-4 h-4 mr-2" />Salvar</>
              }
            </Button>

            {step < 4 ? (
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={next} disabled={saving}>
                Próximo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/dashboard")}>
                Concluir <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BriefingPage;
