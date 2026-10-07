"use client"

import { useRef } from 'react'
import Link from 'next/link'
import { Loader2, Sparkles, RefreshCw, XCircle, CalendarPlus } from 'lucide-react'
import { StrategyStatusCard } from '@/components/social-media/StrategyStatusCard'
import { StrategyProfileChangedBanner } from '@/components/social-media/StrategyProfileChangedBanner'
import { StrategyBusinessContext } from '@/components/social-media/StrategyBusinessContext'
import { StrategyGapsCard } from '@/components/social-media/StrategyGapsCard'
import { AIStrategySections } from '@/components/social-media/AIStrategySections'
import { SingleAIPostGenerator } from '@/components/social-media/SingleAIPostGenerator'
import { Skeleton } from '@/components/ui/skeleton'
import { useProject } from '@/contexts/ProjectContext'
import { useSocialAIStrategy, useGenerateSocialAIStrategy } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { statusView, formatDateTime } from '@/lib/socialMedia/aiStrategy'

/**
 * Social Media AI — AI Strategy, driven entirely by the backend.
 *
 * The strategy is generated on the server from the resolved Business Profile (Google Business Profile +
 * project + the user's own Social AI fields), stored with an exact snapshot of that profile, and shown here
 * read-only. Generation is asynchronous: this page asks the server to start it, then follows the server's own
 * state (it polls a cheap status endpoint while the server says "generating") — there is no client-side
 * progress, no sample strategy and no local state standing in for the result. If generation fails, the last
 * good strategy (if any) stays visible and the real, safe failure message is shown.
 *
 * The strategy is the BRAIN, kept compact: an overview and short grouped cards with expandable detail. It holds no posting
 * schedule: "Create content calendar" goes to the Content Calendar, where the user picks posts per week, platforms and
 * dates. Below the strategy sits the single-post generator (one post at a time, saved as a draft in the existing approval
 * workflow). Not in this page by design: editing (the strategy is regenerated, not hand-edited), and any publishing /
 * approval / scheduling action.
 */
export default function AIStrategyPage() {
  const { activeProjectId } = useProject()
  const query = useSocialAIStrategy(activeProjectId)
  const generate = useGenerateSocialAIStrategy(activeProjectId)
  // Set synchronously on the first click, so a fast double-click can never start two requests before React re-renders the disabled button.
  const startInFlight = useRef(false)

  const header = (view) => (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Strategy</h1>
        <p className="mt-1 text-sm text-slate-500">Your brand&apos;s strategy: who you are, who you talk to and what you say. The calendar turns it into a plan.</p>
      </div>
      {view && <StrategyStatusCard view={view} />}
    </div>
  )

  if (!activeProjectId) {
    return (
      <div className="flex-1 space-y-6 pb-16">
        {header(null)}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm" data-testid="no-project">
          <p className="text-sm font-semibold text-slate-700">No project selected</p>
          <p className="mt-1 text-sm text-slate-400">Select or create a project to generate its social strategy.</p>
        </div>
      </div>
    )
  }

  if (query.isLoading) {
    return (
      <div className="flex-1 space-y-6 pb-16">
        {header(null)}
        <div className="space-y-4" data-testid="strategy-loading" aria-busy="true">
          <Skeleton className="h-24 rounded-2xl bg-slate-200" aria-label="Loading AI strategy" />
          <Skeleton className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (query.isError && !query.data) {
    return (
      <div className="flex-1 space-y-6 pb-16">
        {header(null)}
        <div role="alert" data-testid="strategy-error" className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-red-700">Couldn&apos;t load your AI strategy</p>
          <p className="max-w-md text-sm text-red-600/90">{describeApiError(query.error, 'The request to Odito failed. Nothing was changed.').message}</p>
          <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="mt-1 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70">
            {query.isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      </div>
    )
  }

  const state = query.data
  if (!state) return null
  const { strategy, generation, profile } = state
  const serverGenerating = state.status === 'generating'
  const busy = generate.isPending || serverGenerating
  const failedAttempt = state.status === 'failed' ? generation : null
  const startError = generate.isError ? describeApiError(generate.error, 'Could not start the strategy generation.') : null
  const blockers = profile?.blockers || []
  const canGenerate = profile?.canGenerate !== false

  function handleGenerate() {
    if (startInFlight.current || busy || !canGenerate) return
    startInFlight.current = true
    generate.mutate(undefined, { onSettled: () => { startInFlight.current = false } })
  }

  const generateButton = (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={busy || !canGenerate}
      data-testid="generate-button"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : strategy ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      {busy ? 'Generating…' : strategy ? 'Regenerate strategy' : 'Generate strategy'}
    </button>
  )

  return (
    <div className="flex-1 space-y-6 pb-16">
      {header(statusView(state))}

      {profile?.changed && strategy && (
        <StrategyProfileChangedBanner changes={profile.changes} busy={busy} onRegenerate={handleGenerate} />
      )}

      {serverGenerating && (
        <div role="status" data-testid="strategy-generating" className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-violet-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Generating your strategy from your Business profile…</p>
            <p className="mt-0.5 text-sm text-slate-600">
              This runs on the server and usually takes a minute or two. You can leave this page — it will be here when it&apos;s done.
              {generation?.startedAt ? ` Started ${formatDateTime(generation.startedAt)}.` : ''}
            </p>
          </div>
        </div>
      )}

      {failedAttempt && (
        <div role="alert" data-testid="strategy-failed" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">The last attempt to generate a strategy failed.</p>
              <p className="mt-0.5 text-sm text-red-700" data-testid="strategy-failed-message">{failedAttempt.failure?.message}</p>
              {strategy && <p className="mt-0.5 text-sm text-red-700">Your previous strategy (version {strategy.version}) is shown below and is unchanged.</p>}
            </div>
          </div>
        </div>
      )}

      {startError && (
        <p role="alert" data-testid="strategy-start-error" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{startError.message}</p>
      )}

      {!canGenerate && (
        <div role="status" data-testid="strategy-blocked" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {blockers.map((b) => <p key={b.field}>{b.reason}</p>)}
          <Link href="/app/social-media/business-profile" className="mt-1 inline-block font-semibold underline">Open Business profile</Link>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        {strategy && !serverGenerating && (
          <Link
            href="/app/social-media/content-calendar"
            data-testid="create-calendar-cta"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50"
          >
            <CalendarPlus className="h-4 w-4" /> Create content calendar
          </Link>
        )}
        {generateButton}
      </div>

      {strategy ? (
        <>
          <StrategyBusinessContext snapshot={strategy.profileSnapshot} />
          <AIStrategySections strategy={strategy.strategy} />
          {!serverGenerating && <SingleAIPostGenerator projectId={activeProjectId} strategyState={state} />}
          <StrategyGapsCard gaps={strategy.strategyGaps} title="Gaps in this strategy" subtitle="Information that was missing when this strategy was generated." />
        </>
      ) : (
        !serverGenerating && (
          <>
            <div data-testid="strategy-empty" className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600"><Sparkles className="h-6 w-6" /></span>
              <p className="text-base font-semibold text-slate-800">You don&apos;t have an AI strategy yet</p>
              <p className="max-w-md text-sm text-slate-500">Odito will use your Business profile — what it knows about your business, audience, goals and brand — to propose what to publish on Facebook and Instagram.</p>
            </div>
            <StrategyGapsCard gaps={profile?.gaps} title="Make your strategy more specific" subtitle="These details are missing from your Business profile. You can generate without them, but the strategy will be more general." />
          </>
        )
      )}
    </div>
  )
}
