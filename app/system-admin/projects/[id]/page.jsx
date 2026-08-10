"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Play, Trash2 } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { ProjectDetailCard } from "@/components/system-admin/cards/ProjectDetailCard"
import { ProjectOwnerCard } from "@/components/system-admin/cards/ProjectOwnerCard"
import { ProjectStatisticsCard } from "@/components/system-admin/cards/ProjectStatisticsCard"
import { ProjectAuditsCard } from "@/components/system-admin/cards/ProjectAuditsCard"
import { ProjectJobsCard } from "@/components/system-admin/cards/ProjectJobsCard"
import { StartAuditDialog } from "@/components/system-admin/dialogs/StartAuditDialog"
import { DeleteProjectDialog } from "@/components/system-admin/dialogs/DeleteProjectDialog"
import { useSystemAdminProjectDetail } from "@/hooks/system-admin/projects"
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

export default function SystemAdminProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [auditOpen, setAuditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminProjectDetail(id)
  const project = response?.data

  const breadcrumbs = [
    { label: "Projects", href: "/system-admin/projects" },
    { label: project ? project.projectName : "Loading..." },
  ]

  const auditTarget = project ? { id: project.id, projectName: project.projectName } : null

  return (
    <>
      <AdminPagePlaceholder title={project?.projectName || "Project"} breadcrumbs={breadcrumbs}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/system-admin/projects")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          {project && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAuditOpen(true)}>
                <Play className="h-4 w-4" />
                Start Audit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </AdminPagePlaceholder>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this project</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this project."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && project && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProjectDetailCard project={project} />
            <ProjectOwnerCard owner={project.owner} />
          </div>

          <ProjectStatisticsCard statistics={project.statistics} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProjectAuditsCard audits={project.recentAudits || []} />
            <ProjectJobsCard jobs={project.recentJobs || []} />
          </div>
        </div>
      )}

      <StartAuditDialog
        project={auditTarget}
        open={auditOpen}
        onOpenChange={setAuditOpen}
        onSuccess={refetch}
      />
      <DeleteProjectDialog
        project={auditTarget}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => router.push("/system-admin/projects")}
      />
    </>
  )
}
