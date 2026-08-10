"use client"

import { useRouter } from "next/navigation"
import { Settings2 } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/useDashboardQueries"
import SubscriptionOverviewCard from "@/components/settings/subscription/SubscriptionOverviewCard"

/**
 * Subscription Summary — Phase 1 scope only: Current Plan (the exact same
 * SubscriptionOverviewCard the Subscription tab already renders, not a
 * re-implementation) plus a compact Credits/Pages remaining readout, both
 * sourced from the one existing useSubscription() query. No second fetch,
 * no Stripe call here — "Manage Subscription" is plain in-app navigation to
 * the full Subscription tab, which already owns Upgrade/Billing Portal.
 * Renewal Date is intentionally omitted (Phase 2 — see forensic audit: no
 * renewal-date data exists anywhere in the app yet).
 */
export default function SubscriptionSummaryCard() {
  const router = useRouter()
  const { data: response, isLoading, isError } = useSubscription()
  const subscription = response?.data

  return (
    <div className="space-y-6">
      <SubscriptionOverviewCard plan={subscription?.plan} status={subscription?.status} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage</CardTitle>
          <CardDescription>Your current credits and pages balance.</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-full skeleton-base skeleton-shimmer rounded" />
              <div className="h-4 w-full skeleton-base skeleton-shimmer rounded" />
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">Couldn&apos;t load usage data.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Credits Remaining</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {subscription?.credits?.remaining ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pages Remaining</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {subscription?.pages?.remaining ?? 0}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/60 pt-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/app/settings/subscription")}
          >
            <Settings2 className="h-4 w-4" />
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
