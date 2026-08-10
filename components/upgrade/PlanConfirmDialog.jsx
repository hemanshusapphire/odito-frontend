"use client"

import { Check, ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrencyAmount } from "@/lib/subscription"

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

/**
 * The real confirmation step for both Case A (new subscriber → Checkout)
 * and Case B (existing subscriber → Change Plan). `mode` decides both the
 * copy and, in page-content.jsx, which mutation Continue actually calls —
 * this component itself never calls an API; it only surfaces `onConfirm`.
 *
 * @param {object|null} plan - the plan being confirmed, or null when closed
 * @param {object|null} currentPlan - the user's active plan (serialized
 *   shape from GET /api/subscription), or null if never subscribed
 * @param {'subscribe'|'change'} mode
 * @param {boolean} open
 * @param {() => void} onOpenChange
 * @param {(plan: object) => void} onConfirm
 * @param {boolean} isPending - disables both buttons, shows a spinner on Continue
 * @param {string|null} errorMessage - shown inline; dialog stays open so the
 *   user can retry without losing context (form values are never cleared
 *   on failure, same convention as AddKeywordModal.jsx)
 */
export default function PlanConfirmDialog({
  plan,
  currentPlan,
  mode = "subscribe",
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  errorMessage = null,
}) {
  if (!plan) return null

  const isChange = mode === "change" && currentPlan
  const verb = !isChange ? "Subscribe to" : plan.price >= currentPlan.price ? "Upgrade to" : "Switch to"
  const featureEntries = Object.entries(plan.features || {}).filter(
    ([key, value]) => FEATURE_LABELS[key] && value === true
  )

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!isPending) onOpenChange(next) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {verb} {plan.name}?
          </DialogTitle>
          <DialogDescription>
            Review what&apos;s included before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isChange && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
              <span className="font-medium text-muted-foreground">{currentPlan.name}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{plan.name}</span>
            </div>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {formatCurrencyAmount(plan.price, plan.currency)}
            </span>
            <span className="text-sm text-muted-foreground">
              /{plan.billingInterval === "month" ? "mo" : plan.billingInterval}
            </span>
          </div>

          <dl className="grid grid-cols-3 gap-2 rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
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
              <dd className="text-base font-semibold text-foreground">{plan.limits?.keywords ?? "—"}</dd>
            </div>
          </dl>

          {featureEntries.length > 0 && (
            <ul className="space-y-1.5">
              {featureEntries.map(([key]) => (
                <li key={key} className="flex items-center gap-2 text-sm text-foreground/90">
                  <Check className="size-3.5 shrink-0 text-primary" />
                  {FEATURE_LABELS[key]}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-muted/20 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            {isChange ? (
              <span>
                This updates your existing subscription directly — no new payment method needed.
                Stripe will prorate the difference: you&apos;ll be charged or credited for the
                remainder of this billing cycle on your next invoice.
              </span>
            ) : (
              <span>Stripe will securely process your payment on the next screen.</span>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={() => onConfirm(plan)}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isChange ? "Switching plan..." : "Redirecting to checkout..."}
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
