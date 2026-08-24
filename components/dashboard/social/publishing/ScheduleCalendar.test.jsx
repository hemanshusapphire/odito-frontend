import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import ScheduleCalendar from './ScheduleCalendar'
import { localScheduleToUtcIso } from '@/lib/scheduleTime'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Root-cause regression coverage for the Publishing calendar bug: a post
// scheduled for e.g. 2026-08-25 09:00 Asia/Kolkata could render under the
// calendar cell labelled "26" instead of "25". Cause: the grid cells are
// built and labelled (CalendarDay.jsx's date.getDate()) using LOCAL Date
// arithmetic, but posts used to be bucketed via
// `new Date(scheduledAt).toISOString().slice(0, 10)` — the UTC calendar
// day. For any viewer whose browser timezone has a non-zero UTC offset,
// those two days can disagree by one, landing the post one cell away from
// where its own day-of-month label says it belongs.
//
// These tests don't assume anything about which real timezone the test
// runner itself is in — the system's own resolved zone stands in for "the
// viewer's browser timezone" throughout, so the assertions hold
// identically whether CI happens to run in UTC, America/Los_Angeles, or
// anywhere else. What's fixed is the SAME thing regardless: the day-of-
// month grid label must match the day the post's own `scheduledAt` +
// `timezone` actually bucket it under.

const SYSTEM_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

function makePost(overrides = {}) {
  return {
    id: 'post-1',
    platform: 'facebook',
    content: 'Grow your brand',
    status: 'scheduled',
    scheduledAt: null,
    timezone: null,
    publishedAt: null,
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
    root.render(React.createElement(ScheduleCalendar, {
      posts: [],
      isLoading: false,
      onCompose: vi.fn(),
      ...props,
    }))
  })
}

function dayCellLabelled(dayOfMonth) {
  // CalendarDay.jsx renders the day-of-month as its own text node inside
  // the cell; find the cell whose number label matches and that also
  // contains our post's chip text, to avoid colliding with numbers that
  // appear elsewhere (e.g. a "+N more" overflow label).
  const spans = Array.from(container.querySelectorAll('span'))
  const label = spans.find((s) => s.textContent.trim() === String(dayOfMonth) && s.className.includes('font-semibold'))
  return label ? label.closest('div.group') : null
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('ScheduleCalendar — a post lands on the calendar day its own label says it belongs on', () => {
  it('a post scheduled for "today" (system zone) at 9:00 AM renders under the cell labelled with today\'s day-of-month, not a neighboring day', () => {
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const scheduledAt = localScheduleToUtcIso({ date: iso, hour: '09', minute: '00', format: 'AM', timezone: SYSTEM_ZONE })

    render({ posts: [makePost({ scheduledAt, timezone: SYSTEM_ZONE })] })

    const todayCell = dayCellLabelled(now.getDate())
    expect(todayCell).toBeTruthy()
    expect(todayCell.textContent).toContain('Grow your brand')
  })

  it('a post scheduled for 00:30 (just after midnight, system zone) still renders on that same calendar day, even though its UTC instant can belong to the previous day', () => {
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const scheduledAt = localScheduleToUtcIso({ date: iso, hour: '12', minute: '30', format: 'AM', timezone: SYSTEM_ZONE })

    render({ posts: [makePost({ scheduledAt, timezone: SYSTEM_ZONE })] })

    const todayCell = dayCellLabelled(now.getDate())
    expect(todayCell).toBeTruthy()
    expect(todayCell.textContent).toContain('Grow your brand')
  })

  it('two posts scheduled for the same local day in two different timezones both land on that same day-of-month cell, not different ones', () => {
    const now = new Date()
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const kolkataAt = localScheduleToUtcIso({ date: iso, hour: '09', minute: '00', format: 'AM', timezone: 'Asia/Kolkata' })
    const londonAt = localScheduleToUtcIso({ date: iso, hour: '09', minute: '00', format: 'AM', timezone: 'Europe/London' })

    render({
      posts: [
        makePost({ id: 'kolkata-post', content: 'Kolkata post', scheduledAt: kolkataAt, timezone: 'Asia/Kolkata' }),
        makePost({ id: 'london-post', content: 'London post', scheduledAt: londonAt, timezone: 'Europe/London' }),
      ],
    })

    const cell = dayCellLabelled(now.getDate())
    expect(cell).toBeTruthy()
    expect(cell.textContent).toContain('Kolkata post')
    expect(cell.textContent).toContain('London post')
  })

  it('does not crash and renders no post chip for a draft with no scheduledAt/publishedAt', () => {
    expect(() => render({ posts: [makePost({ scheduledAt: null, publishedAt: null })] })).not.toThrow()
    expect(container.textContent).not.toContain('Grow your brand')
  })
})
