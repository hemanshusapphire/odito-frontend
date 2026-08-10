"use client"

import { createContext, useContext, useState, useCallback, useMemo } from "react"

const AdminPageHeaderContext = createContext(null)

/**
 * Scalable replacement for deriving the header's page title from the
 * sidebar config. Pages (via AdminPagePlaceholder) register their own
 * title/breadcrumbs here; AdminHeader only ever reads from this context.
 *
 * This lets a future page like /system-admin/users/[id] set
 * breadcrumbs=[{label:"Users", href:"/system-admin/users"}, {label: user.name}]
 * without AdminHeader (or the sidebar) knowing anything about users.
 */
export function AdminPageHeaderProvider({ children }) {
  const [header, setHeaderState] = useState({ title: "System Admin", breadcrumbs: [] })

  const setHeader = useCallback(({ title, breadcrumbs } = {}) => {
    setHeaderState((prev) => {
      const nextTitle = title ?? prev.title
      const nextBreadcrumbs = breadcrumbs ?? (title ? [{ label: title }] : prev.breadcrumbs)
      if (prev.title === nextTitle && prev.breadcrumbs === nextBreadcrumbs) return prev
      return { title: nextTitle, breadcrumbs: nextBreadcrumbs }
    })
  }, [])

  const value = useMemo(() => ({ ...header, setHeader }), [header, setHeader])

  return (
    <AdminPageHeaderContext.Provider value={value}>
      {children}
    </AdminPageHeaderContext.Provider>
  )
}

export function useAdminPageHeader() {
  const ctx = useContext(AdminPageHeaderContext)
  if (!ctx) {
    throw new Error("useAdminPageHeader must be used within an AdminPageHeaderProvider")
  }
  return ctx
}
