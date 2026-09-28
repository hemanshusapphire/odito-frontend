"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { IconBrandGoogle, IconBrandWordpress } from "@tabler/icons-react"
import { Link2, Loader2, Copy, Check, Download, Megaphone, Search, BarChart3, Building2, Inbox, Wand2, ChevronDown } from "lucide-react"
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
  useGoogleServiceConnections,
  useConnectGoogleService,
  useDisconnectGoogleService,
  invalidateGoogleServiceStatusQueries,
  useWordPressStatus,
  useConnectWordPress,
  useVerifyWordPressConnection,
  useDisconnectWordPress,
  useWordPressPluginStatus,
  useGenerateWordPressPairingToken,
  useWordPressForms,
  useWordPressCapabilities,
} from "@/hooks/useDashboardQueries"
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
 * (GoogleServicesSection) since it's the one provider with real, live
 * connections to reflect. Add a future non-comingSoon provider by giving it
 * the same treatment Google gets, not by extending this array's shape.
 */
function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

const GOOGLE_STATUS_BADGE = {
  connected: { label: "Connected", variant: "success" },
  expired: { label: "Expired", variant: "outline" },
  revoked: { label: "Reconnect Required", variant: "outline" },
  not_connected: { label: "Not Connected", variant: "outline" },
  error: { label: "Connection Error", variant: "critical" },
}

/**
 * The four independently-connectable Google services (Section 3). Each maps
 * to its own GoogleConnection.purpose and its own OAuth scope list on the
 * backend (see oauth.routes.js) - deliberately NOT a single "Google"
 * provider, so a different Google account can be used per service.
 */
const GOOGLE_SERVICES = [
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Manage campaigns, advertising performance and optimization.",
    icon: Megaphone,
  },
  {
    id: "search_console",
    name: "Search Console",
    description: "Monitor search visibility, queries and indexing.",
    icon: Search,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Analyze traffic and user behavior.",
    icon: BarChart3,
  },
  {
    id: "business_profile",
    name: "Business Profile",
    description: "Manage business profile data, locations and reviews.",
    icon: Building2,
  },
]

/**
 * One service's row within Google Services. Fully independent lifecycle -
 * Connect/Change Account/Disconnect here only ever touch this one service's
 * GoogleConnection row (purpose-scoped on the backend), never any other
 * service's. `status` is this service's slice of the single
 * useGoogleServiceConnections(activeProjectId) response the parent section
 * fetches once for all four rows (Section 34: no per-row network calls).
 */
function GoogleServiceRow({ service, activeProjectId, status, isLoading }) {
  const Icon = service.icon
  const connectService = useConnectGoogleService(activeProjectId, service.id)
  const disconnectMutation = useDisconnectGoogleService(activeProjectId, service.id)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState(null)
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false)

  const badge = isLoading ? null : (GOOGLE_STATUS_BADGE[status?.status] || GOOGLE_STATUS_BADGE.not_connected)
  const needsReconnect = status?.status === "expired" || status?.status === "revoked"

  const handleConnect = async () => {
    if (!activeProjectId) return
    setConnectError(null)
    setConnecting(true)
    try {
      await connectService("settings")
      // On success the browser navigates away to Google - nothing left to do.
    } catch (err) {
      setConnectError(err.message || `Failed to start ${service.name} connection.`)
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
          <h4 className="text-sm font-semibold text-foreground">{service.name}</h4>
          <p className="text-xs text-muted-foreground">{service.description}</p>

          {!isLoading && status?.connected && (
            <dl className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              {status.email && <div>{status.email}</div>}
              {status.connectedAt && <div>Connected on {formatDate(status.connectedAt)}</div>}
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
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConnect}
              disabled={connecting || !activeProjectId}
              className="gap-1.5"
            >
              {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {connecting ? "Redirecting..." : "Change Account"}
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
                  {connecting ? "Redirecting..." : needsReconnect ? "Reconnect" : "Connect Google Account"}
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
                Disconnect {service.name}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
                Odito will stop accessing {service.name} data from this Google account. Your other
                Google service connections for this project will remain unchanged. You can
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
              {disconnectMutation.isPending ? "Disconnecting..." : `Disconnect ${service.name}`}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}

/**
 * Google Services - Section 5/16: a separate, independently-manageable
 * Google account per service, scoped to whichever project is currently
 * active (same activeProjectId pattern WordPressProviderRow below already
 * uses). One network call (useGoogleServiceConnections) backs all four
 * rows - Settings never calls a live Google API just to render a status
 * badge (Section 34).
 */
function GoogleServicesSection() {
  const { activeProjectId } = useProject()
  const { data: connectionsResponse, isLoading } = useGoogleServiceConnections(activeProjectId)
  const connections = connectionsResponse?.data || {}
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
            <IconBrandGoogle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Google Services</h4>
            <p className="text-xs text-muted-foreground">
              Connect a separate Google account for each Odito service.
            </p>
          </div>
        </div>
        <ChevronDown
          className={`mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        !activeProjectId ? (
          <p className="mt-3 pl-13 text-xs text-muted-foreground">Select or create a project first.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border/60 pl-13 sm:pl-13">
            {GOOGLE_SERVICES.map((service) => (
              <GoogleServiceRow
                key={service.id}
                service={service}
                activeProjectId={activeProjectId}
                status={connections[service.id]}
                isLoading={isLoading}
              />
            ))}
          </ul>
        )
      )}
    </li>
  )
}

const WORDPRESS_STATUS_BADGE = {
  connected: { label: "Connected", variant: "success" },
  verification_failed: { label: "Verification Failed", variant: "critical" },
  not_connected: { label: "Not Connected", variant: "outline" },
}

/** Lead Capture and SEO Bridge are independent plugins on the SAME WordPress connection — each gets its own row/badge below WordPress, same layout as each Google service under Google Services. */
function leadCaptureBadge(wordPressConnected, pluginStatus) {
  if (!wordPressConnected) return { label: "Not Connected", variant: "outline" }
  return pluginStatus?.connected
    ? { label: "Installed", variant: "success" }
    : { label: "Not Installed", variant: "outline" }
}

function seoBridgeBadge(wordPressConnected, capabilities) {
  if (!wordPressConnected) return { label: "Not Connected", variant: "outline" }
  if (!capabilities) return { label: "Loading...", variant: "secondary" }
  if (capabilities.ambiguous) return { label: "Multiple Plugins", variant: "warning" }
  if (!capabilities.bridgeInstalled) return { label: "Not Installed", variant: "outline" }
  if (!capabilities.bridgeActive) return { label: "Inactive", variant: "warning" }
  if (capabilities.bridgeVersionSupported === false) return { label: "Update Required", variant: "warning" }
  if (capabilities.bridgeUpdateAvailable) return { label: "Update Available", variant: "warning" }
  return { label: "Active", variant: "success" }
}

// Human-readable labels for the capability object's field keys — mirrors
// odito_backend's seoProviderAdapter.js capability shape exactly
// (title/metaDescription/canonical/robots/openGraph/schema/slug/altText).
const SEO_FIELD_LABELS = {
  title: "Title",
  metaDescription: "Meta description",
  canonical: "Canonical URL",
  robots: "Robots meta",
  openGraph: "Open Graph",
  schema: "Schema markup",
  slug: "Slug",
  altText: "Image alt text",
}

const SEO_PROVIDER_LABELS = {
  none: "WordPress Core",
  aioseo: "AIOSEO",
  seopress: "SEOPress",
  rank_math: "Rank Math",
  yoast: "Yoast SEO",
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
  const [seoBridgeDownloadError, setSeoBridgeDownloadError] = useState(null)
  const [pluginsExpanded, setPluginsExpanded] = useState(false)

  const status = statusResponse?.data
  const badge = isLoading ? null : (WORDPRESS_STATUS_BADGE[status?.status] || WORDPRESS_STATUS_BADGE.not_connected)

  // Plugin (Phase 3A) status only makes sense once the Application Password
  // connection (Phase 2) itself is live — pairing is offered right below
  // that, not as a separate top-level row.
  const { data: pluginStatusResponse } = useWordPressPluginStatus(activeProjectId, { enabled: !!status?.connected })
  const pluginStatus = pluginStatusResponse?.data
  const { data: formsResponse } = useWordPressForms(activeProjectId, { enabled: !!pluginStatus?.connected && formsExpanded })
  const forms = formsResponse?.data || []

  // SEO provider detection + per-field capability table (Phase 4) — only
  // meaningful once the Application Password connection itself is live,
  // same enabling condition as the Odito Plugin status query above.
  const { data: capabilitiesResponse, isLoading: capabilitiesLoading } = useWordPressCapabilities(activeProjectId, { enabled: !!status?.connected })
  const capabilities = capabilitiesResponse?.data
  const writableFields = capabilities?.capabilities
    ? Object.entries(capabilities.capabilities).filter(([, c]) => c.write).map(([field]) => SEO_FIELD_LABELS[field] || field)
    : []

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync()
      setConfirmDisconnectOpen(false)
    } catch {
      // Inline error already surfaced via disconnectMutation.isError below.
    }
  }

  const handleDownloadSeoBridge = async () => {
    setSeoBridgeDownloadError(null)
    try {
      await apiService.downloadSeoBridgePlugin()
    } catch (err) {
      setSeoBridgeDownloadError(err.message || "Failed to download the Odito SEO Bridge plugin.")
    }
  }

  const leadCaptureBadgeInfo = isLoading ? { label: "Loading...", variant: "secondary" } : leadCaptureBadge(status?.connected, pluginStatus)
  // Shown when a Bridge is installed but older than the version Odito ships.
  // Installing the downloaded ZIP over the existing plugin (same slug) is a
  // normal WordPress update — the newer capabilities (FAQ, rating, robots,
  // site schema) then appear on the next capabilities check.
  const renderSeoBridgeUpdate = ({ withVersions = true } = {}) => {
    if (!capabilities?.bridgeUpdateAvailable) return null
    return (
      <div className="space-y-1.5 pt-1" data-testid="seo-bridge-update">
        <p className="font-medium text-amber-600 dark:text-amber-500">
          {withVersions && capabilities.bridgeVersion && capabilities.latestBridgeVersion
            ? `Update available: ${capabilities.bridgeVersion} → ${capabilities.latestBridgeVersion}`
            : "A newer Odito SEO Bridge is available."}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleDownloadSeoBridge} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Download latest Odito SEO Bridge
        </Button>
        <p>Upload it in WordPress under Plugins → Add New → Upload Plugin and replace the current version.</p>
        {seoBridgeDownloadError && (
          <p className="text-destructive" role="alert">{seoBridgeDownloadError}</p>
        )}
      </div>
    )
  }

  const seoBridgeBadgeInfo = isLoading ? { label: "Loading...", variant: "secondary" } : seoBridgeBadge(status?.connected, capabilitiesLoading ? null : capabilities)

  return (
    <li className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

        <button
          type="button"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => setPluginsExpanded((v) => !v)}
          aria-expanded={pluginsExpanded}
          aria-label={pluginsExpanded ? "Hide Odito WordPress plugins" : "Show Odito WordPress plugins"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${pluginsExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>
    </div>

      {/* Odito WordPress Plugins — Lead Capture and SEO Bridge are two
          separate, independent plugins (different responsibility, different
          trust boundary — never merged), but BOTH ride on this ONE
          WordPress connection/Application Password. Same list pattern as
          Google Services: one parent row above, one child row per
          plugin below, each with its own badge/button — no separate
          "connect" step or second Application Password for either plugin.
          Collapsed by default, same as Google Services, so the settings
          page doesn't dump every sub-row on screen at once. */}
      {pluginsExpanded && (
      <ul className="mt-2 divide-y divide-border/60 pl-13 sm:pl-13">
        <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Lead Capture</h4>
              <p className="text-xs text-muted-foreground">Capture leads from supported WordPress forms.</p>

              {status?.connected && pluginStatus?.connected && (
                <dl className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                  {pluginStatus.pluginVersion && <div>Version {pluginStatus.pluginVersion}</div>}
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
                </dl>
              )}
              {status?.connected && !pluginStatus?.connected && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Install the Odito plugin on your WordPress site to detect Contact Form 7, Divi, and other forms.
                </p>
              )}
              {!status?.connected && (
                <p className="mt-1.5 text-xs text-muted-foreground">Connect WordPress first.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pl-13 sm:pl-0">
            <Badge variant={leadCaptureBadgeInfo.variant} className={leadCaptureBadgeInfo.variant === "outline" ? "text-muted-foreground" : undefined}>
              {leadCaptureBadgeInfo.label}
            </Badge>
            {status?.connected && !pluginStatus?.connected && (
              <Button type="button" variant="outline" size="sm" onClick={() => setPairingOpen(true)}>
                Get Pairing Token
              </Button>
            )}
          </div>
        </li>

        <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
              <Wand2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">SEO Bridge</h4>
              <p className="text-xs text-muted-foreground">Apply SEO fixes directly to your WordPress SEO plugin.</p>

              {!status?.connected && (
                <p className="mt-1.5 text-xs text-muted-foreground">Connect WordPress first.</p>
              )}
              {status?.connected && capabilitiesLoading && (
                <p className="mt-1.5 text-xs text-muted-foreground">Checking...</p>
              )}
              {status?.connected && !capabilitiesLoading && capabilities?.ambiguous && (
                <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                  <div className="font-medium text-amber-600 dark:text-amber-500">Multiple SEO plugins detected.</div>
                  <div>{(capabilities.providers || []).map((p) => SEO_PROVIDER_LABELS[p] || p).join(", ")}</div>
                  <div>Automatic SEO fixes are disabled until one provider is selected.</div>
                </div>
              )}
              {status?.connected && !capabilitiesLoading && !capabilities?.ambiguous && !capabilities?.bridgeInstalled && (
                <div className="mt-1.5 space-y-1.5 text-xs text-muted-foreground">
                  <p>Install Odito SEO Bridge to enable automatic SEO fixes.</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadSeoBridge} className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Download Odito SEO Bridge
                  </Button>
                  {seoBridgeDownloadError && (
                    <p className="text-destructive" role="alert">{seoBridgeDownloadError}</p>
                  )}
                </div>
              )}
              {status?.connected && !capabilitiesLoading && !capabilities?.ambiguous && capabilities?.bridgeInstalled && !capabilities?.bridgeActive && (
                <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                  {capabilities.bridgeVersion && <div>Version {capabilities.bridgeVersion}</div>}
                  <p>Odito SEO Bridge is installed but inactive. Activate it in WordPress.</p>
                  {renderSeoBridgeUpdate()}
                </div>
              )}
              {status?.connected && !capabilitiesLoading && !capabilities?.ambiguous && capabilities?.bridgeActive && capabilities?.bridgeVersionSupported === false && (
                <div className="mt-1.5 space-y-1.5 text-xs text-muted-foreground">
                  <p>Please update Odito SEO Bridge to continue using automatic SEO fixes.</p>
                  {renderSeoBridgeUpdate({ withVersions: false })}
                </div>
              )}
              {status?.connected && !capabilitiesLoading && !capabilities?.ambiguous && capabilities?.bridgeActive && capabilities?.bridgeVersionSupported !== false && (
                <dl className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                  {capabilities.bridgeVersion && <div>Version {capabilities.bridgeVersion}</div>}
                  <div>Provider: <span className="font-medium text-foreground">{capabilities?.providerLabel || "WordPress Core"}</span></div>
                  {writableFields.length > 0 ? (
                    <div>Can auto-apply: {writableFields.join(", ")}</div>
                  ) : (
                    <div>No fields can be auto-applied via WordPress yet for this provider.</div>
                  )}
                  {renderSeoBridgeUpdate()}
                </dl>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pl-13 sm:pl-0">
            <Badge variant={seoBridgeBadgeInfo.variant} className={seoBridgeBadgeInfo.variant === "outline" ? "text-muted-foreground" : undefined}>
              {seoBridgeBadgeInfo.label}
            </Badge>
          </div>
        </li>
      </ul>
      )}

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

/**
 * Connected Accounts. Google Services reflects four fully independent
 * GoogleConnection rows, one per service (live status, Connect/Change
 * Account/Disconnect per service — reusing the existing OAuth start/
 * callback flow and token-revocation service, never a second OAuth
 * implementation). Microsoft/LinkedIn remain static placeholders until real
 * linking exists for them.
 */
export default function ConnectedAccountsCard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState(null)

  // Reads the redirect-back query params the OAuth callback attaches
  // (?google_connected=1 or ?google_error=<code>, plus ?projectId= when a
  // project-scoped flow redirected here) when it lands here (returnTo=
  // settings) instead of on /google-visibility — same pattern that page
  // already uses, just landing on a different route now.
  //
  // Invalidating only googleServices.connections here (as this used to)
  // fixes THIS card's own Google Services row, but every dedicated
  // service page (search-console/analytics/business-profile/google-ads)
  // keeps its own separate, persisted, 5-minute-stale-tolerant status
  // query — none of them are mounted right now to pick this up, so their
  // pre-connection "not connected" cache entry would otherwise keep being
  // served as "fresh" the next time the user opens one of those pages.
  // invalidateGoogleServiceStatusQueries covers all four (see its own doc
  // comment in useDashboardQueries.js) so connecting from here propagates
  // everywhere immediately, exactly like connecting from the Google
  // Visibility overview page already does for the queries it mounts.
  useEffect(() => {
    const connected = searchParams.get("google_connected")
    const error = searchParams.get("google_error")
    const projectId = searchParams.get("projectId")

    if (connected) {
      setToast({ message: "Google account connected successfully.", type: "success" })
      if (projectId) {
        invalidateGoogleServiceStatusQueries(queryClient, projectId)
      }
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
          <GoogleServicesSection />
          <WordPressProviderRow
            provider={{
              id: "wordpress",
              name: "WordPress",
              description: "Securely connect your WordPress website using an Application Password.",
              icon: IconBrandWordpress,
            }}
          />
        </ul>
      </CardContent>

      {toast && typeof document !== "undefined" && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </Card>
  )
}
