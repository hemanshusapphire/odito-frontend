"use client"

import { useMemo, useState } from 'react'
import SocialTabs from '@/components/dashboard/social/SocialTabs'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'

import ReportsHeader from '@/components/dashboard/social/reports/ReportsHeader'
import PlatformSelector from '@/components/dashboard/social/reports/PlatformSelector'
import DateToolbar from '@/components/dashboard/social/reports/DateToolbar'
import ReportMetricCard from '@/components/dashboard/social/reports/ReportMetricCard'
import PerformanceChart from '@/components/dashboard/social/reports/PerformanceChart'
import StatsTable from '@/components/dashboard/social/reports/StatsTable'

import { REPORT_PLATFORMS, kpisForPlatform, dateRangeLabel } from '@/lib/socialReportsDummyData'

/**
 * Social Media Management - Reports tab. Frontend-only: KPIs/chart/table
 * all come from lib/socialReportsDummyData.js - no backend, no API, no
 * React Query. Platform + date range are local UI state that drive which
 * slice of the static data renders.
 */
export default function SocialReportsPage() {
  const [activePlatform, setActivePlatform] = useState('facebook')
  const [range, setRange] = useState(30)
  const [refreshing, setRefreshing] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  const kpis = useMemo(() => kpisForPlatform(activePlatform), [activePlatform])
  const activeName = REPORT_PLATFORMS.find((p) => p.id === activePlatform)?.name

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Report data refreshed', 'success') }, 900)
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <ReportsHeader
        dateRangeLabel={dateRangeLabel(range)}
        onExport={() => notify('Exporting report…', 'success')}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <SocialTabs />

      <PlatformSelector active={activePlatform} onSelect={setActivePlatform} />

      <DateToolbar
        range={range}
        onRangeChange={setRange}
        onExport={() => notify('Exporting report…', 'success')}
        onToggleFilters={() => notify('Use the filters below the Social Stats table to narrow results')}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => <ReportMetricCard key={kpi.key} kpi={kpi} />)}
      </div>

      <PerformanceChart days={range} />

      <StatsTable onSync={() => notify(`Syncing ${activeName} data…`, 'success')} />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
