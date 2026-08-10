"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatJobType } from "../filters/JobFilters"

const STATUS_VARIANT = {
  pending: "outline", claimed: "info", processing: "info",
  retrying: "warning", completed: "success", failed: "critical",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

/**
 * ODITO-OPS-001 — every Job stamped with this batch's batchId
 * (input_data.batchId), across BOTH the per-page pipeline (PAGE_SCRAPING…
 * AI_VISIBILITY) and the project aggregation chain
 * (PROJECT_SEO_AGGREGATION → PROJECT_AI_AGGREGATION →
 * PROJECT_TASK_VERIFICATION) — correlated by jobId for cross-referencing
 * with the Queue Dashboard.
 */
export function BatchJobsCard({ jobs }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Jobs ({jobs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Failure Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell><Badge variant="outline">{formatJobType(job.jobType)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[job.status] || "secondary"} className="capitalize">
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{job.attempts}/{job.maxAttempts}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(job.createdAt)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(job.completedAt)}</TableCell>
                  <TableCell className="text-destructive truncate max-w-40">{job.failureReason || "—"}</TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No jobs recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
