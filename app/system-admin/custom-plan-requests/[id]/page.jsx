"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Settings2 } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { Badge } from "@/components/ui/badge"
import {
  CustomPlanRequestCompanyCard,
  CustomPlanRequestRequirementsCard,
} from "@/components/system-admin/cards/CustomPlanRequestDetailCard"
import { CustomPlanRequestTimelineCard } from "@/components/system-admin/cards/CustomPlanRequestTimelineCard"
import { UpdateCustomPlanRequestDialog } from "@/components/system-admin/dialogs/UpdateCustomPlanRequestDialog"
import { useAdminCustomPlanRequest } from "@/hooks/system-admin/customPlanRequests"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_VARIANT = { pending: "warning", contacted: "info", closed: "outline" }

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SystemAdminCustomPlanRequestDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [manageOpen, setManageOpen] = useState(false)

  const { data: response, isLoading, isError, error, refetch } = useAdminCustomPlanRequest(id)
  const data = response?.data

  const breadcrumbs = [
    { label: "Custom Plan Requests", href: "/system-admin/custom-plan-requests" },
    { label: data?.companyName || "Loading..." },
  ]

  const manageTarget = data ? { id: data.id, status: data.status } : null

  return (
    <>
      <AdminPagePlaceholder title={data?.companyName || "Custom Plan Request"} breadcrumbs={breadcrumbs}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/system-admin/custom-plan-requests")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Button>
          {data && (
            <>
              <Badge variant={STATUS_VARIANT[data.status] || "outline"} className="capitalize">
                {data.status}
              </Badge>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setManageOpen(true)}>
                <Settings2 className="h-4 w-4" />
                Manage
              </Button>
            </>
          )}
        </div>
      </AdminPagePlaceholder>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this request</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this request."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CustomPlanRequestCompanyCard request={data} />
            <CustomPlanRequestRequirementsCard request={data} />
          </div>

          <CustomPlanRequestTimelineCard events={data.timelineEvents} />
        </div>
      )}

      <UpdateCustomPlanRequestDialog
        target={manageTarget}
        open={manageOpen}
        onOpenChange={setManageOpen}
        onSuccess={refetch}
      />
    </>
  )
}
