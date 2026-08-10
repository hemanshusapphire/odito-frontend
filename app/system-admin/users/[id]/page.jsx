"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Ban, CheckCircle2 } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { UserAccountCard } from "@/components/system-admin/cards/UserAccountCard"
import { UserSubscriptionCard } from "@/components/system-admin/cards/UserSubscriptionCard"
import { UserCreditsCard } from "@/components/system-admin/cards/UserCreditsCard"
import { UserPagesCard } from "@/components/system-admin/cards/UserPagesCard"
import { UserStatisticsCard } from "@/components/system-admin/cards/UserStatisticsCard"
import { UserRecentBillingCard } from "@/components/system-admin/cards/UserRecentBillingCard"
import { SuspendUserDialog } from "@/components/system-admin/dialogs/SuspendUserDialog"
import { ActivateUserDialog } from "@/components/system-admin/dialogs/ActivateUserDialog"
import { useSystemAdminUserDetail } from "@/hooks/system-admin/users"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function ProfileSkeleton() {
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

export default function SystemAdminUserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminUserDetail(id)
  const user = response?.data

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : ""
  const breadcrumbs = user
    ? [{ label: "Users", href: "/system-admin/users" }, { label: fullName }]
    : [{ label: "Users", href: "/system-admin/users" }, { label: "Loading..." }]

  return (
    <>
      <AdminPagePlaceholder title={fullName || "User Profile"} breadcrumbs={breadcrumbs}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/system-admin/users")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
          {user && (
            user.isActive ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setSuspendOpen(true)}
              >
                <Ban className="h-4 w-4" />
                Suspend
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-emerald-500 hover:text-emerald-500"
                onClick={() => setActivateOpen(true)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Activate
              </Button>
            )
          )}
        </div>
      </AdminPagePlaceholder>

      {isLoading && <ProfileSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this user</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this user's profile."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && user && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UserAccountCard user={user} />
            <UserSubscriptionCard subscription={user.subscription} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UserCreditsCard credits={user.credits} />
            <UserPagesCard pages={user.pages} />
          </div>

          <UserStatisticsCard statistics={user.statistics} />

          <UserRecentBillingCard records={user.recentBilling || []} />
        </div>
      )}

      <SuspendUserDialog
        user={user}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        onSuccess={refetch}
      />
      <ActivateUserDialog
        user={user}
        open={activateOpen}
        onOpenChange={setActivateOpen}
        onSuccess={refetch}
      />
    </>
  )
}
