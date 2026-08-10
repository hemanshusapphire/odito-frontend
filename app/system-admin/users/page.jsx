"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AdminPagination } from "@/components/system-admin/shared/AdminPagination"
import { UserSearch } from "@/components/system-admin/search/UserSearch"
import { UserFilters } from "@/components/system-admin/filters/UserFilters"
import { UserTable } from "@/components/system-admin/tables/UserTable"
import { SuspendUserDialog } from "@/components/system-admin/dialogs/SuspendUserDialog"
import { ActivateUserDialog } from "@/components/system-admin/dialogs/ActivateUserDialog"
import { useSystemAdminUsers } from "@/hooks/system-admin/users"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DEFAULT_FILTERS = {
  role: "",
  subscriptionStatus: "",
  emailVerified: "",
  accountStatus: "",
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

export default function SystemAdminUsersPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [suspendTarget, setSuspendTarget] = useState(null)
  const [activateTarget, setActivateTarget] = useState(null)

  const params = useMemo(
    () => ({ ...filters, search, page, limit: 20 }),
    [filters, search, page]
  )

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminUsers(params)
  const users = response?.data?.users || []
  const pagination = response?.data?.pagination

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <>
      <AdminPagePlaceholder
        title="Users"
        description={pagination ? `${pagination.total} total users` : "User management"}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UserSearch value={search} onChange={handleSearchChange} />
          <UserFilters filters={filters} onChange={handleFilterChange} />
        </div>

        {isLoading && <TableSkeleton />}

        {isError && !isLoading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="text-foreground font-medium">Couldn&apos;t load users</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Something went wrong while fetching the user list."}
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
            <UserTable
              users={users}
              onSuspend={setSuspendTarget}
              onActivate={setActivateTarget}
            />

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

      <SuspendUserDialog
        user={suspendTarget}
        open={!!suspendTarget}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
      />
      <ActivateUserDialog
        user={activateTarget}
        open={!!activateTarget}
        onOpenChange={(open) => !open && setActivateTarget(null)}
      />
    </>
  )
}
