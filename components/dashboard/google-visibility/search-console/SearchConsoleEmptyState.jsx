"use client"

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, ArrowRight } from 'lucide-react'

/**
 * Shown when there's no Search Console connection yet, or connected but no
 * property selected. Mirrors BusinessProfileEmptyState.jsx. Only the
 * 'connect'/'select' variants are used - unlike Business Profile, the
 * Search Console status endpoint doesn't surface an expired/revoked
 * distinction, so there's no honest way to render a 'reconnect' variant here.
 */
export default function SearchConsoleEmptyState({
  variant = 'connect',
  title,
  description,
}) {
  const COPY = {
    connect: {
      icon: Search,
      iconClass: 'bg-blue-100 text-blue-600',
      title: 'Connect Google Search Console',
      description: 'Connect a Google account to see real search performance, indexing and visibility data for your site.',
    },
    select: {
      icon: Search,
      iconClass: 'bg-blue-100 text-blue-600',
      title: 'Select a Search Console property',
      description: "You're connected to Google - now choose which verified property to show on this page.",
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
