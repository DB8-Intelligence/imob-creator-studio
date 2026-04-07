import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";

interface LpLayoutProps {
  children: ReactNode;
  /** CTA label shown in the sticky bar */
  ctaLabel?: string;
}

/**
 * Minimal layout for paid-traffic landing pages.
 * No nav links — just logo + single CTA. Reduces friction and keeps focus on conversion.
 */
export function LpLayout({ children, ctaLabel = "Começar gratuitamente" }: LpLayoutProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    captureAttribution();
    captureLastTouch();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-ds">
      {/* ── Minimal sticky bar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "bg-[rgba(5,8,11,0.92)] backdrop-blur-xl border-b border-[var(--ds-border)] shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <img src="/images/logo-header.png" alt="ImobCreator AI" className="h-8 w-auto" />
          </Link>

          <Link to="/auth" className="btn-primary !py-2 !px-5 !text-sm">
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Page content ── */}
      <main>{children}</main>

      {/* ── Minimal footer ── */}
      <footer className="py-8 border-t border-[var(--ds-border)] bg-[var(--ds-bg)]">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[var(--ds-fg-subtle)] text-xs">
          <span>© 2026 ImobCreator AI. Todos os direitos reservados.</span>
          <div className="flex gap-5">
            <Link to="/termos" className="hover:text-[var(--ds-gold-light)] transition-colors">Termos de Uso</Link>
            <Link to="/termos" className="hover:text-[var(--ds-gold-light)] transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Shared LP hero ──────────────────────────────────────────────────────────

interface LpHeroProps {
  badge: ReactNode;
  headline: ReactNode;
  description: string;
  ctaLabel?: string;
  trust?: string;
  stats?: { value: string; label: string }[];
}

const containerV = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};
const itemV = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};

export function LpHero({ badge, headline, description, ctaLabel = "Começar agora — grátis", trust, stats }: LpHeroProps) {
  return (
    <section className="relative min-h-[90vh] pt-28 pb-20 flex items-center overflow-hidden bg-hero bg-ds">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[640px] h-[420px] bg-[rgba(212,175,55,0.07)] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-[280px] h-[280px] bg-[rgba(0,242,255,0.04)] rounded-full blur-[80px] pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6"
        >
          <motion.div variants={itemV}>{badge}</motion.div>

          <motion.h1 variants={itemV} className="ds-h1 text-[clamp(2.2rem,5.5vw,4.25rem)]">
            {headline}
          </motion.h1>

          <motion.p variants={itemV} className="ds-body text-lg sm:text-xl max-w-2xl">
            {description}
          </motion.p>

          <motion.div variants={itemV} className="flex flex-col items-center gap-3">
            <Link to="/auth" className="btn-primary text-base">
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {trust && (
              <span className="text-[var(--ds-fg-subtle)] text-xs">{trust}</span>
            )}
          </motion.div>

          {stats && stats.length > 0 && (
            <motion.div variants={itemV} className="flex flex-wrap items-center justify-center gap-8 pt-4">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-3xl font-bold text-gold font-display leading-none">{s.value}</span>
                  <span className="text-[var(--ds-fg-muted)] text-xs">{s.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[var(--ds-bg)] to-transparent pointer-events-none" />
    </section>
  );
}

// ─── Shared LP inline CTA strip ──────────────────────────────────────────────

interface LpCtaStripProps {
  text: string;
  ctaLabel?: string;
  variant?: "dark" | "gold";
}

export function LpCtaStrip({ text, ctaLabel = "Começar agora — grátis", variant = "dark" }: LpCtaStripProps) {
  return (
    <div className={`section-px py-10 ${variant === "gold" ? "bg-[rgba(212,175,55,0.06)] border-y border-[rgba(212,175,55,0.15)]" : "bg-[var(--ds-surface)]"}`}>
      <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-5">
        <p className="text-[var(--ds-fg)] font-semibold text-lg text-center sm:text-left">{text}</p>
        <Link to="/auth" className="btn-primary shrink-0">
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
