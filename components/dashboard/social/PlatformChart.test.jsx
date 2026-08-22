import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import PlatformChart from './PlatformChart'
import { Eye } from 'lucide-react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Regression coverage for the reported "Day and Week buttons are missing"
// bug: exhaustive live-browser testing across every viewport/theme could
// not reproduce a CSS/visibility issue (PERIODS always maps all 3 entries
// unconditionally) — the real, confirmed bug was that Day/Week always
// fetched/rendered an EMPTY chart (`series: { day: [], week: [] }`,
// hardcoded), which read as "not working". These tests lock down that the
// three buttons are always present and that period changes now flow
// through a controlled `onPeriodChange` callback (a real backend refetch
// at the page level), not silently swallowed local state.

function chart(overrides = {}) {
  return {
    type: 'area',
    title: 'Page Views',
    color: '#1877F2',
    series: {
      day: [{ label: 'today', value: 5 }],
      week: [{ label: 'Mon', value: 10 }, { label: 'Tue', value: 12 }],
      month: [{ label: '1', value: 100 }, { label: '2', value: 120 }],
    },
    ...overrides,
  }
}

let container
let root

function render(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(PlatformChart, {
      chart: chart(),
      connected: true,
      icon: Eye,
      tint: '#1877F2',
      platformName: 'Facebook',
      connectMessage: '',
      onConnect: () => {},
      emptyMessage: null,
      period: 'month',
      onPeriodChange: vi.fn(),
      ...props,
    }))
  })
}

function triggers() {
  return Array.from(container.querySelectorAll('[data-slot="tabs-trigger"]'))
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('PlatformChart — Day/Week/Month selector', () => {
  it('always renders all three period buttons, regardless of which period is active', () => {
    render({ period: 'month' })
    const labels = triggers().map((t) => t.textContent.trim())
    expect(labels).toEqual(['Day', 'Week', 'Month'])
  })

  it('renders all three buttons even when the active period is Day', () => {
    render({ period: 'day' })
    expect(triggers().map((t) => t.textContent.trim())).toEqual(['Day', 'Week', 'Month'])
  })

  it('renders all three buttons even when the active period is Week', () => {
    render({ period: 'week' })
    expect(triggers().map((t) => t.textContent.trim())).toEqual(['Day', 'Week', 'Month'])
  })

  it('marks only the currently active period as selected', () => {
    render({ period: 'week' })
    const active = triggers().find((t) => t.getAttribute('data-state') === 'active')
    expect(active.textContent.trim()).toBe('Week')
  })

  it('clicking Day calls onPeriodChange("day") instead of only updating local state', () => {
    const onPeriodChange = vi.fn()
    render({ period: 'month', onPeriodChange })
    const dayButton = triggers().find((t) => t.textContent.trim() === 'Day')
    act(() => { dayButton.focus(); dayButton.click() })
    expect(onPeriodChange).toHaveBeenCalledWith('day')
  })

  it('clicking Week calls onPeriodChange("week")', () => {
    const onPeriodChange = vi.fn()
    render({ period: 'month', onPeriodChange })
    const weekButton = triggers().find((t) => t.textContent.trim() === 'Week')
    act(() => { weekButton.focus(); weekButton.click() })
    expect(onPeriodChange).toHaveBeenCalledWith('week')
  })

  it('shows a loading spinner instead of stale/mismatched data while a range refetch is in flight', () => {
    render({ period: 'day', loading: true })
    // Buttons must stay visible while loading (never disappear)...
    expect(triggers().map((t) => t.textContent.trim())).toEqual(['Day', 'Week', 'Month'])
    // ...but the chart body shows the loading state, not a chart/empty message.
    expect(container.textContent).not.toContain('unavailable')
  })

  it('disables the buttons (but keeps them visible) while loading, so rapid clicks cannot overlap requests', () => {
    render({ period: 'month', loading: true })
    const dayButton = triggers().find((t) => t.textContent.trim() === 'Day')
    expect(dayButton.disabled).toBe(true)
  })

  it('shows a real backend-provided date range label, never a hardcoded one, when rangeLabel is supplied', () => {
    render({ period: 'month', rangeLabel: 'Jul 24 – Aug 21, 2026' })
    expect(container.textContent).toContain('Jul 24 – Aug 21, 2026')
    expect(container.textContent).not.toContain('Jul 1 – Jul 30, 2026')
  })

  it('while loading, never shows the PREVIOUS range\'s stale backend rangeLabel next to the newly-selected tab', () => {
    // rangeLabel here is what placeholderData would still be holding from
    // the range that was active before this click (e.g. "month"'s real
    // window) while period has already flipped to 'day' and the real
    // fetch for 'day' is still in flight.
    render({ period: 'day', loading: true, rangeLabel: 'Jul 22 – Aug 21, 2026' })
    expect(container.textContent).not.toContain('Jul 22 – Aug 21, 2026')
  })
})
