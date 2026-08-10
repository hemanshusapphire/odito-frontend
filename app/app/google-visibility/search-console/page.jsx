"use client"

import { useEffect, useMemo, useState } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import {
  useSearchConsoleStatus,
  useSearchConsoleSites,
  useSelectSearchConsoleSite,
  useSyncSearchConsole,
  useSearchConsoleData,
  useSearchConsoleTrends,
  useSearchConsoleBreakdown,
  useSearchConsoleSitemaps,
  useInspectSearchConsoleUrl,
  useProjectBrandAsset,
} from '@/hooks/useDashboardQueries'
import { buildKpisFromSeries } from '@/lib/searchConsoleTrends'
import { buildRecentActivityFromSyncTimestamps } from '@/lib/searchConsoleActivity'
import { formatCountryLabel, formatDeviceLabel, formatSearchAppearanceLabel } from '@/lib/searchConsoleFormatters'

import SearchConsoleHeader from '@/components/dashboard/google-visibility/search-console/SearchConsoleHeader'
import SearchConsoleEmptyState from '@/components/dashboard/google-visibility/search-console/SearchConsoleEmptyState'
import SearchConsoleLoadingState from '@/components/dashboard/google-visibility/search-console/SearchConsoleLoadingState'
import SearchConsoleSetupPanel from '@/components/dashboard/google-visibility/search-console/SearchConsoleSetupPanel'
import ChangeSiteModal from '@/components/dashboard/google-visibility/search-console/ChangeSiteModal'
import PropertySummaryCard from '@/components/dashboard/google-visibility/search-console/PropertySummaryCard'
import KPIGrid from '@/components/dashboard/google-visibility/search-console/KPIGrid'
import SearchTrendsCard from '@/components/dashboard/google-visibility/search-console/SearchTrendsCard'
import TopPagesTable from '@/components/dashboard/google-visibility/search-console/TopPagesTable'
import TopQueriesTable from '@/components/dashboard/google-visibility/search-console/TopQueriesTable'
import DimensionBreakdownList from '@/components/dashboard/google-visibility/search-console/DimensionBreakdownList'
import SearchAppearanceEmptyState from '@/components/dashboard/google-visibility/search-console/SearchAppearanceEmptyState'
import SitemapsTable from '@/components/dashboard/google-visibility/search-console/SitemapsTable'
import UrlInspectionCard from '@/components/dashboard/google-visibility/search-console/UrlInspectionCard'
import RecentActivityCard from '@/components/dashboard/google-visibility/search-console/RecentActivityCard'

/**
 * Search Console dashboard - real Google Search Console data only.
 *
 * Data flow: status (connection/selection) -> data (page-level rows +
 * summary, `page` dimension) + trends (day-by-day series, `date` dimension,
 * also powers the KPI cards) + breakdown x4 (query/country/device/
 * searchAppearance dimensions) + sitemaps (Sitemaps API, live) + on-demand
 * URL inspection (URL Inspection API, live). All via the React Query hooks
 * in hooks/useDashboardQueries.js, calling searchConsoleController.
 *
 * Phase 1 scope is intentionally limited to what Google's Search Analytics,
 * Sitemaps and URL Inspection APIs actually expose. Index Coverage and Core
 * Search Health were removed entirely (not placeholdered) - Google has no
 * bulk coverage-report API, only per-URL inspection, which is what the URL
 * Inspection tool below already is.
 */
export default function SearchConsolePage() {
  const { activeProjectId: projectId } = useProject()
  const [range, setRange] = useState('30')
  const [changeSiteOpen, setChangeSiteOpen] = useState(false)

  const statusQuery = useSearchConsoleStatus(projectId)
  const status = statusQuery.data?.data

  const connected = !!status?.connected
  const selected = connected && !!status?.service_enabled

  // Single site-picker state, shared by BOTH first-time onboarding
  // (!selected) and the "Change Property" modal on an already-connected
  // dashboard - one set of state/queries/mutations for both entry points.
  const pickerActive = (connected && !selected) || changeSiteOpen

  const sitesQuery = useSearchConsoleSites(projectId, { enabled: pickerActive })
  const sites = sitesQuery.data?.data || []

  const selectMutation = useSelectSearchConsoleSite(projectId)
  const syncMutation = useSyncSearchConsole(projectId)

  function selectSiteAndSync(siteUrl) {
    selectMutation.mutate(siteUrl, {
      onSuccess: () => {
        syncMutation.mutate()
        setChangeSiteOpen(false)
      },
    })
  }

  useEffect(() => {
    if (
      !selected &&
      sites.length === 1 &&
      !selectMutation.isPending &&
      !selectMutation.isSuccess
    ) {
      selectSiteAndSync(sites[0].siteUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites, selected])

  const pickerResolving = sitesQuery.isLoading || selectMutation.isPending

  const dataQuery = useSearchConsoleData(projectId, {}, { enabled: selected })
  const data = dataQuery.data?.data

  const trendsQuery = useSearchConsoleTrends(projectId, range, { enabled: selected })
  const trendsSeries = trendsQuery.data?.data?.series || []

  const queriesQuery = useSearchConsoleBreakdown(projectId, 'query', { enabled: selected })
  const countryQuery = useSearchConsoleBreakdown(projectId, 'country', { enabled: selected })
  const deviceQuery = useSearchConsoleBreakdown(projectId, 'device', { enabled: selected })
  const appearanceQuery = useSearchConsoleBreakdown(projectId, 'searchAppearance', { enabled: selected })
  const sitemapsQuery = useSearchConsoleSitemaps(projectId, { enabled: selected })
  const inspectMutation = useInspectSearchConsoleUrl(projectId)

  // Same centralized Brand Asset resolver Analytics/Business Profile use for
  // their property icon - one cache entry per project, shared across all
  // three Google Visibility pages (see hooks/useDashboardQueries.js).
  const brandAssetQuery = useProjectBrandAsset(projectId, { enabled: selected })
  const brandAsset = brandAssetQuery.data?.data

  const kpis = useMemo(() => buildKpisFromSeries(trendsSeries), [trendsSeries])
  const recentActivity = useMemo(() => buildRecentActivityFromSyncTimestamps(status), [status])

  // Initial connection/selection status still loading - whole page is a skeleton.
  if (statusQuery.isLoading) {
    return <div className="flex-1"><SearchConsoleLoadingState /></div>
  }

  if (statusQuery.isError) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Search Console</h1>
        </div>
        <div className="max-w-md mx-auto mt-10 text-center text-sm text-muted-foreground">
          Couldn't load your Search Console connection status. Please refresh the page.
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Search Console</h1>
          <p className="text-muted-foreground">
            Monitor your website's search performance, indexing and visibility across Google Search.
          </p>
        </div>
        <SearchConsoleEmptyState variant="connect" />
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="flex-1 space-y-6">
        {/* No siteUrl yet -> header renders Connected badge only, no action buttons.
            Onboarding has no manual sync step - selection automatically chains
            into sync (selectSiteAndSync above). */}
        <SearchConsoleHeader connected={connected} />
        <SearchConsoleSetupPanel
          loading={pickerResolving}
          error={sitesQuery.isError}
          onRetry={() => sitesQuery.refetch()}
          sites={sites}
          onSelectSite={selectSiteAndSync}
          selecting={selectMutation.isPending}
        />
      </div>
    )
  }

  // Connected + selected, but the very first data fetch hasn't resolved yet.
  if (dataQuery.isLoading && !data) {
    return <div className="flex-1"><SearchConsoleLoadingState /></div>
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <SearchConsoleHeader
        connected={connected}
        siteUrl={status?.search_console_site_url}
        lastSyncedAt={status?.last_sync_at}
        syncing={syncMutation.isPending}
        onSync={() => syncMutation.mutate()}
        onChangeSite={() => setChangeSiteOpen(true)}
      />

      <ChangeSiteModal
        open={changeSiteOpen}
        onOpenChange={setChangeSiteOpen}
        loading={pickerResolving}
        error={sitesQuery.isError}
        onRetry={() => sitesQuery.refetch()}
        sites={sites}
        onSelectSite={selectSiteAndSync}
        selecting={selectMutation.isPending}
      />

      <PropertySummaryCard
        siteUrl={status?.search_console_site_url}
        googleEmail={status?.google_email}
        dataPoints={status?.data_points}
        latestDataDate={status?.latest_data_date}
        brandAsset={brandAsset}
      />

      <KPIGrid kpis={kpis} />

      <SearchTrendsCard
        series={trendsSeries}
        range={range}
        onRangeChange={setRange}
        loading={trendsQuery.isLoading}
      />

      <TopPagesTable rows={data?.rows || []} loading={dataQuery.isLoading} />

      <TopQueriesTable rows={queriesQuery.data?.data?.rows || []} loading={queriesQuery.isLoading} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DimensionBreakdownList
          title="Country Performance"
          subtitle="Top countries by clicks"
          rows={countryQuery.data?.data?.rows || []}
          loading={countryQuery.isLoading}
          labelFormatter={formatCountryLabel}
        />
        <DimensionBreakdownList
          title="Device Performance"
          subtitle="Clicks by device category"
          rows={deviceQuery.data?.data?.rows || []}
          loading={deviceQuery.isLoading}
          labelFormatter={formatDeviceLabel}
        />
      </div>

      <DimensionBreakdownList
        title="Search Appearance"
        subtitle="How your results appeared in Google Search"
        rows={appearanceQuery.data?.data?.rows || []}
        loading={appearanceQuery.isLoading}
        labelFormatter={formatSearchAppearanceLabel}
        emptyMessage={<SearchAppearanceEmptyState />}
      />

      <SitemapsTable sitemaps={sitemapsQuery.data?.data || []} loading={sitemapsQuery.isLoading} />

      <UrlInspectionCard
        onInspect={(url) => inspectMutation.mutate(url)}
        isPending={inspectMutation.isPending}
        result={inspectMutation.data?.data}
        error={inspectMutation.isError ? (inspectMutation.error?.message || 'Failed to inspect URL') : null}
      />

      <RecentActivityCard activity={recentActivity} />
    </div>
  )
}
