"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { RotateCcw } from "lucide-react"
import { formatJobType } from "../filters/JobFilters"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

/**
 * ODITO-OPS-001 §3/§5 — recovery events derived from persisted Job error
 * markers for THIS batch specifically. See
 * systemAdminVerificationOpsService.js's own comment: batch-resumed/
 * aggregation-resumed/duplicate-recovery-avoided have no persisted trace
 * (log-line-only) and are not shown here — this is a real gap, not a
 * silent omission, called out below rather than faked.
 */
export function BatchRecoveryEventsCard({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          Recovery Events ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length > 0 ? (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell><span className="text-muted-foreground">{formatJobType(event.jobType)}</span></TableCell>
                    <TableCell className="text-foreground">{event.reason}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(event.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recovery activity recorded for this batch.</p>
        )}
        <p className="text-xs text-muted-foreground italic">
          Batch-resumed, aggregation-resumed, and duplicate-recovery-avoided events are not shown here —
          they exist only as log lines today, not persisted data (see the Recovery Dashboard for details).
        </p>
      </CardContent>
    </Card>
  )
}
