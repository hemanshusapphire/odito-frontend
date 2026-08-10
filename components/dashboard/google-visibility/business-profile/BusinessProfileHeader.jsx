"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, MapPin, RefreshCw, Loader2, Repeat } from 'lucide-react'
import { formatRelativeTime as formatSyncTime } from '@/lib/formatRelativeTime'

/**
 * Page header. Two distinct render modes, driven entirely by whether
 * `businessName` is present:
 *
 * - Onboarding (no businessName yet - nothing selected/synced): title,
 *   subtitle, and a bare Connected badge only. No Refresh/Change/Maps
 *   buttons - there is nothing to refresh, change, or open yet, and no
 *   manual sync action exists during onboarding (that's automatic - see
 *   business-profile/page.jsx).
 * - Dashboard (businessName present): adds the business name/current
 *   location/last-synced line and the three actions.
 */
export default function BusinessProfileHeader({
  connected,
  businessName,
  currentLocation,
  lastSyncedAt,
  syncing,
  onSync,
  mapsUrl,
  onChangeLocation,
}) {
  const hasSelection = !!businessName

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Business Profile</h1>
        <p className="text-muted-foreground max-w-lg">
          Monitor your business performance, local visibility and customer engagement from Google Business Profile.
        </p>

        {hasSelection && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-foreground">{businessName}</span>
            {currentLocation && (
              <span className="text-muted-foreground">{currentLocation}</span>
            )}
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

        {hasSelection && (
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

            {onChangeLocation && (
              <Button variant="outline" size="sm" onClick={onChangeLocation} className="gap-2">
                <Repeat className="h-4 w-4" />
                Change Location
              </Button>
            )}

            <Button variant="outline" size="sm" className="gap-2" asChild={!!mapsUrl}>
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </a>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
