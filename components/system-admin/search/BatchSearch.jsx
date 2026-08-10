"use client"

import { UserSearch } from "./UserSearch"

/**
 * ODITO-OPS-001 — delegates to the shared debounced search box, same
 * convention as JobSearch/AuditLogSearch.
 */
export function BatchSearch(props) {
  return <UserSearch placeholder="Search by batch ID, project, or user email..." {...props} />
}
