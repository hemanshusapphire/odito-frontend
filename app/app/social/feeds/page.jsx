"use client"

import { useMemo, useState } from 'react'
import SocialTabs from '@/components/dashboard/social/SocialTabs'
import CreatePostDialog from '@/components/dashboard/social/CreatePostDialog'
import FeedsHeader from '@/components/dashboard/social/feeds/FeedsHeader'
import FeedStats from '@/components/dashboard/social/feeds/FeedStats'
import FeedFilters from '@/components/dashboard/social/feeds/FeedFilters'
import FeedGrid from '@/components/dashboard/social/feeds/FeedGrid'
import FeedPagination from '@/components/dashboard/social/feeds/FeedPagination'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { FEED_POSTS } from '@/lib/socialFeedsDummyData'
import { PLATFORMS } from '@/lib/socialMediaDummyData'

const PAGE_SIZE = 9
const DEFAULT_FILTERS = { platform: '', status: '', dateFrom: '', dateTo: '', search: '', sort: 'newest' }

/**
 * Social Media Management - Feeds tab. Frontend-only: FEED_POSTS is a
 * static mock array (lib/socialFeedsDummyData.js) - filtering, sorting and
 * pagination all happen client-side over that one array, no backend, no
 * React Query.
 */
export default function SocialFeedsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const filteredSorted = useMemo(() => {
    let out = FEED_POSTS.filter((post) => {
      if (filters.platform && post.platform !== filters.platform) return false
      if (filters.status && post.status !== filters.status) return false
      if (filters.dateFrom && post.publishedAt.slice(0, 10) < filters.dateFrom) return false
      if (filters.dateTo && post.publishedAt.slice(0, 10) > filters.dateTo) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!post.text.toLowerCase().includes(q)) return false
      }
      return true
    })

    out = [...out].sort((a, b) => {
      if (filters.sort === 'oldest') return new Date(a.publishedAt) - new Date(b.publishedAt)
      if (filters.sort === 'engaged') {
        const engagement = (p) => p.metrics.likes + p.metrics.comments + p.metrics.shares + p.metrics.reactions
        return engagement(b) - engagement(a)
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt)
    })

    return out
  }, [filters])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Feeds refreshed', 'success') }, 900)
  }

  function handleCreatePost({ platformIds }) {
    const names = PLATFORMS.filter((p) => platformIds.includes(p.id)).map((p) => p.name).join(', ')
    notify(`Post published to ${names}`, 'success')
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <FeedsHeader onRefresh={handleRefresh} refreshing={refreshing} onCreatePost={() => setPostDialogOpen(true)} />

      <SocialTabs />

      <FeedStats
        posts={FEED_POSTS}
        activePlatform={filters.platform || 'all'}
        onSelectPlatform={(id) => updateFilter('platform', id === 'all' ? '' : id)}
      />

      <FeedFilters filters={filters} onFilterChange={updateFilter} />

      <FeedGrid posts={pageItems} onCreatePost={() => setPostDialogOpen(true)} />

      <FeedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />

      <CreatePostDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        platforms={PLATFORMS}
        onSubmit={handleCreatePost}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
