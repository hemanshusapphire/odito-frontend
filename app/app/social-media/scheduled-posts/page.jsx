"use client"

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { ApprovalTabs } from '@/components/social-media/ApprovalTabs'
import { ScheduledPostList } from '@/components/social-media/ScheduledPostList'
import { ConfirmSchedulePanel } from '@/components/social-media/ConfirmSchedulePanel'
import { ConnectionWarning } from '@/components/social-media/ConnectionWarning'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import {
  SCHEDULE_TABS,
  SCHEDULED_POSTS,
  PUBLISHED_POSTS,
  FAILED_POSTS,
  CONNECTION_WARNING,
} from '@/lib/socialMediaAIDummyData'

const INITIAL_POSTS = [...SCHEDULED_POSTS, ...PUBLISHED_POSTS, ...FAILED_POSTS]
const VALID_TAB_IDS = new Set(SCHEDULE_TABS.map((tab) => tab.id))

/**
 * Social Media AI - Scheduled Posts. Entirely frontend-only, same as the
 * rest of the module: every post comes from lib/socialMediaAIDummyData.js,
 * no API calls, no real Facebook/Instagram publishing. Reuses ApprovalTabs
 * (Content Approvals) as-is - same underline-tabs-with-counts pattern over
 * a differently-shaped post list.
 */
function ScheduledPostsPageContent() {
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const initialTab = VALID_TAB_IDS.has(requestedTab) ? requestedTab : 'scheduled'

  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedPostId, setSelectedPostId] = useState(
    INITIAL_POSTS.find((p) => p.status === initialTab)?.id ?? null
  )
  const [instagramReconnected, setInstagramReconnected] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  const filteredPosts = useMemo(() => posts.filter((p) => p.status === activeTab), [posts, activeTab])
  const selectedPost = useMemo(() => posts.find((p) => p.id === selectedPostId) || null, [posts, selectedPostId])
  const showWarning = !instagramReconnected && posts.some((p) => p.status === 'scheduled' && p.connectionAtRisk)

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    const first = posts.find((p) => p.status === tabId)
    setSelectedPostId(first?.id ?? null)
  }

  function handleView(post) {
    notify('Post preview is on the roadmap.', 'default')
  }

  function handleDuplicate(post) {
    const copy = { ...post, id: `${post.id}-copy-${Date.now()}`, title: `${post.title} (Copy)` }
    setPosts((prev) => [...prev, copy])
    notify('Post duplicated.', 'success')
  }

  function handleCancel(post) {
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
    if (post.id === selectedPostId) {
      const remaining = posts.filter((p) => p.status === 'scheduled' && p.id !== post.id)
      setSelectedPostId(remaining[0]?.id ?? null)
    }
    notify('Schedule cancelled.', 'default')
  }

  function handleRetry(post) {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: 'scheduled', failReason: undefined } : p)))
    notify("Retry scheduled. We'll attempt to publish this again.", 'success')
  }

  function handleDiscard(post) {
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
    if (post.id === selectedPostId) setSelectedPostId(null)
    notify('Failed post discarded.', 'default')
  }

  function handleConfirmSchedule(fields) {
    notify(`Schedule confirmed for ${fields.date} at ${fields.time}.`, 'success')
  }

  function handleSaveForLater() {
    notify('Saved for later.', 'default')
  }

  function handleReconnected() {
    setInstagramReconnected(true)
    setPosts((prev) => prev.map((p) => (p.platform === 'instagram' ? { ...p, connectionAtRisk: false } : p)))
    notify('Instagram reconnected (preview only).', 'success')
  }

  const cardHandlers = {
    onSelect: setSelectedPostId,
    onEditSchedule: setSelectedPostId,
    onView: handleView,
    onDuplicate: handleDuplicate,
    onCancel: handleCancel,
    onRetry: handleRetry,
    onDiscard: handleDiscard,
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scheduled Posts</h1>
          <p className="mt-1 text-sm text-slate-500">Approved content, ready to go live</p>
        </div>
        <Link
          href="/app/social-media/content-approvals"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800"
        >
          <Plus className="h-4 w-4" />
          Schedule New Post
        </Link>
      </div>

      <ApprovalTabs tabs={SCHEDULE_TABS} posts={posts} activeTab={activeTab} onChange={handleTabChange} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-5">
          <ScheduledPostList posts={filteredPosts} selectedPostId={selectedPostId} {...cardHandlers} />

          {activeTab === 'scheduled' && showWarning && (
            <ConnectionWarning warning={CONNECTION_WARNING} onReconnected={handleReconnected} />
          )}
        </div>

        {activeTab === 'scheduled' && selectedPost && (
          <aside className="w-full shrink-0 lg:w-[320px]">
            <ConfirmSchedulePanel key={selectedPost.id} post={selectedPost} onConfirm={handleConfirmSchedule} onSaveForLater={handleSaveForLater} />
          </aside>
        )}
      </div>

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}

export default function ScheduledPostsPage() {
  return (
    <Suspense fallback={null}>
      <ScheduledPostsPageContent />
    </Suspense>
  )
}
