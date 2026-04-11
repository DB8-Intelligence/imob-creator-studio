import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Share2,
  FileDown,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Globe,
  User,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  instagram: string;
  facebook: string;
  linkedin: string;
  tempoCorretor: string;
  especialidade: string;
  temSite: boolean;
  siteUrl: string;
  maiorDificuldade: string;
  cidade: string;
  nome: string;
  telefone: string;
  email: string;
  creci: string;
}

interface DiagnosticoResult {
  score_geral: number;
  nivel: string;
  resumo: string;
  pontos_atencao: { titulo: string; descricao: string; impacto: string }[];
  pontos_positivos: { titulo: string; descricao: string }[];
  oportunidades: { titulo: string; descricao: string; potencial: string }[];
  proximos_passos: { acao: string; prazo: string; dificuldade: string }[];
  insight_instagram: string;
  insight_site: string;
}

type PageState = "form" | "loading" | "result";

const INITIAL_FORM: FormData = {
  instagram: "",
  facebook: "",
  linkedin: "",
  tempoCorretor: "",
  especialidade: "",
  temSite: false,
  siteUrl: "",
  maiorDificuldade: "",
  cidade: "",
  nome: "",
  telefone: "",
  email: "",
  creci: "",
};

// ── Phone mask ───────────────────────────────────────────────────────────────
function phoneMask(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// ── Rotating messages ────────────────────────────────────────────────────────
function useRotatingMessage(handle: string, active: boolean) {
  const messages = [
    `Analisando seu Instagram @${handle}...`,
    "Verificando estrategia de conteudo...",
    "Identificando oportunidades...",
    "Calculando score digital...",
    "Preparando recomendacoes...",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 2000);
    return () => clearInterval(t);
  }, [active, messages.length]);
  return messages[idx];
}

// ── Fallback score generator ─────────────────────────────────────────────────
function generateFallbackResult(form: FormData): DiagnosticoResult {
  let score = 10;
  if (form.instagram) score += 20;
  if (form.temSite) score += 20;
  if (form.linkedin) score += 10;
  if (form.facebook) score += 10;
  if (form.tempoCorretor === "3 a 5 anos" || form.tempoCorretor === "Mais de 5 anos") score += 10;
  if (form.cidade) score += 5;

  const nivel = score >= 71 ? "Bom" : score >= 41 ? "Regular" : "Critico";

  return {
    score_geral: Math.min(score, 100),
    nivel,
    resumo: `Sua presenca digital atual possui pontos de melhoria importantes. Com base nos dados informados, identificamos que seu score e ${score}/100 (${nivel}).`,
    pontos_atencao: [
      ...(!form.temSite
        ? [{ titulo: "Sem site profissional", descricao: "Voce nao possui um site proprio, perdendo credibilidade e leads organicos do Google.", impacto: "Alto" }]
        : []),
      ...(!form.linkedin
        ? [{ titulo: "LinkedIn ausente", descricao: "O LinkedIn e essencial para networking e posicionamento profissional no mercado imobiliario.", impacto: "Medio" }]
        : []),
      ...(!form.facebook
        ? [{ titulo: "Facebook nao utilizado", descricao: "O Facebook ainda e relevante para publico 35+ que compra imoveis.", impacto: "Medio" }]
        : []),
    ],
    pontos_positivos: [
      ...(form.instagram ? [{ titulo: "Presenca no Instagram", descricao: "Voce ja esta no principal canal de marketing imobiliario do Brasil." }] : []),
      ...(form.temSite ? [{ titulo: "Site proprio", descricao: "Ter um site e fundamental para gerar leads organicos e transmitir credibilidade." }] : []),
      { titulo: "Busca por melhoria", descricao: "O fato de realizar este diagnostico mostra proatividade e visao estrategica." },
    ],
    oportunidades: [
      { titulo: "Conteudo com IA", descricao: "Automatize a criacao de posts e stories com inteligencia artificial para manter consistencia.", potencial: "Alto" },
      { titulo: "Funil de captacao", descricao: "Implemente um funil digital completo: Instagram > Site > WhatsApp > CRM.", potencial: "Alto" },
      { titulo: "SEO local", descricao: `Posicione-se no Google para buscas como "corretor em ${form.cidade || "sua cidade"}".`, potencial: "Medio" },
    ],
    proximos_passos: [
      { acao: "Criar site profissional com IA", prazo: "Hoje", dificuldade: "Facil" },
      { acao: "Configurar CRM para gerenciar leads", prazo: "Esta semana", dificuldade: "Facil" },
      { acao: "Criar calendario de conteudo mensal", prazo: "Esta semana", dificuldade: "Medio" },
      { acao: "Automatizar respostas no WhatsApp", prazo: "Proximo mes", dificuldade: "Facil" },
    ],
    insight_instagram: form.instagram
      ? `Seu perfil @${form.instagram.replace("@", "")} precisa de uma analise mais profunda de engajamento e frequencia de postagem.`
      : "Voce precisa criar um perfil profissional no Instagram para o mercado imobiliario.",
    insight_site: form.temSite
      ? "Seu site precisa ser analisado quanto a velocidade, SEO e conversao de leads."
      : "Sem um site, voce depende 100% das redes sociais e perde leads do Google.",
  };
}

// ── System prompt for Claude ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `Voce e um especialista em marketing digital imobiliario brasileiro. Analise a presenca digital do corretor e responda APENAS em JSON valido (sem markdown, sem code fences) com esta estrutura exata:
{
  "score_geral": number (0-100),
  "nivel": "Critico" | "Regular" | "Bom" | "Excelente",
  "resumo": "string com 2-3 frases",
  "pontos_atencao": [{"titulo":"string","descricao":"string","impacto":"Alto|Medio|Baixo"}],
  "pontos_positivos": [{"titulo":"string","descricao":"string"}],
  "oportunidades": [{"titulo":"string","descricao":"string","potencial":"Alto|Medio|Baixo"}],
  "proximos_passos": [{"acao":"string","prazo":"string","dificuldade":"Facil|Medio|Dificil"}],
  "insight_instagram": "string",
  "insight_site": "string"
}
Gere pelo menos 3 itens em pontos_atencao, pontos_positivos e oportunidades. Gere pelo menos 4 proximos_passos. Seja especifico para o mercado imobiliario brasileiro.`;

// ── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step }: { step: number }) {
  const labels = ["Redes sociais", "Site", "Contato"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {labels.map((l, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={l} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done ? "bg-green-500 text-white" : active ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-sm hidden sm:inline ${active ? "font-semibold text-[#1E3A8A]" : "text-gray-500"}`}>{l}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        );
      })}
    </div>
  );
}

// ── Score color ──────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 71) return { bg: "bg-green-500", text: "text-green-600", ring: "ring-green-500" };
  if (s >= 41) return { bg: "bg-yellow-500", text: "text-yellow-600", ring: "ring-yellow-500" };
  return { bg: "bg-red-500", text: "text-red-600", ring: "ring-red-500" };
}
function nivelBadge(n: string) {
  const map: Record<string, string> = {
    Critico: "bg-red-100 text-red-700",
    Regular: "bg-yellow-100 text-yellow-700",
    Bom: "bg-green-100 text-green-700",
    Excelente: "bg-emerald-100 text-emerald-700",
  };
  return map[n] || "bg-gray-100 text-gray-700";
}
function impactBadge(impact: string) {
  const map: Record<string, string> = {
    Alto: "bg-red-100 text-red-700",
    Medio: "bg-yellow-100 text-yellow-700",
    Baixo: "bg-blue-100 text-blue-700",
  };
  return map[impact] || "bg-gray-100 text-gray-700";
}
function diffBadge(d: string) {
  const map: Record<string, string> = {
    Facil: "bg-green-100 text-green-700",
    Medio: "bg-yellow-100 text-yellow-700",
    Dificil: "bg-red-100 text-red-700",
  };
  return map[d] || "bg-gray-100 text-gray-700";
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function DiagnosticoPage() {
  const [pageState, setPageState] = useState<PageState>("form");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [result, setResult] = useState<DiagnosticoResult | null>(null);
  const loadingRef = useRef(false);

  const handle = form.instagram.replace("@", "").trim();
  const rotatingMsg = useRotatingMessage(handle, pageState === "loading");

  const set = useCallback((field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  function canNext1() {
    return form.instagram.trim().length > 0 && form.tempoCorretor && form.especialidade;
  }
  function canNext2() {
    if (form.temSite && !form.siteUrl.trim()) return false;
    return !!form.maiorDificuldade && !!form.cidade.trim();
  }
  function canSubmit() {
    return form.nome.trim().length > 0 && form.telefone.replace(/\D/g, "").length >= 10;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setPageState("loading");

    const cleanInstagram = form.instagram.replace("@", "").trim();

    // 1. Insert lead into Supabase
    let leadId: string | null = null;
    try {
      const { data } = await supabase
        .from("diagnostico_leads" as any)
        .insert({
          instagram: cleanInstagram,
          facebook: form.facebook || null,
          linkedin: form.linkedin || null,
          tempo_corretor: form.tempoCorretor,
          especialidade: form.especialidade,
          tem_site: form.temSite,
          site_url: form.siteUrl || null,
          maior_dificuldade: form.maiorDificuldade,
          cidade: form.cidade,
          nome: form.nome,
          telefone: form.telefone,
          email: form.email || null,
          creci: form.creci || null,
        } as any)
        .select("id")
        .single();
      leadId = (data as any)?.id ?? null;
    } catch {
      // non-blocking — continue even if insert fails
    }

    // 2. Call Claude API
    let diagResult: DiagnosticoResult;
    try {
      const userPrompt = `Analise a presenca digital deste corretor de imoveis:
- Instagram: @${cleanInstagram}
- Facebook: ${form.facebook || "Nao informado"}
- LinkedIn: ${form.linkedin || "Nao informado"}
- Tempo de corretor: ${form.tempoCorretor}
- Especialidade: ${form.especialidade}
- Tem site: ${form.temSite ? `Sim (${form.siteUrl})` : "Nao"}
- Maior dificuldade: ${form.maiorDificuldade}
- Cidade: ${form.cidade}
- Nome: ${form.nome}

Gere o diagnostico completo em JSON.`;

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

      if (!apiKey) throw new Error("No API key");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const json = await res.json();
      const text = json.content?.[0]?.text ?? "";
      // Strip possible markdown fences
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      diagResult = JSON.parse(cleaned);
    } catch {
      diagResult = generateFallbackResult(form);
    }

    // 3. Update lead with result
    if (leadId) {
      try {
        await supabase
          .from("diagnostico_leads" as any)
          .update({ resultado: diagResult, score: diagResult.score_geral } as any)
          .eq("id", leadId);
      } catch {
        // non-blocking
      }
    }

    setResult(diagResult);
    setPageState("result");
    loadingRef.current = false;
  }

  // ── Share ──────────────────────────────────────────────────────────────────
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: "Meu Diagnostico Digital", url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {pageState === "form" && <FormState key="form" step={step} setStep={setStep} form={form} set={set} canNext1={canNext1} canNext2={canNext2} canSubmit={canSubmit} onSubmit={handleSubmit} />}
          {pageState === "loading" && <LoadingState key="loading" rotatingMsg={rotatingMsg} />}
          {pageState === "result" && result && <ResultState key="result" result={result} nome={form.nome} onShare={handleShare} />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STATE 1 — FORM
// ═════════════════════════════════════════════════════════════════════════════
function FormState({
  step, setStep, form, set, canNext1, canNext2, canSubmit, onSubmit,
}: {
  step: number;
  setStep: (s: number) => void;
  form: FormData;
  set: (field: keyof FormData, value: string | boolean) => void;
  canNext1: () => boolean;
  canNext2: () => boolean;
  canSubmit: () => boolean;
  onSubmit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero */}
      <section className="bg-[#1E3A8A] text-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <span className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            47+ diagnosticos realizados hoje
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
            Corretor de Imovel, descubra se voce esta perdendo negocios.
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-3">
            Nossa IA analisa sua presenca digital e entrega um relatorio completo em segundos.
          </p>
          <p className="text-sm text-blue-200">100% gratuito. Sem cartao de credito.</p>
        </div>
      </section>

      {/* Form card */}
      <section className="relative -mt-8 pb-20">
        <div className="container mx-auto px-6 flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-6 md:p-10 w-full max-w-lg">
            <Stepper step={step} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                    <Instagram className="w-5 h-5 text-[#1E3A8A]" /> Redes sociais
                  </h2>

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Instagram *</span>
                    <input
                      type="text"
                      placeholder="@seunome"
                      value={form.instagram}
                      onChange={(e) => set("instagram", e.target.value.replace("@", ""))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Facebook <span className="text-gray-400">(opcional)</span></span>
                    <input
                      type="url"
                      placeholder="https://facebook.com/seuperfil"
                      value={form.facebook}
                      onChange={(e) => set("facebook", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">LinkedIn <span className="text-gray-400">(opcional)</span></span>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/seuperfil"
                      value={form.linkedin}
                      onChange={(e) => set("linkedin", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Tempo de corretor *</span>
                    <select
                      value={form.tempoCorretor}
                      onChange={(e) => set("tempoCorretor", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      <option>Menos de 1 ano</option>
                      <option>1 a 3 anos</option>
                      <option>3 a 5 anos</option>
                      <option>Mais de 5 anos</option>
                    </select>
                  </label>

                  <label className="block mb-6">
                    <span className="text-sm font-medium text-gray-700">Especialidade *</span>
                    <select
                      value={form.especialidade}
                      onChange={(e) => set("especialidade", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      <option>Alto Padrao</option>
                      <option>Litoral</option>
                      <option>Lancamentos</option>
                      <option>Residencial</option>
                      <option>Comercial</option>
                      <option>Rural</option>
                    </select>
                  </label>

                  <button
                    disabled={!canNext1()}
                    onClick={() => setStep(2)}
                    className="w-full flex items-center justify-center gap-2 bg-[#1E3A8A] text-white font-semibold rounded-lg py-3 hover:bg-[#1E3A8A]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Proximo <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                    <Globe className="w-5 h-5 text-[#1E3A8A]" /> Site
                  </h2>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">Tem site?</span>
                    <button
                      type="button"
                      onClick={() => set("temSite", !form.temSite)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.temSite ? "bg-[#1E3A8A]" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.temSite ? "translate-x-6" : ""}`} />
                    </button>
                    <span className="text-sm text-gray-500">{form.temSite ? "Sim" : "Nao"}</span>
                  </div>

                  {form.temSite && (
                    <label className="block mb-4">
                      <span className="text-sm font-medium text-gray-700">URL do site *</span>
                      <input
                        type="url"
                        placeholder="https://seusite.com.br"
                        value={form.siteUrl}
                        onChange={(e) => set("siteUrl", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                      />
                    </label>
                  )}

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Maior dificuldade *</span>
                    <select
                      value={form.maiorDificuldade}
                      onChange={(e) => set("maiorDificuldade", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      <option>Gerar leads pelo Instagram</option>
                      <option>Criar conteudo</option>
                      <option>Converter seguidores</option>
                      <option>Aparecer no Google</option>
                      <option>Organizar leads</option>
                      <option>Falta de tempo</option>
                    </select>
                  </label>

                  <label className="block mb-6">
                    <span className="text-sm font-medium text-gray-700">Cidade *</span>
                    <input
                      type="text"
                      placeholder="Sua cidade"
                      value={form.cidade}
                      onChange={(e) => set("cidade", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold rounded-lg py-3 hover:bg-gray-50 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button
                      disabled={!canNext2()}
                      onClick={() => setStep(3)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A8A] text-white font-semibold rounded-lg py-3 hover:bg-[#1E3A8A]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Proximo <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-[#1E3A8A]" /> Contato
                  </h2>

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Nome completo *</span>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={form.nome}
                      onChange={(e) => set("nome", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Telefone / WhatsApp *</span>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={form.telefone}
                      onChange={(e) => set("telefone", phoneMask(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Email <span className="text-gray-400">(opcional)</span></span>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <label className="block mb-6">
                    <span className="text-sm font-medium text-gray-700">CRECI <span className="text-gray-400">(opcional)</span></span>
                    <input
                      type="text"
                      placeholder="CRECI-XX 000000"
                      value={form.creci}
                      onChange={(e) => set("creci", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                    />
                  </label>

                  <div className="flex gap-3 mb-3">
                    <button onClick={() => setStep(2)} className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold rounded-lg py-3 px-5 hover:bg-gray-50 transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={!canSubmit()}
                      onClick={onSubmit}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A8A] text-white font-bold rounded-lg py-3.5 text-base hover:bg-[#1E3A8A]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Quero meu Diagnostico Agora — 100% Gratuito
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STATE 2 — LOADING
// ═════════════════════════════════════════════════════════════════════════════
function LoadingState({ rotatingMsg }: { rotatingMsg: string }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#1E3A8A] min-h-[80vh] flex items-center justify-center"
    >
      <div className="text-center text-white max-w-md px-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-bold" style={{ fontFamily: "Rubik, sans-serif" }}>NexoImob</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FFD700] text-[#002B5B]">AI</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-[#FFD700] rounded-full animate-indeterminate" />
        </div>

        <p className="text-lg font-medium mb-2 min-h-[1.75rem]">{rotatingMsg}</p>
        <p className="text-blue-200 text-sm">Seu diagnostico fica pronto em segundos</p>

        <style>{`
          @keyframes indeterminate {
            0% { width: 0%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
          .animate-indeterminate {
            animation: indeterminate 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </motion.section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STATE 3 — RESULT
// ═════════════════════════════════════════════════════════════════════════════
function ResultState({ result, nome, onShare }: { result: DiagnosticoResult; nome: string; onShare: () => void }) {
  const sc = scoreColor(result.score_geral);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Header */}
      <section className="bg-[#1E3A8A] text-white py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-blue-200 mb-2">Diagnostico Digital</p>
          <h1 className="text-2xl md:text-4xl font-bold mb-8">{nome}</h1>

          {/* Score */}
          <div className="flex flex-col items-center gap-4">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ring-4 ${sc.ring} bg-white/10`}>
              <span className="text-5xl font-bold">{result.score_geral}</span>
            </div>
            <p className="text-blue-200 text-lg">de 100</p>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${nivelBadge(result.nivel)}`}>
              {result.nivel}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${sc.bg}`} style={{ width: `${result.score_geral}%` }} />
            </div>
          </div>

          <p className="mt-6 text-blue-100 leading-relaxed max-w-lg mx-auto">{result.resumo}</p>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-4xl py-12 space-y-12">
        {/* Pontos de atencao */}
        {result.pontos_atencao.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Pontos de atencao
            </h2>
            <div className="grid gap-4">
              {result.pontos_atencao.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-red-400">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{p.titulo}</h3>
                      <p className="text-sm text-gray-600">{p.descricao}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${impactBadge(p.impacto)}`}>
                      {p.impacto}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pontos positivos */}
        {result.pontos_positivos.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Pontos positivos
            </h2>
            <div className="grid gap-4">
              {result.pontos_positivos.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-green-400">
                  <h3 className="font-semibold text-gray-900 mb-1">{p.titulo}</h3>
                  <p className="text-sm text-gray-600">{p.descricao}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Oportunidades */}
        {result.oportunidades.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Lightbulb className="w-5 h-5 text-[#1E3A8A]" /> Suas oportunidades
            </h2>
            <div className="grid gap-4">
              {result.oportunidades.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-[#1E3A8A]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{p.titulo}</h3>
                      <p className="text-sm text-gray-600">{p.descricao}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${impactBadge(p.potencial)}`}>
                      {p.potencial}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Proximos passos */}
        {result.proximos_passos.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Proximos passos</h2>
            <div className="space-y-4">
              {result.proximos_passos.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{p.acao}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{p.prazo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${diffBadge(p.dificuldade)}`}>
                        {p.dificuldade}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Insights */}
        <section className="grid md:grid-cols-2 gap-4">
          {result.insight_instagram && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Instagram className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Insight Instagram</h3>
              </div>
              <p className="text-sm text-gray-700">{result.insight_instagram}</p>
            </div>
          )}
          {result.insight_site && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Insight Site</h3>
              </div>
              <p className="text-sm text-gray-700">{result.insight_site}</p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-[#1E3A8A] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Resolva tudo isso com NexoImob AI</h2>
          <div className="flex flex-col items-center gap-2 mb-8 text-blue-100">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FFD700]" /> Site profissional em 5 min</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FFD700]" /> Posts automaticos com IA</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FFD700]" /> CRM completo</span>
          </div>
          <p className="text-[#FFD700] text-2xl font-bold mb-2">R$147/mes</p>
          <p className="text-blue-200 text-sm mb-8">Cancele quando quiser</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/precos"
              className="inline-flex items-center gap-2 bg-[#FFD700] text-[#1E3A8A] font-bold px-8 py-3.5 rounded-lg hover:bg-[#FFD700]/90 transition-colors"
            >
              Comecar agora <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/5511999999999?text=Oi!%20Quero%20saber%20mais%20sobre%20o%20NexoImob%20AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Falar com especialista
            </a>
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 pb-4">
          <button
            onClick={onShare}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1E3A8A] transition-colors"
          >
            <Share2 className="w-4 h-4" /> Compartilhar diagnostico
          </button>
          <button
            onClick={() => toast.info("Em breve! O download em PDF estara disponivel.")}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1E3A8A] transition-colors"
          >
            <FileDown className="w-4 h-4" /> Baixar PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}
