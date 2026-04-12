import AppLayout from "@/components/app/AppLayout";
import { Link } from "react-router-dom";
import {
  Upload, Sliders, Download, Zap, Clock, Film,
  Star, ArrowRight, Check, X, Sparkles,
} from "lucide-react";

const steps = [
  { number: "01", icon: Upload, title: "Envie suas fotos", desc: "De 6 a 20 fotos do imóvel. Quanto mais fotos, mais completo o vídeo." },
  { number: "02", icon: Sliders, title: "Escolha o estilo", desc: "Formato (Reels, Feed, YouTube), estilo visual e duração." },
  { number: "03", icon: Download, title: "Baixe o vídeo", desc: "Em minutos, renderizado em até 4K Ultra HD, pronto para publicar." },
];

const benefits = [
  { icon: Clock, title: "Menos de 3 minutos", desc: "Do upload ao vídeo pronto. Sem editor, sem equipe de filmagem." },
  { icon: Film, title: "Qualidade 4K Ultra HD", desc: "Renderização cinematográfica com transições e trilha profissional." },
  { icon: Zap, title: "Multi-formato automático", desc: "Um clique gera versões para Reels, YouTube e Feed." },
  { icon: Star, title: "Zero edição manual", desc: "A IA monta o vídeo com as fotos e dados do imóvel." },
];

const comparison = [
  { feature: "Tempo de produção", tradicional: "2–5 dias", ia: "< 3 minutos" },
  { feature: "Custo por vídeo", tradicional: "R$ 500–2.000", ia: "Incluso no plano" },
  { feature: "Resolução", tradicional: "Variável", ia: "Até 4K Ultra HD" },
  { feature: "Equipe necessária", tradicional: "Fotógrafo + Editor", ia: "Nenhuma" },
  { feature: "Formatos gerados", tradicional: "1 formato", ia: "Reels, Feed e YouTube" },
];

const plans = [
  { name: "Standard", videos: "300 créditos/mês", res: "720p", badge: null, featured: false, limit: "Até 10 fotos · até 50s" },
  { name: "Plus", videos: "600 créditos/mês", res: "1080p Full HD", badge: "Mais escolhido", featured: true, limit: "Até 15 fotos · até 75s" },
  { name: "Premium", videos: "800 créditos/mês", res: "4K Ultra HD", badge: null, featured: false, limit: "Até 20 fotos · até 90s" },
];

const VideoLandingPage = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-16 pb-16">

        {/* Hero */}
        <div className="text-center pt-4 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Novo · Vídeos IA
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Transforme fotos de imóveis em<br />
            <span className="text-gradient">vídeos cinematográficos com IA</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sem equipe de filmagem, sem editor. Em menos de 3 minutos você tem um vídeo 4K pronto para Reels, YouTube e Feed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/video-creator"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:scale-105 transition-all shadow-glow"
            >
              Criar meu primeiro vídeo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/video-plans"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted/50 transition-all"
            >
              Ver planos de vídeo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "< 3 min", label: "do upload ao vídeo" },
            { value: "4K Ultra HD", label: "qualidade máxima" },
            { value: "100% IA", label: "sem edição manual" },
            { value: "3 formatos", label: "Reels, Feed e YouTube" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Como funciona */}
        <div>
          <h2 className="text-xl font-bold text-foreground text-center mb-8">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent text-accent-foreground font-bold text-lg mx-auto">
                  {step.number}
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefícios */}
        <div>
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Por que usar o módulo de vídeos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{b.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparativo */}
        <div>
          <h2 className="text-xl font-bold text-foreground text-center mb-6">IA vs. Produção tradicional</h2>
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left p-4 font-medium text-muted-foreground">Critério</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">Tradicional</th>
                  <th className="p-4 text-center font-semibold text-accent">Vídeos IA</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                    <td className="p-4 font-medium text-foreground">{row.feature}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.tradicional}</td>
                    <td className="p-4 text-center font-semibold text-accent">{row.ia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Planos de vídeo */}
        <div>
          <h2 className="text-xl font-bold text-foreground text-center mb-2">Planos de vídeo</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Add-on ao seu plano de criativos</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.name}
                className={[
                  "rounded-2xl border p-5 flex flex-col transition-all",
                  p.featured
                    ? "border-accent/50 bg-accent/5 shadow-glow scale-[1.02]"
                    : "border-border/60 bg-card hover:-translate-y-1 hover:shadow-md",
                ].join(" ")}
              >
                {p.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold mb-3 self-start">
                    {p.badge}
                  </span>
                )}
                <p className="font-bold text-foreground text-lg mb-1">{p.name}</p>
                <p className="text-sm text-muted-foreground mb-1">{p.videos}</p>
                <p className="text-xs text-muted-foreground mb-1">{p.limit}</p>
                <p className="text-xs text-accent font-semibold mb-4">{p.res}</p>
                <div className="mt-auto">
                  <Link
                    to="/video-plans"
                    className={[
                      "flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all",
                      p.featured
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "border border-border hover:bg-muted/50 text-foreground",
                    ].join(" ")}
                  >
                    Ver detalhes
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Pronto para começar?</h2>
          <p className="text-primary-foreground/70">Crie seu primeiro vídeo imobiliário agora. Sem equipe, sem edição.</p>
          <Link
            to="/video-creator"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-primary font-semibold hover:scale-105 transition-all shadow-glow"
          >
            Criar vídeo agora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </AppLayout>
  );
};

export default VideoLandingPage;
