"use client"

import { History } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT = {
  succeeded: "success",
  failed: "critical",
  canceled: "warning",
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return value
  }
}

function formatAmount(cents) {
  if (cents == null) return null
  return (cents / 100).toFixed(2)
}

/**
 * Reuses Transaction as-is (no new timeline model, no duplicated event
 * generation) — `events` is systemAdminSubscriptionService's
 * `recentTransactions`, already labeled (checkout -> "Activated", etc.) on
 * the backend so this component only renders, never re-derives labels.
 */
export function SubscriptionTimelineCard({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-4 w-4 text-muted-foreground" />
          Timeline
        </CardTitle>
        <CardDescription>Recent subscription lifecycle events.</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-muted-foreground text-sm">No lifecycle events yet.</p>
          </div>
        ) : (
          <ol className="border-l border-border/60 pl-5">
            {events.map((event) => (
              <li key={event.id} className="relative pb-5 last:pb-0">
                <span className="absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{event.label}</span>
                  <Badge variant={STATUS_VARIANT[event.status] || "secondary"} className="text-[10px] capitalize">
                    {event.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(event.date)}
                  {event.amount != null && ` · $${formatAmount(event.amount)} ${event.currency?.toUpperCase() || ""}`}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
