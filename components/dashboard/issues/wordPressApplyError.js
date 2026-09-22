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

  let fallback = 'Something went wrong while applying this fix.'
  if (status === 400) fallback = 'This request was invalid — please close and reopen this dialog.'
  else if (status === 401) fallback = 'Your session has expired — please sign in again.'
  else if (status === 403) fallback = 'You do not have permission to modify this project.'
  else if (status === 404) fallback = 'This task or WordPress connection could not be found.'
  else if (status === 409) fallback = 'This value changed on WordPress before the fix was applied.'
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
    requiresRefresh: isConflict,
  }
}

export default { describeApplyError }
