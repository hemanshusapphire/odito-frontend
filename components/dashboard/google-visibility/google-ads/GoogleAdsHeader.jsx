"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink, RefreshCw, Loader2, Repeat, History } from 'lucide-react'
import { formatRelativeTime as formatSyncTime } from '@/lib/formatRelativeTime'
import CreateCampaignMenu from './ai-campaign/CreateCampaignMenu'

const GOOGLE_ADS_BASE_PATH = '/app/google-visibility/google-ads'

/**
 * Page header for the Google Ads dashboard - mirrors
 * analytics/AnalyticsHeader.jsx's structure exactly (same two-mode shape as
 * business-profile/BusinessProfileHeader.jsx) so every Google Visibility
 * page shares one header pattern: bare "Connected" badge before an account
 * is selected, the full action row ("Synced X ago" + "Refresh Data" +
 * "Open Google Ads") once one is. The date-range picker lives in
 * GoogleAdsDateRangeSelector.jsx below the header, same split as Analytics'
 * AnalyticsHeader/AnalyticsFilters. Presentational only - `refreshing`/
 * `onRefresh` are plain props, no fetching lives here.
 */
export default function GoogleAdsHeader({
  connected,
  accountName,
  customerId,
  lastSyncedAt,
  refreshing = false,
  onRefresh,
  onChangeAccount,
}) {
  const router = useRouter()
  const hasAccount = !!customerId
  const displayId = customerId ? customerId.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3') : null

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Monitor campaign performance, advertising spend and return on investment across your Google Ads accounts.
        </p>

        {hasAccount && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-foreground">{accountName || 'Google Ads Account'}</span>
            {displayId && <span className="text-xs font-mono text-muted-foreground">{displayId}</span>}
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

        {hasAccount && (
          <>
            {lastSyncedAt && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Synced {formatSyncTime(lastSyncedAt)}
              </span>
            )}

            {/* Phase 3 — AI Campaign Builder entry point. Isolated: opens
                its own route, never touches this dashboard's data paths. */}
            <CreateCampaignMenu basePath={GOOGLE_ADS_BASE_PATH} />

            {/* Secondary action: makes the existing AI campaign drafts list
                (already reachable via CreateCampaignMenu's "Continue a
                draft" item) directly discoverable from the header, rather
                than buried inside the Create Campaign dropdown. Reuses the
                exact same route/page — no second campaign-list implementation. */}
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => router.push(`${GOOGLE_ADS_BASE_PATH}/ai-campaigns`)}
              data-testid="recent-campaigns"
            >
              <History className="h-4 w-4" />
              Recent Campaigns
            </Button>

            <Button size="sm" variant="outline" onClick={onRefresh} disabled={refreshing} className="gap-2">
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {refreshing ? 'Refreshing…' : 'Refresh Data'}
            </Button>

            {onChangeAccount && (
              <Button variant="outline" size="sm" onClick={onChangeAccount} className="gap-2">
                <Repeat className="h-4 w-4" />
                Change Account
              </Button>
            )}

            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://ads.google.com" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open Google Ads
              </a>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
