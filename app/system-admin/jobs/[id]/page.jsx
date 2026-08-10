"use client"

import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { JobDetailCard } from "@/components/system-admin/cards/JobDetailCard"
import { useSystemAdminJob } from "@/hooks/system-admin/operations"
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

export default function SystemAdminJobDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminJob(id)
  const job = response?.data

  const breadcrumbs = [
    { label: "Jobs", href: "/system-admin/jobs" },
    { label: job ? job.jobType : "Loading..." },
  ]

  return (
    <>
      <AdminPagePlaceholder title="Job" breadcrumbs={breadcrumbs}>
        <Button variant="outline" size="sm" onClick={() => router.push("/system-admin/jobs")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </AdminPagePlaceholder>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this job</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this job."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && job && (
        <div className="max-w-2xl">
          <JobDetailCard job={job} />
        </div>
      )}
    </>
  )
}
