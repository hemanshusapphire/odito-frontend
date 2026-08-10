"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

/**
 * Confirmation dialog for restoring a trashed project — same AlertDialog
 * header/divider/footer pattern as CreditLimitDialog and RecrawlCard's
 * confirm dialog, no new design system.
 */
export default function RestoreConfirmDialog({ project, open, onOpenChange, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-120">
        <div className="px-7 pt-7 pb-6">
          <AlertDialogHeader className="space-y-3 text-left sm:text-left">
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Restore Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {project && (
                <>
                  Restore <strong>{project.project_name}</strong>? It will become
                  active again and reappear in your project list.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-end gap-3 px-7 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #7730ed 0%, #00dfff 100%)" }}
          >
            Restore Project
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
