import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bot, Loader2, Save, ArrowLeft, AlertCircle, CheckCircle2, Calendar, Clock, ExternalLink, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const MODELS = [
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (qualidade, recomendado)" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (rápido e barato)" },
] as const;

const TONE_PRESETS = [
  "profissional, claro e acolhedor",
  "casual e amigável, como um amigo corretor",
  "consultivo de alto padrão, atendimento premium",
  "direto e objetivo, sem enrolação",
];

interface AiSettings {
  ai_enabled: boolean;
  ai_agent_name: string;
  ai_agent_tone: string;
  ai_custom_instructions: string;
  ai_model: string;
  status: string;
  followup_enabled: boolean;
  followup_delay_hours: number;
  followup_max_attempts: number;
  friendly_name: string;
  ai_work_hours_start: string; // HH:MM
  ai_work_hours_end:   string;
  ai_work_days:        number[];
  ai_delay_min_seconds: number;
  ai_delay_max_seconds: number;
  ai_after_hours_message: string;
}

interface CalendarStatus {
  connected: boolean;
  email: string | null;
  connectedAt: string | null;
}

const DEFAULTS: AiSettings = {
  ai_enabled: false,
  ai_agent_name: "Secretária Virtual",
  ai_agent_tone: TONE_PRESETS[0],
  ai_custom_instructions: "",
  ai_model: "claude-sonnet-4-6",
  status: "disconnected",
  followup_enabled: false,
  followup_delay_hours: 48,
  followup_max_attempts: 2,
  friendly_name: "",
  ai_work_hours_start: "08:00",
  ai_work_hours_end:   "19:00",
  ai_work_days:        [1, 2, 3, 4, 5, 6],
  ai_delay_min_seconds: 2,
  ai_delay_max_seconds: 8,
  ai_after_hours_message: "",
};

const WEEKDAYS = [
  { iso: 1, short: "Seg" },
  { iso: 2, short: "Ter" },
  { iso: 3, short: "Qua" },
  { iso: 4, short: "Qui" },
  { iso: 5, short: "Sex" },
  { iso: 6, short: "Sáb" },
  { iso: 7, short: "Dom" },
];

export default function WhatsAppAiConfigPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AiSettings>(DEFAULTS);
  const [dirty, setDirty] = useState(false);
  const [calendar, setCalendar] = useState<CalendarStatus>({ connected: false, email: null, connectedAt: null });
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  // Surface OAuth callback outcome
  useEffect(() => {
    const googleParam = searchParams.get("google");
    if (!googleParam) return;
    if (googleParam === "connected") {
      toast({ title: "Google Agenda conectado" });
    } else if (googleParam === "error") {
      const reason = searchParams.get("reason") ?? "erro desconhecido";
      toast({ title: "Falha ao conectar Google", description: reason, variant: "destructive" });
    }
    searchParams.delete("google");
    searchParams.delete("reason");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, toast]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [settingsRes, calRes] = await Promise.all([
        supabase
          .from("user_whatsapp_instances")
          .select("ai_enabled, ai_agent_name, ai_agent_tone, ai_custom_instructions, ai_model, status, followup_enabled, followup_delay_hours, followup_max_attempts, friendly_name, ai_work_hours_start, ai_work_hours_end, ai_work_days, ai_delay_min_seconds, ai_delay_max_seconds, ai_after_hours_message")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("calendar_integration_status")
          .select("email, connected_at")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (settingsRes.error) {
        toast({ title: "Erro ao carregar configurações", description: settingsRes.error.message, variant: "destructive" });
      } else if (settingsRes.data) {
        const d = settingsRes.data as Record<string, unknown>;
        setSettings({
          ai_enabled:             Boolean(d.ai_enabled),
          ai_agent_name:          (d.ai_agent_name as string) ?? DEFAULTS.ai_agent_name,
          ai_agent_tone:          (d.ai_agent_tone as string) ?? DEFAULTS.ai_agent_tone,
          ai_custom_instructions: (d.ai_custom_instructions as string) ?? "",
          ai_model:               (d.ai_model as string) ?? DEFAULTS.ai_model,
          status:                 (d.status as string) ?? "disconnected",
          followup_enabled:       Boolean(d.followup_enabled),
          followup_delay_hours:   (d.followup_delay_hours as number) ?? DEFAULTS.followup_delay_hours,
          followup_max_attempts:  (d.followup_max_attempts as number) ?? DEFAULTS.followup_max_attempts,
          friendly_name:          (d.friendly_name as string) ?? "",
          ai_work_hours_start:    ((d.ai_work_hours_start as string) ?? "08:00:00").slice(0, 5),
          ai_work_hours_end:      ((d.ai_work_hours_end   as string) ?? "19:00:00").slice(0, 5),
          ai_work_days:           (d.ai_work_days as number[]) ?? DEFAULTS.ai_work_days,
          ai_delay_min_seconds:   (d.ai_delay_min_seconds as number) ?? DEFAULTS.ai_delay_min_seconds,
          ai_delay_max_seconds:   (d.ai_delay_max_seconds as number) ?? DEFAULTS.ai_delay_max_seconds,
          ai_after_hours_message: (d.ai_after_hours_message as string) ?? "",
        });
      }

      if (calRes.data) {
        setCalendar({
          connected: true,
          email: (calRes.data as { email: string | null }).email ?? null,
          connectedAt: (calRes.data as { connected_at: string | null }).connected_at ?? null,
        });
      }
      setLoading(false);
    })();
  }, [user, toast]);

  const update = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_whatsapp_instances")
      .update({
        ai_enabled:             settings.ai_enabled,
        ai_agent_name:          settings.ai_agent_name.trim() || DEFAULTS.ai_agent_name,
        ai_agent_tone:          settings.ai_agent_tone.trim() || DEFAULTS.ai_agent_tone,
        ai_custom_instructions: settings.ai_custom_instructions.trim() || null,
        ai_model:               settings.ai_model,
        followup_enabled:       settings.followup_enabled,
        followup_delay_hours:   settings.followup_delay_hours,
        followup_max_attempts:  settings.followup_max_attempts,
        friendly_name:          settings.friendly_name.trim() || null,
        ai_work_hours_start:    settings.ai_work_hours_start,
        ai_work_hours_end:      settings.ai_work_hours_end,
        ai_work_days:           settings.ai_work_days,
        ai_delay_min_seconds:   settings.ai_delay_min_seconds,
        ai_delay_max_seconds:   settings.ai_delay_max_seconds,
        ai_after_hours_message: settings.ai_after_hours_message.trim() || null,
      })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setDirty(false);
    toast({ title: "Configurações salvas", description: settings.ai_enabled ? "A Secretária IA está ativa." : "Secretária IA pausada." });
  };

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    const { data, error } = await supabase.functions.invoke("google-oauth-start", { method: "GET" });
    setConnectingGoogle(false);
    if (error || !data?.authUrl) {
      toast({ title: "Erro ao iniciar conexão", description: error?.message ?? "Tente novamente", variant: "destructive" });
      return;
    }
    window.location.href = data.authUrl;
  };

  const handleDisconnectGoogle = async () => {
    if (!user) return;
    const { error } = await supabase.from("calendar_integrations").delete().eq("user_id", user.id);
    if (error) {
      toast({ title: "Erro ao desconectar", description: error.message, variant: "destructive" });
      return;
    }
    setCalendar({ connected: false, email: null, connectedAt: null });
    toast({ title: "Google Agenda desconectado" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#002B5B]" />
      </div>
    );
  }

  const disconnected = settings.status !== "connected";

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/dashboard/whatsapp" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#002B5B] mb-2">
              <ArrowLeft className="h-3 w-3" /> Voltar
            </Link>
            <h1 className="text-2xl font-bold text-[#002B5B] flex items-center gap-2">
              <Bot className="h-6 w-6 text-[#002B5B]" />
              Secretária Virtual IA
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure como a IA atende seus clientes no WhatsApp automaticamente.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2 shrink-0"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Connection warning */}
        {disconnected && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">WhatsApp não conectado</p>
              <p className="text-amber-800">
                A IA só responde quando o WhatsApp estiver conectado.{" "}
                <Link to="/dashboard/whatsapp" className="underline font-medium">Conectar agora</Link>
              </p>
            </div>
          </div>
        )}

        {/* Master toggle */}
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ai_enabled" className="text-base font-semibold text-[#002B5B] cursor-pointer">
                    IA respondendo automaticamente
                  </Label>
                  {settings.ai_enabled && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534]">
                      <CheckCircle2 className="h-3 w-3" /> Ativa
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Quando ativa, a IA responde novas mensagens de clientes em até 5s.
                  Você pode pausar em conversas específicas direto no chat.
                </p>
              </div>
              <Switch
                id="ai_enabled"
                checked={settings.ai_enabled}
                onCheckedChange={(v) => update("ai_enabled", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Friendly name do número */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base text-[#002B5B]">Identificação do número</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="friendly_name" className="text-sm font-medium text-[#374151]">
                Nome amigável
              </Label>
              <Input
                id="friendly_name"
                value={settings.friendly_name}
                onChange={(e) => update("friendly_name", e.target.value)}
                placeholder="ex: Principal, Locação, Corretor João"
                maxLength={60}
                className="mt-1.5"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Como este WhatsApp aparece pra você. Útil quando tiver mais de um número conectado.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agent personality */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base text-[#002B5B]">Personalidade do agente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="ai_agent_name" className="text-sm font-medium text-[#374151]">
                Nome do agente
              </Label>
              <Input
                id="ai_agent_name"
                value={settings.ai_agent_name}
                onChange={(e) => update("ai_agent_name", e.target.value)}
                placeholder="ex: Ana, Secretária do João"
                className="mt-1.5"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                O cliente pode perguntar o nome da IA — use algo natural.
              </p>
            </div>

            <div>
              <Label htmlFor="ai_agent_tone" className="text-sm font-medium text-[#374151]">
                Tom de voz
              </Label>
              <Input
                id="ai_agent_tone"
                value={settings.ai_agent_tone}
                onChange={(e) => update("ai_agent_tone", e.target.value)}
                placeholder="profissional e acolhedor"
                className="mt-1.5"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TONE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => update("ai_agent_tone", preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      settings.ai_agent_tone === preset
                        ? "bg-[#002B5B] border-[#002B5B] text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-[#002B5B]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="ai_custom_instructions" className="text-sm font-medium text-[#374151]">
                Instruções específicas (opcional)
              </Label>
              <Textarea
                id="ai_custom_instructions"
                value={settings.ai_custom_instructions}
                onChange={(e) => update("ai_custom_instructions", e.target.value)}
                placeholder={"ex: Sempre ofereça a visita guiada ao pôr do sol no Horizon Tower.\nMeu nome é João e atendo principalmente Pituba, Itaigara e Caminho das Árvores."}
                rows={5}
                className="mt-1.5 text-sm resize-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Dicas que você daria para uma secretária real no primeiro dia. A IA segue essas regras em todas as conversas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Voz clonada (Plus) — atalho */}
        <Card className="border border-gray-200">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  <Mic className="h-4 w-4 text-[#92400E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#002B5B] flex items-center gap-2">
                    Voz clonada
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">Plus</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Clone sua voz e deixe a IA responder em áudio com o seu timbre real.
                  </p>
                </div>
              </div>
              <Link to="/dashboard/whatsapp/voz">
                <Button variant="outline" size="sm">Configurar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Google Agenda */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base text-[#002B5B] flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Google Agenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calendar.connected ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-[#166534]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002B5B]">Conectado</p>
                    <p className="text-xs text-gray-500">{calendar.email ?? "conta Google"}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectGoogle}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Quando o cliente confirma data e hora da visita, a IA cria o evento direto na sua agenda.
                </p>
                <Button
                  onClick={handleConnectGoogle}
                  disabled={connectingGoogle}
                  className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2"
                >
                  {connectingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Conectar Google Agenda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Follow-up automático */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base text-[#002B5B] flex items-center gap-2">
              <Clock className="h-4 w-4" /> Follow-up automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="followup_enabled" className="text-sm font-semibold text-[#002B5B] cursor-pointer">
                  Reengajar leads que sumiram
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  A IA manda uma mensagem nova se o cliente não responder dentro do intervalo configurado.
                </p>
              </div>
              <Switch
                id="followup_enabled"
                checked={settings.followup_enabled}
                onCheckedChange={(v) => update("followup_enabled", v)}
              />
            </div>

            {settings.followup_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <Label className="text-xs font-medium text-[#374151]">Aguardar antes do 1º follow-up</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[24, 48, 72, 120].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => update("followup_delay_hours", h)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          settings.followup_delay_hours === h
                            ? "bg-[#002B5B] border-[#002B5B] text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-[#002B5B]"
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-[#374151]">Máx. tentativas por lead</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => update("followup_max_attempts", n)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          settings.followup_max_attempts === n
                            ? "bg-[#002B5B] border-[#002B5B] text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-[#002B5B]"
                        }`}
                      >
                        {n} {n === 1 ? "vez" : "vezes"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Horário de atendimento + delay humanizado */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base text-[#002B5B] flex items-center gap-2">
              <Clock className="h-4 w-4" /> Horário de atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-gray-500">
              IA responde apenas dentro do horário configurado. Fora dele, você pode enviar uma mensagem automática ou deixar silêncio.
            </p>

            {/* Horário start/end */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="work_start" className="text-sm font-medium text-[#374151]">Início</Label>
                <Input
                  id="work_start"
                  type="time"
                  value={settings.ai_work_hours_start}
                  onChange={(e) => update("ai_work_hours_start", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="work_end" className="text-sm font-medium text-[#374151]">Fim</Label>
                <Input
                  id="work_end"
                  type="time"
                  value={settings.ai_work_hours_end}
                  onChange={(e) => update("ai_work_hours_end", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Dias da semana */}
            <div>
              <Label className="text-sm font-medium text-[#374151]">Dias de atendimento</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d) => {
                  const active = settings.ai_work_days.includes(d.iso);
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? settings.ai_work_days.filter((x) => x !== d.iso)
                          : [...settings.ai_work_days, d.iso].sort((a, b) => a - b);
                        update("ai_work_days", next);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-[#002B5B] border-[#002B5B] text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-[#002B5B]"
                      }`}
                    >
                      {d.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delay humanizado */}
            <div>
              <Label className="text-sm font-medium text-[#374151]">Delay humanizado (simula digitação)</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-gray-500 mb-1">Mínimo (segundos)</p>
                  <Input
                    type="number" min={0} max={60}
                    value={settings.ai_delay_min_seconds}
                    onChange={(e) => update("ai_delay_min_seconds", Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 mb-1">Máximo (segundos)</p>
                  <Input
                    type="number" min={0} max={60}
                    value={settings.ai_delay_max_seconds}
                    onChange={(e) => update("ai_delay_max_seconds", Math.max(settings.ai_delay_min_seconds, Number(e.target.value) || 0))}
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                IA aguarda um tempo aleatório entre mínimo e máximo antes de enviar. 2–8s é natural.
              </p>
            </div>

            {/* After-hours message */}
            <div>
              <Label htmlFor="after_hours" className="text-sm font-medium text-[#374151]">
                Mensagem fora do horário (opcional)
              </Label>
              <Textarea
                id="after_hours"
                value={settings.ai_after_hours_message}
                onChange={(e) => update("ai_after_hours_message", e.target.value)}
                placeholder="ex: Olá! Estou fora do horário de atendimento. Responderei sua mensagem assim que possível, geralmente até 9h do próximo dia útil."
                rows={3}
                className="mt-1.5"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Deixe em branco para não responder fora do horário. A mensagem só é enviada uma vez por conversa.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Model */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base text-[#002B5B]">Modelo de IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update("ai_model", m.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    settings.ai_model === m.value
                      ? "border-[#002B5B] bg-[#F0F4FA]"
                      : "border-gray-200 hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                      settings.ai_model === m.value ? "border-[#002B5B] bg-[#002B5B]" : "border-gray-300"
                    }`}>
                      {settings.ai_model === m.value && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]" />}
                    </div>
                    <span className="text-sm text-[#374151]">{m.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save sticky footer when dirty */}
        {dirty && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <span className="text-xs text-amber-600">Há alterações não salvas.</span>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar alterações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
