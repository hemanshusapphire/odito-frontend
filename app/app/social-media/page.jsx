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
import { PostListSkeleton, PostListError } from '@/components/social-media/ScheduledPostList'
import { Skeleton } from '@/components/ui/skeleton'
import { useProject } from '@/contexts/ProjectContext'
import { useSocialAccounts, useOverviewData, useFailedPosts, useSocialAIStrategy } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { OVERVIEW_STATS } from '@/lib/socialMediaAIDummyData'

const ATTENTION_LIMIT = 3

/**
 * Social Media AI - Overview. What has a real backend is real:
 *  - connection pills            <- GET /social/accounts (the real account status)
 *  - Scheduled / Published tiles <- GET /social/publishing totals
 *  - Upcoming posts              <- the next real scheduled publications
 *  - Needs your attention        <- real failed publications
 *  - Content reviews / Designs to approve <- the approval workflow's database
 *    counts (GET /social/publishing/approvals/summary), refreshed whenever an
 *    approval action runs
 *  - Strategy + AI strategy cards <- the project's real AI strategy (GET /social/ai-strategy);
 *    with no strategy they are honest empty states pointing to AI Strategy.
 */
export default function SocialMediaOverviewPage() {
  const { activeProjectId } = useProject()
  const accounts = useSocialAccounts(activeProjectId)
  const overview = useOverviewData(activeProjectId)
  const failed = useFailedPosts(activeProjectId)
  const aiStrategy = useSocialAIStrategy(activeProjectId)

  const statValue = {
    scheduled: overview.scheduledCount,
    published: overview.publishedCount,
    contentReview: overview.contentReviewCount,
    designReview: overview.designReviewCount,
  }
  const isApprovalStat = (stat) => stat.source === 'contentReview' || stat.source === 'designReview'

  return (
    <div className="flex-1 space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Your social media workspace at a glance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ConnectedAccountCard account={accounts.facebook} />
          <ConnectedAccountCard account={accounts.instagram} />
          <Button asChild className="rounded-lg bg-violet-600 text-white shadow-sm hover:bg-violet-700">
            <Link href="/app/social-media/creative-studio">
              <Plus className="h-4 w-4" />
              Create content
            </Link>
          </Button>
        </div>
      </div>

      {!activeProjectId ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm" data-testid="no-project">
          <p className="text-sm font-semibold text-slate-700">No project selected</p>
          <p className="mt-1 text-sm text-slate-400">Select or create a project to see its social media overview.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {OVERVIEW_STATS.map((stat, index) => (
              <OverviewStatCard
                key={stat.id}
                stat={stat}
                tintIndex={index}
                unavailable={stat.source === 'unavailable'}
                loading={stat.source !== 'unavailable' && (isApprovalStat(stat) ? overview.approvalLoading : overview.isLoading)}
                value={statValue[stat.source] ?? null}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Needs your attention</h2>
                  <Link href="/app/social-media/scheduled-posts?tab=failed" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                    View all
                  </Link>
                </div>
                <div className="mt-3 flex flex-col divide-y divide-slate-100">
                  {failed.isLoading ? (
                    <PostListSkeleton rows={2} />
                  ) : failed.isError ? (
                    <PostListError message={describeApiError(failed.error).message} onRetry={() => failed.refetch()} retrying={failed.isFetching} />
                  ) : failed.posts.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-400" data-testid="attention-empty">Nothing needs your attention right now.</p>
                  ) : (
                    failed.posts.slice(0, ATTENTION_LIMIT).map((post) => <AttentionPostCard key={post.id} post={post} />)
                  )}
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
                  {overview.isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl bg-slate-200" aria-label="Loading upcoming post" />)
                  ) : overview.isError ? (
                    <div className="sm:col-span-2 xl:col-span-3">
                      <PostListError message="Upcoming posts could not be loaded." onRetry={() => overview.refetch()} />
                    </div>
                  ) : overview.upcoming.length === 0 ? (
                    <p className="col-span-full rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400" data-testid="upcoming-empty">
                      No upcoming posts. Posts you schedule will appear here.
                    </p>
                  ) : (
                    overview.upcoming.map((post) => <UpcomingPostCard key={post.id} post={post} />)
                  )}
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-6">
              <AIInsightCard state={aiStrategy.data} />
              <StrategyCard state={aiStrategy.data} isLoading={aiStrategy.isLoading} isError={aiStrategy.isError && !aiStrategy.data} onRetry={() => aiStrategy.refetch()} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
