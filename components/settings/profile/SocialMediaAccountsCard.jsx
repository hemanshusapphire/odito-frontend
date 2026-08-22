"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react"
import { Info, Loader2 } from "lucide-react"
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
import { useMetaOAuthRedirect } from "@/hooks/useMetaOAuthRedirect"
import { useSocialAccountsStatus, useDisconnectSocialAccount } from "@/hooks/useDashboardQueries"
import apiService from "@/lib/apiService"
import MetaPageSelectionDialog from "@/components/dashboard/social/MetaPageSelectionDialog"

// Same local Toast pattern ConnectedAccountsCard.jsx already uses for its
// own OAuth-redirect outcome.
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

const META_ERROR_MESSAGES = {
  access_denied: "Meta connection was cancelled.",
  invalid_request: "That connection request was invalid. Please try again.",
  expired_or_invalid_request: "That connection request expired. Please try connecting again.",
  connection_failed: "Meta connection failed. Please try again.",
}

/**
 * Config-driven platform list — the same real Meta OAuth flow backs both
 * rows today (Instagram is discovered through the connected Facebook
 * Page, never a separate auth mechanism). Adding LinkedIn/X/TikTok/YouTube
 * later means adding an entry here, not touching the row-rendering logic
 * below — each new entry just needs its own `connect` implementation.
 */
const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    name: "Facebook",
    description: "Connect your Facebook Page to manage posts and view insights.",
    icon: IconBrandFacebook,
  },
  {
    key: "instagram",
    name: "Instagram",
    description: "Connect your Instagram Business or Creator account to publish and manage content.",
    icon: IconBrandInstagram,
  },
]

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

/**
 * One platform row. Status comes from the SHARED useSocialAccountsStatus
 * query (called once at the card level, passed down) — never a per-row
 * fetch, so mounting both rows only ever costs one network request, and
 * /app/social reading the exact same query key means both pages agree.
 */
function SocialAccountRow({ platform, statusEntry, isLoading, activeProjectId, onConnect, connectingPlatform }) {
  const Icon = platform.icon
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false)
  const disconnectMutation = useDisconnectSocialAccount(activeProjectId)

  const connected = !!statusEntry?.connected
  const isConnecting = connectingPlatform === platform.key

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync(platform.key)
      setConfirmDisconnectOpen(false)
    } catch {
      // Inline error surfaced via disconnectMutation.isError below; dialog stays open.
    }
  }

  const accountLabel = platform.key === "instagram"
    ? (statusEntry?.username ? `@${statusEntry.username}` : null)
    : (statusEntry?.accountName || null)

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-foreground">{platform.name}</h4>
          <p className="text-xs text-muted-foreground">
            {connected && accountLabel ? accountLabel : platform.description}
          </p>

          {!isLoading && connected && statusEntry?.connectedAt && (
            <p className="mt-1.5 text-xs text-muted-foreground">Connected on {formatDate(statusEntry.connectedAt)}</p>
          )}

          {disconnectMutation.isError && (
            <p className="mt-1.5 text-xs text-destructive" role="alert">
              {disconnectMutation.error?.message || "Failed to disconnect. Please try again."}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pl-13 sm:pl-0">
        {isLoading ? (
          <Badge variant="secondary">Loading...</Badge>
        ) : (
          <Badge variant={connected ? "success" : "outline"} className={connected ? undefined : "text-muted-foreground"}>
            {connected ? "Connected" : "Not Connected"}
          </Badge>
        )}

        {!isLoading && connected && (
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

        {!isLoading && !connected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onConnect(platform.key)}
                  disabled={isConnecting || !activeProjectId}
                  className="gap-1.5"
                >
                  {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              </span>
            </TooltipTrigger>
            {!activeProjectId && <TooltipContent>Select or create a project first.</TooltipContent>}
          </Tooltip>
        )}
      </div>

      <AlertDialog open={confirmDisconnectOpen} onOpenChange={setConfirmDisconnectOpen}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-110">
          <div className="px-7 pt-7 pb-6 space-y-3">
            <AlertDialogHeader className="space-y-3 text-left sm:text-left">
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                Disconnect {platform.name}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
                Are you sure you want to disconnect {platform.name} from Odito? You will no longer
                be able to publish or retrieve social media data until you reconnect the account.
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

/**
 * Social Media Accounts. Another entry point into the exact same Meta
 * OAuth flow /app/social already uses — same start endpoint, same
 * callback, same SocialAccount model, same status query. Connecting or
 * disconnecting here is immediately visible on /app/social (and vice
 * versa) because both read/invalidate the identical
 * ['social','accounts','status', projectId] React Query cache entry —
 * there is no second source of truth to keep in sync.
 */
export default function SocialMediaAccountsCard() {
  const { activeProjectId } = useProject()
  const [toast, setToast] = useState(null)
  const [connectingPlatform, setConnectingPlatform] = useState(null)
  const [pageSelectDialogOpen, setPageSelectDialogOpen] = useState(false)

  const statusQuery = useSocialAccountsStatus(activeProjectId)
  const status = statusQuery.data?.data
  const isLoading = statusQuery.isLoading

  // Second real entry point into the same OAuth flow /app/social uses
  // (metaOAuthController.js's RETURN_TARGETS 'profile' target) — shared
  // redirect-handling logic, not a duplicate implementation.
  useMetaOAuthRedirect({
    onConnected: () => {
      setConnectingPlatform(null)
      setPageSelectDialogOpen(true)
    },
    onError: (error) => {
      setConnectingPlatform(null)
      setToast({ message: META_ERROR_MESSAGES[error] || "Failed to connect Meta account.", type: "error" })
    },
  })

  const handleConnect = async (platformKey) => {
    if (!activeProjectId) return
    setConnectingPlatform(platformKey)
    try {
      const res = await apiService.getMetaConnectUrl(activeProjectId, "profile")
      if (res?.data?.url) {
        window.location.href = res.data.url
        return
      }
      setConnectingPlatform(null)
      setToast({ message: "Failed to start Meta connection.", type: "error" })
    } catch (err) {
      setConnectingPlatform(null)
      setToast({ message: err?.message || "Failed to start Meta connection.", type: "error" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconBrandFacebook className="h-4 w-4 text-muted-foreground" />
          Social Media Accounts
        </CardTitle>
        <CardDescription>
          Connect your social media accounts to manage publishing, insights, and content from Odito.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="divide-y divide-border/60">
          {SOCIAL_PLATFORMS.map((platform) => (
            <SocialAccountRow
              key={platform.key}
              platform={platform}
              statusEntry={status?.[platform.key]}
              isLoading={isLoading}
              activeProjectId={activeProjectId}
              onConnect={handleConnect}
              connectingPlatform={connectingPlatform}
            />
          ))}
        </ul>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
          Additional platforms (LinkedIn, X, TikTok, YouTube) will be available in future updates.
        </p>
      </CardContent>

      {/*
        useSelectMetaPage (used internally by this dialog) already
        invalidates ['social','accounts','status', projectId] on success —
        the same query key useSocialAccountsStatus reads above — so no
        manual invalidation is needed here; this card's status re-renders
        from that same shared cache entry automatically, exactly like
        /app/social does.
      */}
      <MetaPageSelectionDialog
        open={pageSelectDialogOpen}
        onOpenChange={setPageSelectDialogOpen}
        projectId={activeProjectId}
        onConnected={() => setToast({ message: "Facebook Page connected successfully.", type: "success" })}
      />

      {toast && typeof document !== "undefined" && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </Card>
  )
}
