"use client";

import { useEffect, useState } from "react";
import PurchaseModal from "./PurchaseModal";
import PageSlider from "./PageSlider";
import { DEFAULT_PAGE_PACK, calculatePagePackPriceCents } from "@/lib/pagePacks";
import { formatCurrencyAmount } from "@/lib/subscription";

const MIN_PAGES = 1;
const MAX_PAGES = 5000;

/**
 * "Buy More Pages" — a one-time page-quota top-up, not a plan change (see
 * lib/pagePacks.js). Deliberately reusable and presentation-only: it takes
 * `currentPagesLimit` and an `onContinue(pack)` callback rather than reading
 * a subscription query or calling Stripe itself, so the exact same modal can
 * be dropped into URL Selection, Dashboard, Settings, or the Subscription
 * page later, each wiring its own trigger + Stripe call at the call site.
 *
 * A thin wrapper around the shared PurchaseModal shell (components/billing/
 * PurchaseModal.jsx) — CreditsPurchaseModal (Phase 17) is the other one;
 * this file owns only the page-specific pricing/state/copy, not the dialog
 * chrome itself. Rendered output is unchanged from before this extraction.
 *
 * If no `onContinue` is passed, Continue just shows a local "coming next"
 * placeholder — that fallback exists only so this component is safely
 * droppable before its real call site is wired.
 */
export default function BuyPagesModal({ open, onClose, currentPagesLimit = 0, onContinue }) {
  const [selectedPages, setSelectedPages] = useState(DEFAULT_PAGE_PACK.pages);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset to a clean slate every time the modal is (re)opened, rather than
  // carrying over whatever was left from a previous open/cancel.
  useEffect(() => {
    if (open) {
      setSelectedPages(DEFAULT_PAGE_PACK.pages);
      setShowComingSoon(false);
      setSubmitting(false);
    }
  }, [open]);

  const priceCents = calculatePagePackPriceCents(selectedPages);
  const newTotal = currentPagesLimit + selectedPages;

  const handleContinue = async () => {
    if (!onContinue) {
      setShowComingSoon(true);
      return;
    }
    setSubmitting(true);
    try {
      await onContinue({ pages: selectedPages, priceCents });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PurchaseModal
      open={open}
      onClose={onClose}
      onSubmit={handleContinue}
      submitting={submitting}
      showComingSoon={showComingSoon}
      title="Buy Additional Pages"
      subtitle="Increase your audit capacity without changing your subscription plan."
      dialogId="buy-pages-title"
      summary={[
        { label: "Current Included", value: `${currentPagesLimit} Pages` },
        { label: "Additional", value: `+${selectedPages} Pages`, accent: "cyan" },
        { label: "New Total", value: `${newTotal} Pages` },
        { label: "Estimated Price", value: formatCurrencyAmount(priceCents / 100, "usd"), accent: "purple" },
      ]}
    >
      <PageSlider
        min={MIN_PAGES}
        max={MAX_PAGES}
        value={selectedPages}
        onChange={setSelectedPages}
      />
    </PurchaseModal>
  );
}
