"use client"

import { UserSearch } from "./UserSearch"

/**
 * Same debounced search box as UserSearch.jsx — that component has no
 * user-specific logic (just value/onChange/placeholder), so this delegates
 * instead of re-implementing the debounce.
 */
export function SubscriptionSearch(props) {
  return <UserSearch placeholder="Search by name or email..." {...props} />
}
