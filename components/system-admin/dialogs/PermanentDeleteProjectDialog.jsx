"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { usePermanentlyDeleteProject } from "@/hooks/system-admin/projects"

/**
 * Same AlertDialog shell as every other System Admin confirm dialog.
 * Calls the admin-scoped permanent-delete endpoint, which reuses
 * deleteProjectCascade() verbatim — the exact same irreversible cascade
 * the customer's own "Delete Permanently" button and the daily purge
 * scheduler already use in production.
 */
export function PermanentDeleteProjectDialog({ project, open, onOpenChange, onSuccess }) {
  const [reason, setReason] = useState("")
  const { mutate, isPending, error } = usePermanentlyDeleteProject()

  const handleConfirm = () => {
    if (!project) return
    mutate(
      { projectId: project.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          setReason("")
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-120">
        <div className="px-7 pt-7 pb-6 space-y-4">
          <AlertDialogHeader className="space-y-3 text-left sm:text-left">
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Delete Permanently
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {project && (
                <>
                  Permanently delete <strong>{project.projectName}</strong>? This removes all
                  audits, jobs, and page data for this project and{" "}
                  <strong className="text-destructive">cannot be undone</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional) — recorded in the audit log"
            className="text-sm"
          />

          {error && <p className="text-sm text-destructive">{error.message || "Could not permanently delete project."}</p>}
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-end gap-3 px-7 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
