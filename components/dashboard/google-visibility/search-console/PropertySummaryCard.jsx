"use client"

import { Card } from '@/components/ui/card'
import BrandAvatar from '@/components/ui/BrandAvatar'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

function propertyTypeFor(siteUrl) {
  if (!siteUrl) return null
  return siteUrl.startsWith('sc-domain:') ? 'Domain Property' : 'URL-prefix Property'
}

function displaySiteName(siteUrl) {
  if (!siteUrl) return undefined
  return siteUrl.replace(/^sc-domain:/, '').replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/**
 * Property/connection summary strip. Every field here is real: GSC's API
 * exposes no verification-status or business-details endpoint the way
 * Business Profile does, so this intentionally shows only what Odito
 * actually has - the selected property, its type (derived from the
 * `sc-domain:` prefix), the connected Google account, and real sync
 * metadata - rather than a fabricated "Verified"/"Data Range" tile.
 *
 * The leading icon reuses BrandAvatar (the same centralized Brand Asset
 * system - see hooks/useDashboardQueries.js useProjectBrandAsset - that
 * Analytics's AnalyticsPropertyCard and Business Profile's
 * BusinessSummaryCard already use), instead of a generic Globe glyph, so
 * the real site logo/favicon shows here too.
 */
export default function PropertySummaryCard({ siteUrl, googleEmail, dataPoints, latestDataDate, brandAsset }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <BrandAvatar brandAsset={brandAsset} name={displaySiteName(siteUrl)} size={48} rounded="rounded-xl" />

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Search Console Property</p>
            <p className="text-sm font-medium mt-0.5 truncate" title={siteUrl}>{siteUrl}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Property Type</p>
            <p className="text-sm font-medium mt-0.5">{propertyTypeFor(siteUrl) || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Connected Account</p>
            <p className="text-sm font-medium mt-0.5 truncate" title={googleEmail}>{googleEmail || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Last Data Update</p>
            <p className="text-sm font-medium mt-0.5">
              {latestDataDate ? formatRelativeTime(latestDataDate) : '—'}
              {typeof dataPoints === 'number' && (
                <span className="text-muted-foreground font-normal"> · {dataPoints.toLocaleString()} pages</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
