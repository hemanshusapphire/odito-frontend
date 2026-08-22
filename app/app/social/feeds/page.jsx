"use client"

import { useEffect, useMemo, useState } from 'react'
import SocialTabs from '@/components/dashboard/social/SocialTabs'
import CreatePostDialog from '@/components/dashboard/social/CreatePostDialog'
import ConnectAccountDialog from '@/components/dashboard/social/ConnectAccountDialog'
import FeedsHeader from '@/components/dashboard/social/feeds/FeedsHeader'
import FeedStats from '@/components/dashboard/social/feeds/FeedStats'
import FeedFilters from '@/components/dashboard/social/feeds/FeedFilters'
import FeedGrid from '@/components/dashboard/social/feeds/FeedGrid'
import FeedPagination from '@/components/dashboard/social/feeds/FeedPagination'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { useProject } from '@/contexts/ProjectContext'
import { useSocialAccountsStatus, useSocialFeeds, useSyncSocialFeeds, useFacebookAccounts } from '@/hooks/useDashboardQueries'
import apiService from '@/lib/apiService'
import { PLATFORMS } from '@/lib/socialMediaDummyData'
import { DEFAULT_FEED_PAGE_SIZE } from '@/lib/socialFeedsDummyData'

const DEFAULT_FILTERS = { platform: '', search: '', dateFrom: '', dateTo: '', sort: 'newest', allAccounts: false }
const META_BACKED_PLATFORM_IDS = ['facebook', 'instagram']

/**
 * Social Media Management - Feeds tab. Real Facebook + Instagram posts,
 * synced from Meta into MongoDB and read through GET /api/social/feeds
 * (see hooks/useDashboardQueries.js's useSocialFeeds and the backend's
 * socialFeedService.js) — no dummy/mock post data, no client-side
 * filtering over a static array. X/LinkedIn/TikTok are not integrated in
 * this phase; the summary tiles still show them with a real 0, never a
 * fabricated count (see socialFeedService.js's own comment).
 *
 * Filtering/sorting/pagination all happen server-side now — every filter
 * change becomes a real API request with `placeholderData` keeping the
 * previous page's posts visible while the new one loads, so changing a
 * filter never blanks the grid or flickers (Phase 9's explicit
 * requirement). Refresh triggers a real, controlled backend sync
 * (useSyncSocialFeeds) rather than calling Meta from the browser or doing
 * nothing at all.
 *
 * Page size (`pageSize`) is user-selectable (see FEED_PAGE_SIZE_OPTIONS in
 * lib/socialFeedsDummyData.js — the one place those options are defined)
 * and is a real `limit` query param sent to the backend (socialFeedService.js
 * applies it at the MongoDB skip/limit level), not a client-side slice of
 * an already-fetched page — a project can have far more posts than any one
 * page size, so slicing client-side would silently hide real posts.
 * Changing either the filters or the page size resets to page 1; a
 * defensive effect also clamps `page` back down if it ever ends up past
 * the real last page (e.g. a background sync changing the result set
 * while a later page was open).
 *
 * ACCOUNT SCOPING: by default (`filters.allAccounts === false`) Feeds is
 * scoped to the SAME active account(s) Overview reads — the active
 * Facebook Page (useFacebookAccounts, `activeSocialAccountId` below) plus
 * whichever Instagram account is linked to it, resolved server-side (see
 * socialFeedService.js). This is not a second, parallel "selected
 * account" concept — it's the exact same source of truth Overview and
 * SwitchAccountDialog already use. "All Feeds" (clicking that tile) is
 * the explicit, separate opt-out back to every connected account pooled
 * together, matching this page's original behavior.
 */
export default function SocialFeedsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_FEED_PAGE_SIZE)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()
  const { activeProjectId } = useProject()

  const statusQuery = useSocialAccountsStatus(activeProjectId)
  const facebookConnected = statusQuery.data?.data?.facebook?.connected === true
  const instagramConnected = statusQuery.data?.data?.instagram?.connected === true
  const anyConnected = facebookConnected || instagramConnected

  // The SAME source of truth Overview/SwitchAccountDialog already use —
  // no second "selected account" state. Only the active Page's name/
  // picture/id are needed here (for the header badge and the Feeds query
  // cache key); the actual account-scoping happens server-side.
  const facebookAccountsQuery = useFacebookAccounts(activeProjectId, { enabled: facebookConnected })
  const activeFacebookAccount = (facebookAccountsQuery.data?.data?.accounts || []).find((a) => a.isActive)
  const activeSocialAccountId = activeFacebookAccount?.id

  const apiFilters = useMemo(() => ({
    platform: filters.platform || undefined,
    search: filters.search || undefined,
    from: filters.dateFrom || undefined,
    to: filters.dateTo || undefined,
    sort: filters.sort,
    page,
    limit: pageSize,
    allAccounts: filters.allAccounts ? true : undefined,
  }), [filters, page, pageSize])

  const feedsQuery = useSocialFeeds(activeProjectId, apiFilters, activeSocialAccountId, { enabled: anyConnected })
  const syncMutation = useSyncSocialFeeds(activeProjectId)

  // Defensive clamp, not a primary control path (filter/page-size changes
  // already reset to page 1 explicitly) — covers any other way the
  // current page could end up past the real last page, e.g. a background
  // sync changing which posts exist while page 3 of 3 was open and it
  // becomes page 3 of 2. Runs after the data for the (now invalid) page
  // has already resolved, so `pagination.totalPages` is real.
  useEffect(() => {
    const totalPages = feedsQuery.data?.data?.pagination?.totalPages
    if (totalPages && page > totalPages) setPage(totalPages)
  }, [feedsQuery.data, page])

  // Only for ConnectAccountDialog's own "Connected" badge — merges the
  // same real statusQuery data the rest of this page already reads, so
  // that secondary entry point doesn't show a stale/default "Connect"
  // badge for a platform that's actually already connected.
  const connectDialogPlatforms = useMemo(() => PLATFORMS.map((p) => {
    if (p.id === 'facebook') return { ...p, connected: facebookConnected }
    if (p.id === 'instagram') return { ...p, connected: instagramConnected }
    return p
  }), [facebookConnected, instagramConnected])

  const feeds = feedsQuery.data?.data
  const posts = feeds?.data || []
  const summary = feeds?.summary || { all: 0, facebook: 0, instagram: 0, x: 0, linkedin: 0, tiktok: 0 }
  const pagination = feeds?.pagination || { page: 1, limit: pageSize, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // "All Feeds" tile = the one explicit way back to every connected
  // account pooled together (allAccounts:true). Any specific platform
  // tile snaps back to the default active-account scope — clicking
  // Facebook must always mean "the active Page", never "every Page",
  // even if "All Feeds" was selected a moment ago.
  function handleSelectPlatformTile(id) {
    setFilters((prev) => ({
      ...prev,
      platform: id === 'all' ? '' : id,
      allAccounts: id === 'all',
    }))
    setPage(1)
  }

  function handlePageSizeChange(size) {
    setPageSize(size)
    setPage(1)
  }

  async function handleRefresh() {
    if (syncMutation.isPending) return
    try {
      await syncMutation.mutateAsync()
      notify('Feeds refreshed', 'success')
    } catch (err) {
      notify(err?.message || 'Failed to refresh feeds.', 'error')
    }
  }

  async function handleConnect(platformId) {
    if (META_BACKED_PLATFORM_IDS.includes(platformId)) {
      if (!activeProjectId) {
        notify('Select a project before connecting Meta.', 'error')
        return
      }
      try {
        const res = await apiService.getMetaConnectUrl(activeProjectId, 'social')
        if (res?.data?.url) {
          window.location.href = res.data.url
          return
        }
        notify('Failed to start Meta connection.', 'error')
      } catch (err) {
        notify(err?.message || 'Failed to start Meta connection.', 'error')
      }
    }
  }

  function handleCreatePost({ platformIds }) {
    const names = PLATFORMS.filter((p) => platformIds.includes(p.id)).map((p) => p.name).join(', ')
    notify(`Post published to ${names}`, 'success')
    return true // this page has nowhere durable to fail against (toast-only) — always a real success
  }

  // No specific platform filter active -> "no accounts connected" is the
  // only honest reason zero real posts can exist. With a specific
  // platform filter active and that platform genuinely connected, the
  // more specific "No Facebook/Instagram posts found" applies; filtering
  // by a platform that isn't even connected falls back to the generic
  // "no matches" (adjusting filters, not connecting, is the fix there).
  const emptyReason = !anyConnected
    ? 'no_accounts'
    : filters.platform === 'facebook' && facebookConnected
      ? 'no_facebook'
      : filters.platform === 'instagram' && instagramConnected
        ? 'no_instagram'
        : 'no_matches'

  return (
    <div className="flex-1 space-y-6 pb-10">
      <FeedsHeader
        activeAccountName={facebookConnected ? activeFacebookAccount?.name : null}
        activeAccountPicture={activeFacebookAccount?.picture}
        onConnectAccount={() => setConnectDialogOpen(true)}
        onRefresh={handleRefresh}
        refreshing={syncMutation.isPending}
        onCreatePost={() => setPostDialogOpen(true)}
      />

      <SocialTabs />

      <FeedStats
        summary={summary}
        activePlatform={filters.allAccounts ? 'all' : filters.platform || null}
        onSelectPlatform={handleSelectPlatformTile}
      />

      <FeedFilters filters={filters} onFilterChange={updateFilter} />

      <FeedGrid
        posts={posts}
        isLoading={feedsQuery.isLoading}
        isError={feedsQuery.isError}
        emptyReason={emptyReason}
        onConnectAccount={() => setConnectDialogOpen(true)}
        onRetry={() => feedsQuery.refetch()}
      />

      <FeedPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pageSize}
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <CreatePostDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        platforms={PLATFORMS}
        onSubmit={handleCreatePost}
        projectId={activeProjectId}
      />

      <ConnectAccountDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        platforms={connectDialogPlatforms}
        onConnect={handleConnect}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
