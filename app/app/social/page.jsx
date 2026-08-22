"use client"

import { useState, useMemo } from 'react'
import { Eye, FileText, Users } from 'lucide-react'
import SocialPageHeader from '@/components/dashboard/social/SocialPageHeader'
import SocialTabs from '@/components/dashboard/social/SocialTabs'
import SocialPlatformSection from '@/components/dashboard/social/SocialPlatformSection'
import CreatePostDialog from '@/components/dashboard/social/CreatePostDialog'
import ConnectAccountDialog from '@/components/dashboard/social/ConnectAccountDialog'
import MetaPageSelectionDialog from '@/components/dashboard/social/MetaPageSelectionDialog'
import SwitchAccountDialog from '@/components/dashboard/social/SwitchAccountDialog'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { useProject } from '@/contexts/ProjectContext'
import { useMetaOAuthRedirect } from '@/hooks/useMetaOAuthRedirect'
import { useSocialAccountsStatus, useFacebookOverview, useFacebookAccounts, useInstagramOverview } from '@/hooks/useDashboardQueries'
import apiService from '@/lib/apiService'
import logger from '@/lib/monitoring/logger'
import { PLATFORMS } from '@/lib/socialMediaDummyData'

const FACEBOOK_ERROR_MESSAGES = {
  TOKEN_EXPIRED: 'Facebook connection expired. Please reconnect.',
  FETCH_FAILED: 'Could not reach Facebook right now.',
}

const INSTAGRAM_ERROR_MESSAGES = {
  TOKEN_EXPIRED: 'Instagram connection expired. Please reconnect Facebook.',
  FETCH_FAILED: 'Could not reach Instagram right now.',
  NOT_LINKED_TO_ACTIVE_PAGE: 'The active Facebook Page has no linked Instagram account.',
}

// Meta (Facebook + Instagram) is a real OAuth connection — both cards
// share the same underlying Meta app grant, so both route through the
// same /social/meta/start flow. Facebook becomes "connected" once a real
// Page is selected and persisted (see MetaPageSelectionDialog below);
// Instagram becomes "connected" only if that Page has a linked Instagram
// Business/Professional account (Phase 3 discovery) — both states are now
// read from real, MongoDB-sourced status (see useSocialAccountsStatus
// above), not just the moment right after connecting. Every other
// platform remains the pre-existing local-state-only mock until its own
// real integration exists.
const META_BACKED_PLATFORM_IDS = ['facebook', 'instagram']
const META_PAGE_BACKED_PLATFORM_ID = 'facebook'

const META_ERROR_MESSAGES = {
  access_denied: 'Meta connection was cancelled.',
  invalid_request: 'That connection request was invalid. Please try again.',
  expired_or_invalid_request: 'That connection request expired. Please try connecting again.',
  connection_failed: 'Meta connection failed. Please try again.',
}

/**
 * A platform that is confirmed NOT connected must never keep showing a
 * previous/dummy account's KPI numbers or chart behind the "Not
 * Connected" overlay — PlatformStatsGrid renders whatever `kpis` it's
 * given with no awareness of `connected` at all, and PlatformChart only
 * dims/blurs the chart's OPACITY, it doesn't clear the data underneath.
 * Bug: `return { ...p, connected: false }` alone leaves `p.kpis`/`p.chart`
 * exactly as they were (the static PLATFORMS dummy baseline on first
 * paint, e.g. Instagram's 356/251/3/209, or a stale real response from
 * before a Page switch) — visually indistinguishable from real data,
 * just dimmed. This strips every KPI value to the same honest "—" this
 * codebase already uses for a failed/unavailable individual metric, and
 * empties the chart series, so a disconnected card can never be mistaken
 * for a connected one showing real numbers.
 */
function disconnectedPlatform(p, connectMessage) {
  return {
    ...p,
    connected: false,
    connectMessage: connectMessage ?? p.connectMessage,
    kpis: p.kpis.map((k) => ({ ...k, value: '—' })),
    chart: { ...p.chart, series: { day: [], week: [], month: [] } },
  }
}

/** Real "Jul 24 – Jul 30, 2026" style label from the backend's own
 * `since`/`until` for the range that was actually fetched — never a
 * client-guessed date, so it can never drift from what the chart data
 * actually covers. */
function formatRangeLabel(range, sinceISO, untilISO) {
  if (!sinceISO || !untilISO) return ''
  const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (range === 'day') return fmt(untilISO)
  const fmtShort = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmtShort(sinceISO)} – ${fmt(untilISO)}`
}

/**
 * Social Media Management - Overview tab. Facebook's "Connect" performs a
 * real OAuth round-trip, then a real Page-selection step — only after a
 * Page is actually chosen and persisted does the card flip to `connected`.
 * Instagram reflects whatever that Page's real, persisted Instagram
 * discovery result is. Both statuses come from useSocialAccountsStatus
 * (real MongoDB state, fetched on every load) — not from transient
 * post-connect React state alone, which is what previously made
 * "Connected" revert to "Not Connected" on every refresh. Every other
 * platform (X, LinkedIn, TikTok) is unchanged: frontend-only, local state,
 * no OAuth, no API. Facebook's KPI tiles and chart are now real Meta
 * Graph API data via useFacebookOverview (see that hook) — "Page
 * Impressions" is retired (Meta deprecated every page-level impressions/
 * reach metric with no replacement, confirmed live) and replaced by
 * "Page Views" (page_views_total, Meta's current supported metric for
 * Page-profile visits — a genuinely different measurement, hence the
 * label change too); it shows "—" / an honest unavailable message only
 * when the fetch itself failed, never for a successful call that simply
 * measured zero. Recent Posts and New Fans are real and unchanged.
 * Instagram's KPIs/chart are now real too, via useInstagramOverview —
 * previously they were 100% static dummy data (356/251/3/209, identical
 * regardless of which account was connected) sitting underneath a real
 * "Connected" badge, which is what made switching accounts/refreshing
 * look broken even though the connection itself always worked correctly.
 * Post count comes straight from the IG account object; Engagements/
 * Followers Gained/Likes come from Instagram Insights; the Comments vs
 * Likes chart is built from already-synced real post data (Instagram
 * Insights has no per-day breakdown for those metrics any more) — see
 * odito_backend's instagramOverviewService.js.
 */
export default function SocialMediaOverviewPage() {
  const [platforms, setPlatforms] = useState(PLATFORMS)
  const [refreshing, setRefreshing] = useState(false)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [pageSelectDialogOpen, setPageSelectDialogOpen] = useState(false)
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false)
  // One Day/Week/Month selection per platform card, all independent (a
  // range change on Facebook's card never touches Instagram's, or vice
  // versa) — keyed by platform id, defaulting to 'month' for any card
  // that hasn't been touched yet.
  const [periods, setPeriods] = useState({})
  const periodFor = (id) => periods[id] || 'month'
  const setPeriodFor = (id, value) => setPeriods((prev) => ({ ...prev, [id]: value }))
  const { toasts, notify, dismiss } = useToastQueue()
  const { activeProjectId } = useProject()
  const statusQuery = useSocialAccountsStatus(activeProjectId)
  const facebookConnected = statusQuery.data?.data?.facebook?.connected === true
  // Every connected Page for this project (Switch Account feature) —
  // fetched only once we know at least one Facebook connection exists.
  const facebookAccountsQuery = useFacebookAccounts(activeProjectId, { enabled: facebookConnected })
  const facebookAccounts = facebookAccountsQuery.data?.data?.accounts || []
  const activeFacebookAccount = facebookAccounts.find((a) => a.isActive)
  const activeSocialAccountId = activeFacebookAccount?.id
  // Only fetch real Facebook data once the DB-sourced status confirms a
  // connection exists — no point making Meta API calls for a project with
  // nothing connected (avoids unnecessary requests). Keyed on
  // activeSocialAccountId too (see useFacebookOverview's own comment) so
  // switching Pages never shows stale data from the previous Page.
  const facebookRange = periodFor('facebook')
  const facebookOverviewQuery = useFacebookOverview(activeProjectId, activeSocialAccountId, facebookRange, {
    enabled: facebookConnected,
  })
  const instagramConnected = statusQuery.data?.data?.instagram?.connected === true
  const instagramRange = periodFor('instagram')
  // Instagram has no independent active-account id of its own — it's
  // always derived from whichever Facebook Page is active (see
  // useInstagramOverview's own header comment), so this deliberately
  // reuses the SAME activeSocialAccountId Facebook's own query above
  // already computes, rather than tracking a second, parallel identifier.
  const instagramOverviewQuery = useInstagramOverview(activeProjectId, activeSocialAccountId, instagramRange, { enabled: instagramConnected })

  // Facebook/Instagram's live data is DERIVED on every render, not synced
  // into `platforms` via useEffect(() => setState(...), [query.data]).
  // That effect-mirroring pattern was the actual bug behind "Refresh
  // succeeds on the backend but the card doesn't visibly update": a
  // useEffect only re-runs when its dependency reference changes, so any
  // timing gap between a query resolving and its effect flushing could
  // leave the rendered card one snapshot behind the real cache — and it
  // duplicated state React Query already owns. Deriving via useMemo
  // instead means every render reads facebookOverviewQuery.data directly,
  // so there is no separate copy of the data that can go stale, skip an
  // update, or race with the loading/status effect. This also gives an
  // explicit, structural precedence: `p` (the dummy/base platform) is
  // always the starting point, and real status/overview data is layered
  // on top of it every time this recomputes — real data can only ever
  // overlay dummy data, never the reverse, and a refresh in flight keeps
  // showing the last REAL response (never reverts to dummy) until a
  // fresher real response replaces it.
  const renderedPlatforms = useMemo(() => {
    const status = statusQuery.data?.data
    const overview = facebookOverviewQuery.data?.data
    const igOverview = instagramOverviewQuery.data?.data

    return platforms.map((p) => {
      if (p.id === 'instagram') {
        if (!status) return p
        if (!status.instagram?.connected) return disconnectedPlatform(p)

        if (!igOverview) {
          // Connected per MongoDB, but the overview fetch hasn't resolved
          // yet (first load, or a refresh in flight) — stay connected
          // with whatever KPI/chart data `p` already carries, same
          // "never blank/never flash disconnected" rule as Facebook.
          return { ...p, connected: true }
        }
        if (!igOverview.connected) {
          return disconnectedPlatform(p, INSTAGRAM_ERROR_MESSAGES[igOverview.reason] || 'Instagram account is not linked for this project.')
        }

        const m = igOverview.metrics
        const chartHasRealData = igOverview.chart.length > 0
        return {
          ...p,
          connected: true,
          kpis: [
            { key: 'posts', label: 'Total Posts', value: m.posts === null ? '—' : m.posts.toLocaleString(), icon: p.kpis[0].icon },
            { key: 'engagements', label: 'Total Engagements', value: m.engagements === null ? '—' : m.engagements.toLocaleString(), icon: p.kpis[1].icon },
            { key: 'followersGained', label: 'Followers Gained', value: m.followersGained === null ? '—' : m.followersGained.toLocaleString(), icon: p.kpis[2].icon },
            { key: 'likes', label: 'Total Likes', value: m.likes === null ? '—' : m.likes.toLocaleString(), icon: p.kpis[3].icon },
          ],
          chart: {
            ...p.chart,
            // Keyed by the range the backend actually fetched (not
            // necessarily the currently-selected UI period — while a
            // period switch is in flight this still holds the PREVIOUS
            // range's data under its own key; PlatformChart shows a
            // loading spinner over the chart for that gap instead of
            // reading a mismatched key, see `chartLoading` below).
            series: { [igOverview.range || 'month']: igOverview.chart.map((pt) => ({ label: pt.date, comments: pt.comments, likes: pt.likes })) },
          },
          chartRangeLabel: formatRangeLabel(igOverview.range, igOverview.since, igOverview.until),
          // Instagram Insights no longer offers a per-day comments/likes
          // breakdown (see instagramOverviewService.js) — the real source
          // is already-synced posts, so "no data" here honestly means
          // "nothing synced yet for this window", not a failed API call.
          chartEmptyMessage: chartHasRealData ? null : 'No Instagram posts synced for this period yet — try Refresh on the Feeds page.',
        }
      }
      if (p.id !== 'facebook') return p

      if (!status) return p // status hasn't loaded yet — show the base card, not a false flash either way
      if (!status.facebook?.connected) return disconnectedPlatform(p)

      if (!overview) {
        // Connected per MongoDB, but the overview fetch hasn't resolved
        // yet (first load, or a refresh in flight) — stay connected with
        // whatever KPI/chart data `p` already carries (dummy on first
        // paint, last real response during a refresh) rather than
        // blanking the card or flashing "Not Connected".
        return { ...p, connected: true }
      }
      if (!overview.connected) {
        return disconnectedPlatform(p, FACEBOOK_ERROR_MESSAGES[overview.reason] || 'Facebook account is not linked for this project.')
      }

      // pageViews (page_views_total) is Meta's currently-supported
      // replacement for the retired "Page Impressions" metric — see
      // odito_backend's facebookInsightsService.js for the live-confirmed
      // metric map. `pageViewsUnavailableReason` (not `pageViews === null`
      // alone) is the source of truth for "unavailable": a real, measured
      // 0 is a valid value the backend already distinguishes from a
      // genuine failure, so this reads the same explicit signal rather
      // than re-deriving it from the value.
      const pageViewsUnavailable = overview.pageViewsUnavailableReason !== null
      const pageViews = overview.metrics.pageViews
      return {
        ...p,
        connected: true,
        kpis: [
          { key: 'pageViews', label: 'Page Views', value: pageViewsUnavailable ? '—' : pageViews.toLocaleString(), icon: Eye },
          { key: 'posts', label: 'Recent Posts', value: overview.metrics.recentPosts === null ? '—' : overview.metrics.recentPosts.toLocaleString(), icon: FileText },
          { key: 'fans', label: 'New Fans', value: overview.metrics.newFans === null ? '—' : overview.metrics.newFans.toLocaleString(), icon: Users },
        ],
        chart: {
          ...p.chart,
          title: 'Page Views',
          series: { [overview.range || 'month']: overview.chart.map((pt) => ({ label: pt.date, value: pt.value })) },
        },
        chartRangeLabel: formatRangeLabel(overview.range, overview.since, overview.until),
        // Two distinct honest messages, never conflated: a genuinely
        // FAILED metric fetch vs. a successful fetch that simply found no
        // recorded activity in this window (real Meta behavior — Meta
        // omits zero-activity days from a `period=day` series rather than
        // returning explicit zero points, confirmed live).
        chartEmptyMessage: pageViewsUnavailable
          ? "Page views data isn't available for this Facebook Page."
          : overview.chart.length === 0
            ? 'No page views recorded for this Facebook Page in this period.'
            : null,
      }
    })
  }, [platforms, statusQuery.data, facebookOverviewQuery.data, instagramOverviewQuery.data])

  // A successful OAuth round-trip is not yet a connected Page — it opens
  // the Page Selection dialog instead of immediately marking anything
  // connected. Shared with Settings -> Profile's own Meta entry point
  // (see useMetaOAuthRedirect's own header comment for why this is a
  // shared hook now, not per-page duplicated logic).
  useMetaOAuthRedirect({
    onConnected: () => setPageSelectDialogOpen(true),
    onError: (error) => notify(META_ERROR_MESSAGES[error] || 'Failed to connect Meta account.', 'error'),
  })

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
      return
    }

    const platform = platforms.find((p) => p.id === platformId)
    setPlatforms((prev) => prev.map((p) => (p.id === platformId ? { ...p, connected: true } : p)))
    if (platform) notify(`${platform.name} account connected`, 'success')
  }

  // Actually refetches — the previous implementation only toggled the
  // button's spinner via setTimeout and never touched a query, which is
  // why no request ever reached the backend. Reuses every real query
  // this page reads from (no new endpoints, no duplicate services):
  // connection status always, Facebook's account list + overview only
  // when Facebook is connected, Instagram's overview only when Instagram
  // is connected.
  async function handleRefresh() {
    if (refreshing) return // duplicate clicks must not overlap
    setRefreshing(true)
    logger.debug('social_refresh_clicked', { projectId: activeProjectId, facebookConnected, activeSocialAccountId, instagramConnected })
    try {
      const refetches = [statusQuery.refetch()]
      if (facebookConnected) {
        refetches.push(facebookAccountsQuery.refetch(), facebookOverviewQuery.refetch())
      }
      if (instagramConnected) {
        refetches.push(instagramOverviewQuery.refetch())
      }
      const results = await Promise.all(refetches)
      const failed = results.some((r) => r.isError)
      logger.debug('social_refresh_completed', { projectId: activeProjectId, queriesRefetched: refetches.length, failed })
      notify(failed ? 'Some social data failed to refresh. Please try again.' : 'Social data refreshed', failed ? 'error' : 'success')
    } catch (err) {
      logger.warn('social_refresh_failed', { projectId: activeProjectId, message: err?.message })
      notify(err?.message || 'Failed to refresh social data.', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  function handleCreatePost({ platformIds }) {
    const names = renderedPlatforms.filter((p) => platformIds.includes(p.id)).map((p) => p.name).join(', ')
    notify(`Post published to ${names}`, 'success')
    return true // this page has nowhere durable to fail against (toast-only) — always a real success
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <SocialPageHeader
        activeAccountName={facebookConnected ? activeFacebookAccount?.name : null}
        activeAccountPicture={activeFacebookAccount?.picture}
        onConnectAccount={() => setConnectDialogOpen(true)}
        onSwitchAccount={() => setSwitchDialogOpen(true)}
        showSwitchAccount={facebookConnected}
        onCreatePost={() => setPostDialogOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <SocialTabs />

      <div className="flex flex-col gap-5">
        {renderedPlatforms.map((platform) => (
          <SocialPlatformSection
            key={platform.id}
            platform={platform}
            onConnect={handleConnect}
            period={periodFor(platform.id)}
            onPeriodChange={(value) => setPeriodFor(platform.id, value)}
            chartLoading={
              platform.id === 'facebook' ? facebookOverviewQuery.isFetching
                : platform.id === 'instagram' ? instagramOverviewQuery.isFetching
                  : false
            }
          />
        ))}
      </div>

      <CreatePostDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        platforms={renderedPlatforms}
        onSubmit={handleCreatePost}
        projectId={activeProjectId}
      />

      <ConnectAccountDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        platforms={renderedPlatforms}
        onConnect={handleConnect}
      />

      <MetaPageSelectionDialog
        open={pageSelectDialogOpen}
        onOpenChange={setPageSelectDialogOpen}
        projectId={activeProjectId}
        onConnected={() => {
          setPlatforms((prev) => prev.map((p) => (p.id === META_PAGE_BACKED_PLATFORM_ID ? { ...p, connected: true } : p)))
          notify('Facebook Page connected successfully.', 'success')
        }}
      />

      <SwitchAccountDialog
        open={switchDialogOpen}
        onOpenChange={setSwitchDialogOpen}
        projectId={activeProjectId}
        onSwitched={(account) => notify(`Switched to ${account?.name || 'that Page'}.`, 'success')}
        onConnectAnother={() => setConnectDialogOpen(true)}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
