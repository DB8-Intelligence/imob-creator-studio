import { ArrowRight, CheckCircle2, MessageCircle, Smartphone, Wand2, Star, Image, Share2, Zap, Clock, ShieldCheck, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// ─── Links Kiwify Pro+ ─────────────────────────────────────────────────────────
// ATENÇÃO: Substitua pelos URLs reais após cadastrar os produtos no Kiwify.
// Os preços abaixo incluem o custo operacional do pipeline:
//   - Recepção de mídia via WhatsApp (Evolution API)
//   - Upscale em lote (por imagem processada)
//   - Análise de CTA via Claude API
// Revise os preços caso os custos de infraestrutura se alterem.
const KIWIFY_PRO_PLUS = {
  90:  "https://kiwify.com.br/seu-produto-pro-plus-90",   // R$ 197,00 — ~22 imóveis/mês
  150: "https://kiwify.com.br/seu-produto-pro-plus-150",  // R$ 259,00 — ~37 imóveis/mês
};
// ─────────────────────────────────────────────────────────────────────────────

const pipelineSteps = [
  {
    icon: MessageCircle,
    color: "bg-emerald-500",
    title: "Parceiro envia pelo WhatsApp",
    desc: "Corretor parceiro envia fotos do imóvel direto no WhatsApp. Sem apps, sem e-mail, sem complicação.",
  },
  {
    icon: Star,
    color: "bg-amber-500",
    title: "IA seleciona as 10 melhores",
    desc: "O sistema analisa automaticamente e filtra as fotos de maior qualidade e impacto visual.",
  },
  {
    icon: Image,
    color: "bg-blue-500",
    title: "Upscale em lote",
    desc: "Cada imagem selecionada passa por upscale com IA — resolução e nitidez profissional sem Photoshop.",
  },
  {
    icon: Wand2,
    color: "bg-purple-500",
    title: "Claude cria 2 opções de CTA",
    desc: "A IA analisa o descritivo do imóvel e gera duas sugestões de legenda otimizadas para conversão.",
  },
  {
    icon: Smartphone,
    color: "bg-indigo-500",
    title: "Você aprova pelo WhatsApp",
    desc: "Recebe as duas opções no seu celular. Responde "1" ou "2". Simples assim.",
  },
  {
    icon: Zap,
    color: "bg-accent",
    title: "Criativo gerado automaticamente",
    desc: "Com sua aprovação, o sistema monta o criativo no padrão da sua marca — feed, story ou reels.",
  },
  {
    icon: Share2,
    color: "bg-pink-500",
    title: "Publicado no Instagram e Facebook",
    desc: "Post agendado ou publicado imediatamente nos seus perfis conectados. Zero esforço.",
  },
];

const prosPlusPlans = [
  {
    credits: 90,
    badge: "⭐ Melhor custo-benefício",
    badgeColor: "bg-accent text-primary",
    price: "R$ 197",
    imoveis: "~22 imóveis",
    perImovel: "~R$ 8,95/imóvel",
    saving: "Pipeline completo incluso",
    featured: true,
    link: KIWIFY_PRO_PLUS[90],
  },
  {
    credits: 150,
    badge: "Volume máximo",
    badgeColor: "bg-muted text-foreground",
    price: "R$ 259",
    imoveis: "~37 imóveis",
    perImovel: "~R$ 7,00/imóvel",
    saving: "Economize R$ 72 vs. 2× 90cr",
    featured: false,
    link: KIWIFY_PRO_PLUS[150],
  },
];

const faqs = [
  {
    q: "Preciso ter a Evolution API configurada?",
    a: "Sim. O pipeline usa a Evolution API para receber e enviar mensagens pelo WhatsApp Business. Nossa equipe cuida da configuração durante o onboarding do Plano Pro+.",
  },
  {
    q: "Os créditos Pro+ são diferentes dos créditos normais?",
    a: "Sim. Os créditos Pro+ já cobrem o custo de recepção via WhatsApp, upscale em lote e análise de CTA — não apenas a geração do criativo. Por isso o valor por crédito é ligeiramente maior.",
  },
  {
    q: "Quantas fotos o parceiro pode enviar?",
    a: "O sistema aceita até 40 fotos por envio e seleciona automaticamente as 10 melhores. O parceiro não precisa fazer nenhuma triagem.",
  },
  {
    q: "O que acontece se eu não aprovar pelo WhatsApp?",
    a: "O sistema aguarda sua resposta por 24 horas. Após esse prazo, envia um lembrete. Você pode aprovar, solicitar uma nova sugestão ou cancelar sem consumir créditos.",
  },
  {
    q: "Instagram e Facebook ficam conectados permanentemente?",
    a: "Sim, desde que você mantenha as permissões concedidas nas configurações do app. As publicações seguem o horário que você configurar.",
  },
];

const ProPlusLandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Nav mínima ── */}
      <nav className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg text-foreground">
            imob<span className="text-accent">creator</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <a
              href={KIWIFY_PRO_PLUS[90]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-primary font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Assinar Pro+ <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6 border border-accent/20">
            <Zap className="w-3.5 h-3.5" />
            Plano Pro+ — Pipeline WhatsApp → Instagram
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Receba fotos pelo{" "}
            <span className="text-emerald-400">WhatsApp</span>{" "}
            e publique no{" "}
            <span className="text-gradient">Instagram</span>{" "}
            automaticamente
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
            O corretor parceiro envia as fotos. Você aprova com "1" ou "2" no celular.
            O sistema cuida do upscale, do criativo e da publicação. Tudo automático.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={KIWIFY_PRO_PLUS[90]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-primary font-bold text-base hover:scale-105 transition-transform shadow-glow"
            >
              Começar com 90 créditos — R$ 197
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#pipeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
              Ver como funciona
            </a>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
            {[
              { value: "< 2 min", label: "para aprovar um imóvel" },
              { value: "10 fotos", label: "selecionadas automaticamente" },
              { value: "2 opções", label: "de CTA geradas pela IA" },
              { value: "0 apps", label: "extras necessários" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center">
                <p className="text-2xl font-bold text-accent">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problema ── */}
      <section className="py-16 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
              O problema que todo corretor conhece
            </h2>
            <p className="text-muted-foreground">
              Receber um imóvel de parceiro é fácil. Transformar isso em conteúdo de qualidade... não.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: "😩",
                title: "40 fotos sem triagem",
                desc: "O parceiro manda de tudo: escuro, tremido, espelho. Você perde tempo filtrando.",
              },
              {
                icon: "⏰",
                title: "2 horas para postar 1 imóvel",
                desc: "Selecionar, editar, criar legenda, agendar. Um trabalho que poderia ser automático.",
              },
              {
                icon: "📉",
                title: "Postagens inconsistentes",
                desc: "Sem processo, o feed fica irregular. Parceiros deixam de mandar imóveis.",
              },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline visual ── */}
      <section id="pipeline" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Como funciona
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              7 passos. Você só executa o 5.
            </h2>
            <p className="text-muted-foreground">
              O pipeline cuida de tudo automaticamente. Sua única ação é aprovar o CTA — pelo próprio WhatsApp.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {pipelineSteps.map((step, i) => {
              const Icon = step.icon;
              const isUser = i === 4; // aprovação pelo corretor
              return (
                <div
                  key={step.title}
                  className={[
                    "relative flex items-start gap-4 rounded-2xl border p-5 transition-all",
                    isUser
                      ? "border-accent/50 bg-accent/5 shadow-sm"
                      : "border-border/50 bg-card/60",
                  ].join(" ")}
                >
                  {/* Número + linha conectora */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <div className={`w-9 h-9 rounded-full ${step.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {i < pipelineSteps.length - 1 && (
                      <div className="w-px h-6 bg-border/50 mt-1" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-muted-foreground/50">PASSO {i + 1}</span>
                      {isUser && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                          Sua ação
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mt-0.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Simulação WhatsApp ── */}
      <section className="py-16 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold mb-3">
              Veja na prática
            </h2>
            <p className="text-muted-foreground">
              É exatamente assim que você vai interagir com o sistema — pelo WhatsApp do seu celular.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">

            {/* Antes */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-400">Sem Pro+ — processo manual</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2 items-start">
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">08:00</span>
                  <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3 py-2 text-foreground/80">
                    📎 <span className="text-muted-foreground">40 imagens recebidas</span>
                  </div>
                </div>
                <div className="flex gap-2 items-start justify-end">
                  <div className="bg-accent/20 rounded-2xl rounded-tr-sm px-3 py-2 text-foreground/80">
                    Ok, vou ver depois...
                  </div>
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">08:01</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">10:30</span>
                  <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3 py-2 text-foreground/80">
                    Já postou?
                  </div>
                </div>
                <div className="flex gap-2 items-start justify-end">
                  <div className="bg-accent/20 rounded-2xl rounded-tr-sm px-3 py-2 text-foreground/80">
                    Ainda não, estou triando as fotos 😅
                  </div>
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">10:31</span>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-3">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Resultado: ~2 horas de trabalho manual
              </div>
            </div>

            {/* Depois */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-400">Com Pro+ — pipeline automático</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2 items-start">
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">08:00</span>
                  <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3 py-2 text-foreground/80">
                    📎 <span className="text-muted-foreground">40 imagens recebidas</span>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">08:02</span>
                  <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3 py-2 text-foreground/80 max-w-xs">
                    ✅ <strong>10 melhores fotos selecionadas</strong> e otimizadas com upscale. Escolha o CTA:<br /><br />
                    <span className="text-emerald-600 font-medium">1️⃣</span> "Apartamento de 3 dorms em Pinheiros — agende sua visita"<br />
                    <span className="text-emerald-600 font-medium">2️⃣</span> "3 dorms, 2 vagas, vista livre — últimas unidades disponíveis"
                  </div>
                </div>
                <div className="flex gap-2 items-start justify-end">
                  <div className="bg-accent/20 rounded-2xl rounded-tr-sm px-3 py-2 font-semibold text-accent">
                    1
                  </div>
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">08:03</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-muted-foreground/60 shrink-0 text-xs pt-1">08:04</span>
                  <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3 py-2 text-foreground/80">
                    🚀 Criativo gerado e publicado no Instagram!
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg p-3">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Resultado: 4 minutos, zero trabalho manual
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── O que está incluso ── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-2">O que está incluso no Pro+</h2>
            <p className="text-muted-foreground">Cada crédito Pro+ já cobre toda a infraestrutura do pipeline</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: MessageCircle, label: "Recepção via WhatsApp", detail: "Número dedicado com Evolution API" },
              { icon: Star, label: "Seleção automática de fotos", detail: "10 melhores de até 40 enviadas" },
              { icon: Image, label: "Upscale em lote", detail: "Resolução profissional para todas as fotos" },
              { icon: Wand2, label: "2 CTAs gerados pela IA", detail: "Claude analisa o descritivo do imóvel" },
              { icon: Zap, label: "Criativo no padrão da marca", detail: "Feed, story e reels automatizados" },
              { icon: Share2, label: "Publicação no Instagram/Facebook", detail: "Agendado ou imediato" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="planos" className="py-20 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Plano Pro+
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Escolha seu volume
            </h2>
            <p className="text-muted-foreground text-sm">
              Cada crédito Pro+ já inclui o custo de infraestrutura do pipeline completo.
            </p>
          </div>

          {/* Aviso de custo operacional */}
          <div className="max-w-xl mx-auto mb-8 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-600">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              O valor do Pro+ é ligeiramente maior que os créditos avulsos porque <strong>já inclui os custos de recepção WhatsApp, upscale em lote e análise de CTA por Claude</strong> — sem surpresas na conta.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {prosPlusPlans.map((plan) => (
              <div
                key={plan.credits}
                className={[
                  "relative rounded-3xl border p-7 flex flex-col transition-all duration-300",
                  plan.featured
                    ? "border-accent/60 bg-primary text-primary-foreground shadow-[0_0_40px_rgba(var(--accent)/0.2)] scale-[1.03]"
                    : "border-border/60 bg-card hover:-translate-y-1 hover:shadow-elevated",
                ].join(" ")}
              >
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold self-start mb-5 ${plan.badgeColor}`}>
                  {plan.badge}
                </span>

                <p className={`font-display text-2xl font-bold mb-1 ${plan.featured ? "text-primary-foreground" : "text-foreground"}`}>
                  {plan.credits} Créditos Pro+
                </p>
                <p className={`text-sm mb-5 ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  Inclui pipeline WhatsApp → Instagram
                </p>

                <div className={`font-display text-4xl font-bold mb-1 ${plan.featured ? "text-accent" : "text-foreground"}`}>
                  {plan.price}
                </div>
                <p className={`text-xs mb-2 ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  pagamento único · créditos não expiram
                </p>

                <div className={`flex flex-col gap-1.5 mb-5 text-sm ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{plan.imoveis} completos processados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{plan.perImovel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{plan.saving}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <a
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all",
                      plan.featured
                        ? "bg-accent-gradient text-primary shadow-glow hover:scale-105"
                        : "bg-foreground text-background hover:bg-foreground/90",
                    ].join(" ")}
                  >
                    Assinar agora
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-10 text-muted-foreground/60 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Pagamento seguro via Kiwify · Créditos creditados automaticamente após confirmação
          </div>

          {/* Comparativo com créditos avulsos */}
          <div className="max-w-2xl mx-auto mt-10 rounded-2xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4 text-center text-sm">
              Comparativo: créditos avulsos vs. Pro+
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/40">
                    <th className="text-left pb-2 font-medium">Recurso</th>
                    <th className="text-center pb-2 font-medium">Créditos avulsos</th>
                    <th className="text-center pb-2 font-medium text-accent">Pro+</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {[
                    ["Geração de criativos", "✅", "✅"],
                    ["Upscale individual", "✅", "✅"],
                    ["Recepção via WhatsApp", "—", "✅"],
                    ["Seleção automática de fotos", "—", "✅"],
                    ["Upscale em lote", "—", "✅"],
                    ["CTA gerado por IA (Claude)", "—", "✅"],
                    ["Aprovação pelo WhatsApp", "—", "✅"],
                    ["Publicação automática", "—", "✅"],
                  ].map(([feature, std, pro]) => (
                    <tr key={feature}>
                      <td className="py-2.5 text-foreground/80">{feature}</td>
                      <td className="text-center py-2.5 text-muted-foreground">{std}</td>
                      <td className="text-center py-2.5 text-accent font-medium">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Perguntas frequentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="font-medium text-foreground text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border/30 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Pronto para automatizar seu pipeline?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Comece com 90 créditos Pro+ e veja quantos imóveis você consegue publicar sem esforço.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={KIWIFY_PRO_PLUS[90]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-primary font-bold text-base hover:scale-105 transition-transform shadow-glow"
            >
              Assinar Pro+ 90 créditos — R$ 197
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/5511999999999?text=${encodeURIComponent("Olá! Quero saber mais sobre o Plano Pro+ do ImobCreator")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border/60 bg-card text-foreground font-semibold text-sm hover:bg-muted/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              Falar com especialista
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Pagamento único · Créditos não expiram · Suporte incluso no onboarding
          </p>
        </div>
      </section>

      {/* ── Footer mínimo ── */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2025 ImobCreator Studio. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos de uso</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Página inicial</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ProPlusLandingPage;
