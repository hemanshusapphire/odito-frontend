// Single source of truth for every IANA timezone offered anywhere in the
// app (currently just the Create Post schedule picker). Values are real
// IANA zone identifiers — never fixed numeric offsets — because DST makes
// a fixed offset wrong for roughly half the year in every US/UK zone
// listed here. Actual date-math always goes through lib/scheduleTime.js's
// luxon-based conversion, which resolves the correct offset (including
// DST) for whatever moment is being converted; the offset shown in each
// label below is display-only, for the standard-time case.
export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: '(UTC+05:30) India Standard Time' },
  { value: 'America/New_York', label: '(UTC-05:00) Eastern Time' },
  { value: 'America/Chicago', label: '(UTC-06:00) Central Time' },
  { value: 'America/Denver', label: '(UTC-07:00) Mountain Time' },
  { value: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time' },
  { value: 'UTC', label: '(UTC+00:00) Coordinated Universal Time' },
  { value: 'Europe/London', label: '(UTC+00:00) London' },
]

export const DEFAULT_TIMEZONE = TIMEZONES[0].value
