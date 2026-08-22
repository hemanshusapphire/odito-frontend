"use client"

import { Rss, Link2, Facebook, Instagram, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CONTENT = {
  no_accounts: {
    icon: Link2,
    title: 'No social accounts connected',
    body: 'Connect a Facebook Page or Instagram account to start seeing real posts here.',
  },
  no_facebook: {
    icon: Facebook,
    title: 'No Facebook posts found',
    body: 'This Facebook Page is connected, but no posts have been synced yet — try Refresh, or check back after the Page has published something.',
  },
  no_instagram: {
    icon: Instagram,
    title: 'No Instagram posts found',
    body: 'This Instagram account is connected, but no media has been synced yet — try Refresh, or check back after posting.',
  },
  no_matches: {
    icon: Rss,
    title: 'No posts match these filters',
    body: 'Try adjusting your search, platform, or date range.',
  },
  error: {
    icon: AlertCircle,
    title: 'Could not load your feeds',
    body: 'Something went wrong while loading real feed data. Please try again.',
  },
}

/**
 * Context-aware empty state — never a generic "no posts" message when a
 * more specific, honest reason is known (no accounts connected at all vs.
 * a connected platform with genuinely zero synced posts vs. filters that
 * simply don't match anything). See app/app/social/feeds/page.jsx for how
 * `reason` is derived from real connection status + the real API result.
 */
export default function EmptyFeeds({ reason = 'no_matches', onConnectAccount, onRetry }) {
  const { icon: Icon, title, body } = CONTENT[reason] || CONTENT.no_matches

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border bg-card">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{body}</p>
      {reason === 'no_accounts' && onConnectAccount && (
        <Button onClick={onConnectAccount} className="gap-2">
          <Link2 className="h-4 w-4" />
          Connect Account
        </Button>
      )}
      {reason === 'error' && onRetry && (
        <Button variant="outline" onClick={onRetry}>Try again</Button>
      )}
    </div>
  )
}
