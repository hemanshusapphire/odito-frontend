import Link from 'next/link'
import { Target, ChevronRight, Info, GraduationCap, Heart, Megaphone, MessageCircle, Camera, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { MIX_LABELS, sortedMix } from '@/lib/socialMedia/aiStrategy'

const MIX_STYLE = {
  informational: { icon: Info, color: 'text-sky-600 bg-sky-50' },
  educational: { icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
  soft_sell: { icon: Heart, color: 'text-rose-500 bg-rose-50' },
  hard_sell: { icon: Megaphone, color: 'text-indigo-600 bg-indigo-50' },
  engagement: { icon: MessageCircle, color: 'text-amber-600 bg-amber-50' },
  behind_the_scenes: { icon: Camera, color: 'text-violet-600 bg-violet-50' },
}

const SHELL = 'flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

/**
 * Overview "strategy" card, from the REAL AI strategy (GET /social/ai-strategy). With no strategy it is an
 * honest empty state with a link to create one — never sample figures.
 */
export function StrategyCard({ state, isLoading = false, isError = false, onRetry }) {
  if (isLoading) {
    return <div className={SHELL} data-testid="overview-strategy-loading"><Skeleton className="h-9 w-40 bg-slate-200" aria-label="Loading strategy" /><Skeleton className="mt-4 h-24 bg-slate-200" /></div>
  }
  if (isError) {
    return (
      <div className={SHELL} data-testid="overview-strategy-error" role="alert">
        <p className="text-sm font-semibold text-slate-800">Strategy unavailable</p>
        <p className="mt-1 text-sm text-slate-500">Your AI strategy could not be loaded.</p>
        <button type="button" onClick={onRetry} className="mt-3 w-fit text-sm font-semibold text-violet-600 hover:text-violet-700">Try again</button>
      </div>
    )
  }

  const strategy = state?.strategy?.strategy
  if (!strategy) {
    const generating = state?.status === 'generating'
    return (
      <div className={SHELL} data-testid="overview-strategy-empty">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">{generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />}</span>
          <p className="text-sm font-bold text-slate-900">{generating ? 'Generating your strategy…' : 'No AI strategy yet'}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {generating ? 'Your strategy is being generated from your Business profile.' : 'Generate a strategy from your Business profile to see your goals and content mix here.'}
        </p>
        <Link href="/app/social-media/ai-strategy" className="mt-4 w-fit text-sm font-semibold text-violet-600 hover:text-violet-700">{generating ? 'View progress' : 'Create strategy'}</Link>
      </div>
    )
  }

  const goal = strategy.goals?.[0]?.goal
  return (
    <div className={SHELL} data-testid="overview-strategy">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Target className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">Primary goal</p>
          <p className="truncate text-sm font-bold text-slate-900" data-testid="overview-strategy-goal">{goal || 'No goal defined yet'}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-500">{strategy.summary}</p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Content mix</p>
        <div className="flex flex-col gap-1">
          {sortedMix(strategy.contentMix).map((item) => {
            const style = MIX_STYLE[item.type] || MIX_STYLE.informational
            const Icon = style.icon
            return (
              <Link key={item.type} href="/app/social-media/ai-strategy" className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.color}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{MIX_LABELS[item.type] || item.type}</span>
                <span className="text-sm font-semibold text-slate-900">{item.percentage}%</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StrategyCard
