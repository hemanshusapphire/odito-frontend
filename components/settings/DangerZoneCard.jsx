"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Archive, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { useProject } from "@/contexts/ProjectContext"
import { useDeleteProject } from "@/hooks/useDashboardQueries"
import DeleteProjectDialog from "./DeleteProjectDialog"

// Same local Toast pattern used on the Deleted Projects page — there is no
// shared toast component in this codebase, so this matches the existing
// convention rather than introducing a new one.
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

/**
 * Delete Project — moves the project to Trash via the existing soft-delete
 * endpoint (DELETE /app_user/projects/:id, unchanged since Project Trash &
 * Restore Phase 1). No new API. Permanent removal and restore both live on
 * the Deleted Projects page, linked from here.
 */
export default function DangerZoneCard({ project }) {
  const router = useRouter()
  const { refreshProjects, setActiveProject } = useProject()
  const deleteMutation = useDeleteProject()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const handleConfirmDelete = async () => {
    if (!project?._id) return

    try {
      await deleteMutation.mutateAsync(project._id)
      setConfirmOpen(false)
      setToast({ message: "Project moved to Trash", type: "success" })

      // Refresh the active list, then hand the active-project slot to
      // whatever remains — the deleted project can no longer be it.
      const freshProjects = await refreshProjects()
      const remaining = (freshProjects || []).filter((p) => p._id !== project._id)
      if (remaining.length > 0) {
        setActiveProject(remaining[0])
      }

      // Give the toast a moment to register before navigating away —
      // the Settings page (and this toast) unmount on route change.
      setTimeout(() => router.push("/app/dashboard"), 900)
    } catch (error) {
      setToast({
        message: error?.message || "Failed to delete project. Please try again.",
        type: "error",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Delete Project</CardTitle>
        <CardDescription>
          Move this project to Trash. Projects remain recoverable for 7 days and can be restored from the Deleted Projects page.
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="destructive"
          className="gap-2"
          disabled={!project?._id || deleteMutation.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {deleteMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Moving...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Move To Trash
            </>
          )}
        </Button>

        <Link
          href="/app/deleted-projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Archive className="h-3.5 w-3.5" />
          View Deleted Projects
        </Link>
      </CardFooter>

      <DeleteProjectDialog
        project={project}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      {toast && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </Card>
  )
}
