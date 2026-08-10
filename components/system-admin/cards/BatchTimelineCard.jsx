"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Circle } from "lucide-react"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
}

/**
 * ODITO-OPS-001 §8 — one entry per pipeline stage this batch actually
 * reached, in chronological order, exactly as
 * systemAdminVerificationOpsService.buildTimeline derived it from real
 * Job/VerificationBatch timestamps — nothing here is estimated or
 * reconstructed client-side.
 */
export function BatchTimelineCard({ timeline }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-border/60 pl-5 space-y-4">
          {timeline.map((entry, i) => (
            <li key={`${entry.stage}-${i}`} className="relative">
              <Circle className="absolute -left-[1.45rem] top-1 h-3 w-3 fill-primary text-primary" />
              <p className="text-sm font-medium text-foreground">{entry.stage}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{formatDate(entry.timestamp)}</p>
            </li>
          ))}
          {timeline.length === 0 && <p className="text-sm text-muted-foreground">No timeline data available.</p>}
        </ol>
      </CardContent>
    </Card>
  )
}
