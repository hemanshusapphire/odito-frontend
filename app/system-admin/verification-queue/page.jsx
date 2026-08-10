"use client"

import { AlertTriangle, ListOrdered } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { QueueTable } from "@/components/system-admin/tables/QueueTable"
import { SystemStatCard } from "@/components/system-admin/cards/SystemStatCard"
import { useSystemAdminVerificationQueueSummary } from "@/hooks/system-admin/verificationOps"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * ODITO-OPS-001 §2 — Queue Dashboard. Live counts by job type, refreshed on
 * a short interval (see useSystemAdminVerificationQueueSummary's REALTIME
 * staleTime) since queue depth is exactly the kind of number that goes
 * stale fast during an incident. Read-only — no retry/requeue action here.
 */
export default function SystemAdminVerificationQueuePage() {
  const { data: response, isLoading, isError, error, refetch } = useSystemAdminVerificationQueueSummary()
  const summary = response?.data

  return (
    <>
      <AdminPagePlaceholder
        title="Verification Queue Dashboard"
        description="Live job counts by type — auto-refreshes every 10 seconds"
      />

      <div className="flex flex-col gap-6">
        {summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SystemStatCard icon={ListOrdered} label="Total Queue Depth" value={summary.queueDepth} tone="blue" />
          </div>
        )}

        {isLoading && !summary && <TableSkeleton />}

        {isError && !isLoading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="text-foreground font-medium">Couldn&apos;t load the queue</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Something went wrong while fetching queue data."}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        {summary && <QueueTable rows={summary.byType} />}
      </div>
    </>
  )
}
