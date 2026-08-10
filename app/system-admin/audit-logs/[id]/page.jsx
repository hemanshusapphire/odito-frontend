"use client"

import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AuditDetailCard } from "@/components/system-admin/cards/AuditDetailCard"
import { useSystemAdminAuditLog } from "@/hooks/system-admin/operations"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatAuditAction } from "@/components/system-admin/filters/AuditFilters"

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

export default function SystemAdminAuditLogDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminAuditLog(id)
  const log = response?.data

  const breadcrumbs = [
    { label: "Audit Logs", href: "/system-admin/audit-logs" },
    { label: log ? formatAuditAction(log.action) : "Loading..." },
  ]

  return (
    <>
      <AdminPagePlaceholder title="Audit Log Entry" breadcrumbs={breadcrumbs}>
        <Button variant="outline" size="sm" onClick={() => router.push("/system-admin/audit-logs")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Audit Logs
        </Button>
      </AdminPagePlaceholder>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this audit log entry</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this audit log entry."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && log && (
        <div className="max-w-2xl">
          <AuditDetailCard log={log} />
        </div>
      )}
    </>
  )
}
