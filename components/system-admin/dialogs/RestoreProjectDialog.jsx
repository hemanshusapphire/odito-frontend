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
import { useRestoreProject } from "@/hooks/system-admin/projects"

/**
 * Same AlertDialog shell as every other System Admin confirm dialog
 * (StartAuditDialog.jsx, DeleteProjectDialog.jsx) and the same UX the
 * customer's own Deleted Projects page uses (RestoreConfirmDialog.jsx) —
 * this one just targets the admin-scoped restore endpoint, which works for
 * ANY user's project, not only the caller's own.
 */
export function RestoreProjectDialog({ project, open, onOpenChange, onSuccess }) {
  const [reason, setReason] = useState("")
  const { mutate, isPending, error } = useRestoreProject()

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
              Restore Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {project && (
                <>
                  Restore <strong>{project.projectName}</strong>? It will become active again
                  and reappear in the owner's project list.
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

          {error && <p className="text-sm text-destructive">{error.message || "Could not restore project."}</p>}
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
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7730ed 0%, #00dfff 100%)" }}
          >
            {isPending ? "Restoring..." : "Restore Project"}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
