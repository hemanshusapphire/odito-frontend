/**
 * Shared helpers for reading a User's subscription/quota data.
 *
 * The backend already calculates `remaining` server-side (see
 * odito_backend/src/utils/creditService.js summarizeQuota()) and returns it
 * as part of every auth response's `user.subscription` object — these
 * helpers exist purely to provide one safe, consistent access point, so no
 * component reads the nested shape or does arithmetic independently.
 *
 * Old shape (removed): user.credits.permanent / user.credits.monthly
 * New shape: user.subscription.credits.{limit,used,remaining}
 *            user.subscription.pages.{limit,used,remaining}
 */

/**
 * @param {Object} user
 * @returns {{limit: number, used: number, remaining: number}}
 */
export function getCreditUsage(user) {
  const credits = user?.subscription?.credits;
  return {
    limit: credits?.limit ?? 0,
    used: credits?.used ?? 0,
    remaining: credits?.remaining ?? 0,
  };
}

/**
 * @param {Object} user
 * @returns {{limit: number, used: number, remaining: number}}
 */
export function getPageUsage(user) {
  const pages = user?.subscription?.pages;
  return {
    limit: pages?.limit ?? 0,
    used: pages?.used ?? 0,
    remaining: pages?.remaining ?? 0,
  };
}

/**
 * @param {Object} user
 * @returns {number}
 */
export function getRemainingCredits(user) {
  return getCreditUsage(user).remaining;
}

/**
 * @param {Object} user
 * @returns {number}
 */
export function getRemainingPages(user) {
  return getPageUsage(user).remaining;
}

/**
 * Formats a currency amount for display. Callers own the unit: pass a
 * whole-currency-unit amount (e.g. a plan's `price: 25`) as-is; pass a
 * Stripe amount (always in the currency's smallest unit, e.g. cents) as
 * `amount / 100`. This is the one place the Intl.NumberFormat + fallback
 * logic lives — SubscriptionOverviewCard, PlanSummaryCard, and
 * BillingHistoryCard all call this instead of each defining their own copy.
 * @param {number} amount - whole currency units (e.g. dollars, not cents)
 * @param {string} currency - ISO currency code, e.g. "usd"
 * @returns {string}
 */
export function formatCurrencyAmount(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount} ${(currency || "").toUpperCase()}`
  }
}
