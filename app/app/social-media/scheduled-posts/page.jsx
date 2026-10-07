"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { ApprovalTabs } from '@/components/social-media/ApprovalTabs'
import { ScheduledPostList, PostListSkeleton, PostListError } from '@/components/social-media/ScheduledPostList'
import { ConfirmSchedulePanel } from '@/components/social-media/ConfirmSchedulePanel'
import { ConnectionWarning } from '@/components/social-media/ConnectionWarning'
import { ConfirmActionDialog } from '@/components/social-media/ConfirmActionDialog'
import { PostViewDialog } from '@/components/social-media/PostViewDialog'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { useProject } from '@/contexts/ProjectContext'
import {
  useSocialAccounts, useStartMetaConnection, useScheduledPosts, usePublishedPosts, useFailedPosts,
  useReschedulePost, useUnschedulePost, useCancelPost, useDeletePost, useRetryPost, useDuplicatePost, publishAttemptError,
} from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { SCHEDULE_TABS } from '@/lib/socialMediaAIDummyData'

const VALID_TAB_IDS = new Set(SCHEDULE_TABS.map((tab) => tab.id))

const EMPTY_COPY = {
  scheduled: { title: 'No scheduled posts', message: 'Posts you schedule will appear here until they are published.' },
  published: { title: 'Nothing published yet', message: 'Posts that have gone out to Facebook or Instagram will appear here.' },
  failed: { title: 'No failed posts', message: 'Posts that could not be published will appear here with the reason.' },
}

/**
 * Social Media AI - Scheduled Posts, driven entirely by the real scheduler
 * backend: every row is a SocialPublication from GET /social/publishing (see
 * hooks/useSocialMediaAI.js), mapped once in lib/socialMedia/postMapper.js.
 * Statuses, retry state, failure reasons and what actions are allowed all come
 * from the backend; every action calls the real endpoint and the lists are
 * refetched from the database afterwards (nothing is edited in local state).
 */
function ScheduledPostsPageContent() {
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const requestedPostId = searchParams.get('post')

  const { activeProjectId } = useProject()
  const accounts = useSocialAccounts(activeProjectId)
  const lists = {
    scheduled: useScheduledPosts(activeProjectId),
    published: usePublishedPosts(activeProjectId),
    failed: useFailedPosts(activeProjectId),
  }

  const [activeTab, setActiveTab] = useState(VALID_TAB_IDS.has(requestedTab) ? requestedTab : 'scheduled')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [busyPostId, setBusyPostId] = useState(null)
  const [panelPending, setPanelPending] = useState(null) // 'confirm' | 'save' | null
  const [panelError, setPanelError] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [discardTarget, setDiscardTarget] = useState(null)
  const [dialogError, setDialogError] = useState(null)
  const [viewPost, setViewPost] = useState(null)
  const { toasts, notify, dismiss } = useToastQueue()

  const reschedule = useReschedulePost(activeProjectId)
  const unschedule = useUnschedulePost(activeProjectId)
  const cancel = useCancelPost(activeProjectId)
  const remove = useDeletePost(activeProjectId)
  const retry = useRetryPost(activeProjectId)
  const duplicate = useDuplicatePost(activeProjectId)
  const startConnection = useStartMetaConnection(activeProjectId)

  // Deep link (?post=<id>, from the calendar/overview): once data is loaded,
  // open the tab that actually contains that post and select it — once.
  const handledDeepLink = useRef(false)
  useEffect(() => {
    if (handledDeepLink.current || !requestedPostId) return
    for (const tab of SCHEDULE_TABS) {
      const found = lists[tab.id].posts.find((p) => p.id === requestedPostId)
      if (found) { handledDeepLink.current = true; setActiveTab(tab.id); setSelectedPostId(found.id); return }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedPostId, lists.scheduled.posts, lists.published.posts, lists.failed.posts])

  const active = lists[activeTab]
  const posts = active.posts
  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) || (activeTab === 'scheduled' ? posts.find((p) => p.canEditSchedule) : null) || null,
    [posts, selectedPostId, activeTab],
  )

  // Connection state from the SAME status query Connect Accounts uses.
  const accountIssues = useMemo(() => Object.fromEntries(accounts.attention.map((a) => [a.platform, a.reason])), [accounts.attention])
  const atRiskCount = lists.scheduled.posts.filter((p) => p.status === 'scheduled' && accountIssues[p.platform]).length
  const accountNameFor = (post) => (post ? accounts[post.platform]?.name : null)

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    setSelectedPostId(null)
    setPanelError(null)
  }

  function runForPost(post, mutation, variables, { onSuccess, onError } = {}) {
    setBusyPostId(post.id)
    mutation.mutate(variables, {
      onSuccess,
      onError: onError || ((error) => notify(describeApiError(error).message, 'danger')),
      onSettled: () => setBusyPostId((current) => (current === post.id ? null : current)),
    })
  }

  function handleRetry(post) {
    runForPost(post, retry, post.id, {
      onSuccess: (res) => {
        // A Meta-rejected attempt is HTTP 200 + publishError; the post is refetched as failed.
        const rejected = publishAttemptError(res)
        if (rejected) notify(`${rejected.message}${rejected.requiresReconnect ? ' Reconnect the account to continue.' : ''}`, 'danger')
        else notify('Post published.', 'success')
      },
    })
  }

  function handleDuplicate(post) {
    runForPost(post, duplicate, post, { onSuccess: () => notify('Duplicated as a draft. It is not scheduled.', 'success') })
  }

  function handleConfirmSchedule({ scheduledAt, timezone }) {
    if (!selectedPost) return
    setPanelPending('confirm')
    setPanelError(null)
    reschedule.mutate({ publicationId: selectedPost.id, scheduledAt, timezone }, {
      onSuccess: () => notify('Schedule updated.', 'success'),
      onError: (error) => setPanelError(describeApiError(error).message),
      onSettled: () => setPanelPending(null),
    })
  }

  function handleSaveForLater() {
    if (!selectedPost) return
    setPanelPending('save')
    setPanelError(null)
    unschedule.mutate(selectedPost.id, {
      onSuccess: () => { setSelectedPostId(null); notify('Moved to drafts. Find it in Social → Publishing.', 'default') },
      onError: (error) => setPanelError(describeApiError(error).message),
      onSettled: () => setPanelPending(null),
    })
  }

  function handleConfirmCancel() {
    const post = cancelTarget
    setDialogError(null)
    cancel.mutate(post.id, {
      onSuccess: () => { setCancelTarget(null); notify('Schedule cancelled.', 'default') },
      onError: (error) => setDialogError(describeApiError(error).message),
    })
  }

  function handleConfirmDiscard() {
    const post = discardTarget
    setDialogError(null)
    remove.mutate({ publicationId: post.id }, {
      onSuccess: () => { setDiscardTarget(null); notify('Post discarded.', 'default') },
      onError: (error) => setDialogError(describeApiError(error).message),
    })
  }

  function handleReconnect() {
    startConnection.mutate({ reconnect: true }, {
      onError: (error) => notify(describeApiError(error, 'Failed to start the Meta connection.').message, 'danger'),
    })
  }

  const cardHandlers = {
    onSelect: setSelectedPostId,
    onEditSchedule: (id) => { setActiveTab('scheduled'); setSelectedPostId(id) },
    onView: setViewPost,
    onDuplicate: handleDuplicate,
    onCancel: (post) => { setDialogError(null); setCancelTarget(post) },
    onRetry: handleRetry,
    onDiscard: (post) => { setDialogError(null); setDiscardTarget(post) },
    onReconnect: handleReconnect,
  }

  const counts = {
    scheduled: lists.scheduled.isLoading || lists.scheduled.isError ? null : lists.scheduled.total,
    published: lists.published.isLoading || lists.published.isError ? null : lists.published.total,
    failed: lists.failed.isLoading || lists.failed.isError ? null : lists.failed.total,
  }

  const header = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scheduled Posts</h1>
        <p className="mt-1 text-sm text-slate-500">Approved content, ready to go live</p>
      </div>
      <Link
        href="/app/social/publishing"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800"
      >
        <Plus className="h-4 w-4" />
        Schedule New Post
      </Link>
    </div>
  )

  if (!activeProjectId) {
    return (
      <div className="flex-1 space-y-6 pb-16">
        {header}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm" data-testid="no-project">
          <p className="text-sm font-semibold text-slate-700">No project selected</p>
          <p className="mt-1 text-sm text-slate-400">Select or create a project to see its scheduled posts.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      {header}

      <ApprovalTabs tabs={SCHEDULE_TABS} activeTab={activeTab} onChange={handleTabChange} counts={counts} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-5">
          {active.isFetching && !active.isLoading && (
            <p className="flex items-center gap-1.5 text-xs text-slate-400" data-testid="refreshing"><Loader2 className="h-3 w-3 animate-spin" />Refreshing…</p>
          )}

          {active.isLoading ? (
            <PostListSkeleton />
          ) : active.isError ? (
            <PostListError message={describeApiError(active.error).message} onRetry={() => active.refetch()} retrying={active.isFetching} />
          ) : (
            <ScheduledPostList
              posts={posts}
              selectedPostId={selectedPost?.id}
              busyPostId={busyPostId}
              accountIssues={accountIssues}
              emptyTitle={EMPTY_COPY[activeTab].title}
              emptyMessage={EMPTY_COPY[activeTab].message}
              emptyAction={activeTab === 'scheduled' ? (
                <Link href="/app/social/publishing" className="mt-3 text-sm font-semibold text-violet-600 hover:text-violet-700">Create a post</Link>
              ) : null}
              {...cardHandlers}
            />
          )}

          {active.truncated && (
            <p className="text-xs text-slate-400">Showing the first 500 posts.</p>
          )}

          {activeTab === 'scheduled' && (
            <ConnectionWarning
              attention={accounts.attention}
              atRiskCount={atRiskCount}
              onReconnect={handleReconnect}
              reconnecting={startConnection.isPending}
            />
          )}
        </div>

        {activeTab === 'scheduled' && selectedPost && selectedPost.canEditSchedule && (
          <aside className="w-full shrink-0 lg:w-[320px]">
            <ConfirmSchedulePanel
              key={selectedPost.id}
              post={selectedPost}
              accountName={accountNameFor(selectedPost)}
              pendingAction={panelPending}
              error={panelError}
              onConfirm={handleConfirmSchedule}
              onSaveForLater={handleSaveForLater}
            />
          </aside>
        )}
      </div>

      <PostViewDialog post={viewPost} open={!!viewPost} onOpenChange={(open) => !open && setViewPost(null)} />

      <ConfirmActionDialog
        open={!!cancelTarget}
        onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
        title="Cancel this schedule?"
        description="The post will not be published. It will be marked cancelled and removed from this list."
        confirmLabel="Cancel schedule"
        cancelLabel="Keep scheduled"
        destructive
        pending={cancel.isPending}
        error={dialogError}
        onConfirm={handleConfirmCancel}
      />

      <ConfirmActionDialog
        open={!!discardTarget}
        onOpenChange={(open) => { if (!open) setDiscardTarget(null) }}
        title="Discard this post?"
        description={discardTarget?.outcomeUnknown
          ? 'Only discard this if you have checked your page. If the post is live there, this only removes Odito\'s record of it.'
          : 'This permanently removes the failed post from Odito.'}
        confirmLabel="Discard"
        cancelLabel="Keep"
        destructive
        pending={remove.isPending}
        error={dialogError}
        onConfirm={handleConfirmDiscard}
      />

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
