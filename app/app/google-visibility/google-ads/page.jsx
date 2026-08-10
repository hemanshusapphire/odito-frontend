"use client"

import { useEffect, useRef, useState } from 'react'

import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import {
  useGoogleAdsConnection,
  useGoogleAdsAccounts,
  useSelectGoogleAdsAccount,
  useTriggerGoogleAdsSync,
  useGoogleAdsOverview,
  useGoogleAdsTrends,
  useInvalidateGoogleAdsQueries,
} from '@/hooks/useDashboardQueries'
import { useGoogleAdsSyncProgress } from '@/hooks/useGoogleAdsSyncProgress'

import GoogleAdsLoadingState from '@/components/dashboard/google-visibility/google-ads/GoogleAdsLoadingState'
import GoogleAdsConnectPanel from '@/components/dashboard/google-visibility/google-ads/GoogleAdsConnectPanel'
import GoogleAdsSetupPanel from '@/components/dashboard/google-visibility/google-ads/GoogleAdsSetupPanel'
import ChangeAccountModal from '@/components/dashboard/google-visibility/google-ads/ChangeAccountModal'
import GoogleAdsSyncProgress from '@/components/dashboard/google-visibility/google-ads/GoogleAdsSyncProgress'
import GoogleAdsErrorState from '@/components/dashboard/google-visibility/google-ads/GoogleAdsErrorState'

import GoogleAdsHeader from '@/components/dashboard/google-visibility/google-ads/GoogleAdsHeader'
import GoogleAdsDateRangeSelector from '@/components/dashboard/google-visibility/google-ads/GoogleAdsDateRangeSelector'
import GoogleAdsKPIGrid from '@/components/dashboard/google-visibility/google-ads/GoogleAdsKPIGrid'
import CampaignPerformanceTrendsCard from '@/components/dashboard/google-visibility/google-ads/CampaignPerformanceTrendsCard'
import CampaignOverviewTable from '@/components/dashboard/google-visibility/google-ads/CampaignOverviewTable'
import KeywordPerformanceTable from '@/components/dashboard/google-visibility/google-ads/KeywordPerformanceTable'
import SearchTermsTable from '@/components/dashboard/google-visibility/google-ads/SearchTermsTable'
import BudgetOverviewCard from '@/components/dashboard/google-visibility/google-ads/BudgetOverviewCard'
import DevicePerformanceCard from '@/components/dashboard/google-visibility/google-ads/DevicePerformanceCard'
import GeographicPerformanceCard from '@/components/dashboard/google-visibility/google-ads/GeographicPerformanceCard'
import AudiencePerformanceCard from '@/components/dashboard/google-visibility/google-ads/AudiencePerformanceCard'
import AdPerformanceCard from '@/components/dashboard/google-visibility/google-ads/AdPerformanceCard'
import OptimizationCenterGrid from '@/components/dashboard/google-visibility/google-ads/OptimizationCenterGrid'
import CampaignHealthGrid from '@/components/dashboard/google-visibility/google-ads/CampaignHealthGrid'
import RecentActivityCard from '@/components/dashboard/google-visibility/google-ads/RecentActivityCard'
import OptimizationScoreCard from '@/components/dashboard/google-visibility/google-ads/OptimizationScoreCard'
import TodaySummaryCard from '@/components/dashboard/google-visibility/google-ads/TodaySummaryCard'
import QuickActionsCard from '@/components/dashboard/google-visibility/google-ads/QuickActionsCard'
import { AlertTriangle } from 'lucide-react'
import { GoogleAdsCurrencyProvider } from '@/contexts/GoogleAdsCurrencyContext'

/**
 * Google Ads dashboard. Every widget below the header reads live data from
 * the real Phase 6.x/7.x backend APIs (Phase 7.2) - no dummy/sample data
 * remains anywhere in this tree.
 *
 * States (see useGoogleAdsConnection in hooks/useDashboardQueries.js):
 *   1. not connected      -> GoogleAdsConnectPanel (own OAuth button - Google
 *                            Ads is a separate OAuth purpose from Business
 *                            Profile/Search Console/Analytics, so it isn't
 *                            covered by the hub page's shared "Connect
 *                            Google" button)
 *   2/3. connected, no account selected -> GoogleAdsSetupPanel (search/select/confirm)
 *   4. selected, no sync has EVER completed yet -> full-page GoogleAdsSyncProgress/
 *      GoogleAdsErrorState (socket + poll) - nothing to show underneath yet
 *   5. selected, at least one sync has completed -> the real dashboard body,
 *      always rendered from here on. A later "Refresh Data" click keeps this
 *      body mounted (previous data stays visible/interactive) and only shows
 *      a small inline refreshing/error indicator - never bounces back to the
 *      full-page state 4 screens, so a background refresh (auto or manual)
 *      can never hide data the user is already looking at.
 */
export default function GoogleAdsPage() {
  const { activeProjectId: projectId } = useProject()

  // Phase 2 (Enterprise Historical Sync): {preset, startDate, endDate} - see
  // GoogleAdsDateRangeSelector's doc comment. Every range-aware hook below
  // takes this whole object directly (translated to range=7d|30d|90d|12m|all
  // or startDate&endDate by apiService's _googleAdsRangeParams) - changing
  // it only ever changes query params against already-synced MongoDB data,
  // it NEVER triggers a new Google Ads sync.
  const [dateRange, setDateRange] = useState({ preset: '30d', startDate: null, endDate: null })
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState(null)

  const connection = useGoogleAdsConnection(projectId)
  const { connected, selected, syncing, syncFailed, ready, data: statusData } = connection

  // Once true, stays true for the rest of this mount - flips the whole
  // "sync in flight / sync failed" state machine below from "replace the
  // page" (state 4, nothing to show underneath yet) to "keep the dashboard
  // mounted and show a small inline indicator instead" (state 5, per Phase
  // 7's "preserve previous dashboard data" requirement).
  const hasCompletedBefore = !!statusData?.lastSyncCompletedAt

  // Single picker state, shared by BOTH first-time account selection
  // (connected && !selected) and the "Change Account" modal on an
  // already-connected dashboard - same pattern as Analytics' changePropertyOpen.
  const [changeAccountOpen, setChangeAccountOpen] = useState(false)
  const pickerActive = (connected && !selected) || changeAccountOpen

  const accountsQuery = useGoogleAdsAccounts(projectId, { enabled: pickerActive })
  const selectMutation = useSelectGoogleAdsAccount(projectId)
  const syncMutation = useTriggerGoogleAdsSync(projectId)
  const invalidateGoogleAdsQueries = useInvalidateGoogleAdsQueries(projectId)

  const syncIsStarting = syncMutation.isPending
  const refreshing = syncing || syncIsStarting
  const syncProgress = useGoogleAdsSyncProgress(projectId, { active: syncing || syncIsStarting })

  // Fires exactly once per NEW completed sync (initial sync or a later
  // "Refresh Data") - invalidates every Google Ads dashboard query in one
  // call so every card refetches fresh data automatically, no manual page
  // reload ever required. Compares the timestamp itself (not just
  // truthiness) so it re-fires on the second, third, etc. completed sync
  // too, not only the first.
  const lastCompletedAtRef = useRef(statusData?.lastSyncCompletedAt || null)
  useEffect(() => {
    const current = statusData?.lastSyncCompletedAt || null
    if (current && current !== lastCompletedAtRef.current) {
      lastCompletedAtRef.current = current
      invalidateGoogleAdsQueries()
    }
  }, [statusData?.lastSyncCompletedAt, invalidateGoogleAdsQueries])

  // KPI grid needs both the current-period totals and a per-day series (for
  // its sparklines) - fetched once here rather than duplicated inside
  // GoogleAdsKPIGrid, since nothing else on the page needs this exact
  // pairing. Gated on hasCompletedBefore (not `ready`) so these stay enabled
  // - and keep showing their last-known data - through a background
  // "Refresh Data" run, same as every other card on this page; `ready` alone
  // would briefly flip these to `enabled: false` mid-refresh (inProgress
  // becomes true), pausing them for no benefit.
  const kpiGranularity = dateRange.preset === '12m' || dateRange.preset === 'all' ? 'monthly' : 'daily'
  const overviewQuery = useGoogleAdsOverview(projectId, dateRange, { enabled: hasCompletedBefore })
  const kpiTrendsQuery = useGoogleAdsTrends(projectId, dateRange, kpiGranularity, { enabled: hasCompletedBefore })

  // Recovery path: selected but no sync ever completed and nothing is in
  // flight (e.g. the tab closed between /select succeeding and /refresh
  // firing) - re-trigger the initial sync instead of leaving a dead end.
  //
  // recoveryFiredRef guards against a real duplicate-submission bug: this
  // project runs with reactStrictMode: true (next.config.mjs), which
  // double-invokes every effect body on mount in dev - both invocations run
  // synchronously, back-to-back, before syncMutation.isPending has a chance
  // to flip true from the first call's mutate(). Without this ref, both
  // invocations saw the same "not syncing yet" snapshot and both called
  // syncMutation.mutate(), firing two near-simultaneous POST /google-ads/
  // refresh requests - the two GOOGLE_ADS_SYNC jobs / unique_google_ads_
  // sync_in_flight duplicate-key errors this was reported against. A ref
  // mutation (unlike component state) is visible to the second invocation
  // immediately, so it closes the gap StrictMode opens. Reset when the
  // account is deselected so a later, genuinely new selection can still use
  // this recovery path once.
  const recoveryFiredRef = useRef(false)
  useEffect(() => {
    if (!selected) {
      recoveryFiredRef.current = false
      return
    }
    if (recoveryFiredRef.current) return
    if (connected && selected && !syncing && !syncIsStarting && !syncFailed && !ready && !syncMutation.isSuccess) {
      recoveryFiredRef.current = true
      syncMutation.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, selected, syncing, syncIsStarting, syncFailed, ready])

  function handleConnect() {
    if (!projectId) return
    setConnecting(true)
    setConnectError(null)
    apiService.getGoogleAdsConnectUrl(projectId)
      .then((res) => {
        if (res?.data?.url) {
          window.location.href = res.data.url
          return
        }
        setConnectError('Could not start the Google Ads connection.')
        setConnecting(false)
      })
      .catch((error) => {
        setConnectError(error.message || 'Could not start the Google Ads connection.')
        setConnecting(false)
      })
  }

  // Reused for BOTH first-time account selection and the "Change Account"
  // modal - selecting a new customerId always re-triggers a fresh sync
  // (the previous account's synced data has no relevance to the new one),
  // and closes the modal if it was open.
  function handleConfirmAccount(customerId, loginCustomerId) {
    selectMutation.mutate({ customerId, loginCustomerId }, {
      onSuccess: () => {
        syncMutation.mutate()
        setChangeAccountOpen(false)
      },
    })
  }

  function handleOpenChangeAccount() {
    setChangeAccountOpen(true)
  }

  // Queues a real backend sync (POST /google-ads/refresh) - progress arrives
  // via the same socket + poll hook the initial sync already uses
  // (syncProgress below), and completion/failure are already handled by the
  // `refreshing`/`syncFailed` state derived above, not a fake local timer.
  function handleRefresh() {
    if (refreshing) return
    syncMutation.mutate()
  }

  if (connection.isLoading) {
    return <div className="flex-1"><GoogleAdsLoadingState /></div>
  }

  if (connection.isError) {
    const status = connection.error?.status
    const variant = status === 403 ? 'permission' : status === 429 ? 'quota' : 'backend'
    return (
      <div className="flex-1">
        <GoogleAdsErrorState variant={variant} onRetry={() => connection.refetch()} />
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
          <p className="text-muted-foreground">
            Monitor campaign performance, advertising spend and return on investment across your Google Ads accounts.
          </p>
        </div>
        <GoogleAdsConnectPanel onConnect={handleConnect} connecting={connecting} error={connectError} />
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
          <p className="text-muted-foreground">Connected - now choose which account to sync.</p>
        </div>
        <GoogleAdsSetupPanel
          loading={accountsQuery.isLoading}
          error={accountsQuery.isError}
          onRetry={() => accountsQuery.refetch()}
          accounts={accountsQuery.data?.data || []}
          onConfirm={handleConfirmAccount}
          confirming={selectMutation.isPending || syncMutation.isPending}
        />
      </div>
    )
  }

  // Full-page states only apply until the FIRST sync ever completes - once
  // hasCompletedBefore is true we always fall through to the real dashboard
  // body below, which handles "currently refreshing" / "last refresh
  // failed" as small inline indicators instead of replacing the page (Phase
  // 7: a background refresh must never hide data the user is already
  // looking at).
  //
  // `syncing` reflects the Job collection's own 'pending'/'processing'/
  // 'retrying' status - and the generic job-retry engine (jobService.
  // failJob) burns up to 3 attempts (~3 min of backoff) for ANY error,
  // including deterministic ones (bad GAQL field, invalid customer, etc.)
  // that are guaranteed to fail again. failSync() already records
  // lastSyncFailedAt/lastSyncError synchronously on the very FIRST failed
  // attempt, before that backoff even starts - so syncFailed is the more
  // accurate, more immediate signal and must win over a stale `syncing`
  // that's only still true because the job is silently waiting out its next
  // backoff window.
  if (!hasCompletedBefore) {
    if (syncIsStarting) {
      return (
        <div className="flex-1 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
          </div>
          <GoogleAdsSyncProgress
            stage={syncProgress.stage}
            progress={syncProgress.progress}
            startedAt={syncProgress.startedAt || statusData?.lastSyncStartedAt}
          />
        </div>
      )
    }

    if (syncFailed) {
      return (
        <div className="flex-1 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
          </div>
          <GoogleAdsErrorState
            variant="backend"
            message={statusData?.lastSyncError || 'The last sync attempt failed.'}
            onRetry={() => syncMutation.mutate()}
            retrying={syncMutation.isPending}
          />
        </div>
      )
    }

    if (syncing) {
      // Job legitimately pending/processing/retrying (e.g. page reloaded
      // mid-sync) - show real live stage/progress from the socket+poll
      // hook, not a static placeholder.
      return (
        <div className="flex-1 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
          </div>
          <GoogleAdsSyncProgress
            stage={syncProgress.stage}
            progress={syncProgress.progress}
            startedAt={syncProgress.startedAt || statusData?.lastSyncStartedAt}
          />
        </div>
      )
    }

    // Selected but no completed sync yet and nothing in flight (e.g. first
    // load before the initial sync was ever triggered) - re-trigger it
    // rather than showing a dead end.
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
        </div>
        <GoogleAdsSyncProgress stage="started" progress={0} startedAt={null} />
      </div>
    )
  }

  return (
    // Single source of truth for money formatting across the whole page -
    // every card below (present or future) reads the account's real
    // currency via useGoogleAdsCurrencyFormatter() with zero prop drilling.
    // See contexts/GoogleAdsCurrencyContext.jsx.
    <GoogleAdsCurrencyProvider currencyCode={statusData?.currencyCode}>
    <div className="flex-1 space-y-6 pb-10">
      <GoogleAdsHeader
        connected={connected}
        accountName={statusData?.accountName}
        customerId={statusData?.customerId}
        lastSyncedAt={statusData?.lastSyncCompletedAt}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onChangeAccount={handleOpenChangeAccount}
      />

      <ChangeAccountModal
        open={changeAccountOpen}
        onOpenChange={setChangeAccountOpen}
        loading={accountsQuery.isLoading}
        error={accountsQuery.isError}
        onRetry={() => accountsQuery.refetch()}
        accounts={accountsQuery.data?.data || []}
        onConfirm={handleConfirmAccount}
        confirming={selectMutation.isPending || syncMutation.isPending}
      />

      {syncFailed && (
        <div className="flex items-center gap-2.5 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {statusData?.lastSyncError || 'The last refresh failed.'} Showing data from the previous successful sync.
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs font-semibold underline underline-offset-2 shrink-0 disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <GoogleAdsDateRangeSelector value={dateRange} onChange={setDateRange} />

          <GoogleAdsKPIGrid
            overview={overviewQuery.data?.data}
            dailySeries={kpiTrendsQuery.data?.data?.series}
            rangeDays={overviewQuery.data?.data?.range?.days}
            status={overviewQuery.isLoading || kpiTrendsQuery.isLoading ? 'loading' : overviewQuery.isError ? 'error' : 'ready'}
            onRetry={() => { overviewQuery.refetch(); kpiTrendsQuery.refetch() }}
          />

          <CampaignPerformanceTrendsCard projectId={projectId} dateRange={dateRange} ready={hasCompletedBefore} />

          <div id="google-ads-campaign-overview">
            <CampaignOverviewTable projectId={projectId} dateRange={dateRange} ready={hasCompletedBefore} />
          </div>

          <KeywordPerformanceTable projectId={projectId} ready={hasCompletedBefore} />

          <SearchTermsTable projectId={projectId} ready={hasCompletedBefore} />

          <BudgetOverviewCard projectId={projectId} ready={hasCompletedBefore} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DevicePerformanceCard projectId={projectId} dateRange={dateRange} ready={hasCompletedBefore} />
            <GeographicPerformanceCard projectId={projectId} ready={hasCompletedBefore} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AudiencePerformanceCard projectId={projectId} ready={hasCompletedBefore} />
            <AdPerformanceCard projectId={projectId} ready={hasCompletedBefore} />
          </div>

          <div id="google-ads-optimization-center">
            <OptimizationCenterGrid projectId={projectId} ready={hasCompletedBefore} />
          </div>

          <CampaignHealthGrid projectId={projectId} ready={hasCompletedBefore} />

          <RecentActivityCard projectId={projectId} ready={hasCompletedBefore} />
        </div>

        <div className="flex flex-col gap-4 xl:sticky xl:top-6">
          <OptimizationScoreCard projectId={projectId} dateRange={dateRange} ready={hasCompletedBefore} />
          <TodaySummaryCard projectId={projectId} ready={hasCompletedBefore} />
          <QuickActionsCard refreshing={refreshing} onRefresh={handleRefresh} />
        </div>
      </div>
    </div>
    </GoogleAdsCurrencyProvider>
  )
}
