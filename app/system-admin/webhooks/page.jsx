"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AdminPagination } from "@/components/system-admin/shared/AdminPagination"
import { WebhookFilters } from "@/components/system-admin/filters/WebhookFilters"
import { WebhookTable } from "@/components/system-admin/tables/WebhookTable"
import { WebhookSummaryCard } from "@/components/system-admin/cards/WebhookSummaryCard"
import { useSystemAdminWebhooks, useSystemAdminWebhooksSummary } from "@/hooks/system-admin/operations"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DEFAULT_FILTERS = { status: "", eventType: "", sort: "newest" }

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
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

export default function SystemAdminWebhooksPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const params = useMemo(() => ({ ...filters, page, limit: 20 }), [filters, page])

  const { data: summaryResponse, isLoading: summaryLoading } = useSystemAdminWebhooksSummary()
  const summary = summaryResponse?.data

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminWebhooks(params)
  const webhooks = response?.data?.webhooks || []
  const pagination = response?.data?.pagination
  const eventTypes = response?.data?.filters?.eventTypes || []

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <>
      <AdminPagePlaceholder
        title="Webhooks"
        description={pagination ? `${pagination.total} total webhook events` : "Stripe webhook monitoring — read only"}
      />

      <div className="flex flex-col gap-6">
        {summaryLoading || !summary ? <SummarySkeleton /> : <WebhookSummaryCard summary={summary} />}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <WebhookFilters filters={filters} onChange={handleFilterChange} eventTypes={eventTypes} />
          </div>

          {isLoading && <TableSkeleton />}

          {isError && !isLoading && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
              <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
              <p className="text-foreground font-medium">Couldn&apos;t load webhook events</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Something went wrong while fetching webhook events."}
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
              <WebhookTable webhooks={webhooks} />

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
