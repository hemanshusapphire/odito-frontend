"use client"

import { useEffect, useMemo, useState } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import {
  useBusinessProfileStatus,
  useBusinessProfileAccounts,
  useBusinessProfileLocations,
  useSelectBusinessProfile,
  useBusinessProfileDetails,
  useBusinessProfileTrends,
  useBusinessProfileMedia,
  useSyncBusinessProfile,
  useProjectBrandAsset,
} from '@/hooks/useDashboardQueries'
import {
  buildKpisFromTrends,
  buildCustomerActionsFromTrends,
} from '@/lib/businessProfileTrends'
import { buildRecentActivityFromSyncTimestamps } from '@/lib/businessProfileActivity'

import BusinessProfileHeader from '@/components/dashboard/google-visibility/business-profile/BusinessProfileHeader'
import BusinessProfileSetupPanel from '@/components/dashboard/google-visibility/business-profile/BusinessProfileSetupPanel'
import ChangeLocationModal from '@/components/dashboard/google-visibility/business-profile/ChangeLocationModal'
import BusinessSummaryCard from '@/components/dashboard/google-visibility/business-profile/BusinessSummaryCard'
import PerformanceKPIGrid from '@/components/dashboard/google-visibility/business-profile/PerformanceKPIGrid'
import PerformanceTrendsCard from '@/components/dashboard/google-visibility/business-profile/PerformanceTrendsCard'
import PhotosGalleryCard from '@/components/dashboard/google-visibility/business-profile/PhotosGalleryCard'
import CustomerActionsCard from '@/components/dashboard/google-visibility/business-profile/CustomerActionsCard'
import RecentActivityCard from '@/components/dashboard/google-visibility/business-profile/RecentActivityCard'
import BusinessProfileLoadingState from '@/components/dashboard/google-visibility/business-profile/BusinessProfileLoadingState'
import BusinessProfileEmptyState from '@/components/dashboard/google-visibility/business-profile/BusinessProfileEmptyState'
import ReviewsDrawer from '@/components/dashboard/google-visibility/ReviewsDrawer'

const RANGE_LABELS = { '7': 'the last 7 days', '30': 'the last 30 days', '90': 'the last 90 days', '365': 'the last 12 months' }

/**
 * Business Profile dashboard - real Google Business Profile data only.
 *
 * Data flow: status (connection/selection) -> details (profile fields) +
 * trends (day-by-day performance, also powers the KPI cards) + media
 * (photos). Everything is fetched via the React Query hooks in
 * hooks/useDashboardQueries.js, which call the existing/extended
 * businessProfileController endpoints - no new API client, no duplicated
 * fetch logic.
 *
 * Top Engagement Metrics, Business Health and AI Recommendations have all
 * been removed entirely (not just hidden/placeholdered) - review response
 * rate/time, photo views and local keyword rank aren't exposed by any
 * current Google Business Profile API, and Odito doesn't fabricate numbers
 * it can't back with real data.
 */
export default function BusinessProfilePage() {
  const { activeProjectId: projectId } = useProject()
  const [range, setRange] = useState('30')
  const [photoCategory, setPhotoCategory] = useState('')

  const statusQuery = useBusinessProfileStatus(projectId)
  const status = statusQuery.data?.data

  const connected = !!status?.connected
  const selected = connected && !!status?.serviceEnabled
  const isReconnect = status?.connectionStatus === 'expired' || status?.connectionStatus === 'revoked'

  // Single account/location picker state, shared by BOTH first-time
  // onboarding (!selected) and the "Change Location" modal on an
  // already-connected dashboard - one set of state/queries/mutations for
  // both entry points, not two. `changeLocationOpen` gates the second entry
  // point; the resolve-automatically-when-there's-only-one-option effect
  // below applies equally to both (nothing to duplicate).
  const [selectedAccountId, setSelectedAccountId] = useState(null)
  const [changeLocationOpen, setChangeLocationOpen] = useState(false)
  const [reviewsOpen, setReviewsOpen] = useState(false)

  const pickerActive = (connected && !selected) || changeLocationOpen

  const accountsQuery = useBusinessProfileAccounts(projectId, { enabled: pickerActive })
  const accounts = accountsQuery.data?.data || []

  useEffect(() => {
    if (!selectedAccountId && accounts.length === 1) {
      setSelectedAccountId(accounts[0].accountId)
    }
  }, [accounts, selectedAccountId])

  const locationsQuery = useBusinessProfileLocations(projectId, selectedAccountId, {
    enabled: pickerActive && !!selectedAccountId,
  })
  const locations = locationsQuery.data?.data || []

  const selectMutation = useSelectBusinessProfile(projectId)
  const syncMutation = useSyncBusinessProfile(projectId)

  function selectLocationAndSync(accountId, locationId) {
    selectMutation.mutate(
      { accountId, locationId },
      {
        onSuccess: () => {
          syncMutation.mutate()
          setChangeLocationOpen(false)
        },
      }
    )
  }

  useEffect(() => {
    if (
      selectedAccountId &&
      locations.length === 1 &&
      !selectMutation.isPending &&
      !selectMutation.isSuccess
    ) {
      selectLocationAndSync(selectedAccountId, locations[0].locationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, locations])

  function handleOpenChangeLocation() {
    setSelectedAccountId(null)
    setChangeLocationOpen(true)
  }

  // Single derived "picker is busy" flag, reused by both the onboarding
  // panel and the Change Location modal - same three source queries either way.
  const pickerResolving = accountsQuery.isLoading || (!!selectedAccountId && locationsQuery.isLoading) || selectMutation.isPending

  const detailsQuery = useBusinessProfileDetails(projectId, { enabled: selected })
  const details = detailsQuery.data?.data

  const trendsQuery = useBusinessProfileTrends(projectId, range, { enabled: selected })
  const trends = trendsQuery.data?.data

  const mediaQuery = useBusinessProfileMedia(projectId, { page: 1, limit: 24, category: photoCategory }, { enabled: selected })
  const media = mediaQuery.data?.data

  // Same hook, same cache key (['brand-asset', projectId]), same endpoint
  // the Workspace Switcher already uses - if the switcher has already
  // loaded this project's brand asset, this resolves instantly from the
  // shared React Query cache with no new network request.
  const brandAssetQuery = useProjectBrandAsset(projectId, { enabled: selected })
  const brandAsset = brandAssetQuery.data?.data

  const kpis = useMemo(() => buildKpisFromTrends(trends), [trends])
  const customerActions = useMemo(() => buildCustomerActionsFromTrends(trends), [trends])
  const recentActivity = useMemo(
    () => buildRecentActivityFromSyncTimestamps(details, status?.lastSyncAt),
    [details, status?.lastSyncAt]
  )

  // Initial connection/selection status still loading - whole page is a skeleton.
  if (statusQuery.isLoading) {
    return <div className="flex-1"><BusinessProfileLoadingState /></div>
  }

  if (statusQuery.isError) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Business Profile</h1>
        </div>
        <div className="max-w-md mx-auto mt-10 text-center text-sm text-muted-foreground">
          Couldn't load your Business Profile connection status. Please refresh the page.
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Business Profile</h1>
          <p className="text-muted-foreground">
            Monitor your business performance, local visibility and customer engagement from Google Business Profile.
          </p>
        </div>
        <BusinessProfileEmptyState variant={isReconnect ? 'reconnect' : 'connect'} />
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="flex-1 space-y-6">
        {/* No businessName yet -> header renders Connected badge only, no
            action buttons. Onboarding has no manual sync step - selection
            automatically chains into sync (selectLocationAndSync above). */}
        <BusinessProfileHeader connected={connected} />
        <BusinessProfileSetupPanel
          loading={pickerResolving}
          error={accountsQuery.isError}
          onRetry={() => accountsQuery.refetch()}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          locations={locations}
          onSelectLocation={(locationId) => selectLocationAndSync(selectedAccountId, locationId)}
          selecting={selectMutation.isPending}
        />
      </div>
    )
  }

  // Connected + selected, but the very first details fetch hasn't resolved yet.
  if (detailsQuery.isLoading && !details) {
    return <div className="flex-1"><BusinessProfileLoadingState /></div>
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <BusinessProfileHeader
        connected={connected}
        businessName={details?.businessName}
        currentLocation={details?.address}
        lastSyncedAt={status?.lastSyncAt}
        syncing={syncMutation.isPending}
        onSync={() => syncMutation.mutate()}
        mapsUrl={details?.mapsUri}
        onChangeLocation={handleOpenChangeLocation}
      />

      <ChangeLocationModal
        open={changeLocationOpen}
        onOpenChange={setChangeLocationOpen}
        loading={pickerResolving}
        error={accountsQuery.isError}
        onRetry={() => accountsQuery.refetch()}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        locations={locations}
        onSelectLocation={(locationId) => selectLocationAndSync(selectedAccountId, locationId)}
        selecting={selectMutation.isPending}
      />

      <BusinessSummaryCard details={details} brandAsset={brandAsset} onOpenReviews={() => setReviewsOpen(true)} />

      <ReviewsDrawer open={reviewsOpen} onOpenChange={setReviewsOpen} projectId={projectId} />

      <PerformanceKPIGrid kpis={kpis} />

      <PerformanceTrendsCard
        series={trends?.series || []}
        range={range}
        onRangeChange={setRange}
        loading={trendsQuery.isLoading}
      />

      <PhotosGalleryCard
        data={media}
        loading={mediaQuery.isLoading}
        category={photoCategory}
        onCategoryChange={setPhotoCategory}
      />

      <CustomerActionsCard
        customerActions={customerActions}
        rangeLabel={RANGE_LABELS[range]}
        loading={trendsQuery.isLoading}
      />

      <RecentActivityCard activity={recentActivity} />
    </div>
  )
}
