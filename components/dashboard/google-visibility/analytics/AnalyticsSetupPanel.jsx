"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, BarChart3, AlertCircle } from 'lucide-react'

/**
 * Purely presentational - all data-fetching/auto-select orchestration lives
 * in page.jsx, exactly mirroring business-profile/BusinessProfileSetupPanel.jsx.
 * GA4 properties are a single flat list (unlike Business Profile's
 * account->location two-level hierarchy - see analyticsService.js's
 * getAnalyticsProperties, which already flattens across every accessible
 * account), so this panel has one picker level, not two. Rendered only
 * while connected to Google but no property selected yet; the common case
 * (exactly one property) never renders anything visible here - it resolves
 * automatically before this component would need to show a picker.
 */
export default function AnalyticsSetupPanel({
  loading,
  error,
  onRetry,
  properties,
  onSelectProperty,
  selecting,
}) {
  if (loading) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Setting up your Analytics property…</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-muted-foreground">Couldn't load your Google Analytics properties.</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </Card>
    )
  }

  if (!properties?.length) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">No Google Analytics properties found</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The connected Google account doesn't have access to any GA4 properties.
        </p>
      </Card>
    )
  }

  // Multiple properties - inline picker (only path a user ever has to click through).
  if (properties.length > 1) {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold">Select a Google Analytics property</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose which GA4 property to show on this page.</p>
        <div className="mt-4 space-y-2">
          {properties.map((p) => (
            <button
              key={p.propertyId}
              type="button"
              onClick={() => onSelectProperty(p.propertyId)}
              disabled={selecting}
              className="w-full text-left px-4 py-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <p className="text-sm font-medium">{p.displayName}</p>
              {p.websiteUrl && <p className="text-xs text-muted-foreground mt-0.5">{p.websiteUrl}</p>}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  // Exactly one property - auto-selection is in flight, covered by the
  // `loading`/`selecting` states above.
  return null
}
