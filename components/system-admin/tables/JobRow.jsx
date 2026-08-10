"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatJobType } from "../filters/JobFilters"

const STATUS_VARIANT = {
  pending: "outline",
  claimed: "info",
  processing: "info",
  retrying: "warning",
  completed: "success",
  failed: "critical",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function JobRow({ job }) {
  return (
    <TableRow>
      <TableCell>
        <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[job.status] || "secondary"} className="capitalize">
          {job.status}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">{job.project?.name || "—"}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">
        {job.user ? `${job.user.firstName || ""} ${job.user.lastName || ""}`.trim() || job.user.email : "—"}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {job.attempts}/{job.maxAttempts}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(job.createdAt)}</TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View job">
          <Link href={`/system-admin/jobs/${job.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
