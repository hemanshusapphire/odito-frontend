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
import { useSuspendUser } from "@/hooks/system-admin/users"

/**
 * Same AlertDialog shell as RestoreConfirmDialog.jsx / CreditLimitDialog.jsx
 * — no new dialog design. One shared instance rendered at the users list
 * page level (not per-row) with `user` set to whichever row's Suspend
 * button was clicked.
 */
export function SuspendUserDialog({ user, open, onOpenChange, onSuccess }) {
  const [reason, setReason] = useState("")
  const [showReasonError, setShowReasonError] = useState(false)
  const { mutate, isPending } = useSuspendUser()

  const handleReasonChange = (e) => {
    setReason(e.target.value)
    if (showReasonError && e.target.value.trim()) setShowReasonError(false)
  }

  const handleConfirm = () => {
    if (!user) return
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setShowReasonError(true)
      return
    }
    mutate(
      { userId: user.id, reason: trimmedReason },
      {
        onSuccess: () => {
          setReason("")
          setShowReasonError(false)
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
              Suspend User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {user && (
                <>
                  Suspend <strong>{user.firstName} {user.lastName}</strong> ({user.email})?
                  They will be immediately signed out and unable to log back in until
                  reactivated.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={reason}
            onChange={handleReasonChange}
            placeholder="Reason — recorded in the audit log"
            required
            aria-required="true"
            aria-invalid={showReasonError}
            className={`text-sm ${showReasonError ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {showReasonError && (
            <p className="text-sm text-destructive">Please provide a reason for this action.</p>
          )}
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
            {isPending ? "Suspending..." : "Suspend User"}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
