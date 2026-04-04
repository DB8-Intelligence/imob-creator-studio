/**
 * businessMetrics.ts — SaaS financial health engine.
 * Covers ETAPA 11C (CAC/LTV/MRR/Churn), 11D (scaling rules),
 * 11E (retargeting audiences), and 11F (high-performance creative specs).
 */
import { supabase } from "@/integrations/supabase/client";
import { PLAN_RULES } from "@/lib/plan-rules";

// ══════════════════════════════════════════════════════════════════════════════
// 11C — FINANCIAL METRICS
// ══════════════════════════════════════════════════════════════════════════════

export interface MrrSnapshot {
  snapshot_month:    string;   // ISO date (first of month)
  mrr_brl:           number;
  active_paid_users: number;
  new_paid_users:    number;
  churned_users:     number;
  arpu_brl:          number | null;
}

export interface FinancialConfig {
  config_month:                 string;
  ad_spend_meta_brl:            number;
  ad_spend_google_brl:          number;
  other_acquisition_costs_brl:  number;
}

export interface MonthlyMetrics {
  month:          string;   // "Jan/26"
  mrr:            number;
  newPaid:        number;
  churned:        number;
  arpu:           number;
  totalAdSpend:   number;
  cac:            number | null;   // totalAdSpend / newPaid
  churnRate:      number | null;   // churned / activePrior * 100
  mrrGrowthPct:   number | null;
}

export interface SaasHealthSummary {
  currentMrr:     number;
  arr:            number;
  arpu:           number;
  cac:            number;          // latest month CAC
  ltv:            number;          // ARPU / monthly churn rate
  ltvCacRatio:    number;
  paybackMonths:  number;          // CAC / ARPU
  churnRate:      number;          // % monthly
  monthlyGrowth:  number;          // % MoM last period
  totalAdSpend:   number;          // latest month
  activePaid:     number;
}

export async function fetchMrrHistory(): Promise<MrrSnapshot[]> {
  const { data, error } = await supabase
    .from("mrr_snapshots")
    .select("*")
    .order("snapshot_month", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MrrSnapshot[];
}

export async function fetchFinancialConfig(): Promise<FinancialConfig[]> {
  const { data, error } = await supabase
    .from("financial_config")
    .select("*")
    .order("config_month", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FinancialConfig[];
}

function monthLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

export function buildMonthlyMetrics(
  snapshots: MrrSnapshot[],
  configs: FinancialConfig[],
): MonthlyMetrics[] {
  const configByMonth = new Map(configs.map((c) => [c.config_month.substring(0, 7), c]));

  return snapshots.map((snap, i) => {
    const monthKey = snap.snapshot_month.substring(0, 7);
    const cfg      = configByMonth.get(monthKey);
    const prior    = snapshots[i - 1];

    const totalAdSpend = cfg
      ? cfg.ad_spend_meta_brl + cfg.ad_spend_google_brl + cfg.other_acquisition_costs_brl
      : 0;

    const cac  = snap.new_paid_users > 0 ? totalAdSpend / snap.new_paid_users : null;
    const churnRate = prior && prior.active_paid_users > 0
      ? (snap.churned_users / prior.active_paid_users) * 100
      : null;
    const mrrGrowthPct = prior && prior.mrr_brl > 0
      ? ((snap.mrr_brl - prior.mrr_brl) / prior.mrr_brl) * 100
      : null;

    return {
      month:        monthLabel(snap.snapshot_month),
      mrr:          snap.mrr_brl,
      newPaid:      snap.new_paid_users,
      churned:      snap.churned_users,
      arpu:         snap.arpu_brl ?? (snap.active_paid_users > 0 ? snap.mrr_brl / snap.active_paid_users : 0),
      totalAdSpend,
      cac,
      churnRate,
      mrrGrowthPct,
    };
  });
}

export function buildHealthSummary(
  snapshots: MrrSnapshot[],
  configs:   FinancialConfig[],
): SaasHealthSummary {
  const latest   = snapshots[snapshots.length - 1];
  const prior    = snapshots[snapshots.length - 2];
  const latestCfg = configs[configs.length - 1];

  if (!latest) {
    return { currentMrr: 0, arr: 0, arpu: 0, cac: 0, ltv: 0, ltvCacRatio: 0, paybackMonths: 0, churnRate: 0, monthlyGrowth: 0, totalAdSpend: 0, activePaid: 0 };
  }

  const arpu         = latest.arpu_brl ?? (latest.active_paid_users > 0 ? latest.mrr_brl / latest.active_paid_users : 0);
  const churnRate    = prior && prior.active_paid_users > 0
    ? (latest.churned_users / prior.active_paid_users) * 100
    : 0;
  const ltv          = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 24; // cap at 24 months if 0% churn
  const totalAdSpend = latestCfg
    ? latestCfg.ad_spend_meta_brl + latestCfg.ad_spend_google_brl + latestCfg.other_acquisition_costs_brl
    : 0;
  const cac          = latest.new_paid_users > 0 ? totalAdSpend / latest.new_paid_users : 0;
  const ltvCacRatio  = cac > 0 ? ltv / cac : 0;
  const paybackMonths = arpu > 0 ? cac / arpu : 0;
  const monthlyGrowth = prior && prior.mrr_brl > 0
    ? ((latest.mrr_brl - prior.mrr_brl) / prior.mrr_brl) * 100
    : 0;

  return {
    currentMrr:    latest.mrr_brl,
    arr:           latest.mrr_brl * 12,
    arpu,
    cac,
    ltv,
    ltvCacRatio,
    paybackMonths,
    churnRate,
    monthlyGrowth,
    totalAdSpend,
    activePaid:    latest.active_paid_users,
  };
}

// LTV benchmark by plan (ARPU × avg lifetime assumption)
export const LTV_BY_PLAN: Record<string, { monthly: number; avgLifetimeMonths: number; ltv: number }> = {
  starter:  { monthly: PLAN_RULES.starter.monthlyPrice,  avgLifetimeMonths: 8,  ltv: PLAN_RULES.starter.monthlyPrice  * 8  },
  standard: { monthly: PLAN_RULES.standard.monthlyPrice, avgLifetimeMonths: 10, ltv: PLAN_RULES.standard.monthlyPrice * 10 },
  plus:     { monthly: PLAN_RULES.plus.monthlyPrice,     avgLifetimeMonths: 14, ltv: PLAN_RULES.plus.monthlyPrice     * 14 },
  premium:  { monthly: PLAN_RULES.premium.monthlyPrice,  avgLifetimeMonths: 18, ltv: PLAN_RULES.premium.monthlyPrice  * 18 },
};

// ══════════════════════════════════════════════════════════════════════════════
// 11D — SCALING RULES
// ══════════════════════════════════════════════════════════════════════════════

export type ScalingSignal = "scale"  | "hold" | "pause";

export interface ScalingRule {
  id:          string;
  metric:      string;
  operator:    "<" | ">" | "<=" | ">=" | "between";
  threshold:   number;
  threshold2?: number;   // for "between"
  unit:        string;
  signal:      ScalingSignal;
  label:       string;
  description: string;
}

export const SCALING_RULES: ScalingRule[] = [
  // Green light — scale
  {
    id: "ltv_cac_scale",
    metric: "ltvCacRatio", operator: ">=", threshold: 3, unit: "x",
    signal: "scale",
    label: "LTV:CAC ≥ 3x",
    description: "Retorno garantido — cada R$1 investido retorna R$3+. Aumente budget 20-30%.",
  },
  {
    id: "payback_scale",
    metric: "paybackMonths", operator: "<=", threshold: 6, unit: "meses",
    signal: "scale",
    label: "Payback ≤ 6 meses",
    description: "Capital recuperado rapidamente. Seguro para escalar com capital próprio.",
  },
  {
    id: "churn_scale",
    metric: "churnRate", operator: "<=", threshold: 3, unit: "%/mês",
    signal: "scale",
    label: "Churn ≤ 3%/mês",
    description: "Retenção saudável. Escalar aquisição não vai esvaziar o balde.",
  },
  // Hold — observe
  {
    id: "ltv_cac_hold",
    metric: "ltvCacRatio", operator: "between", threshold: 1, threshold2: 3, unit: "x",
    signal: "hold",
    label: "LTV:CAC entre 1x e 3x",
    description: "Margem estreita. Otimize CAC antes de aumentar budget.",
  },
  {
    id: "churn_hold",
    metric: "churnRate", operator: "between", threshold: 3, threshold2: 7, unit: "%/mês",
    signal: "hold",
    label: "Churn entre 3% e 7%",
    description: "Retenção aceitável, mas perigosa para escala. Invista em onboarding primeiro.",
  },
  // Pause — cut
  {
    id: "ltv_cac_pause",
    metric: "ltvCacRatio", operator: "<", threshold: 1, unit: "x",
    signal: "pause",
    label: "LTV:CAC < 1x",
    description: "Você está perdendo dinheiro em cada aquisição. Pause campanhas e revise pricing/churn.",
  },
  {
    id: "churn_pause",
    metric: "churnRate", operator: ">", threshold: 7, unit: "%/mês",
    signal: "pause",
    label: "Churn > 7%/mês",
    description: "Churn crítico. O produto não está retendo usuários — resolver antes de escalar.",
  },
  {
    id: "cac_pause",
    metric: "cac", operator: ">", threshold: 250, unit: "R$",
    signal: "pause",
    label: "CAC > R$250",
    description: "Custo por cliente muito alto para os planos atuais. Revise targeting ou pricing.",
  },
];

export interface ScalingEvaluation {
  rule:      ScalingRule;
  triggered: boolean;
  value:     number | null;
}

export function evaluateScalingRules(health: SaasHealthSummary): ScalingEvaluation[] {
  return SCALING_RULES.map((rule) => {
    const value = health[rule.metric as keyof SaasHealthSummary] as number ?? null;
    let triggered = false;

    if (value !== null) {
      switch (rule.operator) {
        case ">":       triggered = value >  rule.threshold; break;
        case ">=":      triggered = value >= rule.threshold; break;
        case "<":       triggered = value <  rule.threshold; break;
        case "<=":      triggered = value <= rule.threshold; break;
        case "between": triggered = value >= rule.threshold && value <= (rule.threshold2 ?? Infinity); break;
      }
    }

    return { rule, triggered, value };
  });
}

export function getOverallScalingSignal(evals: ScalingEvaluation[]): ScalingSignal {
  const triggered = evals.filter((e) => e.triggered);
  if (triggered.some((e) => e.rule.signal === "pause")) return "pause";
  if (triggered.some((e) => e.rule.signal === "hold"))  return "hold";
  if (triggered.some((e) => e.rule.signal === "scale")) return "scale";
  return "hold";
}

// Campaign budget multipliers by signal
export const SCALE_MULTIPLIERS: Record<ScalingSignal, { label: string; multiplier: number; color: string }> = {
  scale: { label: "+20–30% budget",    multiplier: 1.25, color: "#34D399" },
  hold:  { label: "Manter budget",     multiplier: 1.0,  color: "var(--ds-gold)" },
  pause: { label: "Reduzir / pausar",  multiplier: 0.5,  color: "#F87171" },
};

// ══════════════════════════════════════════════════════════════════════════════
// 11E — RETARGETING AUDIENCES
// ══════════════════════════════════════════════════════════════════════════════

export interface RetargetingAudience {
  id:          string;
  segment:     string;         // matches retargeting_segments.retargeting_segment
  label:       string;
  description: string;
  size:        "high" | "medium" | "low";  // relative expected size
  urgency:     "high" | "medium" | "low";
  strategy:    string;
  adAngles:    RetargetingAd[];
}

export interface RetargetingAd {
  format:     "feed" | "story" | "reels" | "search";
  headline:   string;
  body:       string;
  cta:        string;
  angle:      "social_proof" | "urgency" | "benefit" | "objection";
}

export const RETARGETING_AUDIENCES: RetargetingAudience[] = [
  {
    id:          "rt_visitor",
    segment:     "visitor",
    label:       "Visitou LP, não cadastrou",
    description: "Usuários que acessaram uma landing page mas saíram sem criar conta. Maior volume.",
    size:        "high",
    urgency:     "medium",
    strategy:    "Baixar fricção + prova social. Mostrar que é grátis e rápido.",
    adAngles: [
      {
        format:   "reels",
        headline: "Você viu o DB8. Ainda não testou?",
        body:     "Em 3 minutos você cria o primeiro post profissional do seu imóvel. Sem cartão, sem compromisso. Só resultado.",
        cta:      "Testar grátis agora",
        angle:    "urgency",
      },
      {
        format:   "feed",
        headline: "18.000+ posts gerados. Seu próximo?",
        body:     "Mais de 18.000 corretores já criaram posts profissionais com DB8 Intelligence. Você estava no site mas não testou. O que falta?",
        cta:      "Criar minha conta grátis",
        angle:    "social_proof",
      },
      {
        format:   "story",
        headline: "Grátis. Sem cartão. 3 minutos.",
        body:     "Você visitou o DB8. Sabia que pode testar sem pagar nada? 10 criativos grátis para você ver o resultado antes de decidir.",
        cta:      "Começar grátis",
        angle:    "objection",
      },
    ],
  },
  {
    id:          "rt_signup_not_activated",
    segment:     "signed_up_not_activated",
    label:       "Cadastrou, não ativou",
    description: "Criou conta mas nunca gerou um criativo. Alta intenção, baixa ativação. Janela: 7 dias.",
    size:        "medium",
    urgency:     "high",
    strategy:    "Lembrar do valor, baixar a barreira do primeiro uso. Um post hoje muda o jogo.",
    adAngles: [
      {
        format:   "feed",
        headline: "Sua conta está esperando.",
        body:     "Você criou sua conta no DB8 Intelligence mas ainda não gerou seu primeiro post. Leva 3 minutos. Tente agora — os resultados vão te surpreender.",
        cta:      "Criar meu primeiro post",
        angle:    "urgency",
      },
      {
        format:   "reels",
        headline: "Você está a 1 imóvel de distância.",
        body:     "Envie 3 fotos do imóvel. A IA faz o resto: layout, copy, legenda, branding. Post profissional em 3 minutos. Sua conta está ativa — use agora.",
        cta:      "Ir para minha conta",
        angle:    "benefit",
      },
      {
        format:   "story",
        headline: "\"O primeiro post mudou meu jogo.\"",
        body:     "Isso é o que corretores dizem após gerar o primeiro criativo com DB8. Você tem a conta — falta o primeiro post. Cria agora?",
        cta:      "Criar agora",
        angle:    "social_proof",
      },
    ],
  },
  {
    id:          "rt_activated_not_paid",
    segment:     "activated_not_paid",
    label:       "Ativou, não pagou",
    description: "Gerou criativos no trial mas não converteu. Maior oportunidade de receita. Segmento quente.",
    size:        "low",
    urgency:     "high",
    strategy:    "Mostrar valor já gerado + o que perde ao ficar sem plano. Urgência de acesso contínuo.",
    adAngles: [
      {
        format:   "feed",
        headline: "Você já viu o resultado. Não perca o acesso.",
        body:     "Você já usou o DB8 e sabe que funciona. Os créditos do trial são limitados — com o plano pago você tem acesso completo e contínuo para todos os seus imóveis.",
        cta:      "Ver planos e preços",
        angle:    "urgency",
      },
      {
        format:   "reels",
        headline: "Quanto vale 1 venda a mais por mês?",
        body:     "Corretores que postam com consistência vendem mais rápido. O DB8 custa menos do que o comissionamento de 1 visita. Faça a conta.",
        cta:      "Assinar agora",
        angle:    "benefit",
      },
      {
        format:   "feed",
        headline: "\"Paguei em 1 semana de uso.\"",
        body:     "'O DB8 custou R$97 e me gerou 3 visitas novas em 1 semana. O custo se paga sozinho.' Teste de graça acabou? Assine e continue crescendo.",
        cta:      "Garantir meu plano",
        angle:    "social_proof",
      },
      {
        format:   "search",
        headline: "DB8 Intelligence — Continue Usando",
        body:     "Você já experimentou. Seus créditos estão acabando. Assine o plano e continue criando posts profissionais ilimitados.",
        cta:      "Assinar DB8 Intelligence",
        angle:    "urgency",
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// 11F — HIGH-PERFORMANCE CREATIVE SPECS
// ══════════════════════════════════════════════════════════════════════════════

export type CreativeFormat = "reels_demo" | "before_after" | "how_it_works" | "testimonial";

export interface CreativeSpec {
  id:          string;
  format:      CreativeFormat;
  label:       string;
  objective:   string;
  duration?:   string;
  structure:   string[];      // ordered scene/shot list
  copyFormula: string;
  headline:    string;
  body:        string;
  cta:         string;
  hooks:       string[];      // 3 alternative first lines
  productionNote: string;
  expectedCtr: string;        // benchmark
  platforms:   ("meta_reels" | "meta_feed" | "meta_story" | "google_pmax")[];
}

export const HIGH_PERF_CREATIVES: CreativeSpec[] = [
  {
    id:        "cr_reels_demo",
    format:    "reels_demo",
    label:     "Demo ao vivo — ferramenta em ação",
    objective: "Mostrar velocidade e simplicidade do produto. Highest CTR format.",
    duration:  "15–30s",
    structure: [
      "0–2s: Hook visual — tela do produto já rodando (sem intro de marca)",
      "2–8s: Upload de 3 fotos de imóvel real",
      "8–14s: Timer visível enquanto IA processa",
      "14–20s: Resultado final — post profissional completo",
      "20–25s: Comparativo rápido (foto original vs criativo gerado)",
      "25–30s: CTA na tela + legenda",
    ],
    copyFormula: "Problema implícito → Solução em ação → Resultado visual",
    headline:    "3 fotos → post profissional em 3 minutos",
    body:        "Sem Canva, sem designer, sem espera. DB8 Intelligence faz tudo pela IA enquanto você atende o próximo cliente.",
    cta:         "Testar grátis",
    hooks: [
      "Quanto tempo você perde editando posts de imóveis?",
      "Esse post foi feito em 3 minutos. Sem designer.",
      "A IA criou esse post antes de você terminar de ler isso.",
    ],
    productionNote: "Gravar tela real (Loom ou ScreenFlow). Não usar mockup — autenticidade vence. Música rápida, 120–140 BPM. Sem narração, só texto na tela.",
    expectedCtr: "3–6%",
    platforms:   ["meta_reels", "meta_story"],
  },
  {
    id:        "cr_before_after",
    format:    "before_after",
    label:     "Antes × Depois",
    objective: "Impacto visual imediato. Prova de transformação sem palavras.",
    duration:  "10–20s",
    structure: [
      "0–3s: Foto crua do imóvel (celular, sem edição, posição horizontal)",
      "3s: Transição split-screen ou corte hard",
      "3–10s: Post profissional gerado (com layout, copy, branding)",
      "10–15s: Resultado final com logo do corretor visível",
      "15–20s: CTA + prova social ('vendido em X dias')",
    ],
    copyFormula: "Dor visual → Solução visual → Credibilidade",
    headline:    "Esse imóvel foi vendido em 5 dias com esse post.",
    body:        "A diferença entre foto no celular e post profissional não é designer — é DB8 Intelligence. Cria o seu agora.",
    cta:         "Criar meu primeiro post",
    hooks: [
      "Essa foto tirada no celular virou esse post profissional.",
      "Antes: foto do celular. Depois: post que vende.",
      "A diferença entre aparecer e vender está aqui.",
    ],
    productionNote: "Usar foto real de imóvel do portfólio (pedir permissão ao usuário ou usar imóvel próprio). Resultado gerado pelo próprio DB8. Legenda 'Vendido em X dias' aumenta conversão significativamente.",
    expectedCtr: "2.5–4.5%",
    platforms:   ["meta_feed", "meta_reels", "meta_story"],
  },
  {
    id:        "cr_how_it_works",
    format:    "how_it_works",
    label:     "Como funciona — 3 passos",
    objective: "Reduzir fricção de signup. Explicar sem texto pesado.",
    duration:  "20–45s",
    structure: [
      "0–3s: Hook — 'Você passa quanto tempo criando posts de imóveis por semana?'",
      "3–12s: Passo 1 — Enviar fotos (mostrar interface de upload)",
      "12–22s: Passo 2 — IA processando (timer, barra de progresso)",
      "22–35s: Passo 3 — Resultado final (download, compartilhar)",
      "35–45s: CTA + 'Teste grátis — sem cartão'",
    ],
    copyFormula: "Problema quantificado → Processo simples → Resultado → Oferta irresistível",
    headline:    "3 passos. 3 minutos. Post profissional.",
    body:        "1. Envie as fotos  2. A IA cria o post  3. Publique no Instagram. Sem edição, sem agência, sem espera.",
    cta:         "Ver como funciona",
    hooks: [
      "Você está usando 3 ferramentas para fazer o que o DB8 faz em 1.",
      "Seus concorrentes já automatizaram o marketing. E você?",
      "Se demorar mais de 5 minutos para criar um post, você está perdendo tempo.",
    ],
    productionNote: "Screen recording com zoom nos elementos-chave de cada passo. Numeração visual clara (1 / 2 / 3). Sem narração — texto na tela + música. Funciona bem no feed sem som.",
    expectedCtr: "2–4%",
    platforms:   ["meta_feed", "meta_reels", "google_pmax"],
  },
  {
    id:        "cr_testimonial",
    format:    "testimonial",
    label:     "Depoimento — corretor real",
    objective: "Prova social máxima. Mais impacto em audiências frias.",
    duration:  "30–60s",
    structure: [
      "0–3s: Nome + cargo + empresa na tela (sem narração)",
      "3–10s: Problema antes: 'Eu passava X horas criando posts por semana'",
      "10–25s: Resultado: 'Depois do DB8, gerou X posts em Y minutos, resultado Z'",
      "25–35s: Prova visual: mostrar post/vídeo criado pelo DB8",
      "35–50s: Recomendação direta à câmera",
      "50–60s: CTA + dados de contato do depoente (opcional)",
    ],
    copyFormula: "Identificação (dor) → Virada (produto) → Resultado concreto → Convite",
    headline:    "\"Triplicou meu alcance no Instagram em 30 dias.\"",
    body:        "Ana Paula F., gerente de marketing da RE/MAX, usou o DB8 para criar vídeos cinemáticos dos imóveis. Resultado: 3x mais visualizações nos reels e mais visitas qualificadas.",
    cta:         "Quero esses resultados",
    hooks: [
      "Ela triplicou o alcance dos imóveis dela. Veja como.",
      "\"Fui cética no início. Agora não abro mão.\"",
      "40% mais agendamentos com uma mudança simples.",
    ],
    productionNote: "Vídeo vertical filmado pelo próprio corretor (celular, boa luz natural). Autenticidade > produção. Adicionar legenda automática. Resultados numéricos específicos aumentam conversão 40%.",
    expectedCtr: "1.8–3.5%",
    platforms:   ["meta_feed", "meta_reels"],
  },
];

// Creative performance scoring (for 11D campaign decisions)
export function scoreCreative(ctr: number, cpClick: number, convRate: number): {
  score: number;
  signal: ScalingSignal;
  label:  string;
} {
  // Simple scoring: CTR weight 40%, CPClick weight 30%, Conv 30%
  const ctrScore  = Math.min(ctr / 5,  1) * 40;
  const cpScore   = Math.min(3 / cpClick, 1) * 30;   // lower is better, normalize vs R$3
  const convScore = Math.min(convRate / 3, 1) * 30;   // normalize vs 3% conv rate

  const score = ctrScore + cpScore + convScore;

  const signal: ScalingSignal = score >= 60 ? "scale" : score >= 30 ? "hold" : "pause";
  const label =
    signal === "scale" ? "Duplicar budget" :
    signal === "hold"  ? "Testar variações" :
                         "Pausar e revisar";

  return { score: Math.round(score), signal, label };
}
