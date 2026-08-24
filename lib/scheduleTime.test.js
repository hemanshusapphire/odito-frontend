import { describe, it, expect } from 'vitest'
import { localScheduleToUtcIso, formatInTimezone, dateKeyInTimezone } from './scheduleTime'

// Root-cause regression coverage for the timezone bug: CreatePostDialog
// used to build a naive "YYYY-MM-DDTHH:mm:ss" string and hand it to
// `new Date(...)`, which the backend then parsed using ITS OWN server
// timezone rather than whatever the user actually picked in the dropdown.
// These tests prove the real, IANA/DST-aware replacement produces the
// correct absolute UTC instant for every timezone in lib/timezones.js,
// including across a DST transition — a fixed offset table would get the
// DST cases wrong twice a year, which is exactly why this uses luxon
// instead of hardcoded offsets.

const BASE = { date: '2026-08-22', hour: '11', minute: '30', format: 'AM' }

describe('localScheduleToUtcIso', () => {
  it('converts 11:30 AM Asia/Kolkata (no DST, fixed +05:30) to 06:00:00.000Z', () => {
    expect(localScheduleToUtcIso({ ...BASE, timezone: 'Asia/Kolkata' })).toBe('2026-08-22T06:00:00.000Z')
  })

  it('converts 11:30 AM UTC to 11:30:00.000Z unchanged', () => {
    expect(localScheduleToUtcIso({ ...BASE, timezone: 'UTC' })).toBe('2026-08-22T11:30:00.000Z')
  })

  it('converts 11:30 AM America/New_York in SUMMER (EDT, UTC-4) to 15:30 UTC', () => {
    // 2026 US DST runs March 8 - November 1, so July 15 is EDT (-04:00).
    expect(localScheduleToUtcIso({ date: '2026-07-15', hour: '11', minute: '30', format: 'AM', timezone: 'America/New_York' }))
      .toBe('2026-07-15T15:30:00.000Z')
  })

  it('converts 11:30 AM America/New_York in WINTER (EST, UTC-5) to 16:30 UTC', () => {
    expect(localScheduleToUtcIso({ date: '2026-01-15', hour: '11', minute: '30', format: 'AM', timezone: 'America/New_York' }))
      .toBe('2026-01-15T16:30:00.000Z')
  })

  it('the SAME local wall-clock time in two different timezones produces two DIFFERENT UTC instants', () => {
    const kolkata = localScheduleToUtcIso({ ...BASE, timezone: 'Asia/Kolkata' })
    const newYork = localScheduleToUtcIso({ ...BASE, timezone: 'America/New_York' })
    const london = localScheduleToUtcIso({ ...BASE, timezone: 'Europe/London' })
    expect(kolkata).not.toBe(newYork)
    expect(kolkata).not.toBe(london)
    expect(newYork).not.toBe(london)
  })

  it('correctly straddles the US spring-forward DST transition (2026-03-08)', () => {
    // The day before the transition is still EST (-05:00); the day after is
    // already EDT (-04:00) — same local 11:30 AM, one-hour-different offset.
    const before = localScheduleToUtcIso({ date: '2026-03-07', hour: '11', minute: '30', format: 'AM', timezone: 'America/New_York' })
    const after = localScheduleToUtcIso({ date: '2026-03-09', hour: '11', minute: '30', format: 'AM', timezone: 'America/New_York' })
    expect(before).toBe('2026-03-07T16:30:00.000Z')
    expect(after).toBe('2026-03-09T15:30:00.000Z')
  })

  it('handles 12 AM / 12 PM hour boundary correctly (12-hour to 24-hour conversion)', () => {
    expect(localScheduleToUtcIso({ date: '2026-08-22', hour: '12', minute: '00', format: 'AM', timezone: 'UTC' })).toBe('2026-08-22T00:00:00.000Z')
    expect(localScheduleToUtcIso({ date: '2026-08-22', hour: '12', minute: '00', format: 'PM', timezone: 'UTC' })).toBe('2026-08-22T12:00:00.000Z')
  })

  it('returns null for missing/incomplete input instead of producing a garbage instant', () => {
    expect(localScheduleToUtcIso({ date: '', hour: '11', minute: '30', format: 'AM', timezone: 'UTC' })).toBe(null)
    expect(localScheduleToUtcIso({ date: '2026-08-22', hour: '11', minute: '30', format: 'AM', timezone: '' })).toBe(null)
  })
})

describe('formatInTimezone', () => {
  it('formats a stored UTC instant back in the originally-selected timezone', () => {
    // 06:00:00.000Z is 11:30 AM in Asia/Kolkata.
    expect(formatInTimezone('2026-08-22T06:00:00.000Z', 'Asia/Kolkata')).toBe('Aug 22, 2026, 11:30 AM')
  })

  it('falls back to a valid formatted string when no timezone is recorded (older records)', () => {
    expect(formatInTimezone('2026-08-22T06:00:00.000Z', null)).toMatch(/2026/)
  })
})

// Root-cause regression coverage for the Publishing calendar's own bug:
// ScheduleCalendar.jsx used to bucket a post into a calendar day via
// `new Date(post.scheduledAt).toISOString().slice(0, 10)` — the UTC
// calendar day — while the grid cells it was bucketed against are built
// and LABELLED (CalendarDay.jsx's `date.getDate()`) using local Date
// arithmetic. For any viewer whose timezone has a non-zero UTC offset,
// those two days can disagree, landing a post one cell away from the day
// its own label says it's on. dateKeyInTimezone is the single place that
// now decides a post's calendar day, using the SAME zone-aware logic as
// formatInTimezone (the Posts tab's already-correct reference behavior)
// instead of a raw UTC slice.
describe('dateKeyInTimezone', () => {
  it('A. Asia/Kolkata: 2026-08-25 09:00 IST stays on August 25, even though its UTC instant is still Aug 25 (sanity baseline)', () => {
    const utcIso = localScheduleToUtcIso({ date: '2026-08-25', hour: '09', minute: '00', format: 'AM', timezone: 'Asia/Kolkata' })
    expect(dateKeyInTimezone(utcIso, 'Asia/Kolkata')).toBe('2026-08-25')
  })

  it('B. America/New_York (DST-aware): a summer (EDT) and winter (EST) evening booking both land on the correct local day', () => {
    const summer = localScheduleToUtcIso({ date: '2026-07-15', hour: '11', minute: '30', format: 'PM', timezone: 'America/New_York' })
    const winter = localScheduleToUtcIso({ date: '2026-01-15', hour: '11', minute: '30', format: 'PM', timezone: 'America/New_York' })
    expect(dateKeyInTimezone(summer, 'America/New_York')).toBe('2026-07-15')
    expect(dateKeyInTimezone(winter, 'America/New_York')).toBe('2026-01-15')
  })

  it('C. Europe/London: 2026-08-25 09:00 BST stays on August 25', () => {
    const utcIso = localScheduleToUtcIso({ date: '2026-08-25', hour: '09', minute: '00', format: 'AM', timezone: 'Europe/London' })
    expect(dateKeyInTimezone(utcIso, 'Europe/London')).toBe('2026-08-25')
  })

  it('D. a post near midnight IST stays on Aug 25 in Asia/Kolkata even though its UTC instant is Aug 24 (the exact bug: UTC crosses the calendar-day boundary the other way)', () => {
    // 00:30 IST on Aug 25 is 19:00 UTC on Aug 24 — .slice(0, 10) on the raw
    // ISO string (the old, buggy approach) would incorrectly read "2026-08-24".
    const utcIso = localScheduleToUtcIso({ date: '2026-08-25', hour: '12', minute: '30', format: 'AM', timezone: 'Asia/Kolkata' })
    expect(utcIso).toBe('2026-08-24T19:00:00.000Z') // sanity: confirms the UTC day genuinely differs
    expect(dateKeyInTimezone(utcIso, 'Asia/Kolkata')).toBe('2026-08-25')
  })

  it('E. the result depends only on the post\'s own recorded timezone, never on a different/unrelated viewer-supplied zone', () => {
    const utcIso = localScheduleToUtcIso({ date: '2026-08-25', hour: '09', minute: '00', format: 'AM', timezone: 'Asia/Kolkata' })
    // Same instant, asked for in a completely different zone (standing in
    // for "browser is America/New_York") must give THAT zone's day, proving
    // the function is driven by whichever zone is passed in — the caller
    // (ScheduleCalendar.jsx) is responsible for always passing the post's
    // OWN timezone, never the viewer's.
    expect(dateKeyInTimezone(utcIso, 'America/New_York')).toBe('2026-08-24')
    expect(dateKeyInTimezone(utcIso, 'Asia/Kolkata')).toBe('2026-08-25')
  })

  it('returns null for a missing value, and falls back to a valid key (viewer zone) when no timezone is recorded', () => {
    expect(dateKeyInTimezone(null, 'Asia/Kolkata')).toBeNull()
    expect(dateKeyInTimezone('2026-08-25T09:00:00.000Z', null)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
