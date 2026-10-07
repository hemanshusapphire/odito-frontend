"use client"

import { memo } from 'react'
import { ArrowUp, ArrowDown, Minus, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AnalyticsCard from './AnalyticsCard'
import AnalyticsDateRange from './AnalyticsDateRange'
import { SENTIMENT_COLORS, fmtInt, fmtPercent } from './analyticsFormat'
import {
  COMPARISON_ROWS, COMPARISON_ROW_LABELS, formatPeriod, formatDay, formatValue, formatChangeCompact, blockerText,
} from './comparisonFormat'

const ASSESSMENT_COLOR = { improved: SENTIMENT_COLORS.positive, worsened: SENTIMENT_COLORS.negative }
const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus, none: Minus }
const usable = (p) => p.status === 'available' || p.status === 'partial'

/** Percent headline + absolute change; arrow, text and a screen-reader sentence - colour is never the only signal. */
function ChangeCell({ metric }) {
  if (!metric) return <span className="text-muted-foreground">--</span>
  const c = formatChangeCompact(metric)
  const Icon = TREND_ICON[c.trend]
  const color = ASSESSMENT_COLOR[c.assessment]
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5" style={color ? { color } : undefined}>
      {c.trend !== 'none' && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span className="tabular-nums">{c.primary}</span>
      {c.secondary && <span className="text-[11px] tabular-nums opacity-70">({c.secondary})</span>}
      <span className="sr-only">{c.sr}</span>
    </span>
  )
}

function Notice({ icon: Icon, tone = 'info', children }) {
  return (
    <div role="note" className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${tone === 'warn' ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200' : 'bg-muted/40 text-muted-foreground'}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1">{children}</div>
    </div>
  )
}

/** Neither comparison has history yet: say so, say why, and never show 0% / -100%. */
function InsufficientHistory({ comparison }) {
  const { mom, yoy, rules, historyStartsOn } = comparison
  const startedBeforeHistory = historyStartsOn && (mom.previousPeriod.startDate < historyStartsOn || yoy.previousPeriod.startDate < historyStartsOn)
  return (
    <div className="min-h-48 space-y-3" data-testid="insufficient-history">
      <p className="text-base font-semibold text-[#1b2540] dark:text-foreground">Not enough historical data</p>
      <Notice icon={Info}>
        {historyStartsOn ? (
          startedBeforeHistory && <p>Historical comparison unavailable because Odito began collecting daily snapshots on {formatDay(historyStartsOn)}.</p>
        ) : (
          <p>No daily snapshot has been recorded yet.</p>
        )}
        <p className="text-[#1b2540] dark:text-foreground">{mom.message}</p>
        <p className="text-[#1b2540] dark:text-foreground">{yoy.message}</p>
        {[['Month over month', mom], ['Year over year', yoy]].map(([name, part]) => (
          <div key={name}>
            <p className="font-medium text-[#1b2540] dark:text-foreground">
              {name}: {formatPeriod(part.currentPeriod)} <span className="font-normal text-muted-foreground">vs</span> {formatPeriod(part.previousPeriod)}
            </p>
            <ul className="list-disc pl-4">
              {part.blockers.map((b) => (
                <li key={`${b.period}-${b.code}`}>
                  {blockerText(b, rules, b.period === 'current' ? formatPeriod(part.currentPeriod) : formatPeriod(part.previousPeriod), b.period === 'current' ? part.currentPeriod : part.previousPeriod)}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p>Missing days are treated as unknown, never as zero.</p>
      </Notice>
    </div>
  )
}

const TH = 'px-3 py-3 text-center text-[14px] font-semibold text-[#1b2540] dark:text-foreground'

/**
 * "Comparison": MoM and YoY side by side in the reference's pill-row table. Each
 * period is represented by its END-OF-PERIOD snapshot (reviews known at that date),
 * so growth is one state minus another - never a sum - and everything comes from
 * the historical snapshots, never from live reviews. A column whose history is
 * missing shows "--" with the reason beneath; if neither has history the whole
 * table gives way to the explanation.
 */
function PeriodComparison({ comparison, onRetry }) {
  if (!comparison) {
    return (
      <AnalyticsCard title="Comparison" actions={<AnalyticsDateRange />}>
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
          Unable to load the period comparison.
          {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>}
        </div>
      </AnalyticsCard>
    )
  }

  const { mom, yoy } = comparison
  const anyUsable = usable(mom) || usable(yoy)
  const base = usable(mom) ? mom : yoy
  const partials = [['Month over month', mom], ['Year over year', yoy]].filter(([, p]) => p.status === 'partial')
  const rulesChanged = [mom, yoy].some((p) => usable(p) && !p.rules.compatible)
  const cell = (part, key) => (usable(part) ? part.metrics[key] : null)

  return (
    <AnalyticsCard title="Comparison" actions={<AnalyticsDateRange />}>
      {!anyUsable ? (
        <InsufficientHistory comparison={comparison} />
      ) : (
        <div className="space-y-3">
          {partials.map(([name, part]) => (
            <Notice key={name} icon={AlertTriangle} tone="warn">
              <p>
                {name} - partial history: {fmtInt(part.currentPeriod.coverage.snapshotDays)} of {fmtInt(part.currentPeriod.coverage.expectedDays)} daily snapshots
                ({fmtPercent(part.currentPeriod.coverage.percent)}) in the current period and {fmtInt(part.previousPeriod.coverage.snapshotDays)} of {fmtInt(part.previousPeriod.coverage.expectedDays)} ({fmtPercent(part.previousPeriod.coverage.percent)}) in the previous one.
                Missing days are unknown, not zero.
              </p>
            </Notice>
          ))}
          {rulesChanged && (
            <Notice icon={AlertTriangle} tone="warn">
              <p>The way some metrics are counted changed between these snapshots, so those metrics are marked “Not comparable”.</p>
            </Notice>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-separate border-spacing-y-2.5 text-[14px]">
              <caption className="sr-only">Month-over-month and year-over-year comparison: {formatPeriod(base.currentPeriod)}</caption>
              <thead>
                <tr className="[&>th]:border-b [&>th]:border-[#dbe5f4] dark:[&>th]:border-border">
                  <th scope="col" className={`${TH} !text-left`}>Key Metrics</th>
                  <th scope="col" className={TH}>
                    {formatPeriod(base.currentPeriod)}
                    <span className="block text-[11px] font-normal text-muted-foreground">Current · as of {formatDay(base.currentPeriod.asOfDate)}</span>
                  </th>
                  <th scope="col" className={TH}>
                    {formatPeriod(mom.previousPeriod)}
                    <span className="block text-[11px] font-normal text-muted-foreground">Month earlier</span>
                  </th>
                  <th scope="col" className={TH}>MoM % Change</th>
                  <th scope="col" className={TH}>
                    {formatPeriod(yoy.previousPeriod)}
                    <span className="block text-[11px] font-normal text-muted-foreground">Year earlier</span>
                  </th>
                  <th scope="col" className={TH}>YoY % Change</th>
                </tr>
              </thead>
              <tbody className="[&_td]:bg-[#f4f6fb] dark:[&_td]:bg-muted/40 [&_th[scope=row]]:bg-[#f4f6fb] dark:[&_th[scope=row]]:bg-muted/40 [&>tr>:first-child]:rounded-l-xl [&>tr>:last-child]:rounded-r-xl">
                {COMPARISON_ROWS.map((key) => {
                  const m = cell(base, key)
                  const label = COMPARISON_ROW_LABELS[key]
                  if (!m) return null
                  const mm = cell(mom, key)
                  const ym = cell(yoy, key)
                  return (
                    <tr key={key}>
                      <th scope="row" className="px-3 py-3 sm:py-[18px] text-left text-[14px] font-normal text-[#1b2540] dark:text-foreground">{label}</th>
                      <td className="px-3 py-3 sm:py-[18px] text-center tabular-nums">{formatValue(m, m.current)}</td>
                      <td className="px-3 py-3 sm:py-[18px] text-center tabular-nums">{mm ? formatValue(mm, mm.previous) : '--'}</td>
                      <td className="px-3 py-3 sm:py-[18px] text-center"><ChangeCell metric={mm} /></td>
                      <td className="px-3 py-3 sm:py-[18px] text-center tabular-nums">{ym ? formatValue(ym, ym.previous) : '--'}</td>
                      <td className="px-3 py-3 sm:py-[18px] text-center"><ChangeCell metric={ym} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {[['MoM', mom], ['YoY', yoy]].filter(([, p]) => !usable(p)).map(([name, part]) => (
            <p key={name} className="text-xs text-muted-foreground">
              {name}: {part.message}
            </p>
          ))}
          {!mom.equalLength && usable(mom) && (
            <p className="text-xs text-muted-foreground">MoM periods differ in length ({mom.currentPeriod.lengthDays} vs {mom.previousPeriod.lengthDays} days) because the calendar months differ.</p>
          )}
        </div>
      )}
    </AnalyticsCard>
  )
}

export default memo(PeriodComparison)
