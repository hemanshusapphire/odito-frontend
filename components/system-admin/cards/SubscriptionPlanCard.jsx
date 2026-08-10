"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"

const STATUS_VARIANT = {
  active: "success",
  past_due: "warning",
  paused: "warning",
  canceled: "critical",
  inactive: "outline",
}

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function renewalLabel(renewal) {
  // No local renewal date is stored — this is a live, best-effort Stripe
  // fetch (see stripeService.fetchSubscriptionRenewalInfo) that returns
  // null on any failure or when there's no Stripe subscription at all.
  if (!renewal) return "—"
  if (renewal.cancelAtPeriodEnd && renewal.renewsAt) return `Cancels on ${formatDate(renewal.renewsAt)}`
  if (renewal.renewsAt) return `Renews on ${formatDate(renewal.renewsAt)}`
  return "—"
}

export function SubscriptionPlanCard({ subscription }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Plan" value={subscription.plan?.name || "No plan"} />
        <DetailRow
          label="Status"
          value={
            <Badge variant={STATUS_VARIANT[subscription.status] || "outline"} className="capitalize">
              {subscription.status}
            </Badge>
          }
        />
        <DetailRow label="Stripe Customer" value={subscription.stripeCustomerId} />
        <DetailRow label="Stripe Subscription" value={subscription.stripeSubscriptionId} />
        <DetailRow label="Renewal" value={renewalLabel(subscription.renewal)} />
      </CardContent>
    </Card>
  )
}
