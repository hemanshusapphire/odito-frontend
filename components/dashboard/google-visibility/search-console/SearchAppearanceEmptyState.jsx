"use client"

import { Info } from 'lucide-react'

const APPEARANCE_EXAMPLES = [
  'Rich Results',
  'Product Results',
  'Image Results',
  'Video Results',
  'FAQ Results (where applicable)',
  'Other supported search appearance types',
]

/**
 * Educational empty-state body for the Search Appearance card - passed as
 * DimensionBreakdownList's `emptyMessage` prop. Distinct from the generic
 * "No data yet" default Country/Device use: a confirmed forensic
 * investigation (Google's raw searchAnalytics.query response, every date
 * range, this exact property) showed Google genuinely returns zero
 * searchAppearance rows here - not a sync, auth, or parsing problem. This
 * copy explains why that's expected instead of reading as broken.
 */
export default function SearchAppearanceEmptyState() {
  return (
    <div className="max-w-md mx-auto space-y-3">
      <p className="text-foreground">
        Google isn't currently reporting any special Search Appearance types for this property.
      </p>

      <p className="text-muted-foreground">
        Search Appearance data becomes available when Google serves your pages as enhanced search results, such as:
      </p>

      <ul className="text-muted-foreground text-left list-disc list-inside space-y-1 mx-auto w-fit">
        {APPEARANCE_EXAMPLES.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ul>

      <p className="text-muted-foreground">
        Standard organic search results are not included in this report.
      </p>

      <p className="text-muted-foreground">
        Once Google starts reporting Search Appearance categories, they will automatically appear here after the next sync.
      </p>

      <div className="flex justify-center pt-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          <Info className="h-3 w-3" />
          Based on Google Search Analytics
        </span>
      </div>
    </div>
  )
}
