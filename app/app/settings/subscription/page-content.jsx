"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Coins, FileText, AlertTriangle, ShoppingCart } from "lucide-react"
import { useSubscription } from "@/hooks/useDashboardQueries"
import { useBuyPagesFlow } from "@/hooks/useBuyPagesFlow"
import { useBuyCreditsFlow } from "@/hooks/useBuyCreditsFlow"
import SettingsTabs from "@/components/settings/SettingsTabs"
import SubscriptionOverviewCard from "@/components/settings/subscription/SubscriptionOverviewCard"
import UsageCard from "@/components/settings/subscription/UsageCard"
import PlanSummaryCard from "@/components/settings/subscription/PlanSummaryCard"
import BillingHistoryCard from "@/components/settings/subscription/BillingHistoryCard"
import BuyPagesModal from "@/components/billing/BuyPagesModal"
import CreditsPurchaseModal from "@/components/billing/CreditsPurchaseModal"
import PurchaseToast from "@/components/billing/PurchaseToast"

function SkeletonCard({ lines = 3 }) {
  return (
    <div className="rounded-xl border p-6 space-y-3">
      <div className="w-40 h-5 skeleton-base skeleton-shimmer rounded" />
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
      ))}
    </div>
  )
}

// Mirrors the real layout's exact row shape (2-col, 2-col, full-width) so
// there is no visual jump when the real cards replace these skeletons.
function SubscriptionSkeleton() {
  return (
    <div className="max-w-4xl space-y-6 skeleton-fade-in">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
      <SkeletonCard lines={4} />
    </div>
  )
}

export default function SubscriptionPageContent() {
  const { data: response, isLoading, isError, error, refetch } = useSubscription()
  const subscription = response?.data
  const router = useRouter()
  const searchParams = useSearchParams()

  // "Buy Additional Pages" — the exact same modal + flow URL Selection
  // uses (hooks/useBuyPagesFlow.js), just returning here instead of to a
  // project. No second purchase implementation exists.
  const {
    open: buyPagesModalOpen,
    setOpen: setBuyPagesModalOpen,
    handleContinue: handleBuyPagesContinue,
    toast: pagesToast,
    clearToast: clearPagesToast,
  } = useBuyPagesFlow({ returnPath: '/settings/subscription' })

  // "Buy Credits" — the exact same modal + flow architecture as Buy Pages
  // (hooks/useBuyCreditsFlow.js mirrors hooks/useBuyPagesFlow.js; see
  // Phase 17). No second purchase implementation exists.
  const {
    open: buyCreditsModalOpen,
    setOpen: setBuyCreditsModalOpen,
    handleContinue: handleBuyCreditsContinue,
    toast: creditsToast,
    clearToast: clearCreditsToast,
  } = useBuyCreditsFlow({ returnPath: '/settings/subscription' })

  // Phase 15.5: Stripe Checkout's success/cancel URLs are hardcoded
  // server-side to this page (see subscriptionController.js
  // createCheckoutSession) — there is no way to give onboarding its own
  // return URL without touching checkout/billing logic, which this fix is
  // explicitly not allowed to do. Instead, onboarding's zero-credit Upgrade
  // CTA marks a sessionStorage flag right before redirecting to Stripe; if
  // that flag is present when Stripe lands the user back here, this bounces
  // them straight back to /onboarding (which reads and clears the same
  // flag) instead of showing them the Settings page. A normal Settings-page
  // upgrade never sets this flag, so this is a no-op for every other case.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasCheckoutResult = searchParams.get('success') === 'true' || searchParams.get('cancelled') === 'true'
    if (hasCheckoutResult && sessionStorage.getItem('onboarding_upgrade_resume')) {
      router.replace('/onboarding')
    }
  }, [searchParams, router])

  return (
    <div className="space-y-6">
      <SettingsTabs />

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and usage.</p>
      </div>

      {isLoading && <SubscriptionSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3 max-w-4xl">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load your subscription</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching your plan details."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && !subscription && (
        <div className="rounded-xl border p-8 text-center space-y-2 max-w-4xl">
          <p className="text-muted-foreground">No subscription information is available for your account.</p>
        </div>
      )}

      {!isLoading && !isError && subscription && (
        <div className="max-w-4xl space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SubscriptionOverviewCard plan={subscription.plan} status={subscription.status} />
            <PlanSummaryCard plan={subscription.plan} hasBillingAccount={subscription.billing?.hasBillingAccount} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UsageCard
              icon={Coins}
              title="Credits"
              description="1 credit is used each time you create a project."
              remaining={subscription.credits.remaining}
              used={subscription.credits.used}
              total={subscription.credits.limit}
              actionLabel="Buy Credits"
              actionIcon={ShoppingCart}
              onAction={() => setBuyCreditsModalOpen(true)}
            />
            <UsageCard
              icon={FileText}
              title="Pages"
              description="Pages are used when you approve URLs for crawling."
              remaining={subscription.pages.remaining}
              used={subscription.pages.used}
              total={subscription.pages.limit}
              actionLabel="Buy Additional Pages"
              actionIcon={ShoppingCart}
              onAction={() => setBuyPagesModalOpen(true)}
            />
          </div>

          <BillingHistoryCard />
        </div>
      )}

      <BuyPagesModal
        open={buyPagesModalOpen}
        onClose={() => setBuyPagesModalOpen(false)}
        currentPagesLimit={subscription?.pages?.limit ?? 0}
        onContinue={handleBuyPagesContinue}
      />

      <CreditsPurchaseModal
        open={buyCreditsModalOpen}
        onClose={() => setBuyCreditsModalOpen(false)}
        currentCreditsLimit={subscription?.credits?.limit ?? 0}
        onContinue={handleBuyCreditsContinue}
      />

      {pagesToast && (
        <PurchaseToast message={pagesToast.message} type={pagesToast.type} onClose={clearPagesToast} />
      )}
      {creditsToast && (
        <PurchaseToast message={creditsToast.message} type={creditsToast.type} onClose={clearCreditsToast} />
      )}
    </div>
  )
}
