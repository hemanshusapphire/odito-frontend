"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AdminPagination } from "@/components/system-admin/shared/AdminPagination"
import { PaymentSearch } from "@/components/system-admin/search/PaymentSearch"
import { PaymentFilters } from "@/components/system-admin/filters/PaymentFilters"
import { PaymentTable } from "@/components/system-admin/tables/PaymentTable"
import { PaymentSummaryCard } from "@/components/system-admin/cards/PaymentSummaryCard"
import { useSystemAdminPayments, useSystemAdminPaymentsSummary } from "@/hooks/system-admin/payments"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DEFAULT_FILTERS = {
  paymentType: "",
  status: "",
  invoice: "",
  currency: "",
  sort: "newest",
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
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
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

export default function SystemAdminPaymentsPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({ ...filters, search, page, limit: 20 }),
    [filters, search, page]
  )

  const { data: summaryResponse, isLoading: summaryLoading } = useSystemAdminPaymentsSummary()
  const summary = summaryResponse?.data

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminPayments(params)
  const payments = response?.data?.payments || []
  const pagination = response?.data?.pagination
  const currencies = response?.data?.filters?.currencies || []

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
        title="Payments"
        description={pagination ? `${pagination.total} total payments` : "Payments & billing"}
      />

      <div className="flex flex-col gap-6">
        {summaryLoading || !summary ? <SummarySkeleton /> : <PaymentSummaryCard summary={summary} />}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <PaymentSearch value={search} onChange={handleSearchChange} />
            <PaymentFilters filters={filters} onChange={handleFilterChange} currencies={currencies} />
          </div>

          {isLoading && <TableSkeleton />}

          {isError && !isLoading && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
              <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
              <p className="text-foreground font-medium">Couldn&apos;t load payments</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Something went wrong while fetching payments."}
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
              <PaymentTable payments={payments} />

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
      </div>
    </>
  )
}
