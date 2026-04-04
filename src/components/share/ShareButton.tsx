/**
 * ShareButton — compact trigger that opens SharePanel.
 * Accepts icon-only or icon+label variant.
 */
import { useState } from "react";
import { Share2 } from "lucide-react";
import { SharePanel, SharePanelProps } from "./SharePanel";

type OmitTrigger = Omit<SharePanelProps, "open" | "onClose">;

interface ShareButtonProps extends OmitTrigger {
  label?:    string;       // if provided, renders icon + label
  size?:     "sm" | "md";
  variant?:  "ghost" | "outline" | "primary";
  className?: string;
}

export function ShareButton({
  label,
  size     = "md",
  variant  = "ghost",
  className = "",
  ...panelProps
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  const sizeClass = size === "sm" ? "h-7 px-2 text-xs gap-1.5" : "h-9 px-3 text-sm gap-2";

  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "outline"
      ? "border border-[var(--ds-border)] hover:border-[var(--ds-border-2)] bg-transparent hover:bg-[rgba(255,255,255,0.04)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
      : "bg-transparent hover:bg-[rgba(255,255,255,0.06)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-lg transition-all ${sizeClass} ${variantClass} ${className}`}
        title={label ?? "Compartilhar"}
      >
        <Share2 className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {label && <span>{label}</span>}
      </button>

      <SharePanel
        open={open}
        onClose={() => setOpen(false)}
        {...panelProps}
      />
    </>
  );
}
