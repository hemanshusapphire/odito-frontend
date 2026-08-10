"use client"

import FeedCard from './FeedCard'
import EmptyFeeds from './EmptyFeeds'
import { platformConfig } from '@/lib/socialFeedsDummyData'

/** Responsive 1/2/3-column post grid, or the empty state when `posts` is empty. */
export default function FeedGrid({ posts, onCreatePost }) {
  if (posts.length === 0) {
    return <EmptyFeeds onCreatePost={onCreatePost} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {posts.map((post) => (
        <FeedCard key={post.id} post={post} platform={platformConfig(post.platform)} />
      ))}
    </div>
  )
}
