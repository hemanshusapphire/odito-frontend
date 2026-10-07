/**
 * Human-readable text for every failure code the social publishing backend
 * can report, in ONE place shared by both social UIs (the dashboard's
 * FailureDetails popover and the Social Media AI module). The codes are the
 * backend's own (see odito_backend social_meta: platformAdapters/*,
 * metaErrorClassifier.js, publicationLifecycle.js, socialPublishingService.js)
 * — nothing here is invented. The backend's own `failureReason` is always
 * kept and shown as the specific detail; these headlines only add a short,
 * scannable, actionable summary on top.
 */

// Codes the existing dashboard FailureDetails popover already shipped with
// (kept byte-for-byte so that component's behavior and tests are unchanged).
export const FAILURE_HEADLINES = {
  INSTAGRAM_PERMISSION_MISSING: 'Instagram publishing permission is missing. Reconnect your Instagram account.',
  FACEBOOK_PERMISSION_MISSING: 'Facebook publishing permission is missing. Reconnect your Facebook Page.',
  INSTAGRAM_MEDIA_URL_UNREACHABLE: 'Instagram could not access the uploaded media. Publishing requires a publicly reachable HTTPS media URL.',
  FACEBOOK_MEDIA_URL_UNREACHABLE: 'Facebook could not access the uploaded media. Publishing requires a publicly reachable HTTPS media URL.',
  INSTAGRAM_MEDIA_INVALID: 'Instagram could not process this media. It may be corrupt or in an unsupported format.',
  FACEBOOK_MEDIA_INVALID: 'Facebook could not process this media. It may be corrupt or in an unsupported format.',
  INSTAGRAM_PROCESSING_TIMEOUT: 'Instagram is still processing this media. Try publishing again in a moment.',
  FACEBOOK_TOKEN_INVALID: 'Meta denied this request — the Page connection may need to be reconnected.',
  INSTAGRAM_TOKEN_INVALID: 'Meta denied this request — the Instagram connection may need to be reconnected.',
  ACCOUNT_RECONNECT_REQUIRED: 'The connection for this account has expired. Reconnect it, then retry.',
  PUBLISH_OUTCOME_UNKNOWN: 'Odito could not confirm whether this post went out, so it will not send it again automatically. Check your page: if the post is there, delete this record; if not, delete it and create the post again.',
  SCHEDULE_MISSED: 'This post was not published automatically because it was too far past its scheduled time. Retry to publish it now.',
  MAX_RETRIES_EXCEEDED: 'Odito tried several times but Meta kept failing. Try again later.',
  PUBLISH_INTERRUPTED: 'The publish was interrupted before Meta created the post. It is safe to retry.',
  FACEBOOK_RATE_LIMITED: 'Meta is rate-limiting requests for this Page right now. Try again shortly.',
  INSTAGRAM_RATE_LIMITED: 'Meta is rate-limiting requests for this account right now. Try again shortly.',
}

// Additional codes surfaced by the Social Media AI module (the dashboard
// popover keeps its generic fallback for these, as before).
export const ADDITIONAL_FAILURE_HEADLINES = {
  FACEBOOK_PUBLISH_FAILED: 'Facebook could not publish this post.',
  INSTAGRAM_PUBLISH_FAILED: 'Instagram could not publish this post.',
  MEDIA_REQUIRED: 'Instagram posts need a photo or video. Add media to this post.',
  MEDIA_NOT_SUPPORTED: 'Only a single image or video is supported per post right now.',
  CONTENT_REQUIRED: 'This post has no text. Add a caption or media.',
  META_UNREACHABLE: 'Odito could not reach Meta. This is usually temporary.',
  META_TIMEOUT: 'Meta did not respond in time. This is usually temporary.',
  ACCOUNT_NOT_CONNECTED: 'The connected account for this post is no longer connected. Reconnect it first.',
  ACCOUNT_NOT_FOUND: 'The connected account for this post could not be found.',
  PLATFORM_NOT_SUPPORTED: 'Publishing to this platform is not supported.',
  DUPLICATE_EXTERNAL_POST: 'Meta returned a post that is already recorded for another Odito post.',
  // Content approval workflow: the backend refused to publish/schedule a post that is not fully approved.
  APPROVAL_REQUIRED: 'This post was not published because it is not fully approved. Approve its content and design, then retry.',
}

/** Codes whose only remedy is the user re-authorizing the Meta connection. */
export const RECONNECT_FAILURE_CODES = new Set([
  'FACEBOOK_TOKEN_INVALID', 'INSTAGRAM_TOKEN_INVALID',
  'FACEBOOK_PERMISSION_MISSING', 'INSTAGRAM_PERMISSION_MISSING',
  'ACCOUNT_RECONNECT_REQUIRED', 'ACCOUNT_NOT_CONNECTED',
])

/** Codes meaning "Odito cannot tell whether this was already published". */
export const UNKNOWN_OUTCOME_CODES = new Set(['PUBLISH_OUTCOME_UNKNOWN', 'OUTCOME_UNKNOWN', 'RECONCILIATION_PENDING'])

const PLATFORM_NAME = { facebook: 'Facebook', instagram: 'Instagram' }

export function headlineForFailure(code, platform) {
  if (code && FAILURE_HEADLINES[code]) return FAILURE_HEADLINES[code]
  if (code && ADDITIONAL_FAILURE_HEADLINES[code]) return ADDITIONAL_FAILURE_HEADLINES[code]
  const name = PLATFORM_NAME[platform] || 'Meta'
  return `${name} rejected this post.`
}

/**
 * Normalized failure view of a (failed) publication as returned by the
 * backend. `kind` drives the UI:
 *   'reconnect'  — the account connection needs re-authorizing (show Reconnect)
 *   'unknown'    — outcome unknown: NEVER offer a plain Retry
 *   'approval'   — not published because content/design approval was missing (retry only once approved — the backend says when)
 *   'missed'     — the scheduled time was missed (backend says whether retry is allowed)
 *   'retryable'  — backend says a retry is safe (canRetry)
 *   'blocked'    — failed and the backend does not allow a retry
 * The actionable text is the backend's own `failureReason` (already safe).
 */
export function describeFailure(pub) {
  if (!pub || pub.status !== 'failed') return null
  const code = pub.failureCode || pub.lastErrorCode || null
  const reconnect = !!pub.requiresReconnect || RECONNECT_FAILURE_CODES.has(code)
  const unknown = !!pub.outcomeUnknown || UNKNOWN_OUTCOME_CODES.has(code)

  let kind = 'blocked'
  if (unknown) kind = 'unknown'
  else if (reconnect) kind = 'reconnect'
  else if (code === 'APPROVAL_REQUIRED') kind = 'approval'
  else if (code === 'SCHEDULE_MISSED') kind = 'missed'
  else if (pub.canRetry === true) kind = 'retryable'

  return {
    code,
    kind,
    headline: headlineForFailure(code, pub.platform),
    detail: pub.failureReason || pub.lastError || null,
    canRetry: pub.canRetry === true && !unknown && !reconnect,
    requiresReconnect: reconnect,
    outcomeUnknown: unknown,
  }
}

/**
 * Message for an API ERROR RESPONSE of a social mutation (schedule, cancel,
 * publish, ...). The backend's own message is already safe and specific
 * (e.g. SCHEDULE_IN_PAST: "scheduledAt must be in the future...") and is
 * preferred; the code is returned so callers can branch (reconnect, stale
 * state). apiService attaches the backend's `{ code }` under `error.details`.
 */
export function describeApiError(error, fallback = 'Something went wrong. Please try again.') {
  const code = error?.details?.code || error?.code || null
  const status = error?.status || null
  let message = error?.message || fallback
  // A fetch that never reached the server has no status and a generic message.
  if (!status && /failed to fetch|networkerror|load failed/i.test(message)) {
    message = 'Could not reach Odito. Check your connection and try again.'
  }
  return {
    code,
    status,
    message,
    requiresReconnect: RECONNECT_FAILURE_CODES.has(code),
    outcomeUnknown: UNKNOWN_OUTCOME_CODES.has(code),
    // 404/409 on an action usually means the post changed under us.
    isStale: status === 404 || status === 409,
  }
}
