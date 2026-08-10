"use client"

import { UserSearch } from "./UserSearch"

/**
 * Same debounced search box as UserSearch.jsx — searches admin/target user
 * name or email (see systemAdminOperationsService.listAuditLogs).
 */
export function AuditSearch(props) {
  return <UserSearch placeholder="Search by admin or target user..." {...props} />
}
