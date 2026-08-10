"use client"

import { Card } from '@/components/ui/card'
import BrandAvatar from '@/components/ui/BrandAvatar'
import { Globe } from 'lucide-react'

/**
 * GA4 property identity card - the Analytics equivalent of Business
 * Profile's BusinessSummaryCard. Reuses BrandAvatar (the same centralized
 * Brand Asset system the Workspace Switcher and Business Profile page use)
 * instead of introducing a second logo/initials implementation.
 */
export default function AnalyticsPropertyCard({
  brandAsset,
  siteName,
  siteUrl,
  streamStatus = 'Data streaming normally',
  property,
}) {
  const { propertyName, propertyId, measurementId, timezone } = property || {}

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="flex items-start gap-4 lg:border-r lg:border-border/60 lg:pr-6">
          <BrandAvatar brandAsset={brandAsset} name={siteName} size={56} />
          <div className="min-w-0">
            <div className="text-base font-bold tracking-tight truncate">{siteName || 'Untitled property'}</div>
            {siteUrl && (
              <a
                href={siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1 mt-0.5"
              >
                <Globe className="h-3 w-3" />
                {siteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {streamStatus}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 lg:pl-2">
          <PropertyFact label="GA4 Property" value={propertyName} />
          <PropertyFact label="Property ID" value={propertyId} mono />
          <PropertyFact label="Measurement ID" value={measurementId} mono />
          <PropertyFact label="Timezone" value={timezone} mono />
        </div>
      </div>
    </Card>
  )
}

function PropertyFact({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground/80">{label}</span>
      <span className={`text-sm truncate ${mono ? 'font-mono' : 'font-medium text-foreground'}`}>
        {value || <span className="italic text-muted-foreground">Not available</span>}
      </span>
    </div>
  )
}
