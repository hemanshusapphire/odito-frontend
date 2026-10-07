/**
 * User-facing text for the stable `meta_error` codes the backend's Meta OAuth
 * callback (metaOAuthController.js handleMetaCallback) puts on the redirect
 * back to the app, and for the Instagram-discovery `reason` codes returned by
 * the select-Page / retry endpoints (metaInstagramService.js). The backend
 * never forwards Meta's raw error text, only these codes.
 */

export const OAUTH_ERROR_MESSAGES = {
  access_denied: 'Meta connection was cancelled. Nothing was changed.',
  invalid_request: 'That connection request was invalid. Please try again.',
  expired_or_invalid_request: 'That connection request expired. Please try connecting again.',
  connection_failed: 'Meta connection failed. Please try again.',
}

export function oauthErrorMessage(code) {
  return OAUTH_ERROR_MESSAGES[code] || 'Failed to connect your Meta account. Please try again.'
}

export const INSTAGRAM_DISCOVERY_MESSAGES = {
  NOT_CONNECTED: 'No Instagram professional account is linked to this Facebook Page yet.',
  ACCESS_DENIED: 'Meta denied access to the linked Instagram account. Reconnect Facebook and approve the Instagram permissions.',
  DISCOVERY_FAILED: 'Could not reach Instagram right now. Try again in a moment.',
  PROFILE_FETCH_FAILED: 'Found a linked Instagram account but could not load its profile. Try again in a moment.',
  INVALID_PAGE_CONNECTION: 'Reconnect your Facebook Page, then check again.',
}

export function instagramDiscoveryMessage(reason) {
  return INSTAGRAM_DISCOVERY_MESSAGES[reason] || 'Could not check for a linked Instagram account. Try again.'
}
