"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT = { pending: "outline", running: "info", completed: "success", failed: "critical" }

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

/**
 * ODITO-OPS-001 — one row per PageVerificationRun in this batch, correlated
 * by runId (shown for cross-referencing with logs/support tickets).
 */
export function BatchRunsCard({ runs }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Page Verification Runs ({runs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Run ID</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.runId}>
                  <TableCell className="text-muted-foreground truncate max-w-56">{run.pageUrl}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[run.status] || "secondary"} className="capitalize">
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-28">{run.runId}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(run.startedAt)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(run.completedAt)}</TableCell>
                  <TableCell className="text-destructive truncate max-w-40">{run.errorMessage || "—"}</TableCell>
                </TableRow>
              ))}
              {runs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No runs recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
