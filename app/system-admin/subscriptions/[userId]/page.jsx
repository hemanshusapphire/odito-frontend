"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Settings2 } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { SubscriptionAccountCard } from "@/components/system-admin/cards/SubscriptionAccountCard"
import { SubscriptionPlanCard } from "@/components/system-admin/cards/SubscriptionPlanCard"
import { SubscriptionCreditsCard } from "@/components/system-admin/cards/SubscriptionCreditsCard"
import { SubscriptionPagesCard } from "@/components/system-admin/cards/SubscriptionPagesCard"
import { SubscriptionTimelineCard } from "@/components/system-admin/cards/SubscriptionTimelineCard"
import { SubscriptionPurchasesCard } from "@/components/system-admin/cards/SubscriptionPurchasesCard"
import { UpdateSubscriptionDialog } from "@/components/system-admin/dialogs/UpdateSubscriptionDialog"
import { useSystemAdminSubscriptionDetail } from "@/hooks/system-admin/subscriptions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function SystemAdminSubscriptionDetailPage() {
  const { userId } = useParams()
  const router = useRouter()
  const [manageOpen, setManageOpen] = useState(false)

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminSubscriptionDetail(userId)
  const data = response?.data

  const fullName = data ? `${data.account.firstName} ${data.account.lastName}`.trim() : ""
  const breadcrumbs = [
    { label: "Subscriptions", href: "/system-admin/subscriptions" },
    { label: fullName || "Loading..." },
  ]

  const manageTarget = data
    ? {
        userId: data.account.id,
        plan: data.subscription.plan,
        status: data.subscription.status,
        credits: data.credits,
        pages: data.pages,
      }
    : null

  return (
    <>
      <AdminPagePlaceholder title={fullName || "Subscription"} breadcrumbs={breadcrumbs}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/system-admin/subscriptions")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Button>
          {data && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setManageOpen(true)}>
              <Settings2 className="h-4 w-4" />
              Manage
            </Button>
          )}
        </div>
      </AdminPagePlaceholder>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this subscription</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this subscription."}
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
            <SubscriptionAccountCard account={data.account} />
            <SubscriptionPlanCard subscription={data.subscription} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SubscriptionCreditsCard credits={data.credits} />
            <SubscriptionPagesCard pages={data.pages} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SubscriptionTimelineCard events={data.recentTransactions || []} />
            <SubscriptionPurchasesCard
              transactions={data.recentTransactions}
              additionalCredits={data.recentAdditionalCredits}
              additionalPages={data.recentAdditionalPages}
            />
          </div>
        </div>
      )}

      <UpdateSubscriptionDialog
        target={manageTarget}
        open={manageOpen}
        onOpenChange={setManageOpen}
        onSuccess={refetch}
      />
    </>
  )
}
