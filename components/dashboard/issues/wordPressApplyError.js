/**
 * Maps a thrown apply-wordpress error (apiService.handleResponse already
 * attaches .status/.code/.details/.message from the backend response — see
 * lib/apiService.js) into what the confirmation dialog should show.
 *
 * Backend messages are already written to be safe/user-facing (never a raw
 * Axios error, stack trace, or WordPress HTML), so this never invents new
 * copy — it only decides PRESENTATION: conflict-class errors (409, or the
 * VersionError-after-successful-write case) are a recoverable "warning" the
 * user must explicitly acknowledge by refreshing the live value, never a
 * hard "failed" red error implying nothing happened — a real WordPress
 * write may already have gone through in both of those cases.
 *
 * Extracted to its own module (rather than living inline in
 * IssueDetailView.jsx) specifically so it's unit-testable without mounting
 * the component — see wordPressApplyError.test.js.
 */
export function describeApplyError(error) {
  if (!error) return null
  const status = error.status
  const code = error.code
  const isConflict = status === 409 || code === 'CONFLICT'
  const wordpressWriteSucceeded = !!error.details?.wordpressWriteSucceeded
  // The backend's one explicit, structural precondition failure (see
  // wordPressSeoFixService.js's validateFix()): no amount of retrying this
  // exact request can ever succeed without first generating and linking a
  // recommendation — distinct from a transient WRITE_FAILED (a WordPress
  // outage, a stale value) where retrying later is a reasonable thing to
  // offer. The dialog uses this to disable "Apply Fix" outright rather
  // than leaving a guaranteed-to-fail action clickable.
  const isRecommendationRequired = code === 'RECOMMENDATION_REQUIRED'
  // sameAs (site-owner-entered profile URLs): a write that failed part-way may
  // already have saved some of the profiles, and a validation/protected-profile
  // rejection is fixed by editing the entries — never by "refresh live value".
  const partialWrite = !!error.details?.partialWrite
  const isProfileProblem = code === 'INVALID_PROFILES' || code === 'PROFILE_PROTECTED'
  // Schema fixes only (FAQ, AggregateRating): the recommendation no longer
  // matches the content actually on the page (edited/removed since it was
  // generated). A 409 like a CONFLICT,
  // but "refresh the live value" can never fix it — only generating the
  // recommendation again from the current page can.
  const regenerateRequired = code === 'FAQ_CONTENT_CHANGED' || code === 'RATING_CONTENT_CHANGED' || !!error.details?.regenerateRequired

  let fallback = 'Something went wrong while applying this fix.'
  if (code === 'INVALID_PROFILES') fallback = 'One or more social profile URLs are not valid. Check the entries and try again.'
  else if (code === 'PROFILE_PROTECTED') fallback = 'This profile is managed by Rank Math and cannot be removed from here.'
  else if (status === 400) fallback = 'This request was invalid — please close and reopen this dialog.'
  else if (status === 401) fallback = 'Your session has expired — please sign in again.'
  else if (status === 403) fallback = 'You do not have permission to modify this project.'
  else if (status === 404) fallback = 'This task or WordPress connection could not be found.'
  else if (regenerateRequired) fallback = 'The content on this page no longer matches the generated schema — generate it again from the current page.'
  else if (status === 409) fallback = 'This value changed on WordPress before the fix was applied.'
  else if (isRecommendationRequired) fallback = 'No AI recommendation is linked to this task — generate one, then try again.'
  else if (status === 422) fallback = 'This field cannot currently be modified on this WordPress site.'
  else if (status === 429) fallback = 'Too many attempts — please wait a moment and try again.'
  else if (status >= 500) fallback = 'WordPress or Odito had a temporary problem. Please try again shortly.'

  return {
    message: error.message || fallback,
    isConflict,
    // Distinct, more reassuring wording for the one case where a WordPress
    // write genuinely already succeeded but Odito lost the race recording
    // it — never implies "Fix failed" (see Section 9 of the Phase 3 spec).
    wordpressWriteSucceeded,
    requiresRefresh: isConflict && !regenerateRequired,
    regenerateRequired,
    isRecommendationRequired,
    partialWrite,
    isProfileProblem,
    // Whether re-clicking "Apply Fix" with no other action taken could
    // ever succeed — false for RECOMMENDATION_REQUIRED specifically; every
    // other error class is left retryable, matching existing behavior.
    nonRetryable: isRecommendationRequired || regenerateRequired,
  }
}

export default { describeApplyError }
