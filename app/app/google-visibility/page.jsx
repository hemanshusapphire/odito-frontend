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
  RefreshCw,
  CheckCircle2,
  X,
  ArrowRight,
  Info,
} from 'lucide-react'
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

export default function GoogleVisibilityPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { activeProjectId } = useProject()

  const [banner, setBanner] = useState(null)

  // Each service now has its own independent GoogleConnection (its own
  // Google account, its own OAuth consent) - Business Profile, Search
  // Console and Analytics status are three separate queries below, never
  // treated as one shared identity. Connect/Change Account/Disconnect for
  // all three live exclusively in Settings -> Profile (Google Services);
  // this page only reads each service's own status.
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

  // Each status query below is persisted to localStorage (see
  // lib/queryClient.js) and kept "fresh" for staleTimes.STANDARD (5 min).
  // A page landing here straight off a Settings OAuth redirect rehydrates
  // that persisted (pre-connection) "not connected" entry and, being still
  // within its staleTime window, React Query won't auto-refetch it - so the
  // connection badges would keep showing "Not connected" for up to 5
  // minutes despite the GoogleConnection the redirect just created, until
  // something else (e.g. switching projects, which invalidates the whole
  // cache) forces a refetch. Force a refetch of all three here instead, as
  // soon as activeProjectId is known, so the UI reflects reality immediately.
  useEffect(() => {
    if (justConnectedRef.current && activeProjectId) {
      justConnectedRef.current = false
      statusQuery.refetch()
      searchConsoleStatusQuery.refetch()
      analyticsStatusQuery.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId])

  function refetchAllStatuses() {
    statusQuery.refetch()
    searchConsoleStatusQuery.refetch()
    analyticsStatusQuery.refetch()
  }

  const anyLoading = statusLoading || searchConsoleStatusQuery.isLoading || analyticsStatusQuery.isLoading

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
            <h2 className="text-xl font-semibold tracking-tight">Google Visibility Overview</h2>
            <p className="text-muted-foreground">
              Search Console, Analytics, and Business Profile can each use a different Google
              account.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={refetchAllStatuses} disabled={anyLoading}>
              <RefreshCw className={`h-4 w-4 ${anyLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Purely informational - all account management (connect, change
            account, disconnect) for every service lives on Settings ->
            Profile (components/settings/profile/ConnectedAccountsCard.jsx,
            "Google Services") and is NOT duplicated here. This just points
            users there - shown regardless of connection state, since there
            is no single shared "Connect Google" action anymore. */}
        <div className="rounded-lg border bg-muted/30 px-4 py-3.5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center shrink-0">
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Manage Google Accounts</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect, change, or disconnect the Google account for each service from your
                Profile Settings.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
            <Link href="/app/settings/profile">
              Open Profile Settings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

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

              {!searchConsoleStatusQuery.isLoading && !searchConsoleStatus?.connected && (
                <p className="text-sm text-muted-foreground">
                  Connect a Google account in{' '}
                  <Link href="/app/settings/profile" className="text-primary underline-offset-2 hover:underline">
                    Profile Settings
                  </Link>{' '}
                  to get started.
                </p>
              )}

              {!searchConsoleStatusQuery.isLoading && searchConsoleStatus?.connected && !searchConsoleStatus?.service_enabled && (
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

              {!searchConsoleStatusQuery.isLoading && searchConsoleStatus?.connected && searchConsoleStatus?.service_enabled && (
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

              {!analyticsStatusQuery.isLoading && !analyticsStatus?.connected && (
                <p className="text-sm text-muted-foreground">
                  Connect a Google account in{' '}
                  <Link href="/app/settings/profile" className="text-primary underline-offset-2 hover:underline">
                    Profile Settings
                  </Link>{' '}
                  to get started.
                </p>
              )}

              {!analyticsStatusQuery.isLoading && analyticsStatus?.connected && !analyticsStatus?.serviceEnabled && (
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

              {!analyticsStatusQuery.isLoading && analyticsStatus?.connected && analyticsStatus?.serviceEnabled && (
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
                  Connect a Google account in{' '}
                  <Link href="/app/settings/profile" className="text-primary underline-offset-2 hover:underline">
                    Profile Settings
                  </Link>{' '}
                  to get started.
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
