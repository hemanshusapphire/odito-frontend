"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/app/settings", label: "Project" },
  { href: "/app/settings/profile", label: "Profile" },
  { href: "/app/settings/subscription", label: "Subscription" },
]

/**
 * Lightweight route-level tab strip shared by both Settings sub-pages.
 * Not a redesign of Settings — purely additive navigation between the
 * existing project-settings page and the new subscription page.
 */
export default function SettingsTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
