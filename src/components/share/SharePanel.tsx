/**
 * SharePanel — full share modal.
 * Shows image preview (with watermark toggle), download, copy link,
 * copy caption, WhatsApp deep-link, and referral URL.
 */
import { useState, useEffect, useCallback } from "react";
import { Download, Copy, MessageCircle, Link2, X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useReferralCode } from "@/hooks/useReferralCode";
import {
  buildShareUrl,
  buildShareCaption,
  buildMinimalShareCaption,
  buildWhatsAppUrl,
  copyToClipboard,
  downloadBlob,
} from "@/lib/shareUtils";
import { applyWatermark, buildWatermarkPreview } from "@/lib/watermarkUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SharePanelProps {
  open:      boolean;
  onClose:   () => void;
  imageUrl:  string;
  caption?:  string;
  filename?: string;
}

// ─── Action button ────────────────────────────────────────────────────────────

interface ActionBtnProps {
  icon:      React.ReactNode;
  label:     string;
  onClick:   () => void;
  loading?:  boolean;
  copied?:   boolean;
  disabled?: boolean;
}

function ActionBtn({ icon, label, onClick, loading, copied, disabled }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--ds-border-2)] hover:bg-[rgba(255,255,255,0.04)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(0,242,255,0.08)] text-[var(--ds-cyan)] group-hover:bg-[rgba(0,242,255,0.14)] transition-colors">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : copied ? <Check className="w-4 h-4 text-emerald-400" /> : icon}
      </span>
      <span className="text-[11px] text-[var(--ds-fg-muted)] font-medium">{label}</span>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SharePanel({ open, onClose, imageUrl, caption, filename = "imagem-db8.jpg" }: SharePanelProps) {
  const { user }             = useAuth();
  const { data: planInfo }   = useUserPlan();
  const { stats: refStats }  = useReferralCode();

  const isTrial  = !planInfo || planInfo.user_plan === "credits";
  const [wmOn,     setWmOn]     = useState(true);       // watermark toggle
  const [preview,  setPreview]  = useState<string>("");
  const [prevLoad, setPrevLoad] = useState(false);
  const [dlLoad,   setDlLoad]   = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCap,  setCopiedCap]  = useState(false);

  // Build referral URL
  const shareUrl = buildShareUrl({
    referralCode: refStats?.code ?? undefined,
    utmContent:   "post_share",
  });

  const fullCaption = caption
    ? buildShareCaption(caption, shareUrl)
    : buildMinimalShareCaption(shareUrl);

  // Rebuild preview whenever imageUrl or watermark state changes
  useEffect(() => {
    if (!imageUrl || !open) return;
    let cancelled = false;
    const applyFlag = isTrial ? true : wmOn;
    setPrevLoad(true);
    buildWatermarkPreview(imageUrl, applyFlag)
      .then((url) => { if (!cancelled) setPreview(url); })
      .catch(() => { if (!cancelled) setPreview(imageUrl); })
      .finally(() => { if (!cancelled) setPrevLoad(false); });
    return () => { cancelled = true; };
  }, [imageUrl, open, wmOn, isTrial]);

  const handleDownload = useCallback(async () => {
    setDlLoad(true);
    try {
      const applyFlag = isTrial ? true : wmOn;
      const blob = await applyWatermark(imageUrl, applyFlag);
      downloadBlob(blob, filename);
    } catch {
      // fallback: direct link download
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = filename;
      a.click();
    } finally {
      setDlLoad(false);
    }
  }, [imageUrl, filename, wmOn, isTrial]);

  const handleCopyLink = useCallback(async () => {
    await copyToClipboard(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [shareUrl]);

  const handleCopyCaption = useCallback(async () => {
    await copyToClipboard(fullCaption);
    setCopiedCap(true);
    setTimeout(() => setCopiedCap(false), 2000);
  }, [fullCaption]);

  const handleWhatsApp = useCallback(() => {
    window.open(buildWhatsAppUrl(fullCaption), "_blank", "noopener");
  }, [fullCaption]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-[var(--ds-bg)] border-[var(--ds-border)] text-[var(--ds-fg)] max-w-md p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold text-[var(--ds-fg)]">
            Compartilhar criativo
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 flex flex-col gap-5 mt-4">
          {/* Preview */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[var(--ds-surface)] border border-[var(--ds-border)]">
            <AnimatePresence mode="wait">
              {prevLoad ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--ds-fg-muted)]" />
                </motion.div>
              ) : preview ? (
                <motion.img key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={preview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <motion.img key="orig" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
              )}
            </AnimatePresence>
          </div>

          {/* Watermark toggle (paid only) */}
          {!isTrial && (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
              <Label htmlFor="wm-toggle" className="text-sm text-[var(--ds-fg-muted)] cursor-pointer select-none">
                Marca d'água <span className="text-[var(--ds-fg-subtle)] text-xs">(discreto)</span>
              </Label>
              <Switch id="wm-toggle" checked={wmOn} onCheckedChange={setWmOn} />
            </div>
          )}
          {isTrial && (
            <p className="text-[var(--ds-fg-subtle)] text-xs text-center">
              Faça upgrade para remover a marca d'água
            </p>
          )}

          {/* Action grid */}
          <div className="grid grid-cols-4 gap-2">
            <ActionBtn icon={<Download className="w-4 h-4" />}     label="Baixar"       onClick={handleDownload}    loading={dlLoad} />
            <ActionBtn icon={<Link2    className="w-4 h-4" />}     label="Copiar link"  onClick={handleCopyLink}    copied={copiedLink} />
            <ActionBtn icon={<Copy    className="w-4 h-4" />}      label="Legenda"      onClick={handleCopyCaption} copied={copiedCap} />
            <ActionBtn icon={<MessageCircle className="w-4 h-4" />} label="WhatsApp"    onClick={handleWhatsApp} />
          </div>

          {/* Referral link preview */}
          <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-2.5 flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-[var(--ds-fg-subtle)] shrink-0" />
            <span className="text-[11px] text-[var(--ds-fg-muted)] truncate flex-1 font-mono">
              {shareUrl}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
