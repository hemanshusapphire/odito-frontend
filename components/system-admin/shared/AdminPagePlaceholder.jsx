"use client"

import { useEffect } from "react"
import { useAdminPageHeader } from "./AdminPageHeaderContext"

/**
 * Shared shell for System Admin module pages. Registers the page's
 * title/breadcrumbs with AdminPageHeaderContext on mount so AdminHeader
 * renders them — pages never talk to the header directly.
 *
 * `children` is an optional toolbar/actions slot (e.g. an "Add User"
 * button) rendered next to the title, so future pages can extend this
 * without rewriting the placeholder. Not yet a full page body — real
 * modules (tables/cards) still get their own page.jsx content.
 */
export function AdminPagePlaceholder({ title, description, breadcrumbs, children }) {
  const { setHeader } = useAdminPageHeader()

  useEffect(() => {
    setHeader({ title, breadcrumbs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, breadcrumbs])

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-foreground text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
