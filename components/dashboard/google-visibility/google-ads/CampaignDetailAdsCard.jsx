"use client"

import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { useGoogleAdsCampaignAds } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatNumber, formatPercent } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

// Google's own Ad Strength rating, as already synced onto GoogleAdsAd.
// ad_strength - never derived/guessed here, this is the real value Google
// computed. POOR/AVERAGE surfaced as warning/critical so the exact issue
// this whole page exists to help diagnose (an ad rated Average or worse) is
// visible at a glance without leaving Odito.
const AD_STRENGTH_VARIANT = {
  EXCELLENT: 'success',
  GOOD: 'success',
  AVERAGE: 'warning',
  POOR: 'critical',
  NO_ADS: 'secondary',
  PENDING: 'secondary',
  UNKNOWN: 'secondary',
  UNSPECIFIED: 'secondary',
}

const APPROVAL_VARIANT = {
  APPROVED: 'success',
  APPROVED_LIMITED: 'warning',
  DISAPPROVED: 'critical',
  AREA_OF_INTEREST_ONLY: 'warning',
  UNKNOWN: 'secondary',
  UNSPECIFIED: 'secondary',
}

const STATUS_VARIANT = { ENABLED: 'success', PAUSED: 'secondary', REMOVED: 'critical' }

function titleCase(value) {
  if (!value) return '—'
  return value.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

function adTypeLabel(type) {
  if (!type) return 'Unknown'
  return titleCase(type)
}

/**
 * Every ad in this one campaign, with Google's own real Ad Strength rating
 * per ad - reads GET /google-ads/ads?campaignId= (ungrouped). This is the
 * live equivalent of what the Google Ads UI shows for "why is this ad
 * rated Average" - Odito does not compute or guess ad_strength, it only
 * displays the value already synced from Google (see GoogleAdsAd.js).
 * Headline/description text is not shown here because Odito's sync only
 * stores ad metadata + metrics, never the creative text of an already-live
 * Google Ads ad - that level of detail is only available for Odito's own
 * AI Campaign Builder drafts (see ai-campaign/ResponsiveSearchAdEditor.jsx).
 */
export default function CampaignDetailAdsCard({ projectId, campaignId, ready }) {
  const { format } = useGoogleAdsCurrencyFormatter()
  const { data, isLoading, isError, refetch } = useGoogleAdsCampaignAds(
    projectId,
    campaignId,
    { limit: 50, sortBy: 'cost', sortOrder: -1 },
    { enabled: !!ready }
  )
  const rows = data?.data || []
  const status = isLoading ? 'loading' : isError ? 'error' : rows.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Ads</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Every ad in this campaign, with Google&apos;s own Ad Strength rating</p>

      <div className="mt-4 overflow-x-auto">
        {status !== 'ready' ? (
          <GoogleAdsCardState status={status} icon={FileText} message="No ads synced for this campaign yet." onRetry={refetch} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ad Strength</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((ad) => (
                <TableRow key={`${ad.ad_group_id}:${ad.ad_id}`}>
                  <TableCell>
                    <div className="font-medium">{ad.name || `Ad ${ad.ad_id}`}</div>
                    <div className="text-[11px] text-muted-foreground">{ad.ad_group_name || 'Ad group'}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{adTypeLabel(ad.ad_type)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[ad.status] || 'secondary'} className="capitalize">
                      {titleCase(ad.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={AD_STRENGTH_VARIANT[ad.ad_strength] || 'secondary'}>
                      {ad.ad_strength && ad.ad_strength !== 'UNKNOWN' && ad.ad_strength !== 'UNSPECIFIED' ? titleCase(ad.ad_strength) : 'Not rated'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={APPROVAL_VARIANT[ad.approval_status] || 'secondary'}>
                      {titleCase(ad.approval_status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(ad.metrics?.clicks)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatPercent(ad.metrics?.ctr)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(ad.metrics?.conversions)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{format(ad.metrics?.cost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {status === 'ready' && (
        <div className="mt-3 text-[11.5px] text-muted-foreground">
          Showing {rows.length} ad{rows.length === 1 ? '' : 's'}
        </div>
      )}
    </Card>
  )
}
