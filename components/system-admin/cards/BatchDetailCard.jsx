"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { DetailRow } from "../shared/DetailRow"
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
  if (!value) return null
  return new Date(value).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
}

function formatDuration(ms) {
  if (ms == null) return "—"
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export function BatchDetailCard({ batch, project, user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Verification Batch
          {batch.isStuck && (
            <Badge variant="critical" className="gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Stuck
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Batch ID" value={<span className="font-mono text-xs">{batch.batchId}</span>} />
        <DetailRow
          label="Status"
          value={
            <Badge variant={STATUS_VARIANT[batch.status] || "secondary"} className="capitalize">
              {formatBatchStatus(batch.status)}
            </Badge>
          }
        />
        <DetailRow label="Current Stage" value={batch.currentStage} />
        <DetailRow
          label="Project"
          value={project ? <span>{project.name}</span> : "—"}
        />
        <DetailRow
          label="Started By"
          value={
            user ? (
              <Link href={`/system-admin/users/${user.id}`} className="text-primary hover:underline">
                {`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <DetailRow label="URLs" value={`${batch.completedUrls} completed / ${batch.failedUrls} failed / ${batch.totalUrls} total`} />
        <DetailRow label="Duration" value={formatDuration(batch.durationMs)} />
        <DetailRow label="Created" value={formatDate(batch.createdAt)} />
        <DetailRow label="Started" value={formatDate(batch.startedAt) || "—"} />
        <DetailRow label="Aggregation Started" value={formatDate(batch.aggregateStartedAt) || "—"} />
        <DetailRow label="Aggregation Completed" value={formatDate(batch.aggregateCompletedAt) || "—"} />
        <DetailRow label="Completed" value={formatDate(batch.completedAt) || "—"} />
      </CardContent>
    </Card>
  )
}
