"use client"

import { useState } from 'react'
import { Download, Loader2, Check } from 'lucide-react'
import { DateRangeSelector } from './DateRangeSelector'
import { AnalyticsPlatformFilter } from './AnalyticsPlatformFilter'
import { ANALYTICS_DATE_RANGE_OPTIONS, ANALYTICS_PLATFORM_OPTIONS } from '@/lib/socialMediaAIDummyData'

/** Date range + platform filter + "Export report" row for the Analytics header. */
export function AnalyticsToolbar({ dateRange, onDateRangeChange, platform, onPlatformChange, onExport }) {
  const [exportState, setExportState] = useState('idle') // idle | exporting | ready

  function handleExport() {
    if (exportState !== 'idle') return
    setExportState('exporting')
    setTimeout(() => {
      setExportState('ready')
      onExport?.()
      setTimeout(() => setExportState('idle'), 2200)
    }, 1000)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangeSelector options={ANALYTICS_DATE_RANGE_OPTIONS} value={dateRange} onChange={onDateRangeChange} />
      <AnalyticsPlatformFilter options={ANALYTICS_PLATFORM_OPTIONS} value={platform} onChange={onPlatformChange} />
      <button
        type="button"
        onClick={handleExport}
        disabled={exportState !== 'idle'}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed ${
          exportState === 'ready' ? 'bg-emerald-600' : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-80'
        }`}
      >
        {exportState === 'exporting' && <Loader2 className="h-4 w-4 animate-spin" />}
        {exportState === 'ready' ? <Check className="h-4 w-4" /> : exportState === 'idle' && <Download className="h-4 w-4" />}
        {exportState === 'ready' ? 'Report ready' : exportState === 'exporting' ? 'Exporting…' : 'Export report'}
      </button>
    </div>
  )
}

export default AnalyticsToolbar
