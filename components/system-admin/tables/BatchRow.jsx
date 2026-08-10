"use client"

import Link from "next/link"
import { Eye, AlertTriangle } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBatchStatus } from "../filters/BatchFilters"

const STATUS_VARIANT = {
  pending: "outline",
  running: "info",
  aggregating: "info",
  completed: "success",
  partial: "warning",
  failed: "critical",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function formatDuration(ms) {
  if (ms == null) return "—"
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export function BatchRow({ batch }) {
  return (
    <TableRow className={batch.isStuck ? "bg-destructive/5" : undefined}>
      <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-36">{batch.batchId}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Badge variant={STATUS_VARIANT[batch.status] || "secondary"} className="capitalize">
            {batch.status}
          </Badge>
          {batch.isStuck && (
            <span title="Stuck in AGGREGATING beyond the threshold">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">{batch.project?.name || "—"}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">
        {batch.user ? `${batch.user.firstName || ""} ${batch.user.lastName || ""}`.trim() || batch.user.email : "—"}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {batch.completedUrls}/{batch.totalUrls}
        {batch.failedUrls > 0 && <span className="text-destructive"> ({batch.failedUrls} failed)</span>}
      </TableCell>
      <TableCell className="text-muted-foreground">{batch.currentStage}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{formatDuration(batch.durationMs)}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(batch.createdAt)}</TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View batch">
          <Link href={`/system-admin/verification-batches/${batch.batchId}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
