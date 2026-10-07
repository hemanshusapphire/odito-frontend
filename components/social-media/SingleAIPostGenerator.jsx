"use client"

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, Sparkles, XCircle, CheckCircle2, Info } from 'lucide-react'
import { useSocialAIContent, useGenerateSocialAIContent } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { PLATFORM_LABELS } from '@/lib/socialMedia/aiStrategy'
import { generatorOptions, reviewHref, approvalNote, objectiveLabel } from '@/lib/socialMedia/aiContent'

const SELECT_CLASS = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

/**
 * Generate ONE post from the current AI strategy. Everything shown is the server's: the options come from
 * the stored strategy and the server-reported connections, the progress is the server's own "generating"
 * state (no percentages, no timers), and the result preview is the REAL draft that was saved - which is
 * already in the existing approval workflow. This component has no approve / schedule / publish control.
 *
 * A past generation (ready or failed) is only shown if it was started in this visit; a generation that is
 * still running when the page opens is picked up again.
 */
export function SingleAIPostGenerator({ projectId, strategyState }) {
  const options = generatorOptions(strategyState)
  const content = useSocialAIContent(projectId)
  const generate = useGenerateSocialAIContent(projectId)
  const startInFlight = useRef(false)

  const [platform, setPlatform] = useState('')
  const [pillar, setPillar] = useState('')
  const [objective, setObjective] = useState('')
  const [startedId, setStartedId] = useState(null)

  const data = content.data
  const status = data?.status
  const serverGenerating = status === 'generating'
  const busy = generate.isPending || serverGenerating
  const shown = serverGenerating || (startedId && data?.generation?.id === startedId)
  const chosenPlatform = options.platforms.find((p) => p.value === platform)
  const ready = !!platform && !!pillar && !!objective && chosenPlatform?.connected === true
  const profileChanged = strategyState?.profile?.changed === true
  const startError = generate.isError ? describeApiError(generate.error, 'Could not start the post generation.') : null
  const noPlatform = options.platforms.length > 0 && !options.platforms.some((p) => p.connected)

  function handleGenerate() {
    // Set synchronously so a fast double-click cannot send two requests before React re-renders the disabled button.
    if (startInFlight.current || busy || !ready) return
    startInFlight.current = true
    generate.mutate({ platform, contentPillar: pillar, objective }, {
      onSuccess: (res) => setStartedId(res?.data?.generation?.id || null),
      onSettled: () => { startInFlight.current = false },
    })
  }

  return (
    <section data-testid="single-post-generator" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600"><Sparkles className="h-4 w-4" /></span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">Generate a post</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Odito writes one post from strategy version {strategyState.strategy.version}, using the business details that strategy was built on. It&apos;s saved as a draft and goes to content review - nothing is published.
          </p>
        </div>
      </div>

      {profileChanged && (
        <p data-testid="generator-profile-changed" className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Your Business profile changed after this strategy was generated. The post follows the strategy as it was; regenerate the strategy to use the new details.
        </p>
      )}

      {noPlatform && (
        <p data-testid="generator-no-platform" className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Connect Facebook or Instagram to generate a post. <Link href="/app/social-media/connect-accounts" className="font-semibold text-violet-700 underline">Connect accounts</Link>
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Platform
          <select aria-label="Platform" data-testid="generator-platform" value={platform} onChange={(e) => setPlatform(e.target.value)} disabled={busy} className={`${SELECT_CLASS} mt-1`}>
            <option value="">Select a platform</option>
            {options.platforms.map((p) => (
              <option key={p.value} value={p.value} disabled={!p.connected}>{p.label}{p.connected ? '' : ' (not connected)'}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Content pillar
          <select aria-label="Content pillar" data-testid="generator-pillar" value={pillar} onChange={(e) => setPillar(e.target.value)} disabled={busy} className={`${SELECT_CLASS} mt-1`}>
            <option value="">Select a pillar</option>
            {options.pillars.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Objective
          <select aria-label="Objective" data-testid="generator-objective" value={objective} onChange={(e) => setObjective(e.target.value)} disabled={busy} className={`${SELECT_CLASS} mt-1`}>
            <option value="">Select an objective</option>
            {options.objectives.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy || !ready}
          data-testid="generate-post-button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? 'Generating…' : 'Generate post'}
        </button>
      </div>

      {startError && (
        <p role="alert" data-testid="generator-start-error" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{startError.message}</p>
      )}

      {serverGenerating && (
        <div role="status" data-testid="generator-generating" className="mt-4 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-violet-600" />
          <p className="text-sm text-slate-700">
            Writing your {PLATFORM_LABELS[data.generation?.request?.platform] || ''} post on the server. This usually takes under a minute, and you can leave this page - the draft will be waiting in Content Approvals.
          </p>
        </div>
      )}

      {shown && status === 'failed' && (
        <div role="alert" data-testid="generator-failed" className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800">The post could not be generated.</p>
            <p className="mt-0.5 text-sm text-red-700" data-testid="generator-failed-message">{data.generation?.failure?.message}</p>
            <p className="mt-0.5 text-sm text-red-700">Nothing was saved. You can try again.</p>
          </div>
        </div>
      )}

      {shown && status === 'ready' && <GeneratedDraft publication={data.publication} />}
    </section>
  )
}

function GeneratedDraft({ publication }) {
  if (!publication) {
    // the generation succeeded but the draft has since been deleted - say so rather than show anything invented
    return <p data-testid="generator-draft-missing" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">The generated draft is no longer available - it may have been deleted. Generate another to continue.</p>
  }
  const ai = publication.generation
  return (
    <div data-testid="generator-result" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <CheckCircle2 className="h-4 w-4" />
        Draft saved - {approvalNote(publication.approvalState)}
      </div>
      <p data-testid="generator-result-content" className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800">{publication.content}</p>
      <p data-testid="generator-result-meta" className="mt-2 text-xs text-slate-500">
        {PLATFORM_LABELS[publication.platform] || publication.platform}
        {ai ? ` · AI-generated · ${ai.contentPillar} · ${objectiveLabel(ai.objective)} · strategy v${ai.strategyVersion}` : ''}
      </p>
      {publication.platform === 'instagram' && (
        <p data-testid="generator-instagram-note" className="mt-2 flex items-start gap-2 text-xs text-slate-600">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Instagram posts need an image or video before they can be published. This draft has the caption only.
        </p>
      )}
      <div className="mt-3 flex justify-end">
        <Link href={reviewHref(publication.approvalState)} data-testid="review-content-link" className="inline-flex items-center rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50">
          Review content
        </Link>
      </div>
    </div>
  )
}

export default SingleAIPostGenerator
