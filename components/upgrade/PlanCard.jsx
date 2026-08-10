"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrencyAmount } from "@/lib/subscription"
import PlanBadge from "./PlanBadge"

// Human-readable labels for the boolean feature flags on a plan (see
// odito_backend/src/config/plans.js `features` object). Only true/nonzero
// flags are rendered — a plan lacking a feature simply omits its row rather
// than showing a struck-through "not included" line, keeping every card's
// feature list purely additive and easy to scan.
const FEATURE_LABELS = {
  aiSeoAudit: "AI SEO Audit",
  aiVisibilityAudit: "AI Visibility Audit",
  technicalSeoAudit: "Technical SEO Audit",
  accessibilityAudit: "Accessibility Audit",
  performanceAudit: "Performance Audit",
  urlSelection: "URL Selection",
  failedUrlRetry: "Failed URL Retry",
  pdfReport: "PDF Reports",
  weeklyRecrawl: "Weekly Recrawl",
  apiAccess: "API Access",
  whiteLabel: "White-label Reports",
}

function FeatureRow({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground/90">
      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  )
}

/**
 * One Starter / Pro / Premium tile. Purely presentational + one callback —
 * `onChoose(plan)` is the ONLY thing a click does; this component never
 * calls an API, never navigates, never touches Stripe. The caller (page
 * content) owns what "choosing" a plan actually means right now (Phase 2:
 * open a confirmation dialog that itself only logs/toasts).
 *
 * @param {object} plan - serialized plan from GET /api/plans:
 *   {id, name, description, price, currency, billingInterval,
 *    limits: {credits, pages, keywords?}, features}
 * @param {boolean} isCurrentPlan
 * @param {boolean} isPopular
 * @param {boolean} isBlocked - the user's billing status blocks checkout/
 *   change-plan (past_due/paused) — the CTA becomes "Resolve Billing Issue"
 *   and page-content.jsx routes the click straight to the Billing Portal
 *   instead of opening the confirm dialog. Never applies to the current
 *   plan's own card — that one stays "Current Plan"/disabled regardless.
 * @param {boolean} disabled - true while ANY plan mutation is in flight
 *   (checkout/change-plan/portal), across every card — prevents opening a
 *   second confirmation while one is still being processed.
 * @param {number} index - drives the entrance-animation stagger delay
 * @param {(plan: object) => void} onChoose
 */
export default function PlanCard({ plan, isCurrentPlan, isPopular, isBlocked = false, disabled = false, index = 0, onChoose }) {
  const featureEntries = Object.entries(plan.features || {}).filter(
    ([key, value]) => FEATURE_LABELS[key] && value === true
  )
  const teamMembers = plan.features?.teamMembers

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="relative h-full"
    >
      <Card
        className={
          "relative flex h-full flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 " +
          (isPopular
            ? "border-primary/60 ring-1 ring-primary/30 shadow-primary/10"
            : "")
        }
      >
        {isCurrentPlan && <PlanBadge kind="current" />}
        {!isCurrentPlan && isPopular && <PlanBadge kind="popular" />}

        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {formatCurrencyAmount(plan.price, plan.currency)}
            </span>
            <span className="text-sm text-muted-foreground">
              /{plan.billingInterval === "month" ? "mo" : plan.billingInterval}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <dl className="mb-4 grid grid-cols-3 gap-2 rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Credits</dt>
              <dd className="text-base font-semibold text-foreground">{plan.limits?.credits ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Pages</dt>
              <dd className="text-base font-semibold text-foreground">{plan.limits?.pages ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Keywords</dt>
              {/* Renders once the backend response includes limits.keywords —
                  see the Phase 2 report's known-limitations note; omitted
                  gracefully (not faked) until then. */}
              <dd className="text-base font-semibold text-foreground">
                {plan.limits?.keywords ?? "—"}
              </dd>
            </div>
          </dl>

          <ul className="space-y-2">
            {featureEntries.map(([key]) => (
              <FeatureRow key={key}>{FEATURE_LABELS[key]}</FeatureRow>
            ))}
            {teamMembers != null && (
              <FeatureRow>
                {teamMembers} Team Member{teamMembers === 1 ? "" : "s"}
              </FeatureRow>
            )}
          </ul>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
            disabled={isCurrentPlan || disabled}
            onClick={() => onChoose(plan)}
          >
            {isCurrentPlan ? "Current Plan" : isBlocked ? "Resolve Billing Issue" : `Choose ${plan.name}`}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
