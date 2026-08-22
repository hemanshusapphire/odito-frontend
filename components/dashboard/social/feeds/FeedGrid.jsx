"use client"

import FeedCard from './FeedCard'
import EmptyFeeds from './EmptyFeeds'
import { platformConfig } from '@/lib/socialFeedsDummyData'

function FeedCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card shadow-sm p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/5 rounded bg-muted" />
          <div className="h-2.5 w-1/3 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  )
}

/**
 * Responsive 1/2/3-column post grid — real Facebook/Instagram posts only
 * (see app/app/social/feeds/page.jsx's useSocialFeeds). Renders a
 * skeleton grid while the first page loads, a context-aware empty state
 * (see EmptyFeeds) when there's genuinely nothing to show, or an error
 * state if the request itself failed.
 */
export default function FeedGrid({ posts, isLoading, isError, emptyReason, onConnectAccount, onRetry }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <FeedCardSkeleton key={i} />)}
      </div>
    )
  }

  if (isError) {
    return <EmptyFeeds reason="error" onRetry={onRetry} />
  }

  if (posts.length === 0) {
    return <EmptyFeeds reason={emptyReason || 'no_matches'} onConnectAccount={onConnectAccount} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {posts.map((post) => (
        <FeedCard key={post.id} post={post} platform={platformConfig(post.platform)} />
      ))}
    </div>
  )
}
