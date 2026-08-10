"use client"

import { useRouter } from "next/navigation"
import { Sparkles, Loader2, Settings2 } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCreateBillingPortalSession } from "@/hooks/useDashboardQueries"
import { formatCurrencyAmount } from "@/lib/subscription"

/**
 * Shared loading/error rendering for a Stripe-mutating action button (only
 * Manage Subscription uses this now — Upgrade became a plain navigation in
 * Phase 3 of the Upgrade unification, so it no longer needs a pending/error
 * state of its own).
 */
function StripeActionButton({ onClick, isPending, pendingLabel, icon: Icon, label, error }) {
  return (
    <>
      <Button onClick={onClick} disabled={isPending} variant="outline" className="gap-2">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          <>
            <Icon className="h-4 w-4" />
            {label}
          </>
        )}
      </Button>
      {error && (
        <p className="text-center text-xs text-destructive">
          {error?.message || "Something went wrong. Please try again."}
        </p>
      )}
    </>
  )
}

/**
 * Plan Summary card — price/currency/billing cycle recap, plus Upgrade and
 * (when the user has a Stripe customer) Manage Subscription.
 *
 * Phase 3 (Upgrade unification): "Upgrade" no longer creates a Checkout
 * Session directly — it navigates to the shared Choose Plan page, which
 * owns all checkout/change-plan branching now (new subscriber vs. existing
 * subscriber vs. blocked billing status). This card no longer decides a
 * target plan id itself.
 *
 * The Choose Plan page lives at /subscription/plans (outside the (dashboard)
 * route group, not /settings/subscription/plans) — it must be reachable by
 * a user with zero projects (mid-onboarding), and (dashboard)/layout's
 * AuthGuard redirects any such user to /onboarding before this card's own
 * page could ever render for them.
 *
 * "Manage Subscription" is unchanged — it's Billing Portal access, not an
 * upgrade action, and stays exactly as it was.
 */
export default function PlanSummaryCard({ plan, hasBillingAccount }) {
  const router = useRouter()
  const { mutate: startPortal, isPending: isPortalPending, isError: isPortalError, error: portalError } = useCreateBillingPortalSession()

  const handleUpgrade = () => {
    router.push("/subscription/plans")
  }

  const handleManageSubscription = () => {
    startPortal(undefined, {
      onSuccess: (response) => {
        const portalUrl = response?.data?.portalUrl
        if (portalUrl) {
          window.location.href = portalUrl
        }
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plan Summary</CardTitle>
        <CardDescription>
          {plan ? `Billing details for your ${plan.name} plan.` : "Subscribe to a plan to get started."}
        </CardDescription>
      </CardHeader>

      {plan && (
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Monthly Price</dt>
              <dd className="font-medium text-foreground tabular-nums">{formatCurrencyAmount(plan.price, plan.currency)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="font-medium uppercase text-foreground">{plan.currency}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Billing Cycle</dt>
              <dd className="font-medium capitalize text-foreground">{plan.billingInterval}</dd>
            </div>
          </dl>
        </CardContent>
      )}

      <CardFooter className="flex-col items-stretch gap-2 border-t border-border/60 pt-4">
        <Button onClick={handleUpgrade} variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Upgrade
        </Button>

        {/* Hidden entirely (not disabled) when the user has never checked
            out — there is nothing for the Stripe Billing Portal to manage
            yet. */}
        {hasBillingAccount && (
          <StripeActionButton
            onClick={handleManageSubscription}
            isPending={isPortalPending}
            pendingLabel="Opening billing portal..."
            icon={Settings2}
            label="Manage Subscription"
            error={isPortalError ? portalError : null}
          />
        )}
      </CardFooter>
    </Card>
  )
}
