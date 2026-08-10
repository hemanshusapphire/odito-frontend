"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Loader2, TrendingUp, Target, Gauge, AlertCircle } from 'lucide-react'

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Campaign performance in one place',
    description: 'Spend, clicks, conversions and ROAS for every campaign, alongside the rest of your Google Visibility data.',
  },
  {
    icon: Target,
    title: 'Keyword & search term insight',
    description: 'See which keywords and search terms are actually driving results - and which are wasting budget.',
  },
  {
    icon: Gauge,
    title: 'Health & optimization scoring',
    description: 'Budget pacing, quality score and campaign health, computed automatically after every sync.',
  },
]

/**
 * State 1 of the Google Ads connect flow: no google_ads GoogleConnection
 * exists yet for this project. Google Ads is a separate OAuth purpose from
 * Business Profile/Search Console/Analytics (its own consent screen, its
 * own GoogleConnection row - see oauth.routes.js's "google_ads" branch), so
 * unlike those three, it gets its own Connect button directly on this page
 * rather than deferring to the hub's shared "Connect Google" button.
 *
 * Purely presentational - `onConnect`/`connecting`/`error` are owned by
 * page.jsx (mirrors the hub page's handleConnect pattern).
 */
export default function GoogleAdsConnectPanel({ onConnect, connecting = false, error }) {
  return (
    <Card className="p-10 max-w-2xl mx-auto mt-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-linear-to-br from-blue-500 to-violet-500 text-white shadow-sm">
          <Zap className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold mt-4">Connect Google Ads</h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
          Connect a Google Ads account to monitor campaign performance, advertising spend and return on investment
          alongside the rest of your Google Visibility data.
        </p>

        {error && (
          <div className="flex items-center gap-2 mt-4 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button onClick={onConnect} disabled={connecting} size="lg" className="gap-2 mt-6">
          {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {connecting ? 'Connecting…' : 'Connect Google Ads'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8 pt-8 border-t">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="flex flex-col items-center text-center gap-2">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <benefit.icon className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{benefit.title}</p>
            <p className="text-xs text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
