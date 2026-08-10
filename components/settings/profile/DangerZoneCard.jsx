"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Trash2, Info, Loader2, Eye, EyeOff } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/AuthContext"
import apiService from "@/lib/apiService"
import socketService from "@/lib/socketService"

// The literal phrase the user must type in the Final Confirmation dialog —
// the standard, unambiguous pattern for a genuinely irreversible action.
// Purely a client-side gate; the real server-side authority is the
// deletionToken minted by the verify step, not this text.
const CONFIRM_PHRASE = "DELETE"

// Same local Toast pattern used elsewhere in this codebase (project-level
// DangerZoneCard, PersonalInformationCard, SecurityCard) — no shared toast
// component exists to reuse instead.
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000)
    return () => clearTimeout(id)
  }, [onClose])
  const bg = type === "success" ? "rgba(0,245,160,0.12)" : "rgba(255,56,96,0.12)"
  const border = type === "success" ? "rgba(0,245,160,0.28)" : "rgba(255,56,96,0.28)"
  const color = type === "success" ? "#00f5a0" : "#ff3860"
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999,
        background: bg, border: `1px solid ${border}`, color,
        borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 8,
        backdropFilter: "blur(8px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  )
}

/**
 * Danger Zone — Delete Account. Step machine:
 *   idle -> verify (password or OTP, decided by the server) -> confirm
 *   (type-to-confirm) -> deleting -> redirect to /login
 *
 * State lives entirely in this component; nothing here is a React Query
 * mutation or a new AuthContext field — the only AuthContext touch is
 * calling the existing logout() once deletion actually succeeds (Step 10:
 * no new cache, no new global state).
 */
export default function DangerZoneCard() {
  const router = useRouter()
  const { logout } = useAuth()

  const [step, setStep] = useState("idle") // idle | verify | confirm
  const [authMethod, setAuthMethod] = useState(null) // 'password' | 'otp'
  const [credential, setCredential] = useState("")
  const [showCredential, setShowCredential] = useState(false)
  const [deletionToken, setDeletionToken] = useState(null)
  const [confirmText, setConfirmText] = useState("")

  const [requesting, setRequesting] = useState(false)
  const [resending, setResending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [verifyError, setVerifyError] = useState(null)
  const [confirmError, setConfirmError] = useState(null)
  const [toast, setToast] = useState(null)

  const resetFlow = () => {
    setStep("idle")
    setAuthMethod(null)
    setCredential("")
    setShowCredential(false)
    setDeletionToken(null)
    setConfirmText("")
    setVerifyError(null)
    setConfirmError(null)
  }

  const handleStartDeletion = async () => {
    setRequesting(true)
    try {
      const response = await apiService.requestAccountDeletion()
      setAuthMethod(response.data.authMethod)
      setStep("verify")
    } catch (err) {
      setToast({ message: err.message || "Failed to start account deletion. Please try again.", type: "error" })
    } finally {
      setRequesting(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    try {
      await apiService.requestAccountDeletion()
      setToast({ message: "A new verification code has been sent.", type: "success" })
    } catch (err) {
      setToast({ message: err.message || "Failed to resend code.", type: "error" })
    } finally {
      setResending(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerifyError(null)

    if (!credential.trim()) {
      setVerifyError(authMethod === "password" ? "Password is required." : "Verification code is required.")
      return
    }

    setVerifying(true)
    try {
      const payload = authMethod === "password" ? { password: credential } : { otp: credential.trim() }
      const response = await apiService.verifyAccountDeletion(payload)
      setDeletionToken(response.data.deletionToken)
      setCredential("")
      setStep("confirm")
    } catch (err) {
      setVerifyError(err.message || "Verification failed. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  const handleFinalDelete = async () => {
    setConfirmError(null)
    setDeleting(true)
    try {
      await apiService.deleteAccount(deletionToken)

      // Account is gone server-side at this point — clear every local
      // trace of it. logout() already handles auth state, React Query
      // cache, and the persisted localStorage keys (see AuthContext.jsx);
      // this only adds what logout() doesn't already do.
      socketService.disconnect()
      await logout()
      router.push("/login")
    } catch (err) {
      setConfirmError(err.message || "Failed to delete account. Please try again.")
      setDeleting(false)
    }
  }

  const isConfirmEnabled = confirmText === CONFIRM_PHRASE && !deleting

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
        </CardHeader>

        <CardContent>
          <ul className="divide-y divide-border/60">
            <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-foreground">Delete Account</h4>
                <p className="text-xs text-muted-foreground">
                  Permanently remove your account and all associated data.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartDeletion}
                disabled={requesting}
                aria-label="Delete Account"
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </>
                )}
              </button>
            </li>
          </ul>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
            Deleting your account requires identity verification and permanently removes your projects, audits, and billing history is preserved only as anonymized financial records.
          </p>
        </CardContent>
      </Card>

      {/* Step 1: Verify identity (password or OTP, decided by the server) */}
      <AlertDialog open={step === "verify"} onOpenChange={(open) => { if (!open) resetFlow() }}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-110">
          <div className="px-7 pt-7 pb-6 space-y-4">
            <AlertDialogHeader className="space-y-3 text-left sm:text-left">
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                Verify Your Identity
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
                {authMethod === "password"
                  ? "Enter your current password to continue deleting your account."
                  : "We've sent a 6-digit verification code to your email. Enter it below to continue."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="delete-account-credential">
                  {authMethod === "password" ? "Password" : "Verification Code"}
                </Label>
                {authMethod === "password" ? (
                  <div className="relative">
                    <Input
                      id="delete-account-credential"
                      type={showCredential ? "text" : "password"}
                      value={credential}
                      onChange={(e) => { setCredential(e.target.value); setVerifyError(null) }}
                      autoComplete="current-password"
                      disabled={verifying}
                      autoFocus
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCredential((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showCredential ? "Hide password" : "Show password"}
                    >
                      {showCredential ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                ) : (
                  <Input
                    id="delete-account-credential"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={credential}
                    onChange={(e) => { setCredential(e.target.value.replace(/\D/g, "")); setVerifyError(null) }}
                    disabled={verifying}
                    autoFocus
                    className="font-mono tracking-widest"
                  />
                )}
                {verifyError && <p className="text-sm text-destructive" role="alert">{verifyError}</p>}
              </div>

              {authMethod === "otp" && (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-xs font-medium text-primary transition-colors hover:opacity-80 disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              )}
            </form>
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center justify-end gap-3 px-7 py-4">
            <button
              type="button"
              onClick={resetFlow}
              disabled={verifying}
              className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || !credential.trim()}
              className="rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {verifying ? "Verifying..." : "Continue"}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step 2: Final Confirmation — type-to-confirm, no accidental clicks */}
      <AlertDialog open={step === "confirm"} onOpenChange={(open) => { if (!open && !deleting) resetFlow() }}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-110">
          <div className="px-7 pt-7 pb-6 space-y-4">
            <AlertDialogHeader className="space-y-3 text-left sm:text-left">
              <AlertDialogTitle className="text-xl font-bold text-destructive">
                Delete Your Account Permanently?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
                This will permanently delete your account, all projects, audits, and connected
                integrations. Your subscription will be cancelled immediately. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="delete-account-confirm-text">
                Type <span className="font-mono font-bold text-destructive">{CONFIRM_PHRASE}</span> to confirm
              </Label>
              <Input
                id="delete-account-confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={deleting}
                autoFocus
                autoComplete="off"
                aria-describedby="delete-account-confirm-hint"
              />
              <p id="delete-account-confirm-hint" className="text-xs text-muted-foreground">
                This confirms you understand this action is permanent.
              </p>
              {confirmError && <p className="text-sm text-destructive" role="alert">{confirmError}</p>}
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center justify-end gap-3 px-7 py-4">
            <button
              type="button"
              onClick={resetFlow}
              disabled={deleting}
              className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFinalDelete}
              disabled={!isConfirmEnabled}
              aria-label="Permanently delete my account"
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                "Permanently Delete Account"
              )}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {toast && typeof document !== "undefined" && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </>
  )
}
