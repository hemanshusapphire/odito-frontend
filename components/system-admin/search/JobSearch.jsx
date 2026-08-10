"use client"

import { UserSearch } from "./UserSearch"

/**
 * Same debounced search box as UserSearch.jsx — delegates instead of a
 * fourth re-implementation of the debounce.
 */
export function JobSearch(props) {
  return <UserSearch placeholder="Search by job type, project, or user..." {...props} />
}
