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
import { useActivateUser } from "@/hooks/system-admin/users"

export function ActivateUserDialog({ user, open, onOpenChange, onSuccess }) {
  const [reason, setReason] = useState("")
  const { mutate, isPending } = useActivateUser()

  const handleConfirm = () => {
    if (!user) return
    mutate(
      { userId: user.id, reason: reason.trim() || undefined },
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
              Activate User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {user && (
                <>
                  Reactivate <strong>{user.firstName} {user.lastName}</strong> ({user.email})?
                  They will immediately be able to log in again.
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
            {isPending ? "Activating..." : "Activate User"}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
