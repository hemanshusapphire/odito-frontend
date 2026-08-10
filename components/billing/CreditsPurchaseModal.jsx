"use client";

import { useEffect, useState } from "react";
import PurchaseModal from "./PurchaseModal";
import PageSlider from "./PageSlider";
import { DEFAULT_CREDIT_PACK, calculateCreditPackPriceCents, MIN_CREDITS_PER_PURCHASE, MAX_CREDITS_PER_PURCHASE } from "@/lib/creditPacks";
import { formatCurrencyAmount } from "@/lib/subscription";

/**
 * "Buy Credits" — a one-time project-credit top-up, not a plan change
 * (see lib/creditPacks.js). Exact structural mirror of BuyPagesModal.jsx
 * (Phase 16) — same PurchaseModal shell, same PageSlider component (via
 * its label/unit props, so it reads "Additional Credits" instead of
 * "Additional Pages" without a second slider implementation), same
 * `onContinue(pack)` / "coming next" placeholder contract. Only the
 * pricing source, bounds, and copy differ — the only difference this
 * feature is meant to have from Buy More Pages.
 */
export default function CreditsPurchaseModal({ open, onClose, currentCreditsLimit = 0, onContinue }) {
  const [selectedCredits, setSelectedCredits] = useState(DEFAULT_CREDIT_PACK.credits);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedCredits(DEFAULT_CREDIT_PACK.credits);
      setShowComingSoon(false);
      setSubmitting(false);
    }
  }, [open]);

  const priceCents = calculateCreditPackPriceCents(selectedCredits);
  const newTotal = currentCreditsLimit + selectedCredits;

  const handleContinue = async () => {
    if (!onContinue) {
      setShowComingSoon(true);
      return;
    }
    setSubmitting(true);
    try {
      await onContinue({ credits: selectedCredits, priceCents });
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
      title="Buy Additional Credits"
      subtitle="Increase your project capacity without changing your subscription plan."
      dialogId="buy-credits-title"
      summary={[
        { label: "Current Included", value: `${currentCreditsLimit} Credits` },
        { label: "Additional Credits", value: `+${selectedCredits} Credits`, accent: "cyan" },
        { label: "New Total", value: `${newTotal} Credits` },
        { label: "Estimated Price", value: formatCurrencyAmount(priceCents / 100, "usd"), accent: "purple" },
      ]}
    >
      <PageSlider
        min={MIN_CREDITS_PER_PURCHASE}
        max={MAX_CREDITS_PER_PURCHASE}
        value={selectedCredits}
        onChange={setSelectedCredits}
        label="Additional Credits"
        ariaLabel="Additional credits"
        unitSingular="credit"
        unitPlural="credits"
      />
    </PurchaseModal>
  );
}
