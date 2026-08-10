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

export function UserSubscriptionCard({ subscription }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Plan" value={subscription.plan || "No plan"} />
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
      </CardContent>
    </Card>
  )
}
