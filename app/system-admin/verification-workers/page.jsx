"use client"

import { AlertTriangle } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { WorkerHealthCard } from "@/components/system-admin/cards/WorkerHealthCard"
import { useSystemAdminVerificationWorkerHealth } from "@/hooks/system-admin/verificationOps"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * ODITO-OPS-001 §4 — Worker Health. Auto-refreshes every 10 seconds (see
 * useSystemAdminVerificationWorkerHealth's REALTIME staleTime) — this is
 * the one page an operator watches live during an incident.
 */
export default function SystemAdminVerificationWorkersPage() {
  const { data: response, isLoading, isError, error, refetch } = useSystemAdminVerificationWorkerHealth()
  const health = response?.data

  return (
    <>
      <AdminPagePlaceholder
        title="Worker Health"
        description="Node scheduler status and a Python worker activity heuristic — auto-refreshes every 10 seconds"
      />

      {isLoading && !health && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load worker health</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching worker health."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {health && <WorkerHealthCard health={health} />}
    </>
  )
}
