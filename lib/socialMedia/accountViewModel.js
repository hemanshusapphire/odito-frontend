/**
 * Maps the backend's real account-status response (GET /social/accounts)
 * into the one view model every Social Media AI account UI renders.
 *
 * The backend's per-platform entry is one of:
 *   { connected:true,  status:'active',  requiresReconnect:false, accountName, accountId,
 *     socialAccountId, username?, picture?, accountType?, lastVerifiedAt, connectedAt,
 *     publishingReady }
 *   { connected:false, status:'expired', requiresReconnect:true,  accountName, picture, ... }
 *   { connected:false }                       (never connected / disconnected)
 *
 * `connected === true` does NOT by itself mean healthy: a connection can be
 * connected but not publish-ready (a permission was declined) — that is
 * surfaced as `needsPermission`, not hidden.
 *
 * No token ever reaches this layer: the backend never returns one.
 */

export const ACCOUNT_STATE = Object.freeze({
  LOADING: 'loading',
  ERROR: 'error',
  NOT_CONNECTED: 'not_connected',
  CONNECTED: 'connected',
  EXPIRED: 'expired',
})

/**
 * @param {'facebook'|'instagram'} platform
 * @param {object|undefined} entry   data.facebook / data.instagram from the status API
 * @param {{ isLoading?: boolean, isError?: boolean }} [query]
 */
export function toAccountViewModel(platform, entry, { isLoading = false, isError = false } = {}) {
  const base = {
    platform,
    state: ACCOUNT_STATE.NOT_CONNECTED,
    connected: false,
    requiresReconnect: false,
    needsPermission: false,
    name: null,
    username: null,
    picture: null,
    category: null,
    accountType: null,
    accountId: null,
    socialAccountId: null,
    connectedAt: null,
    lastVerifiedAt: null,
    publishingReady: false,
  }

  // No usable data yet: loading wins over error only while nothing is cached.
  if (!entry) {
    if (isLoading) return { ...base, state: ACCOUNT_STATE.LOADING }
    if (isError) return { ...base, state: ACCOUNT_STATE.ERROR }
    return base
  }

  const shared = {
    name: entry.accountName || null,
    username: entry.username || null,
    picture: entry.picture || null,
    category: entry.category || null,
    accountType: entry.accountType || null,
    accountId: entry.accountId || null,
    socialAccountId: entry.socialAccountId || null,
    connectedAt: entry.connectedAt || null,
    lastVerifiedAt: entry.lastVerifiedAt || null,
  }

  if (entry.requiresReconnect === true || entry.status === 'expired') {
    return { ...base, ...shared, state: ACCOUNT_STATE.EXPIRED, requiresReconnect: true }
  }

  if (entry.connected === true) {
    const publishingReady = entry.publishingReady === true
    return {
      ...base,
      ...shared,
      state: ACCOUNT_STATE.CONNECTED,
      connected: true,
      publishingReady,
      needsPermission: !publishingReady,
    }
  }

  return base
}

/** Both platforms from one status query result. */
export function toAccountViewModels(data, query) {
  return {
    facebook: toAccountViewModel('facebook', data?.facebook, query),
    instagram: toAccountViewModel('instagram', data?.instagram, query),
  }
}

/**
 * Accounts that currently block publishing and what the user must do — the
 * single source for the Scheduled Posts "connection needs attention" banner
 * and the header pills, so they can never disagree with Connect Accounts.
 */
export function accountsNeedingAttention(models) {
  const out = []
  for (const vm of Object.values(models || {})) {
    if (vm.state === ACCOUNT_STATE.EXPIRED) out.push({ platform: vm.platform, reason: 'expired', name: vm.name })
    else if (vm.state === ACCOUNT_STATE.CONNECTED && vm.needsPermission) out.push({ platform: vm.platform, reason: 'permission', name: vm.name })
  }
  return out
}

/** Short status label for a pill. */
export function accountStatusLabel(vm) {
  switch (vm.state) {
    case ACCOUNT_STATE.LOADING: return 'Checking…'
    case ACCOUNT_STATE.ERROR: return 'Status unavailable'
    case ACCOUNT_STATE.EXPIRED: return 'Reconnect required'
    case ACCOUNT_STATE.CONNECTED: return vm.needsPermission ? 'Permission needed' : 'Connected'
    default: return 'Not connected'
  }
}
