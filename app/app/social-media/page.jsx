"use client"

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConnectedAccountCard } from '@/components/social-media/ConnectedAccountCard'
import { OverviewStatCard } from '@/components/social-media/OverviewStatCard'
import { AttentionPostCard } from '@/components/social-media/AttentionPostCard'
import { AIInsightCard } from '@/components/social-media/AIInsightCard'
import { UpcomingPostCard } from '@/components/social-media/UpcomingPostCard'
import { StrategyCard } from '@/components/social-media/StrategyCard'
import {
  CONNECTED_ACCOUNTS,
  OVERVIEW_STATS,
  ATTENTION_POSTS,
  UPCOMING_POSTS,
  AI_INSIGHT,
  STRATEGY,
} from '@/lib/socialMediaAIDummyData'

/**
 * Social Media AI - Overview. Entirely frontend-only: every figure comes
 * from lib/socialMediaAIDummyData.js, no API calls, no React Query, no
 * backend. Modeled after an external reference screenshot, rebuilt in the
 * module's own light/purple visual identity (see SocialMediaHeader and
 * SocialMediaSidebar, both swapped in by components/layout/dashboard-layout.jsx).
 */
export default function SocialMediaOverviewPage() {
  return (
    <div className="flex-1 space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Your social media workspace at a glance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {CONNECTED_ACCOUNTS.map((account) => (
            <ConnectedAccountCard key={account.id} platform={account.id} connected={account.connected} />
          ))}
          <Button asChild className="rounded-lg bg-violet-600 text-white shadow-sm hover:bg-violet-700">
            <Link href="/app/social-media/creative-studio">
              <Plus className="h-4 w-4" />
              Create content
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OVERVIEW_STATS.map((stat, index) => (
          <OverviewStatCard key={stat.id} stat={stat} tintIndex={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Needs your attention</h2>
              <Link href="/app/social-media/content-approvals" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                View all
              </Link>
            </div>
            <div className="mt-3 flex flex-col divide-y divide-slate-100">
              {ATTENTION_POSTS.map((post) => (
                <AttentionPostCard key={post.id} post={post} onReview={() => {}} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Upcoming posts</h2>
              <Link href="/app/social-media/scheduled-posts" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                View all
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {UPCOMING_POSTS.map((post) => (
                <UpcomingPostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <AIInsightCard insight={AI_INSIGHT} />
          <StrategyCard strategy={STRATEGY} />
        </div>
      </div>
    </div>
  )
}
