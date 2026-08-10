"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink, RefreshCw, Loader2, Repeat } from 'lucide-react'
import { formatRelativeTime as formatSyncTime } from '@/lib/formatRelativeTime'

/**
 * Page header for the Analytics dashboard. Mirrors
 * business-profile/BusinessProfileHeader.jsx's two-mode structure so both
 * Google Visibility pages share one header pattern: a bare "Connected"
 * badge before a property is selected, the full action row once GA4 data
 * exists - "Refresh Data" (never "Sync Now") once onboarded, matching GBP's
 * exact label; onboarding itself has no manual sync step (selection
 * auto-chains into sync - see analytics/page.jsx). Presentational only -
 * `syncing`/`onSync`/`onOpenGA4`/`onChangeProperty` are plain props, no
 * fetching lives here.
 */
export default function AnalyticsHeader({
  connected,
  propertyName,
  lastSyncedAt,
  syncing = false,
  onSync,
  gaPropertyUrl,
  onChangeProperty,
}) {
  const hasProperty = !!propertyName

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Analytics</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Monitor website traffic, user behaviour and business performance from Google Analytics.
        </p>

        {hasProperty && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-foreground">{propertyName}</span>
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

        {hasProperty && (
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

            {onChangeProperty && (
              <Button variant="outline" size="sm" onClick={onChangeProperty} className="gap-2">
                <Repeat className="h-4 w-4" />
                Change Property
              </Button>
            )}

            <Button variant="outline" size="sm" className="gap-2" asChild={!!gaPropertyUrl} disabled={!gaPropertyUrl}>
              {gaPropertyUrl ? (
                <a href={gaPropertyUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Analytics
                </a>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Analytics
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
