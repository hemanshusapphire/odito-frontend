"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { AdminPagination } from "@/components/system-admin/shared/AdminPagination"
import { ProjectSearch } from "@/components/system-admin/search/ProjectSearch"
import { ProjectFilters } from "@/components/system-admin/filters/ProjectFilters"
import { ProjectTable } from "@/components/system-admin/tables/ProjectTable"
import { DeletedProjectTable } from "@/components/system-admin/tables/DeletedProjectTable"
import { ProjectSummaryCard } from "@/components/system-admin/cards/ProjectSummaryCard"
import { StartAuditDialog } from "@/components/system-admin/dialogs/StartAuditDialog"
import { DeleteProjectDialog } from "@/components/system-admin/dialogs/DeleteProjectDialog"
import { RestoreProjectDialog } from "@/components/system-admin/dialogs/RestoreProjectDialog"
import { PermanentDeleteProjectDialog } from "@/components/system-admin/dialogs/PermanentDeleteProjectDialog"
import { useSystemAdminProjects, useSystemAdminProjectsSummary } from "@/hooks/system-admin/projects"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ACTIVE_DEFAULT_FILTERS = { status: "", industry: "", subscriptionStatus: "", sort: "newest" }
const DELETED_DEFAULT_FILTERS = { status: "", industry: "", subscriptionStatus: "", sort: "deletedNewest" }

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

export default function SystemAdminProjectsPage() {
  // "Active Projects" / "Deleted Projects" tabs — one page, one table
  // component swapped per tab, reusing the SAME listProjects endpoint via
  // its view=active|deleted param (see systemAdminProjectService.js).
  const [view, setView] = useState("active")
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState(ACTIVE_DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [auditTarget, setAuditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null)

  const params = useMemo(() => ({ ...filters, view, search, page, limit: 20 }), [filters, view, search, page])

  const { data: summaryResponse, isLoading: summaryLoading } = useSystemAdminProjectsSummary()
  const summary = summaryResponse?.data

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminProjects(params)
  const projects = response?.data?.projects || []
  const pagination = response?.data?.pagination
  const industries = response?.data?.filters?.industries || []

  const handleTabChange = (nextView) => {
    setView(nextView)
    setFilters(nextView === "deleted" ? DELETED_DEFAULT_FILTERS : ACTIVE_DEFAULT_FILTERS)
    setSearch("")
    setPage(1)
  }

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
        title="Projects"
        description={pagination ? `${pagination.total} total ${view === "deleted" ? "deleted " : ""}projects` : "Cross-user project oversight"}
      />

      <div className="flex flex-col gap-6">
        {summaryLoading || !summary ? <SummarySkeleton /> : <ProjectSummaryCard summary={summary} />}

        <Tabs value={view} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="deleted">Deleted Projects</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ProjectSearch value={search} onChange={handleSearchChange} />
            <ProjectFilters filters={filters} onChange={handleFilterChange} industries={industries} />
          </div>

          {isLoading && <TableSkeleton />}

          {isError && !isLoading && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
              <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
              <p className="text-foreground font-medium">Couldn&apos;t load projects</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Something went wrong while fetching projects."}
              </p>
              <button
                onClick={() => refetch()}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && projects.length === 0 && (
            <div className="rounded-xl border p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {view === "deleted" ? "No deleted projects." : "No projects found."}
              </p>
            </div>
          )}

          {!isLoading && !isError && projects.length > 0 && (
            <>
              {view === "deleted" ? (
                <DeletedProjectTable
                  projects={projects}
                  onRestore={setRestoreTarget}
                  onPermanentDelete={setPermanentDeleteTarget}
                />
              ) : (
                <ProjectTable projects={projects} onStartAudit={setAuditTarget} onDelete={setDeleteTarget} />
              )}

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

      <StartAuditDialog
        project={auditTarget}
        open={!!auditTarget}
        onOpenChange={(open) => !open && setAuditTarget(null)}
      />
      <DeleteProjectDialog
        project={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
      <RestoreProjectDialog
        project={restoreTarget}
        open={!!restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
      />
      <PermanentDeleteProjectDialog
        project={permanentDeleteTarget}
        open={!!permanentDeleteTarget}
        onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
      />
    </>
  )
}
