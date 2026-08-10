"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Search, AlertCircle } from 'lucide-react'

/**
 * Purely presentational site picker - all data-fetching/auto-select
 * orchestration lives in page.jsx. Mirrors
 * business-profile/BusinessProfileSetupPanel.jsx, adapted for Search
 * Console's flat site list (no account->location tiers): GSC's `sites.list`
 * returns one flat array of { siteUrl, permissionLevel }.
 */
export default function SearchConsoleSetupPanel({
  loading,
  error,
  onRetry,
  sites,
  onSelectSite,
  selecting,
}) {
  if (loading) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your Search Console properties…</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-muted-foreground">Couldn't load your Search Console properties.</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </Card>
    )
  }

  if (!sites?.length) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <Search className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">No Search Console properties found</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The connected Google account has no verified properties in Search Console. Add and verify your site at
          search.google.com/search-console first.
        </p>
      </Card>
    )
  }

  // Multiple properties, none chosen yet (the single-property case
  // auto-selects before this component would need to show a picker).
  if (sites.length > 1) {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold">Select a Search Console property</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose which verified property to show on this page.</p>
        <div className="mt-4 space-y-2">
          {sites.map((site) => (
            <button
              key={site.siteUrl}
              type="button"
              onClick={() => onSelectSite(site.siteUrl)}
              disabled={selecting}
              className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <span className="text-sm font-medium truncate">{site.siteUrl}</span>
              {site.permissionLevel && (
                <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wide">
                  {site.permissionLevel.replace(/_/g, ' ').toLowerCase()}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  return null
}
