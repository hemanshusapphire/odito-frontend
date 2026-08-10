"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  BarChart3,
  Building,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ArrowRight,
  Info,
} from 'lucide-react'
import apiService from '@/lib/apiService'
import { useProject } from '@/contexts/ProjectContext'
import {
  useBusinessProfileStatus,
  useBusinessProfileDetails,
  useAnalyticsStatus,
  useAnalyticsProperty,
  useSearchConsoleStatus,
} from '@/hooks/useDashboardQueries'

const GOOGLE_ERROR_MESSAGES = {
  expired_or_invalid_request: 'That connection request expired. Please try connecting again.',
  access_denied: 'Access denied for this project.',
  no_refresh_token: 'Google did not grant offline access. Please try again and approve all requested permissions.',
  save_failed: 'We could not save your Google connection. Please try again.',
  connection_failed: 'Google connection failed. Please try again.',
}

function formatDateTime(value) {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function ConnectionBadge({ status }) {
  if (!status) return null
  if (status.connected) {
    return (
      <Badge variant="success">
        <CheckCircle2 className="h-3 w-3" /> Connected
      </Badge>
    )
  }
  if (status.connectionStatus === 'expired') {
    return (
      <Badge variant="warning">
        <AlertTriangle className="h-3 w-3" /> Expired
      </Badge>
    )
  }
  if (status.connectionStatus === 'revoked') {
    return (
      <Badge variant="critical">
        <XCircle className="h-3 w-3" /> Revoked
      </Badge>
    )
  }
  return <Badge variant="outline">Not connected</Badge>
}

export default function GoogleVisibilityPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { activeProjectId } = useProject()

  const [banner, setBanner] = useState(null)
  const [connecting, setConnecting] = useState(false)

  // Connection status is shared across all three service cards below (one
  // GoogleConnection document per project covers Business Profile, Search
  // Console and Analytics - see GoogleConnection.service_type) - the
  // Business Profile status endpoint returns the same connection-level
  // fields (connected/googleEmail/connectionStatus/lastSyncAt) regardless of
  // which service you ask via, so this single React Query call replaces
  // what used to be a raw useState + manual fetchStatus() duplicated
  // nowhere else - reused as the one status source for the whole page.
  const statusQuery = useBusinessProfileStatus(activeProjectId)
  const status = statusQuery.data?.data
  const statusLoading = statusQuery.isLoading

  // Business name for the "Current Location" line on the hub card below -
  // reuses the existing details hook (same one the dedicated Business
  // Profile page uses), only enabled once a location is actually selected.
  const detailsQuery = useBusinessProfileDetails(activeProjectId, { enabled: !!status?.serviceEnabled })
  const details = detailsQuery.data?.data

  // Search Console - status/summary only, same reused-shared-status pattern
  // as Business Profile/Analytics below. All selection, sync and dashboard
  // logic lives exclusively on the dedicated page
  // (app/app/google-visibility/search-console/page.jsx) via its own
  // useSearchConsoleStatus hook - no raw useState/fetch duplicated here.
  const searchConsoleStatusQuery = useSearchConsoleStatus(activeProjectId)
  const searchConsoleStatus = searchConsoleStatusQuery.data?.data

  // Analytics (GA4) - status/summary only, same reused-shared-status
  // pattern as Business Profile above. All selection, sync and dashboard
  // logic lives exclusively on the dedicated page
  // (app/app/google-visibility/analytics/page.jsx) - no raw useState/fetch
  // duplicated here.
  const analyticsStatusQuery = useAnalyticsStatus(activeProjectId)
  const analyticsStatus = analyticsStatusQuery.data?.data

  const analyticsPropertyQuery = useAnalyticsProperty(activeProjectId, { enabled: !!analyticsStatus?.serviceEnabled })
  const analyticsProperty = analyticsPropertyQuery.data?.data

  // Read the redirect-back query params the backend OAuth callback attaches
  // (?google_connected=1 or ?google_error=<code>), surface them once, then
  // strip them from the URL so a refresh doesn't re-show the banner.
  const justConnectedRef = useRef(false)

  useEffect(() => {
    const connected = searchParams.get('google_connected')
    const error = searchParams.get('google_error')

    if (connected) {
      setBanner({ type: 'success', message: 'Google account connected successfully.' })
      justConnectedRef.current = true
    } else if (error) {
      setBanner({ type: 'error', message: GOOGLE_ERROR_MESSAGES[error] || 'Failed to connect Google account.' })
    }

    if (connected || error) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('google_connected')
      params.delete('google_error')
      params.delete('projectId')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The status query below is persisted to localStorage (see
  // lib/queryClient.js) and kept "fresh" for staleTimes.STANDARD (5 min).
  // A page landing here straight off the OAuth redirect rehydrates that
  // persisted (pre-connection) "not connected" entry and, being still
  // within its staleTime window, React Query won't auto-refetch it - so the
  // connection badge/buttons would keep showing "Not connected" for up to
  // 5 minutes despite the GoogleConnection the redirect just created,
  // until something else (e.g. switching projects, which invalidates the
  // whole cache) forces a refetch. Force that one refetch here instead, as
  // soon as activeProjectId is known, so the UI reflects reality immediately.
  useEffect(() => {
    if (justConnectedRef.current && activeProjectId) {
      justConnectedRef.current = false
      statusQuery.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId])

  async function handleConnect() {
    if (!activeProjectId) return
    setConnecting(true)
    setBanner(null)
    try {
      const res = await apiService.getGoogleConnectUrl(activeProjectId)
      if (res?.data?.url) {
        window.location.href = res.data.url
        return
      }
      setBanner({ type: 'error', message: 'Could not start the Google connection.' })
    } catch (error) {
      setBanner({ type: 'error', message: error.message || 'Could not start the Google connection.' })
    } finally {
      setConnecting(false)
    }
  }

  const isReconnect = status?.connectionStatus === 'expired' || status?.connectionStatus === 'revoked'

  return (
    <div className="flex-1 space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Google Visibility</h1>
            <p className="text-muted-foreground">Monitor your Google search presence and performance</p>
          </div>
        </div>
      </div>

      {banner && (
        <div
          className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm ${
            banner.type === 'error'
              ? 'border-red-700/40 bg-red-900/20 text-red-300'
              : 'border-emerald-700/40 bg-emerald-900/20 text-emerald-300'
          }`}
        >
          <span>{banner.message}</span>
          <button onClick={() => setBanner(null)} aria-label="Dismiss" className="shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">Google Visibility Overview</h2>
              <ConnectionBadge status={status} />
            </div>
            <p className="text-muted-foreground">
              {status?.connected
                ? <>Connected as <span className="font-medium text-foreground">{status.googleEmail}</span></>
                : 'Connect your Google account to view Search Console, Analytics, and Business Profile data.'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => statusQuery.refetch()} disabled={statusLoading}>
              <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
            </Button>
            {!statusLoading && activeProjectId && !status?.connected && (
              <Button onClick={handleConnect} disabled={connecting} className="flex items-center gap-2">
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isReconnect ? 'Reconnect Google' : 'Connect Google'}
              </Button>
            )}
          </div>
        </div>

        {/* Purely informational - all actual account management (reconnect,
            switch account, disconnect) lives on Settings -> Profile
            (components/settings/profile/ConnectedAccountsCard.jsx) and is
            NOT duplicated here. This just points users there. */}
        {status?.connected && (
          <div className="mt-4 rounded-lg border bg-muted/30 px-4 py-3.5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Manage Google Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Google account connection settings are managed from your Profile Settings.
                </p>
                <ul className="text-xs text-muted-foreground mt-1.5 space-y-0.5 list-disc list-inside">
                  <li>Reconnect your Google account</li>
                  <li>Switch to another Google account</li>
                  <li>Disconnect Google completely</li>
                </ul>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
              <Link href="/app/settings/profile">
                Open Profile Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {!activeProjectId && (
          <p className="text-sm text-muted-foreground">Select or create a project to connect Google Visibility.</p>
        )}

        {activeProjectId && (
          <div className="space-y-6">
            {/* Search Console - status/summary only. All selection, sync and
                dashboard logic lives exclusively on the dedicated page
                (app/app/google-visibility/search-console/page.jsx); this
                card just links there - exact structural mirror of the
                Analytics/Business Profile cards below. */}
            <Card className="p-6 border-2">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Search Console</h3>
                  <p className="text-sm text-muted-foreground">View search rankings and performance</p>
                </div>
              </div>

              {searchConsoleStatusQuery.isLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-40" />
                </div>
              )}

              {!searchConsoleStatusQuery.isLoading && !status?.connected && (
                <p className="text-sm text-muted-foreground">
                  Use the "{isReconnect ? 'Reconnect Google' : 'Connect Google'}" button above to get started.
                </p>
              )}

              {!searchConsoleStatusQuery.isLoading && status?.connected && !searchConsoleStatus?.service_enabled && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Connected - choose a property to finish setup.</p>
                  <Button asChild size="sm" className="gap-2 shrink-0">
                    <Link href="/app/google-visibility/search-console">
                      Set up
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {!searchConsoleStatusQuery.isLoading && status?.connected && searchConsoleStatus?.service_enabled && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>
                  </div>
                  {searchConsoleStatus?.search_console_site_url && (
                    <p className="text-sm font-medium text-foreground truncate">
                      {searchConsoleStatus.search_console_site_url.replace('sc-domain:', '')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Last synced: {formatDateTime(searchConsoleStatus.last_sync_at)}</p>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/app/google-visibility/search-console">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </Card>

            {/* Analytics - status/summary only. All selection, sync and
                dashboard logic lives exclusively on the dedicated page
                (app/app/google-visibility/analytics/page.jsx); this card
                just links there - exact structural mirror of the Business
                Profile card below. */}
            <Card className="p-6 border-2">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track website traffic and user behavior</p>
                </div>
              </div>

              {analyticsStatusQuery.isLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-40" />
                </div>
              )}

              {!analyticsStatusQuery.isLoading && !status?.connected && (
                <p className="text-sm text-muted-foreground">
                  Use the "{isReconnect ? 'Reconnect Google' : 'Connect Google'}" button above to get started.
                </p>
              )}

              {!analyticsStatusQuery.isLoading && status?.connected && !analyticsStatus?.serviceEnabled && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Connected - choose a property to finish setup.</p>
                  <Button asChild size="sm" className="gap-2 shrink-0">
                    <Link href="/app/google-visibility/analytics">
                      Set up
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {!analyticsStatusQuery.isLoading && status?.connected && analyticsStatus?.serviceEnabled && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>
                  </div>
                  {analyticsProperty?.propertyName && (
                    <p className="text-sm font-medium text-foreground truncate">{analyticsProperty.propertyName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Last synced: {formatDateTime(analyticsStatus.lastSyncAt)}</p>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/app/google-visibility/analytics">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </Card>

            {/* Business Profile - status/summary only. All selection and
                dashboard logic lives exclusively on the dedicated page
                (app/app/google-visibility/business-profile/page.jsx); this
                card just links there. */}
            <Card className="p-6 border-2">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Business Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your Google Business listing</p>
                </div>
              </div>

              {statusLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-40" />
                </div>
              )}

              {!statusLoading && !status?.connected && (
                <p className="text-sm text-muted-foreground">
                  Use the "{isReconnect ? 'Reconnect Google' : 'Connect Google'}" button above to get started.
                </p>
              )}

              {!statusLoading && status?.connected && !status?.serviceEnabled && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Connected - choose a location to finish setup.</p>
                  <Button asChild size="sm" className="gap-2 shrink-0">
                    <Link href="/app/google-visibility/business-profile">
                      Set up
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {!statusLoading && status?.connected && status?.serviceEnabled && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>
                  </div>
                  {details?.businessName && (
                    <p className="text-sm font-medium text-foreground truncate">{details.businessName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Last synced: {formatDateTime(status.lastSyncAt)}</p>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/app/google-visibility/business-profile">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  )
}
