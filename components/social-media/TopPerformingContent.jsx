import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PerformanceTable } from './PerformanceTable'

/** "Top-performing content" card wrapping the PerformanceTable. */
export function TopPerformingContent({ posts, ...rowHandlers }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Top-performing content</h2>
          <p className="mt-1 text-sm text-slate-500">Your best performing posts from the selected period.</p>
        </div>
        <Link
          href="/app/social-media/content-calendar"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          View all content
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4">
        <PerformanceTable posts={posts} {...rowHandlers} />
      </div>
    </div>
  )
}

export default TopPerformingContent
