"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ServerCrash, ShieldAlert, Clock, RotateCw } from 'lucide-react'

const VARIANT_COPY = {
  backend: {
    icon: ServerCrash,
    title: "Couldn't load Google Ads data",
    message: 'Something went wrong while talking to the server. Please try again.',
  },
  permission: {
    icon: ShieldAlert,
    title: 'Access denied',
    message: 'Your Google account no longer has access to this Google Ads account.',
  },
  quota: {
    icon: Clock,
    title: 'Google Ads quota exceeded',
    message: 'Google Ads API quota was exceeded. Please try again shortly.',
  },
}

/**
 * Error state for a failed Google Ads request - distinct from
 * GoogleAdsConnectPanel ("no connection yet"), this is for "we tried to
 * reach the backend/Google and it failed". Mirrors AnalyticsErrorState.jsx.
 * Never renders a raw backend error message - `variant` (derived from
 * error.status, see useGoogleAdsConnection) picks a fixed, user-safe copy;
 * `message` may override with additional (still user-safe) detail.
 */
export default function GoogleAdsErrorState({ variant = 'backend', message, onRetry, retrying = false }) {
  const copy = VARIANT_COPY[variant] || VARIANT_COPY.backend
  const Icon = copy.icon

  return (
    <Card className="p-12 flex flex-col items-center text-center max-w-md mx-auto mt-10 border-red-500/25">
      <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold mt-4">{copy.title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5">{message || copy.message}</p>
      {onRetry && (
        <Button onClick={onRetry} disabled={retrying} variant="outline" className="gap-2 mt-5">
          <RotateCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Retrying…' : 'Retry'}
        </Button>
      )}
    </Card>
  )
}
