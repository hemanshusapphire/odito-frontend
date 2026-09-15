"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, DollarSign, MousePointerClick, Eye, TrendingUp, Target, Award, Wallet, Percent } from 'lucide-react'

import { useProject } from '@/contexts/ProjectContext'
import { useGoogleAdsConnection, useGoogleAdsCampaignDetail } from '@/hooks/useDashboardQueries'

import GoogleAdsLoadingState from '@/components/dashboard/google-visibility/google-ads/GoogleAdsLoadingState'
import GoogleAdsCardState from '@/components/dashboard/google-visibility/google-ads/GoogleAdsCardState'
import GoogleAdsDateRangeSelector from '@/components/dashboard/google-visibility/google-ads/GoogleAdsDateRangeSelector'
import GoogleAdsKPICard from '@/components/dashboard/google-visibility/google-ads/GoogleAdsKPICard'
import CampaignPerformanceTrendsCard from '@/components/dashboard/google-visibility/google-ads/CampaignPerformanceTrendsCard'
import CampaignDetailAdsCard from '@/components/dashboard/google-visibility/google-ads/CampaignDetailAdsCard'
import KeywordPerformanceTable from '@/components/dashboard/google-visibility/google-ads/KeywordPerformanceTable'
import SearchTermsTable from '@/components/dashboard/google-visibility/google-ads/SearchTermsTable'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber, formatPercent, formatMultiplier } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'
import { GoogleAdsCurrencyProvider } from '@/contexts/GoogleAdsCurrencyContext'

const GOOGLE_ADS_BASE = '/app/google-visibility/google-ads'

const STATUS_VARIANT = { ENABLED: 'success', PAUSED: 'secondary', REMOVED: 'critical' }
const STATUS_LABEL = { ENABLED: 'Active', PAUSED: 'Paused', REMOVED: 'Removed' }

function channelLabel(type) {
  if (!type) return '—'
  return type.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

// Same 8-tile set as GoogleAdsKPIGrid (account-wide dashboard), sourced from
// this one campaign's own metrics summary (GET /campaigns/:campaignId)
// instead of the account overview - no sparkline here (that grid derives
// its sparklines from the account-wide daily series; a per-campaign
// equivalent isn't worth the extra request on a detail page that already
// has its own full trend chart below).
function kpiDefs(metrics, format, formatPrecise) {
  if (!metrics) return []
  return [
    { key: 'spend', label: 'Spend', icon: DollarSign, value: format(metrics.cost) },
    { key: 'clicks', label: 'Clicks', icon: MousePointerClick, value: formatNumber(metrics.clicks) },
    { key: 'impressions', label: 'Impressions', icon: Eye, value: formatNumber(metrics.impressions) },
    { key: 'ctr', label: 'CTR', icon: TrendingUp, value: formatPercent(metrics.ctr, 2) },
    { key: 'avgCpc', label: 'Average CPC', icon: Target, value: formatPrecise(metrics.avgCpc) },
    { key: 'conversions', label: 'Conversions', icon: Award, value: formatNumber(metrics.conversions) },
    { key: 'costPerConversion', label: 'Cost / Conversion', icon: Wallet, value: formatPrecise(metrics.costPerConversion) },
    { key: 'roas', label: 'ROAS', icon: Percent, value: formatMultiplier(metrics.roas) },
  ]
}

function CampaignDetailBody({ projectId, campaignId }) {
  const { format, formatPrecise } = useGoogleAdsCurrencyFormatter()
  const [dateRange, setDateRange] = useState({ preset: '30d', startDate: null, endDate: null })

  const { data, isLoading, isError, error, refetch } = useGoogleAdsCampaignDetail(projectId, campaignId, dateRange)
  const campaign = data?.data?.campaign
  const metrics = data?.data?.metrics

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-31 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    const notFound = error?.status === 404
    return (
      <GoogleAdsCardState
        status="error"
        message={notFound ? "This campaign hasn't synced yet, or no longer exists for this account." : "Couldn't load this campaign."}
        onRetry={notFound ? undefined : refetch}
        height="py-20"
      />
    )
  }

  const kpis = kpiDefs(metrics, format, formatPrecise)

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-border/60 pb-4">
        <Link
          href={GOOGLE_ADS_BASE}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Google Ads
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">{campaign?.name || 'Campaign'}</h1>
              <Badge variant={STATUS_VARIANT[campaign?.status] || 'secondary'} className="capitalize">
                {STATUS_LABEL[campaign?.status] || campaign?.status || 'Unknown'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {channelLabel(campaign?.channel_type)}
              {campaign?.budget?.amount != null && (
                <> &middot; {format(campaign.budget.amount)}/day</>
              )}
            </p>
          </div>
        </div>
      </div>

      <GoogleAdsDateRangeSelector value={dateRange} onChange={setDateRange} />

      {kpis.length === 0 ? (
        <GoogleAdsCardState status="empty" message="No activity for this campaign during this date range." height="py-14" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {kpis.map((kpi) => (
            <GoogleAdsKPICard key={kpi.key} kpi={{ ...kpi, spark: [], rangeDays: data?.data?.range?.days }} />
          ))}
        </div>
      )}

      <CampaignPerformanceTrendsCard projectId={projectId} dateRange={dateRange} ready campaignId={campaignId} />

      <CampaignDetailAdsCard projectId={projectId} campaignId={campaignId} ready />

      <KeywordPerformanceTable projectId={projectId} campaignId={campaignId} ready />

      <SearchTermsTable projectId={projectId} campaignId={campaignId} ready />
    </div>
  )
}

/**
 * Campaign Detail page (drill-down from CampaignOverviewTable). Read-only,
 * same "read from already-synced MongoDB, never call Google" contract as
 * the rest of the Google Ads dashboard - see page.jsx's own doc comment.
 * Gated on the account being connected+selected+synced at least once,
 * exactly like the dashboard root; if that isn't true yet there is nothing
 * campaign-specific to show, so this just points back to the root page,
 * which already owns that whole state machine (connect/select/sync-in-
 * progress/sync-failed).
 */
export default function CampaignDetailPage() {
  const { campaignId } = useParams()
  const { activeProjectId: projectId } = useProject()
  const connection = useGoogleAdsConnection(projectId)
  const { connected, selected, ready, data: statusData } = connection

  if (connection.isLoading) {
    return <div className="flex-1"><GoogleAdsLoadingState /></div>
  }

  if (!connected || !selected || !ready) {
    return (
      <div className="flex-1 space-y-4">
        <Link
          href={GOOGLE_ADS_BASE}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Google Ads
        </Link>
        <GoogleAdsCardState
          status="empty"
          message="Connect and sync a Google Ads account first to view campaign details."
          height="py-20"
        />
      </div>
    )
  }

  return (
    <GoogleAdsCurrencyProvider currencyCode={statusData?.currencyCode}>
      <div className="flex-1">
        <CampaignDetailBody projectId={projectId} campaignId={campaignId} />
      </div>
    </GoogleAdsCurrencyProvider>
  )
}
