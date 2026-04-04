/**
 * /referral — User's referral dashboard.
 * Shows unique link, code, click/signup/conversion stats, and rewards history.
 */
import { Gift, Link2, Users, TrendingUp, Copy, Check, Share2, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/app/AppLayout";
import { useReferralCode } from "@/hooks/useReferralCode";
import { buildShareUrl, buildMinimalShareCaption, buildWhatsAppUrl, copyToClipboard } from "@/lib/shareUtils";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:   React.ReactNode;
  label:  string;
  value:  number | string;
  accent: "cyan" | "gold" | "purple" | "green";
}

const accentCls = {
  cyan:   "bg-[rgba(0,242,255,0.08)]   text-[var(--ds-cyan)]",
  gold:   "bg-[rgba(212,175,55,0.1)]   text-[var(--ds-gold)]",
  purple: "bg-[rgba(167,139,250,0.1)]  text-[#C4B5FD]",
  green:  "bg-[rgba(52,211,153,0.08)]  text-emerald-400",
};

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <motion.div variants={fadeUpVariants} className="glass rounded-2xl p-6">
      <div className={`w-11 h-11 rounded-xl ${accentCls[accent]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[var(--ds-fg)]">{value}</p>
      <p className="text-sm text-[var(--ds-fg-muted)] mt-0.5">{label}</p>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReferralPage() {
  const { stats, loading, error } = useReferralCode();
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = buildShareUrl({
    referralCode: stats?.code ?? undefined,
    utmContent:   "referral_page",
  });

  const shareCaption = buildMinimalShareCaption(shareUrl);

  const handleCopy = async () => {
    await copyToClipboard(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(buildWhatsAppUrl(shareCaption), "_blank", "noopener");
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--ds-bg)] section-px py-10">
        <div className="section-container max-w-3xl">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-[var(--ds-gold)]" />
              <h1 className="text-xl font-bold text-[var(--ds-fg)]">Programa de Indicações</h1>
            </div>
            <p className="text-[var(--ds-fg-muted)] text-sm">
              Indique outros corretores e imobiliárias — ganhe créditos extras a cada signup.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-[var(--ds-fg-muted)]">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 text-sm">
              Erro ao carregar dados: {error}
            </div>
          )}

          {stats && !loading && (
            <div className="flex flex-col gap-8">

              {/* Referral link box */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs font-semibold text-[var(--ds-fg-muted)] uppercase tracking-wider mb-3">
                  Seu link de indicação
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 flex items-center gap-2 bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-4 py-2.5 overflow-hidden">
                    <Link2 className="w-4 h-4 text-[var(--ds-fg-subtle)] shrink-0" />
                    <span className="text-sm text-[var(--ds-fg-muted)] truncate font-mono">{shareUrl}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[rgba(0,242,255,0.1)] text-[var(--ds-cyan)] hover:bg-[rgba(0,242,255,0.16)] border border-[rgba(0,242,255,0.2)] transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[rgba(52,211,153,0.08)] text-emerald-400 hover:bg-[rgba(52,211,153,0.14)] border border-[rgba(52,211,153,0.2)] transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--ds-surface)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] border border-[var(--ds-border)] transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </button>
                </div>
                <p className="text-[var(--ds-fg-subtle)] text-xs mt-4">
                  Código: <span className="font-mono font-semibold text-[var(--ds-fg-muted)]">{stats.code}</span>
                </p>
              </div>

              {/* Stats grid */}
              <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Link2       className="w-5 h-5" />} label="Cliques no link"  value={stats.clickCount}  accent="cyan"   />
                <StatCard icon={<Users       className="w-5 h-5" />} label="Cadastros"        value={stats.signups}     accent="purple" />
                <StatCard icon={<TrendingUp  className="w-5 h-5" />} label="Conversões"       value={stats.conversions} accent="gold"   />
                <StatCard icon={<Gift        className="w-5 h-5" />} label="Créditos ganhos"  value={stats.credits}     accent="green"  />
              </StaggerChildren>

              {/* How it works */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs font-semibold text-[var(--ds-fg-muted)] uppercase tracking-wider mb-4">
                  Como funciona
                </p>
                <ol className="flex flex-col gap-3">
                  {[
                    { step: "1", text: "Compartilhe seu link com corretores e imobiliárias." },
                    { step: "2", text: "Quando alguém se cadastrar usando seu link, você ganha créditos de bônus." },
                    { step: "3", text: "Ao assinar um plano pago, você recebe ainda mais créditos." },
                  ].map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[rgba(212,175,55,0.15)] text-[var(--ds-gold)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <span className="text-sm text-[var(--ds-fg-muted)]">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
