/**
 * Single source of truth for "Buy More Pages" page-pack sizes and pricing.
 *
 * This is a ONE-TIME page-quota top-up, not a subscription plan change —
 * see components/billing/BuyPagesModal.jsx. Every price shown anywhere in
 * the app for a page pack must be derived from this file; nothing outside
 * it should hardcode a pack size or a dollar amount. Changing prices later
 * means editing PAGE_PACK_OPTIONS here — no other file.
 *
 * `priceCents` follows the same convention already used throughout this
 * codebase for every other monetary value that touches Stripe (see
 * Transaction.js on the backend, and formatCurrencyAmount()'s own doc
 * comment below) — the smallest currency unit, never a float dollar
 * amount — so this config is already shaped the way a real Stripe
 * Price/Checkout integration will need it.
 *
 * Current rate: a flat $0.05/page (matches the two reference points the
 * product spec gave — 100 pages -> $5, 300 pages -> $15). Expressed here as
 * an explicit per-tier table rather than a computed formula so a future
 * bulk-discount curve is a one-place edit, not a rewrite.
 */
export const PAGE_PACK_OPTIONS = [
  { pages: 100, priceCents: 500 },
  { pages: 200, priceCents: 1000 },
  { pages: 300, priceCents: 1500 },
  { pages: 400, priceCents: 2000 },
  { pages: 500, priceCents: 2500 },
  { pages: 750, priceCents: 3750 },
  { pages: 1000, priceCents: 5000 },
  { pages: 1500, priceCents: 7500 },
  { pages: 2000, priceCents: 10000 },
];

/**
 * @returns {number[]} just the page-count values, in ascending order.
 */
export function getPagePackPageValues() {
  return PAGE_PACK_OPTIONS.map((option) => option.pages);
}

/**
 * @param {number} pages - must be one of PAGE_PACK_OPTIONS's page values
 * @returns {{pages:number, priceCents:number}} the matching pack
 * @throws if `pages` isn't one of the configured options
 */
export function getPagePackByPages(pages) {
  const pack = PAGE_PACK_OPTIONS.find((option) => option.pages === pages);
  if (!pack) {
    throw new Error(`Unknown page pack size: ${pages}`);
  }
  return pack;
}

export const DEFAULT_PAGE_PACK = PAGE_PACK_OPTIONS[0];

/**
 * Per-page rate in cents, derived from PAGE_PACK_OPTIONS itself rather than
 * a second hardcoded number — every tier in the table already prices out to
 * the same flat rate, so the first tier is as good a reference as any.
 * @returns {number}
 */
export function getPagePackRateCentsPerPage() {
  const reference = PAGE_PACK_OPTIONS[0];
  return reference.priceCents / reference.pages;
}

/**
 * Price, in cents, for an arbitrary page count — the continuous
 * counterpart to getPagePackByPages(), which only resolves the fixed tier
 * list above. Still driven entirely by PAGE_PACK_OPTIONS; changing prices
 * there changes this too.
 * @param {number} pages
 * @returns {number}
 */
export function calculatePagePackPriceCents(pages) {
  return Math.round(pages * getPagePackRateCentsPerPage());
}
