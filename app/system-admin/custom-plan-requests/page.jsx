"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AdminPagination } from "@/components/system-admin/shared/AdminPagination"
import { CustomPlanRequestSearch } from "@/components/system-admin/search/CustomPlanRequestSearch"
import { CustomPlanRequestFilters } from "@/components/system-admin/filters/CustomPlanRequestFilters"
import { CustomPlanRequestTable } from "@/components/system-admin/tables/CustomPlanRequestTable"
import { useAdminCustomPlanRequests } from "@/hooks/system-admin/customPlanRequests"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DEFAULT_FILTERS = { status: "", sort: "newest" }

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

export default function SystemAdminCustomPlanRequestsPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const params = useMemo(() => ({ ...filters, search, page, limit: 20 }), [filters, search, page])

  const { data: response, isLoading, isError, error, refetch } = useAdminCustomPlanRequests(params)
  const requests = response?.data?.requests || []
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
        title="Custom Plan Requests"
        description={pagination ? `${pagination.total} total requests` : "Sales leads from the Choose Plan page's Custom card"}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CustomPlanRequestSearch value={search} onChange={handleSearchChange} />
          <CustomPlanRequestFilters filters={filters} onChange={handleFilterChange} />
        </div>

        {isLoading && <TableSkeleton />}

        {isError && !isLoading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="text-foreground font-medium">Couldn&apos;t load custom plan requests</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Something went wrong while fetching requests."}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && requests.length === 0 && (
          <div className="rounded-xl border border-border p-10 text-center">
            <p className="text-foreground font-medium">No custom plan requests found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || filters.status ? "Try adjusting your search or filters." : "Requests submitted from the Choose Plan page will appear here."}
            </p>
          </div>
        )}

        {!isLoading && !isError && requests.length > 0 && (
          <>
            <CustomPlanRequestTable requests={requests} />

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
