import { DateTime } from 'luxon'

/**
 * Converts a LOCAL date/time as picked in the Create Post schedule form,
 * interpreted in the given IANA timezone, into an absolute UTC ISO string
 * (e.g. "2026-08-22T06:00:00.000Z"). This is the ONLY place schedule times
 * are converted — never build/parse a naive "YYYY-MM-DDTHH:mm:ss" string
 * elsewhere and hand it to `new Date()`, which silently uses the browser's
 * (or, server-side, the process's) own local timezone instead of the one
 * the user actually selected.
 *
 * Returns null if the inputs don't form a valid date/time (e.g. Feb 30, or
 * a hand-edited date string) rather than throwing — callers surface that
 * as an INVALID_SCHEDULE-style error.
 */
export function localScheduleToUtcIso({ date, hour, minute, format, timezone }) {
  if (!date || hour === undefined || hour === null || minute === undefined || minute === null || !timezone) {
    return null
  }
  const [year, month, day] = String(date).split('-').map(Number)
  const hourNum = Number(hour)
  const minuteNum = Number(minute)
  if (!year || !month || !day || Number.isNaN(hourNum) || Number.isNaN(minuteNum)) return null

  const hour24 = format === 'PM' ? (hourNum % 12) + 12 : hourNum % 12

  const dt = DateTime.fromObject(
    { year, month, day, hour: hour24, minute: minuteNum, second: 0, millisecond: 0 },
    { zone: timezone },
  )
  if (!dt.isValid) return null
  return dt.toUTC().toISO()
}

/**
 * Formats a stored absolute UTC instant back into the timezone it was
 * originally scheduled in (falls back to the viewer's own browser
 * timezone when no `timezone` was recorded — older records created before
 * this field existed).
 */
export function formatInTimezone(isoOrDate, timezone) {
  if (!isoOrDate) return null
  const dt = timezone
    ? DateTime.fromJSDate(new Date(isoOrDate)).setZone(timezone)
    : DateTime.fromJSDate(new Date(isoOrDate))
  if (!dt.isValid) return null
  return dt.toFormat('LLL d, yyyy, h:mm a')
}

/**
 * The calendar day (as a sortable "yyyy-LL-dd" key) an absolute UTC
 * instant falls on WHEN VIEWED IN the given timezone — the one and only
 * place that should ever decide which calendar cell a scheduled post
 * belongs in. Same fallback rule as formatInTimezone: no timezone
 * recorded (e.g. a publishedAt, which has no "chosen zone" concept, or a
 * legacy record from before this field existed) falls back to the
 * viewer's own browser timezone.
 *
 * Never derive a calendar day from `new Date(iso).toISOString().slice(0, 10)`
 * — that reads the UTC calendar day, not the day the post was actually
 * scheduled for in the zone the user picked, and disagrees with both this
 * function and the viewer's own local calendar grid for any timezone with
 * a non-zero UTC offset.
 */
export function dateKeyInTimezone(isoOrDate, timezone) {
  if (!isoOrDate) return null
  const dt = timezone
    ? DateTime.fromJSDate(new Date(isoOrDate)).setZone(timezone)
    : DateTime.fromJSDate(new Date(isoOrDate))
  if (!dt.isValid) return null
  return dt.toFormat('yyyy-LL-dd')
}
