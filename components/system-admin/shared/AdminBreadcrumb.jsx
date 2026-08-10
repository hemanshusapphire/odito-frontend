"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Reusable breadcrumb trail. Renders whatever `items` it's given —
 * [{label, href?}] — no page-specific logic lives here. A single-item trail
 * ("Users") and a nested trail ("Users" > "Hemanshu Badoge") are both just
 * different-length arrays; this component never changes.
 */
export function AdminBreadcrumb({ items = [] }) {
  if (!items.length) return null

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? "text-foreground font-medium" : "text-muted-foreground")}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
