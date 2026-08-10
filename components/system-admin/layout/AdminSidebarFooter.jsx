"use client"

import { adminBottomNavItems } from "../config/admin-sidebar-config"
import { SidebarItem } from "@/components/sidebar/SidebarItem"

// Mirrors components/sidebar/SidebarFooter.jsx's shape exactly, pointed at
// the System Admin nav config instead of the regular dashboard's — kept
// separate so the two sidebars never share (or accidentally cross-link)
// nav data, while still reusing the generic SidebarItem primitive.
const settingsItem = adminBottomNavItems.find((item) => item.id === "admin-settings")

export function AdminSidebarFooter({ isCollapsed = false }) {
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
