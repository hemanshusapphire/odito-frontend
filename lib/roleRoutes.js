// Maps a roleId to its own dedicated landing area — the ONE place that
// decides "does this role skip the normal customer flow (hasProjects /
// onboarding / dashboard) entirely and go straight to its own section?"
//
// roleId 5 (regular user) is deliberately NOT listed here — it falls
// through to the existing project-ownership-based routing in
// AuthGuard/PublicGuard, unchanged.
//
// Adding System Admin's future siblings (2/3/4) is a one-line addition
// here — AuthGuard/PublicGuard never need to change again.
const ROLE_LANDING_ROUTES = {
  1: '/system-admin', // systemadmin
}

/**
 * @param {number|undefined} roleId
 * @returns {string|null} the role's dedicated landing route, or null if this
 *   role should go through the normal customer hasProjects/onboarding flow.
 */
export function getRoleLandingRoute(roleId) {
  return ROLE_LANDING_ROUTES[roleId] || null
}
