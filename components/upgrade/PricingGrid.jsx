"use client"

import PlanCard from "./PlanCard"
import CustomPlanCard from "./CustomPlanCard"

// Pro is the marketing-designated "Most Popular" tier. Not derived from the
// API (no plan carries a `popular` flag server-side) — a small, explicit,
// client-only presentation choice, same category as "which plan shows a
// gradient border," not business logic worth round-tripping to the backend.
const POPULAR_PLAN_ID = "pro"

/**
 * Desktop: 4 columns. Tablet: 2. Mobile: 1. — exact breakpoints requested.
 * Renders the API-driven plans (Starter/Pro/Premium, whatever GET /api/plans
 * actually returns — nothing here assumes exactly three) plus one static,
 * always-present Custom card.
 *
 * @param {object[]} plans - from usePlans()
 * @param {object|null} currentPlanId - the user's active plan id, or null
 * @param {boolean} isBlocked - billing status blocks checkout/change-plan
 *   (past_due/paused) — passed through to every non-current card
 * @param {boolean} isMutating - a checkout/change-plan/portal call is in
 *   flight — disables every card's button to prevent a second concurrent
 *   action
 * @param {(plan: object) => void} onChoosePlan
 */
export default function PricingGrid({ plans, currentPlanId, isBlocked = false, isMutating = false, onChoosePlan }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan, index) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          index={index}
          isCurrentPlan={plan.id === currentPlanId}
          isPopular={plan.id === POPULAR_PLAN_ID}
          isBlocked={isBlocked}
          disabled={isMutating}
          onChoose={onChoosePlan}
        />
      ))}
      <CustomPlanCard index={plans.length} />
    </div>
  )
}
