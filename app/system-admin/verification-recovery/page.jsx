"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Info } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AdminPagination } from "@/components/system-admin/shared/AdminPagination"
import { RecoveryEventTable } from "@/components/system-admin/tables/RecoveryEventTable"
import { RecoverySummaryCard } from "@/components/system-admin/cards/RecoverySummaryCard"
import {
  useSystemAdminVerificationRecoveryEvents,
  useSystemAdminVerificationRecoverySummary,
} from "@/hooks/system-admin/verificationOps"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * ODITO-OPS-001 §3 — Recovery Dashboard. Surfaces what's actually derivable
 * from persisted Job data today (retry reclaimed, stale locks recovered,
 * orphaned jobs recovered) and explicitly names what is NOT (batch/
 * aggregation resumes, duplicate-recovery-avoided — log-line-only, no
 * schema change was made to persist them this phase) rather than silently
 * omitting or fabricating those categories.
 */
export default function SystemAdminVerificationRecoveryPage() {
  const [page, setPage] = useState(1)
  const params = useMemo(() => ({ page, limit: 50 }), [page])

  const { data: summaryResponse, isLoading: summaryLoading } = useSystemAdminVerificationRecoverySummary()
  const summary = summaryResponse?.data

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminVerificationRecoveryEvents(params)
  const events = response?.data?.events || []
  const pagination = response?.data?.pagination
  const unavailable = response?.data?.unavailable || []

  return (
    <>
      <AdminPagePlaceholder
        title="Recovery Dashboard"
        description={pagination ? `${pagination.total} recovery events` : "Retry & recovery activity — read only"}
      />

      <div className="flex flex-col gap-6">
        {summaryLoading || !summary ? <SummarySkeleton /> : <RecoverySummaryCard summary={summary} />}

        {unavailable.length > 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Not shown here (no persisted trace exists yet — log-line-only):{" "}
              {unavailable.map((u) => u.replace(/_/g, " ")).join(", ")}.
            </p>
          </div>
        )}

        {isLoading && <TableSkeleton />}

        {isError && !isLoading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="text-foreground font-medium">Couldn&apos;t load recovery events</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Something went wrong while fetching recovery events."}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <RecoveryEventTable events={events} />

            {pagination && (
              <AdminPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}
