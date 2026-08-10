"use client"

import { UserSearch } from "./UserSearch"

/**
 * Same debounced search box as UserSearch.jsx/SubscriptionSearch.jsx — no
 * request-specific logic (just value/onChange/placeholder), so this
 * delegates instead of re-implementing the debounce.
 */
export function CustomPlanRequestSearch(props) {
  return <UserSearch placeholder="Search by company, contact, or email..." {...props} />
}
