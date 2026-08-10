/**
 * Frontend pricing/bounds for "Buy Credits" — the credits counterpart to
 * lib/pagePacks.js, same purpose: this file drives the LIVE price shown
 * in CreditsPurchaseModal while the user is dragging the slider, purely
 * for instant display. It is NOT the source of truth for what a customer
 * is actually charged — the backend (odito_backend/src/modules/
 * credit_purchase/config/creditPackPricing.js) always recomputes the
 * price itself and never trusts this value. Keep the rate here in sync
 * with that backend file if it ever changes.
 */

export const MIN_CREDITS_PER_PURCHASE = 1;
export const MAX_CREDITS_PER_PURCHASE = 100;

// $15.00/credit (1500 cents) — must match
// odito_backend/.../credit_purchase/config/creditPackPricing.js exactly.
export const CREDIT_PACK_RATE_CENTS_PER_CREDIT = 1500;

export const DEFAULT_CREDIT_PACK = { credits: 1, priceCents: CREDIT_PACK_RATE_CENTS_PER_CREDIT };

/**
 * @param {number} credits
 * @returns {number} price in cents
 */
export function calculateCreditPackPriceCents(credits) {
  return Math.round(credits * CREDIT_PACK_RATE_CENTS_PER_CREDIT);
}
