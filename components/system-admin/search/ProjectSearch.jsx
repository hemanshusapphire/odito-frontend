"use client"

import { UserSearch } from "./UserSearch"

/**
 * Same debounced search box as every other System Admin search — also
 * covers the "Owner" filter, since the backend's search already matches
 * owner firstName/lastName/email alongside project name/url (see
 * systemAdminProjectService.js's buildMatchStage). A separate Owner
 * dropdown isn't practical — there's no small enumerable set of owners at
 * scale.
 */
export function ProjectSearch(props) {
  return <UserSearch placeholder="Search by project name, URL, or owner..." {...props} />
}
