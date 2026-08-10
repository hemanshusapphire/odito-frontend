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
 * Confirmation for moving a project to Trash (soft delete) — requires typing
 * DELETE before the action enables, same shape as the Deleted Projects
 * page's PermanentDeleteDialog, toned down to amber since this action is
 * reversible for 7 days rather than immediate and final.
 */
export default function DeleteProjectDialog({ project, open, onOpenChange, onConfirm, isDeleting }) {
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
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Move Project to Trash
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {project && <>Move <strong>{project.project_name}</strong> to Trash?</>}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-3">
            <p className="text-sm leading-relaxed text-amber-500">
              This project will be moved to Trash. The project can be restored within 7 days.
            </p>
            <p className="text-sm leading-relaxed text-amber-500">
              After 7 days it will be permanently removed automatically.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <label htmlFor="delete-project-confirm" className="text-sm font-medium text-foreground">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </label>
            <Input
              id="delete-project-confirm"
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
            {isDeleting ? "Moving..." : "Move To Trash"}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
