"use client"

import { useMemo } from 'react'
import { ShieldAlert, Package, Briefcase } from 'lucide-react'
import { FORMAT_LABELS, ITEM_STATUS_LABELS, ITEM_STATUS_TONE, formatPlanDate, platformsLabel, groupByWeek } from '@/lib/socialMedia/contentCalendar'
import { Pill } from './StrategyParts'

const PLATFORM_TONE = { facebook: 'border-blue-200 bg-blue-50 text-blue-700', instagram: 'border-pink-200 bg-pink-50 text-pink-700' }

function Platforms({ platforms }) {
  return (
    <span className="flex flex-wrap gap-1" data-testid="item-platforms">
      {platforms.map((p) => <span key={p} className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PLATFORM_TONE[p] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>{p === 'facebook' ? 'Facebook' : p === 'instagram' ? 'Instagram' : p}</span>)}
    </span>
  )
}

const focusOf = (item) => item.productName || item.serviceName || null
const FocusIcon = ({ item }) => (item.productId ? <Package className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden /> : item.serviceId ? <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden /> : null)

/**
 * The compact plan: one short row per post (date, platforms, format, pillar, topic and hook, focus, CTA, status). It is
 * the overview only — every other field is in the post's planning window (CalendarItemModal) — so a month fits on a screen. On small screens each
 * row becomes a stacked card instead of a table.
 */
export function CalendarPlanTable({ items, selectedId, onSelect }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" data-testid="plan-table">
      <div role="row" className="hidden grid-cols-[110px_130px_100px_minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)_100px_90px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 xl:grid" data-testid="plan-table-head">
        <span>Date</span><span>Platform</span><span>Format</span><span>Pillar</span><span>Topic and hook</span><span>Service / product</span><span>CTA</span><span>Status</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-label={`${formatPlanDate(item.date)}: ${item.topic}. Open details`}
              aria-pressed={selectedId === item.id}
              data-testid={`plan-row-${item.id}`}
              className={`grid w-full grid-cols-1 gap-1.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-violet-50 xl:grid-cols-[110px_130px_100px_minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)_100px_90px] xl:items-center xl:gap-3 ${selectedId === item.id ? 'bg-violet-50/60' : ''}`}
            >
              <span className="text-sm font-semibold text-slate-800" data-testid="item-date">{formatPlanDate(item.date)}</span>
              <Platforms platforms={item.platforms} />
              <span className="text-sm text-slate-600" data-testid="item-format">{FORMAT_LABELS[item.format] || item.format}</span>
              <span className="truncate text-sm text-slate-600" title={item.contentPillar} data-testid="item-pillar">{item.contentPillar}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-900" title={item.topic} data-testid="item-topic">{item.topic}</span>
                {item.hook && <span className="block truncate text-xs text-slate-500" title={item.hook} data-testid="item-hook">&ldquo;{item.hook}&rdquo;</span>}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-sm text-slate-600" data-testid="item-focus">
                <FocusIcon item={item} />
                <span className="truncate">{focusOf(item) || <span className="text-slate-400">Brand</span>}</span>
              </span>
              <span className="truncate text-sm text-slate-600" title={item.primaryCta} data-testid="item-cta">{item.primaryCta}</span>
              <span className="flex flex-wrap items-center gap-1">
                <Pill tone={ITEM_STATUS_TONE[item.effectiveStatus || item.status] || 'slate'}>{ITEM_STATUS_LABELS[item.effectiveStatus || item.status] || item.status}</Pill>
                {item.requiresReview && <span title="Needs a careful review before it is approved" aria-label="Needs review"><ShieldAlert className="h-3.5 w-3.5 text-amber-500" /></span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** The same plan as weeks: seven columns, each post a small chip. Scrolls sideways on narrow screens rather than squashing. */
export function CalendarPlanGrid({ items, selectedId, onSelect }) {
  const weeks = useMemo(() => groupByWeek(items), [items])
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white" data-testid="plan-grid">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {DOW.map((d) => <span key={d} className="py-2">{d}</span>)}
        </div>
        {weeks.map((week) => (
          <div key={week.weekStart} className="grid grid-cols-7 border-b border-slate-100 last:border-0" data-testid={`plan-week-${week.weekStart}`}>
            {DOW.map((_, col) => {
              const cell = week.items.filter((it) => (new Date(`${it.date}T00:00:00Z`).getUTCDay() + 6) % 7 === col)
              return (
                <div key={col} className="min-h-[88px] border-r border-slate-100 p-1.5 last:border-r-0">
                  {cell.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.id)}
                      aria-label={`${formatPlanDate(item.date)}: ${item.topic}. Open details`}
                      aria-pressed={selectedId === item.id}
                      data-testid={`plan-chip-${item.id}`}
                      className={`mb-1 w-full rounded-lg border px-2 py-1.5 text-left transition-colors hover:border-violet-300 ${selectedId === item.id ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white'}`}
                    >
                      <span className="block text-[10px] font-semibold text-slate-400">{formatPlanDate(item.date).split(' ').slice(1).join(' ')} · {platformsLabel(item.platforms)}</span>
                      <span className="mt-0.5 line-clamp-2 block text-xs font-medium text-slate-800">{item.topic}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">{FORMAT_LABELS[item.format] || item.format}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
