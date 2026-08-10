"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Building2, AlertCircle } from 'lucide-react'

/**
 * Purely presentational - all data-fetching/auto-select orchestration lives
 * in page.jsx (single source of truth so the header's "Sync Now" button can
 * drive the same accounts/locations queries). Rendered only while the
 * project is connected to Google but doesn't have a location selected yet;
 * the common case (exactly one account, one location) never renders
 * anything visible here - it resolves automatically before this component
 * would need to show a picker.
 */
export default function BusinessProfileSetupPanel({
  loading,
  error,
  onRetry,
  accounts,
  selectedAccountId,
  onSelectAccount,
  locations,
  onSelectLocation,
  selecting,
}) {
  if (loading) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Setting up your Business Profile…</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-muted-foreground">Couldn't load your Google Business Profile accounts.</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </Card>
    )
  }

  if (!accounts?.length) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <Building2 className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">No Google Business Profile accounts found</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The connected Google account doesn't manage any Business Profile listings.
        </p>
      </Card>
    )
  }

  // Multiple accounts, none chosen yet.
  if (accounts.length > 1 && !selectedAccountId) {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold">Choose a Google Business account</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your Google account manages more than one Business Profile account.
        </p>
        <div className="mt-4 space-y-2">
          {accounts.map((a) => (
            <button
              key={a.accountId}
              type="button"
              onClick={() => onSelectAccount(a.accountId)}
              className="w-full text-left px-4 py-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors text-sm font-medium"
            >
              {a.accountName}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  if (selectedAccountId && locations?.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <Building2 className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">No locations found</p>
        <p className="text-xs text-muted-foreground max-w-sm">This Business Profile account has no locations to show.</p>
      </Card>
    )
  }

  // Multiple locations - inline picker (only path a user ever has to click through).
  if (locations?.length > 1) {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold">Select a Business Profile location</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose which location to show on this page.</p>
        <div className="mt-4 space-y-2">
          {locations.map((loc) => (
            <button
              key={loc.locationId}
              type="button"
              onClick={() => onSelectLocation(loc.locationId)}
              disabled={selecting}
              className="w-full text-left px-4 py-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <p className="text-sm font-medium">{loc.locationName}</p>
              {loc.address && <p className="text-xs text-muted-foreground mt-0.5">{loc.address}</p>}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  // Exactly one account/location - auto-selection is in flight, covered by
  // the `loading`/`selecting` states above.
  return null
}
