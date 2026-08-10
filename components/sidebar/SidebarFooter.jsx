"use client"

import { bottomNavItems } from "./sidebar-config"
import { SidebarItem } from "./SidebarItem"

// User details are handled in site-header; this footer only surfaces the
// Settings link (Notifications has no page yet, so it stays unwired).
const settingsItem = bottomNavItems.find((item) => item.id === "settings")

export function SidebarFooter({ isCollapsed = false }) {
  if (!settingsItem) return null

  return (
    <div className="px-2 pb-2">
      <div className={isCollapsed ? "mx-auto my-1 h-px w-5 bg-sidebar-border" : "mx-3 my-1 h-px bg-sidebar-border"} />
      <nav className="flex flex-col gap-0" role="navigation" aria-label="Settings">
        <SidebarItem item={settingsItem} isCollapsed={isCollapsed} />
      </nav>
    </div>
  )
}
