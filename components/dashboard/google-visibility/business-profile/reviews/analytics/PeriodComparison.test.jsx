import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

import PeriodComparison from './PeriodComparison'
import { formatPeriod, formatChange, formatChangeCompact, formatValue, COMPARISON_ROWS } from './comparisonFormat'
import {
  comparison, comparisonMetrics, countMetric, period, availablePart, insufficientPart, insufficientComparison,
} from './analyticsFixtures'

const rowOf = (label) => screen.getByRole('rowheader', { name: label }).closest('tr')
const cells = (label) => within(rowOf(label)).getAllByRole('cell')
const partial = (cur, prev, over = {}) => availablePart(cur, prev, { status: 'partial', coverage: { current: 85.71, previous: 100 }, ...over })

describe('Comparison table (reference layout)', () => {
  it('shows the reference columns: Key Metrics | current | month earlier | MoM % Change | year earlier | YoY % Change', () => {
    render(<PeriodComparison comparison={comparison()} />)
    const heads = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(heads[0]).toBe('Key Metrics')
    expect(heads[1]).toMatch(/October 1–7, 2026.*Current · as of October 7, 2026/)
    expect(heads[2]).toMatch(/September 1–7, 2026.*Month earlier/)
    expect(heads[3]).toBe('MoM % Change')
    expect(heads[4]).toMatch(/October 1–7, 2025.*Year earlier/)
    expect(heads[5]).toBe('YoY % Change')
  })

  it('rows follow the reference order (Total, 1-5 Star, With/Without Text, Responded, Non-Responded), then the extra metrics', () => {
    render(<PeriodComparison comparison={comparison()} />)
    const rows = screen.getAllByRole('rowheader').map((r) => r.textContent)
    expect(rows).toEqual(['Total Reviews', '1 Star', '2 Star', '3 Star', '4 Star', '5 Star', 'With Text', 'Without Text', 'Responded', 'Non-Responded', 'Average Rating', 'Response Rate', 'Positive', 'Neutral', 'Negative'])
    expect(COMPARISON_ROWS).toHaveLength(15)
  })

  it('real values: current, previous, percent change headline and the absolute change beside it', () => {
    render(<PeriodComparison comparison={comparison()} />)
    const [cur, momPrev, momChange, yoyPrev, yoyChange] = cells('Total Reviews')
    expect(cur).toHaveTextContent('1,053')
    expect(momPrev).toHaveTextContent('1,020')
    expect(momChange).toHaveTextContent('+3.24 %')
    expect(momChange).toHaveTextContent('(+33)')
    expect(yoyPrev).toHaveTextContent('700')
    expect(yoyChange).toHaveTextContent('+50.43 %')
    expect(yoyChange).toHaveTextContent('(+353)')
  })

  it('percentage POINTS for the response rate ("pp"), never a percentage-of-a-percentage', () => {
    render(<PeriodComparison comparison={comparison()} />)
    const [cur, , momChange] = cells('Response Rate')
    expect(cur).toHaveTextContent('99.62%')
    expect(momChange).toHaveTextContent('+0.92 pp')
    expect(momChange).not.toHaveTextContent('%)')
    expect(within(rowOf('Response Rate')).queryByText('+0.93 %')).not.toBeInTheDocument()
  })

  it('average rating shows both the relative and the absolute (★) change', () => {
    render(<PeriodComparison comparison={comparison()} />)
    const [, , momChange] = cells('Average Rating')
    expect(momChange).toHaveTextContent('+1.04 %')
    expect(momChange).toHaveTextContent('(+0.05 ★)')
  })

  it('indicators: good/bad is by meaning, not by sign - and every cell has an arrow + a screen-reader sentence', () => {
    render(<PeriodComparison comparison={comparison()} />)
    // fewer unanswered reviews is a DEcrease that is GOOD
    expect(within(rowOf('Non-Responded')).getAllByText(/Not Responded decreased by 16.*improvement/).length).toBeGreaterThan(0)
    expect(within(rowOf('Negative')).getAllByText(/Negative decreased by 3.*improvement/).length).toBeGreaterThan(0)
    expect(within(rowOf('Without Text')).getAllByText(/increased by 3.*neutral change/).length).toBeGreaterThan(0)
    expect(within(rowOf('Neutral')).getAllByText(/did not change, no change/).length).toBeGreaterThan(0)
  })

  it('a worsening is flagged as worse even though the number went UP', () => {
    const m = comparisonMetrics({
      notResponded: countMetric('notResponded', 'Not Responded', 30, 20, 'down'),
      negative: countMetric('negative', 'Negative', 40, 24, 'down'),
    })
    render(<PeriodComparison comparison={comparison({ mom: availablePart(period('2026-10-01', '2026-10-07'), period('2026-09-01', '2026-09-07'), { metrics: m }) })} />)
    expect(within(rowOf('Non-Responded')).getAllByText(/increased by 10.*worse/).length).toBeGreaterThan(0)
    expect(within(rowOf('Negative')).getAllByText(/increased by 16.*worse/).length).toBeGreaterThan(0)
  })

  it('a previous value of zero shows "New" - never Infinity / NaN', () => {
    const m = comparisonMetrics({ negative: countMetric('negative', 'Negative', 5, 0, 'down') })
    const { container } = render(<PeriodComparison comparison={comparison({ mom: availablePart(period('2026-10-01', '2026-10-07'), period('2026-09-01', '2026-09-07'), { metrics: m }) })} />)
    const [, , momChange] = cells('Negative')
    expect(momChange).toHaveTextContent('New')
    expect(momChange).toHaveTextContent('(+5)')
    expect(container.textContent).not.toMatch(/Infinity|NaN/)
  })

  it('YoY unavailable but MoM available: the YoY columns show "--" with the reason beneath (no fake numbers)', () => {
    const cur = period('2026-10-01', '2026-10-07')
    render(<PeriodComparison comparison={comparison({
      status: 'available',
      yoy: insufficientPart('yoy', cur, period('2025-10-01', '2025-10-07', { quality: 'none' }), [{ period: 'previous', code: 'no_snapshots' }]),
    })} />)
    const [, momPrev, momChange, yoyPrev, yoyChange] = cells('Total Reviews')
    expect(momPrev).toHaveTextContent('1,020')
    expect(momChange).toHaveTextContent('+3.24 %')
    expect(yoyPrev).toHaveTextContent('--')
    expect(yoyChange).toHaveTextContent('--')
    expect(screen.getByText(/YoY: YoY comparison requires historical snapshots from the comparison period\./)).toBeInTheDocument()
  })

  it('MoM unavailable but YoY available: symmetrical', () => {
    const cur = period('2026-10-01', '2026-10-07')
    render(<PeriodComparison comparison={comparison({
      mom: insufficientPart('mom', cur, period('2026-09-01', '2026-09-07', { quality: 'none' }), [{ period: 'previous', code: 'no_snapshots' }]),
    })} />)
    const [cur1, momPrev, momChange, yoyPrev, yoyChange] = cells('Total Reviews')
    expect(cur1).toHaveTextContent('1,053')
    expect(momPrev).toHaveTextContent('--')
    expect(momChange).toHaveTextContent('--')
    expect(yoyPrev).toHaveTextContent('700')
    expect(yoyChange).toHaveTextContent('+50.43 %')
  })

  it('insufficient history in BOTH: explanation, reasons, history start - no table and no fake 0% / -100%', () => {
    const { container } = render(<PeriodComparison comparison={insufficientComparison()} />)
    expect(screen.getByText('Not enough historical data')).toBeInTheDocument()
    expect(screen.getByText(/Historical comparison unavailable because Odito began collecting daily snapshots on October 7, 2026\./)).toBeInTheDocument()
    expect(screen.getByText('MoM comparison will be available once both the current and previous comparison periods have snapshot coverage.')).toBeInTheDocument()
    expect(screen.getByText('YoY comparison requires historical snapshots from the comparison period.')).toBeInTheDocument()
    expect(screen.getAllByText(/No daily snapshots were recorded in the previous period \(September 1–7, 2026\)|\(October 1–7, 2025\)/).length).toBe(2)
    expect(screen.getAllByText(/has 1 of 7 daily snapshots; at least 50% is needed/).length).toBe(2)
    expect(screen.getByText(/Missing days are treated as unknown, never as zero/)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(container.textContent).not.toMatch(/-100|\b0 %|Infinity|NaN|No Change/)
  })

  it('no snapshot has ever been recorded', () => {
    const c = insufficientComparison()
    c.historyStartsOn = null
    render(<PeriodComparison comparison={c} />)
    expect(screen.getByText('No daily snapshot has been recorded yet.')).toBeInTheDocument()
  })

  it('a stale end snapshot is explained', () => {
    const cur = period('2026-10-01', '2026-10-07')
    const prev = period('2026-09-01', '2026-09-07', { quality: 'insufficient', coverage: { ...period('a', 'b').coverage, endGapDays: 5 } })
    const c = insufficientComparison()
    c.mom = insufficientPart('mom', cur, prev, [{ period: 'previous', code: 'stale_end_snapshot' }])
    render(<PeriodComparison comparison={c} />)
    expect(screen.getByText(/is 5 days before the period ends/)).toBeInTheDocument()
  })

  it('partial coverage: warns with the exact counts and says missing days are unknown, not zero (numbers still shown)', () => {
    const cur = period('2026-10-01', '2026-10-07', { quality: 'partial', coverage: { ...period('a', 'b').coverage, snapshotDays: 6, percent: 85.71, missingDays: 1 } })
    render(<PeriodComparison comparison={comparison({ mom: partial(cur, period('2026-09-01', '2026-09-07')) })} />)
    const note = screen.getByText(/Month over month - partial history/).closest('[role="note"]')
    expect(note).toHaveTextContent('6 of 7 daily snapshots (85.7%)')
    expect(note).toHaveTextContent('7 of 7 (100.0%)')
    expect(note).toHaveTextContent('Missing days are unknown, not zero')
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('metrics whose definition changed between snapshots are "Not comparable", the rest still compare', () => {
    const m = comparisonMetrics({ positive: { key: 'positive', label: 'Positive', kind: 'count', current: 1026, previous: 990, status: 'incomparable', reason: 'metric_rules_changed' } })
    render(<PeriodComparison comparison={comparison({ mom: availablePart(period('2026-10-01', '2026-10-07'), period('2026-09-01', '2026-09-07'), { metrics: m, rules: { currentVersion: 2, previousVersion: 1, compatible: false, affectedMetrics: ['positive'] } }) })} />)
    expect(cells('Positive')[2]).toHaveTextContent('Not comparable')
    expect(within(rowOf('Positive')).getByText(/not comparable because the metric definition changed/)).toBeInTheDocument()
    expect(cells('Total Reviews')[2]).toHaveTextContent('+3.24 %')
    expect(screen.getByText(/The way some metrics are counted changed/)).toBeInTheDocument()
  })

  it('periods of different length are labelled, never silently compared', () => {
    const cur = period('2026-10-01', '2026-10-31', { kind: 'calendar_month', lengthDays: 31 })
    const prev = period('2026-09-01', '2026-09-30', { kind: 'calendar_month', lengthDays: 30 })
    render(<PeriodComparison comparison={comparison({ mom: availablePart(cur, prev) })} />)
    expect(screen.getAllByRole('columnheader')[1]).toHaveTextContent('October 2026')
    expect(screen.getAllByRole('columnheader')[2]).toHaveTextContent('September 2026')
    expect(screen.getByText(/MoM periods differ in length \(31 vs 30 days\)/)).toBeInTheDocument()
  })

  it('error: the comparison could not be loaded -> message and Retry', () => {
    const onRetry = vi.fn()
    render(<PeriodComparison comparison={null} onRetry={onRetry} />)
    expect(screen.getByText('Unable to load the period comparison.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('titled "Comparison", not "Growth"', () => {
    render(<PeriodComparison comparison={comparison()} />)
    expect(screen.getByRole('heading', { name: 'Comparison' })).toBeInTheDocument()
    expect(screen.queryByText(/Growth/)).not.toBeInTheDocument()
  })
})

describe('comparison formatting', () => {
  it('exact period labels', () => {
    expect(formatPeriod(period('2026-10-01', '2026-10-07'))).toBe('October 1–7, 2026')
    expect(formatPeriod(period('2026-10-01', '2026-10-31', { kind: 'calendar_month' }))).toBe('October 2026')
    expect(formatPeriod(period('2025-01-01', '2025-12-31', { kind: 'calendar_year' }))).toBe('2025')
    expect(formatPeriod(period('2026-09-08', '2026-10-07'))).toBe('Sep 8 – Oct 7, 2026')
    expect(formatPeriod(period('2025-10-08', '2026-10-07'))).toBe('Oct 8, 2025 – Oct 7, 2026')
  })
  it('values per kind', () => {
    expect(formatValue({ kind: 'rate' }, 99.62)).toBe('99.62%')
    expect(formatValue({ kind: 'rating' }, 4.8)).toBe('4.80')
    expect(formatValue({ kind: 'count' }, 1053)).toBe('1,053')
    expect(formatValue({ kind: 'count' }, null)).toBe('—')
  })
  it('compact change: percent headline, "pp" for rates, no trailing zeros, dashes for unknown', () => {
    const decrease = formatChangeCompact(countMetric('totalReviews', 'Total Reviews', 609, 728, 'up'))
    expect(decrease.primary).toBe('-16.35 %')
    expect(decrease.secondary).toBe('-119')
    expect(formatChangeCompact(countMetric('x', 'X', 23, 20, 'up')).primary).toBe('+15 %')
    expect(formatChangeCompact(countMetric('x', 'X', 9, 2, 'up')).primary).toBe('+350 %')
    expect(formatChangeCompact({ key: 'responseRate', label: 'Response Rate', kind: 'rate', status: 'ok', percentagePointChange: -1.42, trend: 'down', assessment: 'worsened' }).primary).toBe('-1.42 pp')
    expect(formatChangeCompact({ key: 'a', label: 'A', kind: 'rating', status: 'unknown' }).primary).toBe('--')
    expect(formatChange({ key: 'a', label: 'A', kind: 'rating', status: 'unknown' }).text).toBe('—')
  })
})
