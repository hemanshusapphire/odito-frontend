"use client"

import { useMemo, useState } from 'react'
import { AnalyticsToolbar } from '@/components/social-media/AnalyticsToolbar'
import { MetricCard } from '@/components/social-media/MetricCard'
import { TopPerformingContent } from '@/components/social-media/TopPerformingContent'
import { AIRecommendations } from '@/components/social-media/AIRecommendations'
import { LeadTrackingCard } from '@/components/social-media/LeadTrackingCard'
import { StrategyUpdateBanner } from '@/components/social-media/StrategyUpdateBanner'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import {
  ANALYTICS_DEFAULT_DATE_RANGE,
  ANALYTICS_SUMMARY_BY_PLATFORM,
  TOP_PERFORMING_POSTS,
  AI_RECOMMENDATIONS,
  LEAD_TRACKING,
  STRATEGY_UPDATE,
} from '@/lib/socialMediaAIDummyData'

/**
 * Social Media AI - Analytics. Entirely frontend-only, same as the rest of
 * the module: every figure comes from lib/socialMediaAIDummyData.js, no
 * Facebook/Instagram API, no real report generation. Changing the platform
 * filter swaps in a different (still static) set of mock numbers rather
 * than duplicating page state.
 */
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(ANALYTICS_DEFAULT_DATE_RANGE)
  const [platform, setPlatform] = useState('all')
  const { toasts, notify, dismiss } = useToastQueue()

  const summaryMetrics = ANALYTICS_SUMMARY_BY_PLATFORM[platform] || ANALYTICS_SUMMARY_BY_PLATFORM.all
  const filteredPosts = useMemo(
    () => (platform === 'all' ? TOP_PERFORMING_POSTS : TOP_PERFORMING_POSTS.filter((p) => p.platform === platform)),
    [platform]
  )

  function handleExport() {
    notify('Report ready to download (preview only).', 'success')
  }

  function handleSelectRecommendation(rec) {
    notify(`"${rec.title}" - detailed guidance is on the roadmap.`, 'default')
  }

  function handleRowAction(post, action) {
    notify(`${action} for "${post.title}" is on the roadmap.`, 'default')
  }

  function handleStrategyApplied() {
    notify("Strategy applied to next month's calendar.", 'success')
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              Sample data
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Turn social performance into your next strategy.</p>
        </div>

        <AnalyticsToolbar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          platform={platform}
          onPlatformChange={setPlatform}
          onExport={handleExport}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopPerformingContent
            posts={filteredPosts}
            onViewDetails={(post) => handleRowAction(post, 'Post details')}
            onOpenInStudio={(post) => handleRowAction(post, 'Opening in Creative Studio')}
            onDuplicate={(post) => handleRowAction(post, 'Duplicating')}
          />
        </div>

        <div className="flex flex-col gap-5">
          <AIRecommendations recommendations={AI_RECOMMENDATIONS} onSelectRecommendation={handleSelectRecommendation} />
          <LeadTrackingCard tracking={LEAD_TRACKING} />
        </div>
      </div>

      <StrategyUpdateBanner update={STRATEGY_UPDATE} onApplied={handleStrategyApplied} />

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
