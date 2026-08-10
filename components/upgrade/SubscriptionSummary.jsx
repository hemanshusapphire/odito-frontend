"use client"

import { Coins, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT = {
  active: "success",
  past_due: "warning",
  paused: "warning",
  canceled: "critical",
  inactive: "outline",
}

const STATUS_LABEL = {
  active: "Active",
  past_due: "Past Due",
  paused: "Paused",
  canceled: "Canceled",
  inactive: "No Active Subscription",
}

/**
 * "Current Subscription Summary" — reads the exact response shape
 * GET /api/subscription already returns (see useSubscription() in
 * useDashboardQueries.js): {plan, status, credits:{limit,used,remaining},
 * pages:{limit,used,remaining}, billing}. No new fetch, no new endpoint.
 *
 * "Next Renewal" is intentionally NOT rendered: the backend's
 * getMySubscription() does not return a renewal/current-period-end date
 * today (that field only exists on the System Admin detail view, via a
 * separate live Stripe call — fetchSubscriptionRenewalInfo() — not this
 * endpoint). Showing a fabricated or "N/A" row for data that structurally
 * doesn't exist would be worse than omitting it; the task's own spec says
 * "if available," and today it isn't.
 */
export default function SubscriptionSummary({ subscription }) {
  const plan = subscription?.plan
  const status = subscription?.status || "inactive"
  const credits = subscription?.credits
  const pages = subscription?.pages

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Plan</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              {plan?.name || "No active plan"}
            </span>
            <Badge variant={STATUS_VARIANT[status] || "outline"}>
              {STATUS_LABEL[status] || status}
            </Badge>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Credits</p>
              <p className="text-sm font-medium text-foreground">
                {credits ? `${credits.remaining} / ${credits.limit} left` : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pages</p>
              <p className="text-sm font-medium text-foreground">
                {pages ? `${pages.remaining} / ${pages.limit} left` : "—"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
