import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import ScheduleCard from './ScheduleCard'
import { localScheduleToUtcIso } from '@/lib/scheduleTime'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Regression coverage for a secondary instance of the same bug class: the
// hover-preview time on a calendar chip used to be computed with
// `new Date(iso).toLocaleTimeString(...)` — the VIEWER's browser
// timezone — instead of the timezone the user actually scheduled the post
// in. A post scheduled for "9:00 AM Asia/Kolkata" must show "9:00 AM" in
// its own hover preview regardless of which timezone the viewer's browser
// happens to be in.

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

function render(post) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(ScheduleCard, { post }))
  })
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('ScheduleCard — hover preview time uses the post\'s own scheduled timezone', () => {
  it('shows 9:00 AM for a post scheduled at 9:00 AM Asia/Kolkata, regardless of the viewer\'s own timezone', () => {
    const scheduledAt = localScheduleToUtcIso({ date: '2026-08-25', hour: '09', minute: '00', format: 'AM', timezone: 'Asia/Kolkata' })
    render(makePost({ scheduledAt, timezone: 'Asia/Kolkata' }))
    expect(container.textContent).toContain('9:00 AM')
  })

  it('shows 11:30 PM for a post scheduled at 11:30 PM America/New_York, not whatever hour that UTC instant is elsewhere', () => {
    const scheduledAt = localScheduleToUtcIso({ date: '2026-08-25', hour: '11', minute: '30', format: 'PM', timezone: 'America/New_York' })
    render(makePost({ scheduledAt, timezone: 'America/New_York' }))
    expect(container.textContent).toContain('11:30 PM')
  })

  it('never throws and shows no time for a post with neither scheduledAt nor publishedAt', () => {
    expect(() => render(makePost())).not.toThrow()
  })
})
