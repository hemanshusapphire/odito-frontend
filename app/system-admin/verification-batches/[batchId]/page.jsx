"use client"

import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { BatchDetailCard } from "@/components/system-admin/cards/BatchDetailCard"
import { BatchRunsCard } from "@/components/system-admin/cards/BatchRunsCard"
import { BatchJobsCard } from "@/components/system-admin/cards/BatchJobsCard"
import { BatchTimelineCard } from "@/components/system-admin/cards/BatchTimelineCard"
import { BatchRecoveryEventsCard } from "@/components/system-admin/cards/BatchRecoveryEventsCard"
import { useSystemAdminVerificationBatchDetail } from "@/hooks/system-admin/verificationOps"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function DetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * ODITO-OPS-001 §5 — Batch Detail View. VerificationBatch → PageVerificationRuns
 * → Jobs → Timeline → Recovery events, everything correlated by batchId/
 * runId/jobId, all read directly from useSystemAdminVerificationBatchDetail's
 * one response (systemAdminVerificationOpsService.getBatchDetail).
 */
export default function SystemAdminVerificationBatchDetailPage() {
  const { batchId } = useParams()
  const router = useRouter()

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminVerificationBatchDetail(batchId)
  const detail = response?.data

  const breadcrumbs = [
    { label: "Verification Batches", href: "/system-admin/verification-batches" },
    { label: detail ? detail.batch.batchId : "Loading..." },
  ]

  return (
    <>
      <AdminPagePlaceholder title="Verification Batch" breadcrumbs={breadcrumbs}>
        <Button variant="outline" size="sm" onClick={() => router.push("/system-admin/verification-batches")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </Button>
      </AdminPagePlaceholder>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this batch</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this batch."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && detail && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <BatchDetailCard batch={detail.batch} project={detail.project} user={detail.user} />
          </div>
          <BatchTimelineCard timeline={detail.timeline} />
          <BatchRecoveryEventsCard events={detail.recoveryEvents} />
          <div className="lg:col-span-2">
            <BatchRunsCard runs={detail.runs} />
          </div>
          <div className="lg:col-span-2">
            <BatchJobsCard jobs={detail.jobs} />
          </div>
        </div>
      )}
    </>
  )
}
