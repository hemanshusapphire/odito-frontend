"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * The shared dialog shell for every one-time purchase flow (Buy More
 * Pages, Buy Credits, and any future one) — backdrop, dialog chrome,
 * Escape-to-close, title/subtitle, a summary grid, the "Stripe
 * integration coming next" placeholder, and Cancel/Continue buttons.
 * Fully presentational: it knows nothing about pages, credits, pricing,
 * or Stripe — the caller supplies the quantity selector as `children`
 * (e.g. <PageSlider .../>) and the four summary rows as data.
 *
 * Uses the app's real theme tokens (bg-background/text-foreground/
 * border-border, same as AlertDialogContent/CreditLimitDialog) rather
 * than a hardcoded dark card — this modal used to be permanently dark
 * regardless of the site's light/dark setting while its text colors
 * (var(--text), which DOES correctly flip per theme) followed the
 * theme, so light mode produced near-black text on a near-black card.
 */
export default function PurchaseModal({
  open,
  onClose,
  onSubmit,
  submitting,
  showComingSoon,
  title,
  subtitle,
  dialogId,
  summary,
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogId}
        onClick={(e) => e.stopPropagation()}
        className="buy-pages-modal-enter w-full max-w-115 rounded-2xl border border-border bg-background p-6 shadow-2xl"
      >
        <div id={dialogId} className="mb-1.5 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </div>
        <div className="mb-6 text-sm text-muted-foreground">
          {subtitle}
        </div>

        {children}

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl border border-border bg-muted/50 p-4">
          {summary.map((item) => (
            <SummaryItem key={item.label} label={item.label} value={item.value} accent={item.accent} />
          ))}
        </div>

        {showComingSoon && (
          <div className="mt-4 rounded-[10px] border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-2.5 text-center text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            Stripe integration coming next.
          </div>
        )}

        <div className="mt-5.5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] border border-border bg-transparent py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-[10px] border-none py-3 text-sm font-bold text-white"
            style={{
              background: submitting ? "rgba(124,58,237,0.4)" : "var(--grad1, linear-gradient(135deg,#7c3aed,#00e5ff))",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Please wait..." : "Continue"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes buyPagesModalIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .buy-pages-modal-enter { animation: buyPagesModalIn 0.18s ease-out; }
      `}</style>
    </div>,
    document.body
  );
}

// accent: "cyan" | "purple" | undefined — a semantic key, not a raw hex,
// so each resolves to a light/dark pair with real contrast in both themes
// (the old hardcoded #00e5ff neon cyan was unreadable on a white card).
const ACCENT_CLASSES = {
  cyan: "text-cyan-600 dark:text-cyan-400",
  purple: "text-violet-600 dark:text-violet-400",
};

function SummaryItem({ label, value, accent }) {
  return (
    <div>
      <div className="mb-0.75 text-[11px] font-semibold uppercase tracking-[0.3px] text-muted-foreground">
        {label}
      </div>
      <div className={`text-base font-bold ${ACCENT_CLASSES[accent] || "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
