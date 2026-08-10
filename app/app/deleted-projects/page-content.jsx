"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { RotateCcw, Trash2, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { useProject } from "@/contexts/ProjectContext"
import { useTrashedProjects, useRestoreProject, usePermanentlyDeleteProject } from "@/hooks/useDashboardQueries"
import RestoreConfirmDialog from "@/components/deleted-projects/RestoreConfirmDialog"
import PermanentDeleteDialog from "@/components/deleted-projects/PermanentDeleteDialog"

// Same local Toast pattern used elsewhere in the app (e.g. IssueDetailView) —
// there is no shared toast component in this codebase, so this matches the
// existing convention rather than introducing a new one.
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  const bg = type === "success" ? "rgba(0,245,160,0.12)" : "rgba(255,56,96,0.12)"
  const border = type === "success" ? "rgba(0,245,160,0.28)" : "rgba(255,56,96,0.28)"
  const color = type === "success" ? "#00f5a0" : "#ff3860"
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, border: `1px solid ${border}`, color,
      borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8,
      backdropFilter: "blur(8px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    }}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export default function DeletedProjectsPageContent() {
  const { activeProject, setActiveProject, refreshProjects } = useProject()
  const { data: response, isLoading, isError } = useTrashedProjects(1, 50)
  const restoreMutation = useRestoreProject()
  const permanentDeleteMutation = usePermanentlyDeleteProject()

  const [confirmProject, setConfirmProject] = useState(null)
  const [restoringId, setRestoringId] = useState(null)
  const [deleteProject, setDeleteProject] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const projects = response?.data?.projects || []

  const handleConfirmRestore = async () => {
    const project = confirmProject
    setConfirmProject(null)
    if (!project?._id) return

    setRestoringId(project._id)
    try {
      const result = await restoreMutation.mutateAsync(project._id)
      const restoredProject = result?.data

      setToast({ message: "Project restored successfully", type: "success" })

      // Refresh the active project list (also covered by useRestoreProject's
      // own invalidateQueries, but this forces an immediate refetch rather
      // than waiting on the background invalidation).
      await refreshProjects()

      // Only take over as the active project if there isn't one already —
      // an existing selection is left untouched.
      if (!activeProject && restoredProject) {
        setActiveProject(restoredProject)
      }
    } catch (error) {
      setToast({
        message: error?.message || "Failed to restore project. Please try again.",
        type: "error",
      })
    } finally {
      setRestoringId(null)
    }
  }

  const handleConfirmPermanentDelete = async () => {
    const project = deleteProject
    if (!project?._id) return

    setDeletingId(project._id)
    try {
      await permanentDeleteMutation.mutateAsync(project._id)

      setDeleteProject(null)
      setToast({ message: "Project permanently deleted", type: "success" })

      // Same reuse-existing-patterns approach as restore: the mutation's own
      // onSuccess already invalidates ['projects','list'] and
      // ['projects','trash'], this forces an immediate refetch of the
      // active list rather than waiting on the background invalidation.
      await refreshProjects()
    } catch (error) {
      setToast({
        message: error?.message || "Failed to permanently delete project. Please try again.",
        type: "error",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 skeleton-fade-in">
        <div className="border-b pb-4">
          <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
          <div className="w-72 h-4 skeleton-base skeleton-shimmer rounded mt-2" />
        </div>
        <div className="rounded-xl border p-6 space-y-4">
          <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
          <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
          <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Deleted Projects</h1>
        </div>
        <div className="rounded-xl border p-8 text-center space-y-2">
          <p className="text-muted-foreground">Something went wrong loading your trash. Please refresh.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Deleted Projects</h1>
        <p className="text-muted-foreground">
          Deleted projects are kept for 7 days before permanent removal, and can be restored anytime before then.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border p-8 text-center space-y-2">
          <p className="text-muted-foreground">Trash is empty. Deleted projects will show up here.</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Deleted On</TableHead>
                <TableHead>Permanent Delete On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell className="font-medium text-foreground">{project.project_name}</TableCell>
                  <TableCell className="text-muted-foreground">{project.main_url}</TableCell>
                  <TableCell>{formatDate(project.deleted_at)}</TableCell>
                  <TableCell>{formatDate(project.scheduled_purge_at)}</TableCell>
                  <TableCell className="text-right">
                    {project.deletedByOwner === false ? (
                      <div className="flex items-center justify-end gap-2 text-amber-600 dark:text-amber-400">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span className="text-sm">Deleted by your System Administrator — contact them to restore it</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={restoringId === project._id || deletingId === project._id}
                          onClick={() => setConfirmProject(project)}
                        >
                          {restoringId === project._id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={restoringId === project._id || deletingId === project._id}
                          onClick={() => setDeleteProject(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Permanently
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RestoreConfirmDialog
        project={confirmProject}
        open={!!confirmProject}
        onOpenChange={(open) => { if (!open) setConfirmProject(null) }}
        onConfirm={handleConfirmRestore}
      />

      <PermanentDeleteDialog
        project={deleteProject}
        open={!!deleteProject}
        onOpenChange={(open) => { if (!open) setDeleteProject(null) }}
        onConfirm={handleConfirmPermanentDelete}
        isDeleting={deletingId === deleteProject?._id}
      />

      {toast && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </div>
  )
}
