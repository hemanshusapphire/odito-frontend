"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, ArrowRight, AlertTriangle } from 'lucide-react'

/**
 * Shown when there's no usable Analytics connection yet - never connected,
 * expired/revoked, or connected but no GA4 property selected. Same
 * variant/copy pattern as business-profile/BusinessProfileEmptyState.jsx.
 */
export default function AnalyticsEmptyState({ variant = 'connect', onConnect, title, description }) {
  const COPY = {
    connect: {
      icon: BarChart3,
      iconClass: 'bg-blue-500/10 text-blue-500',
      title: 'Connect Google Analytics',
      description: 'Connect a Google account to see real traffic, audience and conversion data for this website.',
      cta: 'Connect Analytics',
    },
    reconnect: {
      icon: AlertTriangle,
      iconClass: 'bg-amber-500/10 text-amber-500',
      title: 'Your Google connection needs attention',
      description: 'Your Google connection has expired or was revoked. Reconnect to keep seeing live Analytics data.',
      cta: 'Reconnect Google',
    },
    select: {
      icon: BarChart3,
      iconClass: 'bg-blue-500/10 text-blue-500',
      title: 'Select a GA4 property',
      description: "You're connected to Google - now choose which Analytics property to show on this page.",
      cta: 'Select property',
    },
  }

  const copy = COPY[variant] || COPY.connect
  const Icon = copy.icon

  return (
    <Card className="p-12 flex flex-col items-center text-center max-w-md mx-auto mt-10">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${copy.iconClass}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold mt-4">{title || copy.title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5">{description || copy.description}</p>
      <Button onClick={onConnect} className="gap-2 mt-5">
        {copy.cta}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  )
}
