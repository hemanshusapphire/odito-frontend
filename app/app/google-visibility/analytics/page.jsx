"use client"

import { useEffect, useMemo, useState } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import {
  useAnalyticsStatus,
  useAnalyticsProperties,
  useSelectAnalyticsProperty,
  useAnalyticsProperty,
  useAnalyticsTrends,
  useAnalyticsBreakdowns,
  useAnalyticsPages,
  useAnalyticsEvents,
  useAnalyticsConversions,
  useAnalyticsRealtime,
  useAnalyticsHealth,
  useAnalyticsActivity,
  useSyncAnalytics,
  useProjectBrandAsset,
} from '@/hooks/useDashboardQueries'
import {
  CATEGORICAL_COLORS,
  CONVERSION_CATEGORY_STYLE,
  DEFAULT_CONVERSION_STYLE,
  formatPercent,
  formatDuration,
} from '@/lib/analyticsChartConfig'
import { buildAnalyticsKpisFromTrends, buildTodaySummaryFromTrends } from '@/lib/analyticsTrends'

import AnalyticsHeader from '@/components/dashboard/google-visibility/analytics/AnalyticsHeader'
import AnalyticsFilters from '@/components/dashboard/google-visibility/analytics/AnalyticsFilters'
import AnalyticsSetupPanel from '@/components/dashboard/google-visibility/analytics/AnalyticsSetupPanel'
import ChangePropertyModal from '@/components/dashboard/google-visibility/analytics/ChangePropertyModal'
import AnalyticsPropertyCard from '@/components/dashboard/google-visibility/analytics/AnalyticsPropertyCard'
import AnalyticsOverviewCards from '@/components/dashboard/google-visibility/analytics/AnalyticsOverviewCards'
import TrafficChartCard from '@/components/dashboard/google-visibility/analytics/TrafficChartCard'
import TrafficSourcesCard from '@/components/dashboard/google-visibility/analytics/TrafficSourcesCard'
import TopChannelsCard from '@/components/dashboard/google-visibility/analytics/TopChannelsCard'
import TopPagesCard from '@/components/dashboard/google-visibility/analytics/TopPagesCard'
import AnalyticsStatRow from '@/components/dashboard/google-visibility/analytics/AnalyticsStatRow'
import DeviceBreakdownCard from '@/components/dashboard/google-visibility/analytics/DeviceBreakdownCard'
import TopCountriesCard from '@/components/dashboard/google-visibility/analytics/TopCountriesCard'
import BrowserOSCard from '@/components/dashboard/google-visibility/analytics/BrowserOSCard'
import RealtimeUsersCard from '@/components/dashboard/google-visibility/analytics/RealtimeUsersCard'
import EventsCard from '@/components/dashboard/google-visibility/analytics/EventsCard'
import RecentActivityCard from '@/components/dashboard/google-visibility/analytics/RecentActivityCard'
import TrafficHealthCard from '@/components/dashboard/google-visibility/analytics/TrafficHealthCard'
import TodaySummaryCard from '@/components/dashboard/google-visibility/analytics/TodaySummaryCard'
import AnalyticsLoadingState from '@/components/dashboard/google-visibility/analytics/AnalyticsLoadingState'
import AnalyticsEmptyState from '@/components/dashboard/google-visibility/analytics/AnalyticsEmptyState'
import AnalyticsErrorState from '@/components/dashboard/google-visibility/analytics/AnalyticsErrorState'

const RANGE_LABELS = { '7': 'the last 7 days', '30': 'the last 30 days', '90': 'the last 90 days', '365': 'the last 12 months' }

/**
 * Google Analytics dashboard - fully React Query-driven, no mock data.
 * Structural mirror of business-profile/page.jsx: same connect -> select ->
 * auto-sync -> dashboard flow, same loading/empty/dashboard branches. GA4
 * properties are a flat list (unlike Business Profile's account->location
 * hierarchy), so the picker/auto-select logic here is one level, not two.
 */
export default function GoogleAnalyticsPage() {
  const { activeProjectId: projectId } = useProject()
  const [range, setRange] = useState('30')

  const statusQuery = useAnalyticsStatus(projectId)
  const status = statusQuery.data?.data

  const connected = !!status?.connected
  const selected = connected && !!status?.serviceEnabled
  // The Analytics status endpoint (Phase 0, unchanged) only returns a
  // connected boolean, not the expired/revoked distinction Business
  // Profile's status endpoint separately looks up - so "Reconnect" copy
  // can't be shown here today. Documented as remaining technical debt
  // (Phase 4 report) rather than guessed at.
  const isReconnect = false

  // Single picker state, shared by BOTH first-time onboarding (!selected)
  // and the "Change Property" modal on an already-connected dashboard.
  const [changePropertyOpen, setChangePropertyOpen] = useState(false)
  const pickerActive = (connected && !selected) || changePropertyOpen

  const propertiesQuery = useAnalyticsProperties(projectId, { enabled: pickerActive })
  const properties = propertiesQuery.data?.data || []

  const selectMutation = useSelectAnalyticsProperty(projectId)
  const syncMutation = useSyncAnalytics(projectId)

  function selectPropertyAndSync(propertyId) {
    selectMutation.mutate(propertyId, {
      onSuccess: () => {
        syncMutation.mutate()
        setChangePropertyOpen(false)
      },
    })
  }

  // Exactly one property - resolve automatically, no picker shown. Applies
  // equally to onboarding and Change Property (nothing to duplicate).
  useEffect(() => {
    if (
      pickerActive &&
      properties.length === 1 &&
      !selectMutation.isPending &&
      !selectMutation.isSuccess
    ) {
      selectPropertyAndSync(properties[0].propertyId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, pickerActive])

  function handleOpenChangeProperty() {
    setChangePropertyOpen(true)
  }

  const pickerResolving = propertiesQuery.isLoading || selectMutation.isPending

  const propertyQuery = useAnalyticsProperty(projectId, { enabled: selected })
  const property = propertyQuery.data?.data

  const brandAssetQuery = useProjectBrandAsset(projectId, { enabled: selected })
  const brandAsset = brandAssetQuery.data?.data

  const trendsQuery = useAnalyticsTrends(projectId, range, { enabled: selected })
  const trends = trendsQuery.data?.data

  const breakdownsQuery = useAnalyticsBreakdowns(projectId, range, { enabled: selected })
  const breakdowns = breakdownsQuery.data?.data

  const pagesQuery = useAnalyticsPages(projectId, { limit: 10 }, { enabled: selected })
  const pages = pagesQuery.data?.data?.rows || []

  const eventsQuery = useAnalyticsEvents(projectId, range, { enabled: selected })
  const events = eventsQuery.data?.data

  const conversionsQuery = useAnalyticsConversions(projectId, range, { enabled: selected })
  const conversions = conversionsQuery.data?.data

  const realtimeQuery = useAnalyticsRealtime(projectId, { enabled: selected })
  const realtime = realtimeQuery.data?.data

  const healthQuery = useAnalyticsHealth(projectId, range, { enabled: selected })
  const health = healthQuery.data?.data

  const activityQuery = useAnalyticsActivity(projectId, { enabled: selected })
  const activity = activityQuery.data?.data

  const rangeLabel = RANGE_LABELS[range]

  const kpis = useMemo(() => buildAnalyticsKpisFromTrends(trends), [trends])
  const todayStats = useMemo(() => buildTodaySummaryFromTrends(trends), [trends])

  const trendSeriesConfig = useMemo(() => ([
    { key: 'users', label: 'Users', color: CATEGORICAL_COLORS[0] },
    { key: 'sessions', label: 'Sessions', color: CATEGORICAL_COLORS[1] },
    { key: 'views', label: 'Views', color: CATEGORICAL_COLORS[2] },
    { key: 'conversions', label: 'Conversions', color: CATEGORICAL_COLORS[3] },
  ]), [])

  // Sources/channels both derive from the same one Breakdown fetch's
  // `channels` rows (see TrafficSourcesCard/TopChannelsCard) - color is a
  // display concern assigned here (the backend intentionally returns none,
  // matching how the Trends chart's colors are also assigned here, not by
  // the API).
  const sources = useMemo(
    () => (breakdowns?.sources || []).map((s, i) => ({ ...s, color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length] })),
    [breakdowns]
  )
  const channels = useMemo(
    () => (breakdowns?.channels || []).map((c, i) => ({ ...c, color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length] })),
    [breakdowns]
  )

  const audienceStats = useMemo(() => {
    if (!trends?.totals) return []
    const { totals } = trends
    // GA4 has no direct "returning users" metric on this report - the
    // standard approximation (total users minus new users), labeled as
    // such rather than presented as a precise Google figure.
    const returning = Math.max(0, totals.users - totals.newUsers)
    const engagementRatePct = totals.sessions > 0 ? (totals.engagedSessions / totals.sessions) * 100 : 0

    return [
      { key: 'users', icon: 'users', color: 'blue', value: totals.users.toLocaleString(), label: 'Active users' },
      { key: 'newUsers', icon: 'userPlus', color: 'teal', value: totals.newUsers.toLocaleString(), label: 'New users' },
      { key: 'returning', icon: 'activity', color: 'violet', value: returning.toLocaleString(), label: 'Returning users (est.)' },
      { key: 'engagement', icon: 'click', color: 'amber', value: formatPercent(engagementRatePct), label: 'Engagement rate' },
      { key: 'duration', icon: 'clock', color: 'emerald', value: formatDuration(totals.avgEngagementTime), label: 'Avg. session duration' },
    ]
  }, [trends])

  const conversionStats = useMemo(
    () => (conversions?.conversions || []).map((c) => {
      const style = CONVERSION_CATEGORY_STYLE[c.label] || DEFAULT_CONVERSION_STYLE
      return { key: c.key, icon: style.icon, color: style.color, value: c.count.toLocaleString(), label: c.label, trend: c.trend }
    }),
    [conversions]
  )

  if (statusQuery.isLoading) {
    return <div className="flex-1"><AnalyticsLoadingState /></div>
  }

  if (statusQuery.isError) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Analytics</h1>
        </div>
        <AnalyticsErrorState
          message="Couldn't load your Analytics connection status."
          onRetry={() => statusQuery.refetch()}
          retrying={statusQuery.isFetching}
        />
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Analytics</h1>
          <p className="text-muted-foreground">
            Monitor website traffic, user behaviour and business performance from Google Analytics.
          </p>
        </div>
        <AnalyticsEmptyState variant={isReconnect ? 'reconnect' : 'connect'} />
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="flex-1 space-y-6">
        {/* No propertyName yet -> header renders Connected badge only, no
            action buttons. Onboarding has no manual sync step - selection
            automatically chains into sync (selectPropertyAndSync above). */}
        <AnalyticsHeader connected={connected} />
        <AnalyticsSetupPanel
          loading={pickerResolving}
          error={propertiesQuery.isError}
          onRetry={() => propertiesQuery.refetch()}
          properties={properties}
          onSelectProperty={selectPropertyAndSync}
          selecting={selectMutation.isPending}
        />
      </div>
    )
  }

  if (propertyQuery.isLoading && !property) {
    return <div className="flex-1"><AnalyticsLoadingState /></div>
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <AnalyticsHeader
        connected={connected}
        propertyName={property?.propertyName}
        lastSyncedAt={status?.lastSyncAt}
        syncing={syncMutation.isPending}
        onSync={() => syncMutation.mutate()}
        gaPropertyUrl={property?.propertyId ? `https://analytics.google.com/analytics/web/#/p${property.propertyId}` : undefined}
        onChangeProperty={handleOpenChangeProperty}
      />

      <ChangePropertyModal
        open={changePropertyOpen}
        onOpenChange={setChangePropertyOpen}
        loading={pickerResolving}
        error={propertiesQuery.isError}
        onRetry={() => propertiesQuery.refetch()}
        properties={properties}
        onSelectProperty={selectPropertyAndSync}
        selecting={selectMutation.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <AnalyticsFilters range={range} onRangeChange={setRange} />

          <AnalyticsPropertyCard
            brandAsset={brandAsset}
            siteName={property?.propertyName}
            siteUrl={property?.websiteUrl}
            property={property}
          />

          <AnalyticsOverviewCards kpis={kpis} loading={trendsQuery.isLoading} />

          <TrafficChartCard data={trends?.series || []} seriesConfig={trendSeriesConfig} loading={trendsQuery.isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TrafficSourcesCard sources={sources} rangeLabel={rangeLabel} loading={breakdownsQuery.isLoading} />
            <TopChannelsCard channels={channels} rangeLabel={rangeLabel} loading={breakdownsQuery.isLoading} />
          </div>

          <TopPagesCard pages={pages} rangeLabel={rangeLabel} loading={pagesQuery.isLoading} />

          <AnalyticsStatRow title="Audience" stats={audienceStats} loading={trendsQuery.isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TopCountriesCard countries={breakdowns?.countries || []} rangeLabel={rangeLabel} loading={breakdownsQuery.isLoading} />
            <DeviceBreakdownCard devices={breakdowns?.devices || []} loading={breakdownsQuery.isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <BrowserOSCard browsers={breakdowns?.browsers || []} operatingSystems={breakdowns?.operatingSystems || []} loading={breakdownsQuery.isLoading} />
            <RealtimeUsersCard
              activeUsers={realtime?.activeUsers}
              topPages={realtime?.topPages || []}
              topCountries={realtime?.topCountries || []}
              deviceSplit={realtime?.deviceSplit || []}
              loading={realtimeQuery.isLoading}
            />
          </div>

          {conversionStats.length > 0 && <AnalyticsStatRow title="Conversions" stats={conversionStats} loading={conversionsQuery.isLoading} />}

          <EventsCard events={events?.events || []} rangeLabel={rangeLabel} loading={eventsQuery.isLoading} />

          {/* Full-width, standalone, last section - same placement Search
              Console's RecentActivityCard uses (see
              app/app/google-visibility/search-console/page.jsx), instead of
              being squeezed into a 2-col grid alongside Events. */}
          <RecentActivityCard activity={activity?.activity || []} />
        </div>

        <div className="space-y-5 lg:sticky lg:top-6">
          <TrafficHealthCard score={health?.score} status={health?.status} reasons={health?.reasons || []} />
          <TodaySummaryCard stats={todayStats} />
        </div>
      </div>
    </div>
  )
}
