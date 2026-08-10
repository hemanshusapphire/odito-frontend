"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatJobType } from "../filters/JobFilters"

function formatAge(ms) {
  if (ms == null) return "—"
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}

/**
 * ODITO-OPS-001 §2 — one row per verification-pipeline job type. The "View"
 * action deep-links into the existing Jobs page's search box (`?search=`) —
 * verified by reading jobs/page.jsx: it seeds `search` from the URL on
 * mount but does NOT do the same for the `jobType` filter, and listJobs'
 * own $or search clauses already match jobType by regex — so `?search=`
 * with the exact type string is the one query param that actually narrows
 * the Jobs table today, without editing that page. Queue Dashboard has no
 * paginated job list of its own; it reuses that existing page instead of
 * duplicating it.
 */
export function QueueTypeRow({ row }) {
  return (
    <TableRow>
      <TableCell><Badge variant="outline">{formatJobType(row.jobType)}</Badge></TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{row.pending}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{row.processing}</TableCell>
      <TableCell className={`tabular-nums ${row.retrying > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}>
        {row.retrying}
      </TableCell>
      <TableCell className={`tabular-nums ${row.failed > 0 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
        {row.failed}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{row.completed}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{row.retryCount}</TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">{formatAge(row.oldestPending?.ageMs)}</TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">{formatAge(row.longestProcessing?.ageMs)}</TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label={`View ${row.jobType} jobs`}>
          <Link href={`/system-admin/jobs?search=${encodeURIComponent(row.jobType)}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
