"use client"

import { CreditCard } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrencyAmount } from "@/lib/subscription"

const STATUS_VARIANT = {
  active: "success",
  paused: "warning",
  canceled: "critical",
  past_due: "warning",
}

// CSS `capitalize` only capitalizes per whitespace-separated word, so
// "past_due" would otherwise render as "Past_due" — a plain label map for
// the one status value with an underscore, not a badge redesign.
const STATUS_LABEL = {
  past_due: "Past due",
  inactive: "No subscription",
}

/**
 * Current Plan card — plan name, status, monthly price, billing interval.
 * Every value comes from GET /subscription's `plan`/`status` — nothing here
 * hardcodes a plan name or price.
 *
 * Starter is a paid plan, not a free default (Phase 15.6) — a
 * never-subscribed (or fully-lapsed) user has `plan: null` and
 * `status: "inactive"`. No placeholder plan is ever invented here.
 */
export default function SubscriptionOverviewCard({ plan, status }) {
  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Current Plan
          </CardTitle>
          <CardDescription>Subscribe to unlock projects and audits.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">No Active Subscription</span>
            <Badge variant={STATUS_VARIANT[status] || "secondary"} className="capitalize">
              {STATUS_LABEL[status] || status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          Current Plan
        </CardTitle>
        {plan.description && <CardDescription>{plan.description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">{plan.name}</span>
          <Badge variant={STATUS_VARIANT[status] || "secondary"} className="capitalize">
            {STATUS_LABEL[status] || status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Monthly Price</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {formatCurrencyAmount(plan.price, plan.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Billing Interval</p>
            <p className="text-lg font-semibold capitalize text-foreground">{plan.billingInterval}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
