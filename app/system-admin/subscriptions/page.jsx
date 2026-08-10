"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AdminPagination } from "@/components/system-admin/shared/AdminPagination"
import { SubscriptionSearch } from "@/components/system-admin/search/SubscriptionSearch"
import { SubscriptionFilters } from "@/components/system-admin/filters/SubscriptionFilters"
import { SubscriptionTable } from "@/components/system-admin/tables/SubscriptionTable"
import { UpdateSubscriptionDialog } from "@/components/system-admin/dialogs/UpdateSubscriptionDialog"
import { useSystemAdminSubscriptions } from "@/hooks/system-admin/subscriptions"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DEFAULT_FILTERS = {
  plan: "",
  status: "",
  hasStripeCustomer: "",
  hasSubscription: "",
  sort: "newest",
}

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

export default function SystemAdminSubscriptionsPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [manageTarget, setManageTarget] = useState(null)

  const params = useMemo(
    () => ({ ...filters, search, page, limit: 20 }),
    [filters, search, page]
  )

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminSubscriptions(params)
  const subscriptions = response?.data?.subscriptions || []
  const pagination = response?.data?.pagination

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleManage = (subscription) => {
    setManageTarget({
      userId: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      credits: subscription.credits,
      pages: subscription.pages,
    })
  }

  return (
    <>
      <AdminPagePlaceholder
        title="Subscriptions"
        description={pagination ? `${pagination.total} total subscriptions` : "Subscription management"}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SubscriptionSearch value={search} onChange={handleSearchChange} />
          <SubscriptionFilters filters={filters} onChange={handleFilterChange} />
        </div>

        {isLoading && <TableSkeleton />}

        {isError && !isLoading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="text-foreground font-medium">Couldn&apos;t load subscriptions</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Something went wrong while fetching subscriptions."}
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
            <SubscriptionTable subscriptions={subscriptions} onManage={handleManage} />

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

      <UpdateSubscriptionDialog
        target={manageTarget}
        open={!!manageTarget}
        onOpenChange={(open) => !open && setManageTarget(null)}
      />
    </>
  )
}
