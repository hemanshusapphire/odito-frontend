/**
 * sessionStorage keys shared between the onboarding zero-credit Upgrade CTA
 * (components/onboarding/ARIAChat.jsx) and any page that can complete a
 * checkout/plan-change on its behalf. Centralized here so both sides always
 * agree on the exact key string — ARIAChat.jsx used to declare its resume
 * key locally since it was the only reader/writer; now that the Choose Plan
 * page also writes it (and needs its own staging key to hand resume state
 * across the page navigation between the two), duplicating both string
 * literals across files would be a silent-drift risk not worth taking.
 *
 * PENDING is written by ARIAChat.jsx right before navigating to the Choose
 * Plan page — it holds the resume payload in transit, before we know
 * whether/which plan the user will actually pick or whether the checkout/
 * change-plan call will succeed.
 *
 * RESUME is the pre-existing key /settings/subscription/page-content.jsx
 * already reads on mount (unchanged) and ARIAChat.jsx already restores from
 * on mount (unchanged). It must only ever be written at the exact moment a
 * return-to-onboarding is actually about to happen — right before the
 * Stripe redirect (Case A) or right before navigating back directly
 * (Case B, no external redirect involved) — never any earlier, so a user
 * who navigates to the Choose Plan page and then abandons it never gets
 * unexpectedly bounced to /onboarding on some unrelated later visit to
 * /settings/subscription.
 */
export const ONBOARDING_UPGRADE_PENDING_KEY = 'onboarding_upgrade_pending'
export const ONBOARDING_UPGRADE_RESUME_KEY = 'onboarding_upgrade_resume'
