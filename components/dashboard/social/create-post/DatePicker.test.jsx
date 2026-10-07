import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import DatePicker from './DatePicker'
import ScheduleSection from './ScheduleSection'
import { todayInTimezone } from '@/lib/scheduleTime'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// UX-only guard: the date input must not offer past days. The backend
// (socialPublishingService.js parseAbsoluteScheduledAt) independently rejects
// any scheduledAt that is not in the future and remains authoritative.

let container
let root
function mount(element) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => { root.render(element) })
}
afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('schedule date picker min date', () => {
  it('DatePicker passes `min` through to the native date input', () => {
    mount(React.createElement(DatePicker, { value: '2099-01-01', min: '2026-10-01', onChange: () => {} }))
    expect(container.querySelector('input[type="date"]').getAttribute('min')).toBe('2026-10-01')
  })

  it('ScheduleSection sets min to today in the SELECTED timezone', () => {
    const schedule = { timezone: 'Asia/Kolkata', date: '2099-01-01', hour: '09', minute: '00', format: 'AM' }
    mount(React.createElement(ScheduleSection, { schedule, onChange: () => {} }))
    expect(container.querySelector('input[type="date"]').getAttribute('min')).toBe(todayInTimezone('Asia/Kolkata'))
  })
})
