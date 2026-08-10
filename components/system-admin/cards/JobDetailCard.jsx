"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"
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
  if (!value) return null
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function formatDuration(ms) {
  if (ms == null) return "—"
  if (ms < 1000) return `${ms}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export function JobDetailCard({ job }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Job</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Type" value={<Badge variant="outline">{formatJobType(job.jobType)}</Badge>} />
        <DetailRow
          label="Status"
          value={
            <Badge variant={STATUS_VARIANT[job.status] || "secondary"} className="capitalize">
              {job.status}
            </Badge>
          }
        />
        {/* Project Management (/system-admin/projects) has no detail route
            yet — only the name is shown, not linked, to avoid pointing at a
            page that doesn't exist. */}
        <DetailRow label="Project" value={job.project?.name || "—"} />
        <DetailRow
          label="User"
          value={
            job.user ? (
              <Link href={`/system-admin/users/${job.user.id}`} className="text-primary hover:underline">
                {`${job.user.firstName || ""} ${job.user.lastName || ""}`.trim() || job.user.email}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <DetailRow label="Retry Count" value={`${job.attempts} / ${job.maxAttempts}`} />
        <DetailRow label="Duration" value={formatDuration(job.durationMs)} />
        <DetailRow label="Created" value={formatDate(job.createdAt)} />
        <DetailRow label="Started" value={formatDate(job.startedAt) || "—"} />
        <DetailRow label="Completed" value={formatDate(job.completedAt) || "—"} />
        {job.failureReason && (
          <DetailRow label="Failure Reason" value={<span className="text-destructive">{job.failureReason}</span>} />
        )}
      </CardContent>
    </Card>
  )
}
