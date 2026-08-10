"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

const CONFIRM_WORD = "DELETE"

/**
 * Permanent delete confirmation — requires typing DELETE before the action
 * button enables, per Phase 3 spec. Same AlertDialog shape as
 * RestoreConfirmDialog/RecrawlCard's confirm dialog, no new design system.
 */
export default function PermanentDeleteDialog({ project, open, onOpenChange, onConfirm, isDeleting }) {
  const [confirmText, setConfirmText] = useState("")

  const canConfirm = confirmText === CONFIRM_WORD && !isDeleting

  const handleOpenChange = (next) => {
    if (!next) setConfirmText("")
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-120">
        <div className="px-7 pt-7 pb-6">
          <AlertDialogHeader className="space-y-3 text-left sm:text-left">
            <AlertDialogTitle className="text-xl font-bold text-destructive">
              Permanently Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {project && (
                <>You are about to permanently delete <strong>{project.project_name}</strong>.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 space-y-2">
            <p className="text-sm leading-relaxed text-destructive">
              This action permanently removes all audit history, AI data, rankings, screenshots, integrations, recommendations, tasks, and project records.
            </p>
            <p className="text-sm font-semibold text-destructive">
              This action cannot be undone.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <label htmlFor="permanent-delete-confirm" className="text-sm font-medium text-foreground">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </label>
            <Input
              id="permanent-delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              disabled={isDeleting}
            />
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-end gap-3 px-7 py-4">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="flex items-center gap-2 rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
