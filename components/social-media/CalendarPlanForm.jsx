"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { PLATFORM_LABELS } from '@/lib/socialMedia/aiStrategy'
import {
  POSTS_PER_WEEK_OPTIONS, QUICK_RANGES, DISTRIBUTION_OPTIONS, rangeFromToday, dayCount, estimatePosts, defaultPostsPerWeek, recommendedLabel,
} from '@/lib/socialMedia/contentCalendar'

const ORDER = ['facebook', 'instagram']
const INPUT = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-60'

/**
 * The user's planning choices: posts per week, platforms, date range and how posts are shared between platforms.
 * These four things — and only these — are what the client sends; the strategy, profile and catalog the plan is built
 * from are always loaded by the server. "Posts per week" is the TOTAL number of posts, not a number per platform.
 * Only platforms that are connected AND covered by the strategy can be chosen.
 */
export function CalendarPlanForm({ strategy, connectedPlatforms, limits, pending = false, submitLabel = 'Generate calendar', onSubmit, onCancel = null, error = null }) {
  const available = useMemo(() => ORDER.filter((p) => (strategy?.platforms || []).includes(p) && connectedPlatforms?.[p]), [strategy, connectedPlatforms])
  const [postsPerWeek, setPostsPerWeek] = useState(() => defaultPostsPerWeek(strategy?.recommended))
  const [platforms, setPlatforms] = useState(() => new Set(available))
  const [range, setRange] = useState(() => rangeFromToday(30))
  const [mode, setMode] = useState('ai_optimized')

  const minDays = limits?.minDays ?? 7
  const maxDays = limits?.maxDays ?? 31
  const days = dayCount(range.startDate, range.endDate)
  const today = DateTime.local().toFormat('yyyy-LL-dd')
  const selected = ORDER.filter((p) => platforms.has(p))
  const problems = []
  if (!selected.length) problems.push('Choose at least one platform.')
  if (!days) problems.push('Choose a start date and an end date that is on or after it.')
  else if (days < minDays) problems.push(`Plan at least ${minDays} days.`)
  else if (days > maxDays) problems.push(`Plan at most ${maxDays} days.`)
  if (range.startDate && range.startDate < DateTime.local().minus({ days: 1 }).toFormat('yyyy-LL-dd')) problems.push('The calendar cannot start in the past.')

  const togglePlatform = (p) => setPlatforms((prev) => { const next = new Set(prev); if (next.has(p)) next.delete(p); else next.add(p); return next })
  const rec = recommendedLabel(strategy?.recommended)
  const posts = estimatePosts(postsPerWeek, days)

  function submit(e) {
    e.preventDefault()
    if (pending || problems.length) return
    onSubmit({ startDate: range.startDate, endDate: range.endDate, postsPerWeek, platforms: selected, distributionMode: selected.length === 1 ? 'balanced' : mode })
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" data-testid="calendar-plan-form" aria-label="Plan a content calendar">
      <h2 className="text-base font-bold text-slate-900">Plan your content calendar</h2>
      <p className="mt-0.5 text-sm text-slate-500">Choose how much to post and where. Odito plans and writes every post from your strategy: topic, hook, caption, hashtags, call to action and creative direction, with a version for each platform. Nothing is published.</p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">How many posts per week?</legend>
          <p className="mt-0.5 text-xs text-slate-500">Total posts, not per platform.{rec ? ` Your strategy recommends ${rec}.` : ''}</p>
          <div role="radiogroup" aria-label="Posts per week" className="mt-2 flex flex-wrap gap-2" data-testid="posts-per-week">
            {POSTS_PER_WEEK_OPTIONS.map((n) => (
              <label key={n} className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-violet-200 ${postsPerWeek === n ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                <input type="radio" name="posts-per-week" value={n} checked={postsPerWeek === n} onChange={() => setPostsPerWeek(n)} className="sr-only" aria-label={`${n} post${n === 1 ? '' : 's'} per week`} />
                {n}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">Which platforms?</legend>
          <p className="mt-0.5 text-xs text-slate-500">Only connected platforms can be planned.</p>
          <div className="mt-2 flex flex-col gap-2" data-testid="platforms">
            {ORDER.map((p) => {
              const inStrategy = (strategy?.platforms || []).includes(p)
              const connected = !!connectedPlatforms?.[p]
              const usable = inStrategy && connected
              return (
                <label key={p} className={`flex items-center gap-2.5 text-sm ${usable ? 'cursor-pointer text-slate-800' : 'cursor-not-allowed text-slate-400'}`}>
                  <input type="checkbox" checked={usable && platforms.has(p)} disabled={!usable} onChange={() => togglePlatform(p)} className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="font-medium">{PLATFORM_LABELS[p]}</span>
                  {!connected && <span className="text-xs">Not connected · <Link href="/app/social-media/connect-accounts" className="font-semibold text-violet-600 hover:text-violet-700">Connect</Link></span>}
                  {connected && !inStrategy && <span className="text-xs">Not in your strategy. Regenerate the strategy to include it.</span>}
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="lg:col-span-2">
          <legend className="text-sm font-semibold text-slate-800">Date range</legend>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">Start
              <input type="date" value={range.startDate} min={today} onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} className={INPUT} aria-label="Start date" />
            </label>
            <span aria-hidden className="pb-2 text-slate-400">→</span>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">End
              <input type="date" value={range.endDate} min={range.startDate || today} onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} className={INPUT} aria-label="End date" />
            </label>
            <div className="flex flex-wrap gap-2" data-testid="quick-ranges">
              {QUICK_RANGES.map((q) => (
                <button key={q.days} type="button" onClick={() => setRange(rangeFromToday(q.days))} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">{q.label}</button>
              ))}
            </div>
          </div>
        </fieldset>

        {selected.length > 1 && (
          <fieldset className="lg:col-span-2">
            <legend className="text-sm font-semibold text-slate-800">How should posts be shared between platforms?</legend>
            <div role="radiogroup" aria-label="Distribution" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" data-testid="distribution">
              {DISTRIBUTION_OPTIONS.map((o) => (
                <label key={o.value} className={`flex cursor-pointer flex-col gap-0.5 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-violet-200 ${mode === o.value ? 'border-violet-400 bg-violet-50/60' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="distribution" value={o.value} checked={mode === o.value} onChange={() => setMode(o.value)} className="sr-only" />
                  <span className="text-sm font-semibold text-slate-800">{o.label}</span>
                  <span className="text-xs text-slate-500">{o.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600" data-testid="plan-summary">
        {posts && selected.length ? <>About <strong>{posts} posts</strong> over {days} days ({postsPerWeek} per week){selected.length > 1 && mode === 'ai_optimized' ? '. A post can be planned for both platforms, so it may become more than one publication.' : '.'} The exact dates are chosen for you.</> : 'Choose your dates and platforms to see how many posts to expect.'}
      </p>

      {problems.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1" role="alert" data-testid="plan-problems">
          {problems.map((p) => <li key={p} className="text-sm text-red-600">{p}</li>)}
        </ul>
      )}
      {error && <p role="alert" data-testid="plan-start-error" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {onCancel && <button type="button" onClick={onCancel} disabled={pending} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">Cancel</button>}
        <button
          type="submit"
          disabled={pending || problems.length > 0}
          data-testid="generate-calendar-button"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
          {pending ? 'Starting…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default CalendarPlanForm
