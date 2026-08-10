"use client"

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, ArrowRight, AlertTriangle } from 'lucide-react'

/**
 * Shown when there's no usable Business Profile connection yet - never
 * connected, expired/revoked, or connected but no location selected. Points
 * back to the Google Visibility overview page, where the real Connect/
 * Reconnect/Select flow already lives - this page doesn't duplicate that
 * logic (variant only changes copy/icon, never introduces new logic here).
 */
export default function BusinessProfileEmptyState({
  variant = 'connect',
  title,
  description,
}) {
  const COPY = {
    connect: {
      icon: Building2,
      iconClass: 'bg-blue-100 text-blue-600',
      title: 'Connect your Business Profile',
      description: 'Connect a Google account to see real performance, reviews and photos for your business profile.',
    },
    reconnect: {
      icon: AlertTriangle,
      iconClass: 'bg-amber-100 text-amber-600',
      title: 'Your Google connection needs attention',
      description: 'Your Google connection has expired or was revoked. Reconnect to keep seeing live Business Profile data.',
    },
    select: {
      icon: Building2,
      iconClass: 'bg-blue-100 text-blue-600',
      title: 'Select a Business Profile location',
      description: "You're connected to Google - now choose which business account and location to show on this page.",
    },
  }

  const copy = COPY[variant] || COPY.connect
  const Icon = copy.icon

  return (
    <Card className="p-12 border-2 flex flex-col items-center text-center max-w-md mx-auto mt-10">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${copy.iconClass}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold mt-4">{title || copy.title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5">{description || copy.description}</p>
      <Button asChild className="gap-2 mt-5">
        <Link href="/app/google-visibility">
          Go to Google Visibility
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  )
}
