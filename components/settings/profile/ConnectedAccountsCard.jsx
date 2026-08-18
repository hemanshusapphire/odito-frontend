"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { IconBrandGoogle, IconBrandWindows, IconBrandLinkedin, IconBrandWordpress } from "@tabler/icons-react"
import { Link2, Info, Loader2, Copy, Check, Download } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useProject } from "@/contexts/ProjectContext"
import {
  useGoogleAccountStatus,
  useDisconnectGoogleAccount,
  useWordPressStatus,
  useConnectWordPress,
  useVerifyWordPressConnection,
  useDisconnectWordPress,
  useWordPressPluginStatus,
  useGenerateWordPressPairingToken,
  useWordPressForms,
} from "@/hooks/useDashboardQueries"
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

const WORDPRESS_STATUS_BADGE = {
  connected: { label: "Connected", variant: "success" },
  verification_failed: { label: "Verification Failed", variant: "critical" },
  not_connected: { label: "Not Connected", variant: "outline" },
}

/**
 * Connect-form modal for WordPress Application Passwords. NOT an OAuth
 * redirect (WordPress core has no OAuth flow of its own) — the user enters
 * their site URL, WordPress username, and Application Password directly,
 * and the backend verifies them against the live WordPress REST API before
 * anything is stored (see wordPressService.connectWordPress).
 */
function ConnectWordPressDialog({ open, onOpenChange, projectId, onConnected }) {
  const [siteUrl, setSiteUrl] = useState("")
  const [username, setUsername] = useState("")
  const [applicationPassword, setApplicationPassword] = useState("")
  const connectMutation = useConnectWordPress(projectId)

  useEffect(() => {
    if (open) {
      setSiteUrl("")
      setUsername("")
      setApplicationPassword("")
      connectMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await connectMutation.mutateAsync({ siteUrl: siteUrl.trim(), username: username.trim(), applicationPassword: applicationPassword.trim() })
      onConnected?.()
      onOpenChange(false)
    } catch {
      // Inline error surfaced via connectMutation.isError below; dialog stays open.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Connect WordPress</DialogTitle>
            <DialogDescription>
              Odito uses your WordPress Application Password to securely connect to your website.
              Your password is encrypted and never exposed in the dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="wp-site-url">Website URL</Label>
              <Input
                id="wp-site-url"
                type="url"
                placeholder="https://www.yourwebsite.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                required
                autoComplete="url"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wp-username">WordPress Username</Label>
              <Input
                id="wp-username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wp-app-password">Application Password</Label>
              <Input
                id="wp-app-password"
                type="password"
                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                value={applicationPassword}
                onChange={(e) => setApplicationPassword(e.target.value)}
                required
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                This is not your normal WordPress login password. Generate one under your WordPress
                profile → Application Passwords.
              </p>
            </div>

            {connectMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {connectMutation.error?.message || "Failed to connect to WordPress. Please try again."}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={connectMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={connectMutation.isPending} className="gap-1.5">
              {connectMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {connectMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function formatDateTime(value) {
  if (!value) return null
  return new Date(value).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

/**
 * Generates a one-time pairing token (Phase 3A) and walks the user through
 * pasting it into the WordPress plugin's own settings page — Odito never
 * automatically installs the plugin (WordPress's REST API has no safe way
 * to upload/activate a non-wordpress.org plugin for a non-interactive
 * caller; see the Phase 3A report's "Plugin Installation" section), so
 * download-and-manually-upload is the supported path.
 */
function PluginPairingDialog({ open, onOpenChange, projectId }) {
  const [copied, setCopied] = useState(false)
  const [downloadError, setDownloadError] = useState(null)
  const generateMutation = useGenerateWordPressPairingToken(projectId)

  useEffect(() => {
    if (open) {
      setCopied(false)
      setDownloadError(null)
      generateMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleGenerate = () => {
    generateMutation.mutate()
  }

  const handleCopy = async () => {
    const token = generateMutation.data?.data?.token
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — the
      // token is still selectable/copyable manually from the input below.
    }
  }

  const handleDownload = async () => {
    setDownloadError(null)
    try {
      await apiService.downloadWordPressPlugin()
    } catch (err) {
      setDownloadError(err.message || "Failed to download the plugin.")
    }
  }

  const token = generateMutation.data?.data?.token
  const expiresAt = generateMutation.data?.data?.expiresAt

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Install the Odito Plugin</DialogTitle>
          <DialogDescription>
            Download the plugin, install it on your WordPress site, then paste the pairing token
            below into the plugin&apos;s settings page to connect it to this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">1. Download and install</p>
            <Button type="button" variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download Odito Plugin
            </Button>
            {downloadError && <p className="text-xs text-destructive" role="alert">{downloadError}</p>}
            <p className="text-xs text-muted-foreground">
              In WordPress: Plugins → Add New → Upload Plugin, select the downloaded file, then Activate.
            </p>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">2. Generate a pairing token</p>
            {!token ? (
              <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? "Generating..." : "Generate Pairing Token"}
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Input readOnly value={token} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste this into Settings → Odito on your WordPress site. This token is one-time use and expires{" "}
                  {expiresAt ? `at ${formatDateTime(expiresAt)}` : "in 15 minutes"}.
                </p>
              </>
            )}
            {generateMutation.isError && (
              <p className="text-xs text-destructive" role="alert">
                {generateMutation.error?.message || "Failed to generate a pairing token."}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * WordPress's row — project-scoped (unlike Google's account-wide row above),
 * per Section 21 of the Phase 2 spec: the connection is always to whichever
 * project is currently active, read from ProjectContext, never from a URL
 * param. Connect opens ConnectWordPressDialog (a form, not a redirect) since
 * Application Passwords aren't OAuth.
 */
function WordPressProviderRow({ provider }) {
  const Icon = provider.icon
  const { activeProjectId } = useProject()
  const { data: statusResponse, isLoading } = useWordPressStatus(activeProjectId)
  const verifyMutation = useVerifyWordPressConnection(activeProjectId)
  const disconnectMutation = useDisconnectWordPress(activeProjectId)
  const [connectOpen, setConnectOpen] = useState(false)
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false)
  const [pairingOpen, setPairingOpen] = useState(false)
  const [formsExpanded, setFormsExpanded] = useState(false)

  const status = statusResponse?.data
  const badge = isLoading ? null : (WORDPRESS_STATUS_BADGE[status?.status] || WORDPRESS_STATUS_BADGE.not_connected)

  // Plugin (Phase 3A) status only makes sense once the Application Password
  // connection (Phase 2) itself is live — pairing is offered right below
  // that, not as a separate top-level row.
  const { data: pluginStatusResponse } = useWordPressPluginStatus(activeProjectId, { enabled: !!status?.connected })
  const pluginStatus = pluginStatusResponse?.data
  const { data: formsResponse } = useWordPressForms(activeProjectId, { enabled: !!pluginStatus?.connected && formsExpanded })
  const forms = formsResponse?.data || []

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync()
      setConfirmDisconnectOpen(false)
    } catch {
      // Inline error already surfaced via disconnectMutation.isError below.
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
              <div>{status.siteName || status.siteUrl}</div>
              {status.wordpressVersion && <div>WordPress {status.wordpressVersion}</div>}
              {status.pluginDetection?.status === "available" && status.pluginDetection.count != null && (
                <div>{status.pluginDetection.count} plugin{status.pluginDetection.count === 1 ? "" : "s"} detected</div>
              )}
              {status.pluginDetection?.status === "unavailable" && (
                <div>Plugin detection unavailable{status.pluginDetection.reason ? ` (${status.pluginDetection.reason.replace(/_/g, " ")})` : ""}</div>
              )}
              <div>Last verified: {status.lastVerifiedAt ? formatDateTime(status.lastVerifiedAt) : "Never"}</div>
            </dl>
          )}

          {/* Odito Plugin (Phase 3A) — deliberately labeled "Odito Plugin"
              to disambiguate from the line above, which reports the
              site's OWN installed WordPress plugin count (Phase 2 REST
              detection) — an unrelated number. */}
          {!isLoading && status?.connected && (
            <div className="mt-2.5 rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs">
              {pluginStatus?.connected ? (
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    Odito Plugin: Connected
                  </div>
                  <div>{pluginStatus.formsDetected} form{pluginStatus.formsDetected === 1 ? "" : "s"} detected</div>
                  <div>Last sync: {pluginStatus.lastFormSyncAt ? formatDateTime(pluginStatus.lastFormSyncAt) : "Never"}</div>
                  <div>Last seen: {pluginStatus.lastSeenAt ? formatDateTime(pluginStatus.lastSeenAt) : "Never"}</div>
                  {pluginStatus.formsDetected > 0 && (
                    <button
                      type="button"
                      className="mt-1 text-primary underline-offset-2 hover:underline"
                      onClick={() => setFormsExpanded((v) => !v)}
                    >
                      {formsExpanded ? "Hide detected forms" : "Show detected forms"}
                    </button>
                  )}
                  {formsExpanded && (
                    <ul className="mt-1.5 space-y-1.5 border-t border-border/60 pt-1.5">
                      {forms.map((form) => (
                        <li key={form._id}>
                          <div className="font-medium text-foreground">{form.name || "Untitled form"} <span className="text-muted-foreground/70">({form.provider.replace(/_/g, " ")})</span></div>
                          <div className="text-muted-foreground/80">{form.fields?.length || 0} field{form.fields?.length === 1 ? "" : "s"}: {(form.fields || []).map((f) => f.name).join(", ") || "none"}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 text-muted-foreground">
                  <div className="font-medium text-foreground">Odito Plugin: Not Installed</div>
                  <p>Install the Odito plugin on your WordPress site to detect Contact Form 7, Divi, and other forms.</p>
                  <div className="flex gap-2 pt-0.5">
                    <Button type="button" variant="outline" size="sm" onClick={() => setPairingOpen(true)}>
                      Get Pairing Token
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && status?.status === "verification_failed" && (
            <p className="mt-1.5 text-xs text-destructive" role="alert">
              {status.lastError || "The last verification attempt failed."}
            </p>
          )}

          {verifyMutation.isError && (
            <p className="mt-1.5 text-xs text-destructive" role="alert">
              {verifyMutation.error?.message || "Failed to re-verify this connection."}
            </p>
          )}
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
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "Verifying..." : "Re-verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDisconnectOpen(true)}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </>
        )}

        {!isLoading && status?.status === "verification_failed" && (
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
                  onClick={() => setConnectOpen(true)}
                  disabled={!activeProjectId}
                >
                  Connect
                </Button>
              </span>
            </TooltipTrigger>
            {!activeProjectId && (
              <TooltipContent>Select or create a project first.</TooltipContent>
            )}
          </Tooltip>
        )}
      </div>

      <ConnectWordPressDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        projectId={activeProjectId}
      />

      <PluginPairingDialog
        open={pairingOpen}
        onOpenChange={setPairingOpen}
        projectId={activeProjectId}
      />

      <AlertDialog open={confirmDisconnectOpen} onOpenChange={setConfirmDisconnectOpen}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-110">
          <div className="px-7 pt-7 pb-6 space-y-3">
            <AlertDialogHeader className="space-y-3 text-left sm:text-left">
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                Disconnect WordPress?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
                This removes Odito&apos;s stored connection to this WordPress site. Nothing on your
                WordPress site itself is changed, deleted, or disabled — no plugins, forms, or data
                are touched. You can reconnect at any time.
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
          <WordPressProviderRow
            provider={{
              id: "wordpress",
              name: "WordPress",
              description: "Securely connect your WordPress website using an Application Password.",
              icon: IconBrandWordpress,
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
