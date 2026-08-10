"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatJobType } from "../filters/JobFilters"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function RecoveryEventRow({ event }) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(event.timestamp)}</TableCell>
      <TableCell className="text-foreground">{event.reason}</TableCell>
      <TableCell className="text-muted-foreground">{formatJobType(event.jobType)}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-32">{event.batchId || "—"}</TableCell>
      <TableCell>
        {event.batchId ? (
          <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View batch">
            <Link href={`/system-admin/verification-batches/${event.batchId}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}
