"use client"

import { UserSearch } from "./UserSearch"

/**
 * Same debounced search box as UserSearch.jsx/SubscriptionSearch.jsx —
 * delegates instead of a third re-implementation of the debounce.
 */
export function PaymentSearch(props) {
  return <UserSearch placeholder="Search by name or email..." {...props} />
}
