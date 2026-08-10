/**
 * Pure, browser-local-time helpers for Google Business Profile hours.
 *
 * Google's Business Information API never returns a boolean "open now" or a
 * pre-formatted "today's hours" string - only the raw regularHours/
 * specialHours periods (see businessProfileService.getBusinessProfileLocationDetails).
 * Computing "open now" needs the BUSINESS's timezone, which Location doesn't
 * expose either; a real timezone lookup would need a separate paid API
 * (out of scope for this data-only pass). Using the browser's local time is
 * a reasonable approximation for a dashboard the business owner is viewing
 * themselves, and is called out as a known limitation in the implementation
 * report rather than silently presented as authoritative.
 */

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

function timeOfDayToMinutes(t) {
  if (!t) return null
  const hours = typeof t.hours === 'number' ? t.hours : 0
  const minutes = typeof t.minutes === 'number' ? t.minutes : 0
  return hours * 60 + minutes
}

function formatTimeOfDay(t) {
  if (!t) return ''
  const hours = typeof t.hours === 'number' ? t.hours : 0
  const minutes = typeof t.minutes === 'number' ? t.minutes : 0
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
}

function specialPeriodForDate(specialHours, date) {
  if (!Array.isArray(specialHours)) return null
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  return specialHours.find((p) => {
    const sd = p.startDate
    return sd && sd.year === y && sd.month === m && sd.day === d
  }) || null
}

/**
 * @param {Array|null} regularHours - Location.regularHours.periods, as returned by the backend
 * @param {Array|null} specialHours - Location.specialHours.specialHourPeriods
 * @param {Date} [now] - injectable for testing; defaults to browser-local now
 * @returns {{ isOpenNow: boolean|null, todayHours: string|null, closesAt: string|null }}
 */
export function computeOpenStatus(regularHours, specialHours, now = new Date()) {
  const todayName = DAY_NAMES[now.getDay()]
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const special = specialPeriodForDate(specialHours, now)

  if (special) {
    if (special.closed) {
      return { isOpenNow: false, todayHours: 'Closed (holiday hours)', closesAt: null }
    }
    const open = timeOfDayToMinutes(special.openTime)
    const close = timeOfDayToMinutes(special.closeTime)
    const isOpenNow = open != null && close != null && nowMinutes >= open && nowMinutes < close
    return {
      isOpenNow,
      todayHours: `${formatTimeOfDay(special.openTime)} – ${formatTimeOfDay(special.closeTime)}`,
      closesAt: isOpenNow ? formatTimeOfDay(special.closeTime) : null,
    }
  }

  if (!Array.isArray(regularHours) || regularHours.length === 0) {
    return { isOpenNow: null, todayHours: null, closesAt: null }
  }

  const todaysPeriods = regularHours.filter((p) => p.openDay === todayName)
  if (todaysPeriods.length === 0) {
    return { isOpenNow: false, todayHours: 'Closed today', closesAt: null }
  }

  const label = todaysPeriods
    .map((p) => `${formatTimeOfDay(p.openTime)} – ${formatTimeOfDay(p.closeTime)}`)
    .join(', ')

  for (const p of todaysPeriods) {
    const open = timeOfDayToMinutes(p.openTime)
    let close = timeOfDayToMinutes(p.closeTime)
    // Overnight hours (e.g. open 18:00, close 02:00 the next day)
    if (close != null && open != null && close <= open) close += 24 * 60
    if (open != null && close != null && nowMinutes >= open && nowMinutes < close) {
      return { isOpenNow: true, todayHours: label, closesAt: formatTimeOfDay(p.closeTime) }
    }
  }

  return { isOpenNow: false, todayHours: label, closesAt: null }
}
