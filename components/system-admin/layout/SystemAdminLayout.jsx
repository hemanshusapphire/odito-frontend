"use client"

import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { AdminPageHeaderProvider } from "../shared/AdminPageHeaderContext"

/**
 * Presentational shell for the System Admin console: fixed/collapsible
 * sidebar + fixed header + scrollable content, mirroring
 * components/layout/dashboard-layout.jsx's structure.
 *
 * Deliberately does NOT include: ProjectProvider, WorkspaceSwitcher,
 * project selector, project audit UI, credits dialog, PDF export, audit
 * controls, or any project-switching overlay — this layout is fully
 * project-independent.
 *
 * AdminPageHeaderProvider wraps both AdminHeader and {children} so any page
 * rendered below can set the header's title/breadcrumbs (via
 * AdminPagePlaceholder) and AdminHeader picks it up immediately.
 */
export function SystemAdminLayout({ children }) {
  return (
    <AdminPageHeaderProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />

        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </AdminPageHeaderProvider>
  )
}

export default SystemAdminLayout
