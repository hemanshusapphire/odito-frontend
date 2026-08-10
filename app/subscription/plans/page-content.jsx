"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  useSubscription,
  usePlans,
  useCreateCheckoutSession,
  useChangePlan,
  useCreateBillingPortalSession,
} from "@/hooks/useDashboardQueries"
import { ONBOARDING_UPGRADE_PENDING_KEY, ONBOARDING_UPGRADE_RESUME_KEY } from "@/lib/onboardingResume"
import SubscriptionSummary from "@/components/upgrade/SubscriptionSummary"
import PricingGrid from "@/components/upgrade/PricingGrid"
import PlanConfirmDialog from "@/components/upgrade/PlanConfirmDialog"
import ChoosePlanSkeleton from "@/components/upgrade/ChoosePlanSkeleton"
import PurchaseToast from "@/components/billing/PurchaseToast"

// Statuses that block checkout/change-plan and must be resolved via the
// Billing Portal first — mirrors subscriptionLifecycle.js's canChangePlan()
// gate (only 'active' passes there), narrowed here to the two statuses that
// mean "an existing subscription has a real payment problem" as opposed to
// 'canceled'/'inactive', which have no live Stripe subscription to protect
// and are correctly treated as a fresh checkout (Case A) instead.
const BLOCKED_STATUSES = ["past_due", "paused"]

const ERROR_MESSAGES = {
  ALREADY_SUBSCRIBED: (msg) => msg || "You already have an active subscription. Try switching plans instead.",
}

function getErrorMessage(error, fallback) {
  if (!error) return null
  return ERROR_MESSAGES[error.code]?.(error.message) || error.message || fallback
}

function AuthCheckingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  )
}

/**
 * Phase 3 — the Choose Plan page's real CTA behavior, replacing Phase 2's
 * console.log/toast stub. Every mutation here reuses an existing hook
 * (useCreateCheckoutSession, useChangePlan, useCreateBillingPortalSession)
 * — no new endpoint, no new checkout flow, no webhook change.
 *
 * Onboarding hand-off: if the user arrived here via ARIAChat.jsx's
 * zero-credit Upgrade CTA, a staging sessionStorage key
 * (ONBOARDING_UPGRADE_PENDING_KEY) holds the resume payload. This page
 * copies it into the final ONBOARDING_UPGRADE_RESUME_KEY — the key
 * /settings/subscription/page-content.jsx already reads on mount, and
 * ARIAChat.jsx already restores from on mount, both entirely unchanged —
 * at the exact moment a return-to-onboarding is actually about to happen:
 * right before the Stripe redirect (Case A) or right before navigating
 * back directly (Case B, no external redirect involved). A normal,
 * non-onboarding visit finds nothing in the staging key and this is a
 * complete no-op.
 *
 * Routing note: this page deliberately lives OUTSIDE the (dashboard) route
 * group at /subscription/plans (not /settings/subscription/plans). A user
 * arriving here from onboarding has zero projects, and (dashboard)/layout's
 * AuthGuard unconditionally redirects any authenticated user with no
 * projects to /onboarding — which made this page unreachable from the exact
 * CTA that's supposed to open it. The auth check below (mirroring the same
 * inline pattern app/projects/[projectId]/url-selection/client.jsx already
 * uses for the identical problem) replaces AuthGuard's role here: it
 * enforces login without ever checking hasProjects, so both a mid-onboarding
 * user and a full dashboard user can reach this same page.
 */
export default function ChoosePlanPageContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const { data: subResponse, isLoading: isSubLoading, isError: isSubError, error: subError, refetch: refetchSub } = useSubscription()
  const { data: plansResponse, isLoading: isPlansLoading, isError: isPlansError, error: plansError, refetch: refetchPlans } = usePlans()

  const createCheckout = useCreateCheckoutSession()
  const changePlan = useChangePlan()
  const billingPortal = useCreateBillingPortalSession()

  const [confirmingPlan, setConfirmingPlan] = useState(null)
  const [confirmError, setConfirmError] = useState(null)
  const [toast, setToast] = useState(null)

  const subscription = subResponse?.data
  const plans = plansResponse?.data || []

  const isLoading = isSubLoading || isPlansLoading
  const isError = isSubError || isPlansError

  const currentPlan = subscription?.plan || null
  const hasActiveSubscription = subscription?.status === "active" && !!currentPlan
  const isBlockedStatus = BLOCKED_STATUSES.includes(subscription?.status)
  const isMutating = createCheckout.isPending || changePlan.isPending || billingPortal.isPending

  function consumeOnboardingPendingPayload() {
    if (typeof window === "undefined") return null
    const raw = sessionStorage.getItem(ONBOARDING_UPGRADE_PENDING_KEY)
    if (!raw) return null
    sessionStorage.removeItem(ONBOARDING_UPGRADE_PENDING_KEY)
    return raw
  }

  const handleOpenBillingPortal = () => {
    billingPortal.mutate(undefined, {
      onSuccess: (response) => {
        const portalUrl = response?.data?.portalUrl
        if (portalUrl) {
          window.location.href = portalUrl
        } else {
          setToast({ type: "error", message: "Couldn't open the billing portal. Please try again." })
        }
      },
      onError: (error) => {
        setToast({ type: "error", message: getErrorMessage(error, "Couldn't open the billing portal. Please try again.") })
      },
    })
  }

  const handleChoosePlan = (plan) => {
    // Case D: a blocked billing status routes straight to the Billing
    // Portal — no confirmation dialog, matching PlanSummaryCard's existing
    // "Manage Subscription" button (also a direct action, no dialog).
    if (isBlockedStatus) {
      handleOpenBillingPortal()
      return
    }
    setConfirmError(null)
    setConfirmingPlan(plan)
  }

  const handleConfirmPlan = (plan) => {
    setConfirmError(null)

    if (hasActiveSubscription) {
      // Case B — existing subscriber switching plans. Reuses the existing
      // change-plan endpoint; never creates a second Checkout Session.
      changePlan.mutate(plan.id, {
        onSuccess: () => {
          const pending = consumeOnboardingPendingPayload()
          setConfirmingPlan(null)
          if (pending) {
            // No external redirect happens for a change-plan — resume
            // directly, same final key ARIAChat.jsx already restores from.
            sessionStorage.setItem(ONBOARDING_UPGRADE_RESUME_KEY, pending)
            router.push("/onboarding")
            return
          }
          setToast({ type: "success", message: `You're now on the ${plan.name} plan.` })
        },
        onError: (error) => {
          setConfirmError(getErrorMessage(error, "Failed to change your plan. Please try again."))
        },
      })
      return
    }

    // Case A — no active subscription (never subscribed, or canceled with
    // no live Stripe subscription to modify) → a brand-new Checkout Session.
    createCheckout.mutate(plan.id, {
      onSuccess: (response) => {
        const checkoutUrl = response?.data?.checkoutUrl
        if (!checkoutUrl) {
          setConfirmError("Failed to start checkout. Please try again.")
          return
        }
        const pending = consumeOnboardingPendingPayload()
        if (pending) {
          sessionStorage.setItem(ONBOARDING_UPGRADE_RESUME_KEY, pending)
        }
        window.location.href = checkoutUrl
        // No need to close the dialog or reset state — the page is navigating away.
      },
      onError: (error) => {
        setConfirmError(getErrorMessage(error, "Failed to start checkout. Please try again."))
      },
    })
  }

  if (authLoading || !isAuthenticated) {
    return <AuthCheckingState />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Choose the perfect plan</h1>
        <p className="text-muted-foreground">Scale your AI-powered SEO audits as your business grows.</p>
      </div>

      {isLoading && <ChoosePlanSkeleton />}

      {isError && !isLoading && (
        <div className="max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="font-medium text-foreground">Couldn&apos;t load plans</p>
          <p className="text-sm text-muted-foreground">
            {(isSubError && subError?.message) || (isPlansError && plansError?.message) || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={() => {
              refetchSub()
              refetchPlans()
            }}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && plans.length === 0 && (
        <div className="max-w-2xl rounded-xl border border-border p-8 text-center space-y-2">
          <p className="text-muted-foreground">No plans are available right now. Please check back shortly.</p>
        </div>
      )}

      {!isLoading && !isError && plans.length > 0 && (
        <div className="space-y-8">
          <SubscriptionSummary subscription={subscription} />

          {isBlockedStatus && (
            <div className="max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400">
              There&apos;s a billing issue with your subscription. Resolve it in the Billing Portal before
              switching plans.
            </div>
          )}

          <PricingGrid
            plans={plans}
            currentPlanId={currentPlan?.id ?? null}
            isBlocked={isBlockedStatus}
            isMutating={isMutating}
            onChoosePlan={handleChoosePlan}
          />
        </div>
      )}

      <PlanConfirmDialog
        plan={confirmingPlan}
        currentPlan={currentPlan}
        mode={hasActiveSubscription ? "change" : "subscribe"}
        open={!!confirmingPlan}
        onOpenChange={(open) => { if (!open) { setConfirmingPlan(null); setConfirmError(null) } }}
        onConfirm={handleConfirmPlan}
        isPending={createCheckout.isPending || changePlan.isPending}
        errorMessage={confirmError}
      />

      {toast && (
        <PurchaseToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
