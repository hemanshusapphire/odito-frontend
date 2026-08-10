"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink, RefreshCw, Loader2, Repeat } from 'lucide-react'
import { formatRelativeTime as formatSyncTime } from '@/lib/formatRelativeTime'

/**
 * Page header. Two render modes, driven by whether `siteUrl` is present -
 * mirrors components/dashboard/google-visibility/business-profile/BusinessProfileHeader.jsx.
 *
 * - Onboarding (no site selected yet): title, subtitle, bare Connected badge.
 * - Dashboard (site selected): adds the site URL/last-synced line and actions.
 */
export default function SearchConsoleHeader({
  connected,
  siteUrl,
  lastSyncedAt,
  syncing,
  onSync,
  onChangeSite,
}) {
  const hasSelection = !!siteUrl
  const consoleUrl = siteUrl
    ? `https://search.google.com/search-console?resource_id=${encodeURIComponent(siteUrl)}`
    : null

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Console</h1>
        <p className="text-muted-foreground max-w-lg">
          Monitor your website's search performance, indexing and visibility across Google Search.
        </p>

        {hasSelection && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-foreground">{siteUrl}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {connected && (
          <Badge variant="success" className="gap-1.5 px-2.5 py-1">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        )}

        {hasSelection && (
          <>
            {lastSyncedAt && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Synced {formatSyncTime(lastSyncedAt)}
              </span>
            )}

            <Button size="sm" onClick={onSync} disabled={syncing} className="gap-2">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {syncing ? 'Refreshing…' : 'Refresh Data'}
            </Button>

            {onChangeSite && (
              <Button variant="outline" size="sm" onClick={onChangeSite} className="gap-2">
                <Repeat className="h-4 w-4" />
                Change Property
              </Button>
            )}

            <Button variant="outline" size="sm" className="gap-2" asChild={!!consoleUrl}>
              {consoleUrl ? (
                <a href={consoleUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in Search Console
                </a>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Open in Search Console
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
