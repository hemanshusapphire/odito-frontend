"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { IconBrandGoogle, IconBrandWindows, IconBrandLinkedin } from "@tabler/icons-react"
import { Link2, Info, Loader2 } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { useProject } from "@/contexts/ProjectContext"
import { useGoogleAccountStatus, useDisconnectGoogleAccount } from "@/hooks/useDashboardQueries"
import { queryKeys } from "@/lib/query/keys"
import apiService from "@/lib/apiService"

// Same error codes the existing /google-visibility page already translates —
// the OAuth callback (oauth.routes.js) can now land here too (returnTo=
// settings), so the same codes need the same friendly messages here.
const GOOGLE_ERROR_MESSAGES = {
  expired_or_invalid_request: "That connection request expired. Please try connecting again.",
  access_denied: "Access denied for this project.",
  no_refresh_token: "Google did not grant offline access. Please try again and approve all requested permissions.",
  save_failed: "We could not save your Google connection. Please try again.",
  connection_failed: "Google connection failed. Please try again.",
}

// Same local Toast pattern used elsewhere in the Profile module
// (PersonalInformationCard, SecurityCard, DangerZoneCard).
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
 * Future (comingSoon) providers only — Google is handled separately below
 * (GoogleProviderRow) since it's the one provider with a real, live
 * connection to reflect. Add a future non-comingSoon provider by giving it
 * the same treatment Google gets, not by extending this array's shape.
 */
const COMING_SOON_PROVIDERS = [
  {
    id: "microsoft",
    name: "Microsoft",
    description: "Connect your Microsoft account.",
    icon: IconBrandWindows,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect your LinkedIn account.",
    icon: IconBrandLinkedin,
  },
]

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

const GOOGLE_STATUS_BADGE = {
  connected: { label: "Connected", variant: "success" },
  expired: { label: "Expired", variant: "outline" },
  revoked: { label: "Revoked", variant: "outline" },
  not_connected: { label: "Not Connected", variant: "outline" },
}

/**
 * Google's row — the one provider with a real, working OAuth connection to
 * reflect (see GoogleConnection.js / googleAccountConnectionService.js).
 * Status is account-wide, rolled up across every project the user has ever
 * connected Google to; Connect/Reconnect reuses the exact same
 * /auth/oauth/google/start flow the existing Google Visibility page uses,
 * scoped to whichever project is currently active in Settings.
 */
function GoogleProviderRow({ provider }) {
  const Icon = provider.icon
  const { activeProjectId } = useProject()
  const { data: statusResponse, isLoading } = useGoogleAccountStatus()
  const disconnectMutation = useDisconnectGoogleAccount()
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState(null)
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false)

  const status = statusResponse?.data
  const badge = isLoading ? null : (GOOGLE_STATUS_BADGE[status?.status] || GOOGLE_STATUS_BADGE.not_connected)
  const needsReconnect = status?.status === "expired" || status?.status === "revoked"

  const handleConnect = async () => {
    if (!activeProjectId) return
    setConnectError(null)
    setConnecting(true)
    try {
      const res = await apiService.getGoogleConnectUrl(activeProjectId, "settings")
      if (res?.data?.url) {
        window.location.href = res.data.url
        return
      }
      setConnectError("Failed to start Google connection.")
      setConnecting(false)
    } catch (err) {
      setConnectError(err.message || "Failed to start Google connection.")
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync()
      setConfirmDisconnectOpen(false)
    } catch {
      // Inline error already surfaced via disconnectMutation.isError below;
      // dialog stays open so the user can see it and retry.
    }
  }

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-foreground">{provider.name}</h4>
          <p className="text-xs text-muted-foreground">{provider.description}</p>

          {!isLoading && status?.connected && (
            <dl className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              {status.email && <div>{status.email}</div>}
              {status.connectedAt && <div>Connected on {formatDate(status.connectedAt)}</div>}
              {status.scopes?.length > 0 && <div className="capitalize">Scopes: {status.scopes.map((s) => s.replace(/_/g, " ")).join(", ")}</div>}
              <div>Last sync: {status.lastSync ? formatDate(status.lastSync) : "Never"}</div>
            </dl>
          )}

          {!isLoading && !status?.connected && needsReconnect && status?.email && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Previously connected as {status.email}. Reconnect to resume syncing.
            </p>
          )}

          {connectError && <p className="mt-1.5 text-xs text-destructive" role="alert">{connectError}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 pl-13 sm:pl-0">
        {isLoading ? (
          <Badge variant="secondary">Loading...</Badge>
        ) : (
          <Badge variant={badge.variant} className={badge.variant === "outline" ? "text-muted-foreground" : undefined}>
            {badge.label}
          </Badge>
        )}

        {!isLoading && status?.connected && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmDisconnectOpen(true)}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
          </Button>
        )}

        {!isLoading && !status?.connected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleConnect}
                  disabled={connecting || !activeProjectId}
                  className="gap-1.5"
                >
                  {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {connecting ? "Redirecting..." : needsReconnect ? "Reconnect" : "Connect"}
                </Button>
              </span>
            </TooltipTrigger>
            {!activeProjectId && (
              <TooltipContent>Select or create a project first.</TooltipContent>
            )}
          </Tooltip>
        )}
      </div>

      <AlertDialog open={confirmDisconnectOpen} onOpenChange={setConfirmDisconnectOpen}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-110">
          <div className="px-7 pt-7 pb-6 space-y-3">
            <AlertDialogHeader className="space-y-3 text-left sm:text-left">
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                Disconnect Google Account?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
                This revokes Odito&apos;s access to your Google account and stops syncing Search
                Console, Analytics, and Business Profile data across all your projects. You can
                reconnect at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {disconnectMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {disconnectMutation.error?.message || "Failed to disconnect. Please try again."}
              </p>
            )}
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center justify-end gap-3 px-7 py-4">
            <button
              type="button"
              onClick={() => setConfirmDisconnectOpen(false)}
              disabled={disconnectMutation.isPending}
              className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
              className="rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}

/** Unchanged from Phase 4 — a static, disabled, no-op row with a tooltip. */
function ComingSoonProviderRow({ provider }) {
  const Icon = provider.icon
  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-foreground">{provider.name}</h4>
          <p className="text-xs text-muted-foreground">{provider.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-13 sm:pl-0">
        <Badge variant="secondary">Coming Soon</Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-disabled="true"
              aria-label={`${provider.name} — support will be available in a future update`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/70 outline-none cursor-not-allowed hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={(e) => e.preventDefault()}
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Support will be available in a future update.</TooltipContent>
        </Tooltip>
      </div>
    </li>
  )
}

/**
 * Connected Accounts. Google reflects the real, account-wide
 * GoogleConnection rollup (live status, Connect/Reconnect/Disconnect —
 * reusing the existing OAuth start/callback flow and token-revocation
 * service, never a second OAuth implementation). Microsoft/LinkedIn remain
 * static placeholders until real linking exists for them.
 */
export default function ConnectedAccountsCard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState(null)

  // Reads the redirect-back query params the OAuth callback attaches
  // (?google_connected=1 or ?google_error=<code>) when it lands here
  // (returnTo=settings) instead of on /google-visibility — same pattern
  // that page already uses, just landing on a different route now.
  useEffect(() => {
    const connected = searchParams.get("google_connected")
    const error = searchParams.get("google_error")

    if (connected) {
      setToast({ message: "Google account connected successfully.", type: "success" })
      queryClient.invalidateQueries({ queryKey: queryKeys.googleAccount.status() })
    } else if (error) {
      setToast({ message: GOOGLE_ERROR_MESSAGES[error] || "Failed to connect Google account.", type: "error" })
    }

    if (connected || error) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("google_connected")
      params.delete("google_error")
      params.delete("projectId")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Connected Accounts
        </CardTitle>
        <CardDescription>
          Manage the external accounts connected to your Odito account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="divide-y divide-border/60">
          <GoogleProviderRow
            provider={{
              id: "google",
              name: "Google",
              description: "Sync Search Console, Analytics, and Business Profile data.",
              icon: IconBrandGoogle,
            }}
          />
          {COMING_SOON_PROVIDERS.map((provider) => (
            <ComingSoonProviderRow key={provider.id} provider={provider} />
          ))}
        </ul>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
          Additional account providers will be available in future updates.
        </p>
      </CardContent>

      {toast && typeof document !== "undefined" && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </Card>
  )
}
