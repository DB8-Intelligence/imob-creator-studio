/**
 * NextActionsPanel — Blocs 5 + 6
 * Shown after a creative is generated.
 * Section A (Bloc 5): "O que fazer agora?" — Gerar mais, Criar vídeo, Duplicar
 * Section B (Bloc 6): "Gostou? Compartilhe ou indique" — viral CTA moment
 */
import { Sparkles, Video, Copy, Share2, Gift, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { SharePanel } from "./SharePanel";
import { buildShareUrl, copyToClipboard } from "@/lib/shareUtils";
import { useReferralCode } from "@/hooks/useReferralCode";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NextActionsPanelProps {
  imageUrl?:   string;
  caption?:    string;
  filename?:   string;
  onGenerate?: () => void;   // "Gerar mais"
  onDuplicate?: () => void;  // "Duplicar"
}

// ── Small action card ─────────────────────────────────────────────────────────

interface ActionCardProps {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  onClick?:    () => void;
  to?:         string;
  accent?:     "cyan" | "gold" | "purple" | "green";
}

const accentMap: Record<NonNullable<ActionCardProps["accent"]>, { bg: string; text: string }> = {
  cyan:   { bg: "bg-[rgba(0,242,255,0.08)]",     text: "text-[var(--ds-cyan)]"   },
  gold:   { bg: "bg-[rgba(212,175,55,0.1)]",     text: "text-[var(--ds-gold)]"   },
  purple: { bg: "bg-[rgba(167,139,250,0.1)]",    text: "text-[#C4B5FD]"          },
  green:  { bg: "bg-[rgba(52,211,153,0.08)]",    text: "text-emerald-400"        },
};

function ActionCard({ icon, title, description, onClick, to, accent = "cyan" }: ActionCardProps) {
  const { bg, text } = accentMap[accent];

  const inner = (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass glass-hover rounded-xl p-4 flex items-start gap-3 cursor-pointer"
    >
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0 ${text}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--ds-fg)]">{title}</p>
        <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--ds-fg-subtle)] shrink-0 mt-0.5 ml-auto" />
    </motion.div>
  );

  if (to) return <Link to={to}>{inner}</Link>;
  return <div onClick={onClick}>{inner}</div>;
}

// ── Main component ────────────────────────────────────────────────────────────

export function NextActionsPanel({
  imageUrl,
  caption,
  filename,
  onGenerate,
  onDuplicate,
}: NextActionsPanelProps) {
  const { stats } = useReferralCode();
  const [shareOpen, setShareOpen] = useState(false);
  const [copiedRef,  setCopiedRef] = useState(false);

  const refUrl = buildShareUrl({
    referralCode: stats?.code ?? undefined,
    utmContent:   "referral_page",
  });

  const handleCopyRef = async () => {
    await copyToClipboard(refUrl);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1,  y: 0  }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6"
    >
      {/* ── Bloc 5: Next actions ── */}
      <div>
        <p className="text-xs font-semibold text-[var(--ds-fg-muted)] uppercase tracking-wider mb-3">
          O que fazer agora?
        </p>
        <div className="flex flex-col gap-2">
          <ActionCard
            icon={<Sparkles className="w-4 h-4" />}
            title="Gerar mais conteúdo"
            description="Crie uma nova sequência ou criativo diferente"
            onClick={onGenerate ?? (() => {})}
            accent="cyan"
          />
          <ActionCard
            icon={<Video className="w-4 h-4" />}
            title="Criar versão em vídeo"
            description="Transforme este criativo num vídeo cinemático"
            to="/create/animate"
            accent="purple"
          />
          {onDuplicate && (
            <ActionCard
              icon={<Copy className="w-4 h-4" />}
              title="Duplicar e editar"
              description="Use este criativo como base para uma nova versão"
              onClick={onDuplicate}
              accent="gold"
            />
          )}
        </div>
      </div>

      {/* ── Bloc 6: Viral CTA ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-[var(--ds-border)] bg-gradient-to-br from-[rgba(0,242,255,0.04)] to-[rgba(212,175,55,0.04)] p-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-4 h-4 text-[var(--ds-gold)]" />
          <p className="text-sm font-semibold text-[var(--ds-fg)]">Gostou do resultado?</p>
        </div>
        <p className="text-xs text-[var(--ds-fg-muted)] mb-4">
          Compartilhe com outros corretores e ganhe créditos extras para cada indicação.
        </p>

        <div className="flex gap-2">
          {imageUrl && (
            <button
              onClick={() => setShareOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-[rgba(0,242,255,0.1)] text-[var(--ds-cyan)] hover:bg-[rgba(0,242,255,0.16)] border border-[rgba(0,242,255,0.2)] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartilhar criativo
            </button>
          )}
          <button
            onClick={handleCopyRef}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-[rgba(212,175,55,0.1)] text-[var(--ds-gold)] hover:bg-[rgba(212,175,55,0.16)] border border-[rgba(212,175,55,0.2)] transition-all"
          >
            <Gift className="w-3.5 h-3.5" />
            {copiedRef ? "Link copiado!" : "Indicar e ganhar"}
          </button>
        </div>

        <Link
          to="/referral"
          className="mt-3 block text-center text-[10px] text-[var(--ds-fg-subtle)] hover:text-[var(--ds-fg-muted)] transition-colors"
        >
          Ver meu painel de indicações →
        </Link>
      </motion.div>

      {/* Share panel (lazy) */}
      {imageUrl && (
        <SharePanel
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          imageUrl={imageUrl}
          caption={caption}
          filename={filename}
        />
      )}
    </motion.div>
  );
}
