/**
 * Display helpers for Google Business Profile reviews. Field names mirror the
 * review documents the backend returns (reviewer_name, star_rating, comment,
 * review_create_time, reply.{comment,update_time}, ...).
 */

const RELATIVE_UNITS = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
]

export function formatReviewDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** "2 days ago" style label; falls back to '' for missing/invalid dates. */
export function formatRelativeDate(iso, now = Date.now()) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diffSeconds = Math.round((t - now) / 1000)
  const abs = Math.abs(diffSeconds)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (abs >= seconds) return rtf.format(Math.round(diffSeconds / seconds), unit)
  }
  return rtf.format(0, 'second')
}

export function hasReply(review) {
  return !!review?.reply?.comment
}

// Google's reply limit is 4096 BYTES (not characters) - emoji / non-Latin text count more.
export const MAX_REPLY_BYTES = 4096
export const replyByteLength = (text) => new TextEncoder().encode(text || '').length

/**
 * User-facing message for a failed reply, chosen by backend error `code`.
 * Raw server/Google messages are never shown.
 */
export function replyErrorMessage(error) {
  switch (error?.code) {
    case 'INVALID_REPLY': return error.message || 'Please check your reply and try again.'
    case 'REPLY_IN_PROGRESS': return 'Your reply is already being sent.'
    case 'ALREADY_REPLIED': return 'This review already has a reply.'
    case 'REVIEW_NOT_FOUND': return 'This review no longer exists on Google.'
    case 'GOOGLE_AUTH_FAILED': return 'Your Google Business Profile connection may need to be re-authorized.'
    case 'GOOGLE_PERMISSION_DENIED': return 'Your Google account does not have permission to reply to this review.'
    case 'GOOGLE_RATE_LIMITED':
    case 'RATE_LIMITED': return 'Too many requests right now. Please wait a moment and try again.'
    case 'GOOGLE_UNAVAILABLE': return 'Could not reach Google. Please try again.'
    case 'GOOGLE_REJECTED':
    case 'REPLY_REJECTED': return 'Google rejected this reply.'
    case 'NOT_CONNECTED':
    case 'NO_LOCATION_SELECTED': return 'Google Business Profile is not connected for this project.'
    default: return 'Unable to post reply.'
  }
}

/** Errors where trying the identical request again can succeed. */
export function isRetryableReplyError(error) {
  return ['GOOGLE_UNAVAILABLE', 'GOOGLE_RATE_LIMITED', 'RATE_LIMITED'].includes(error?.code) || (!error?.code && !error?.status)
}
