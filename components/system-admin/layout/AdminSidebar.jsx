"use client"

import { useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ShieldCheck } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useSidebarStore } from "@/components/sidebar/sidebar-store"
import { SidebarHeader } from "@/components/sidebar/SidebarHeader"
import { SidebarNav } from "@/components/sidebar/SidebarNav"
import { AdminSidebarFooter } from "./AdminSidebarFooter"
import { adminSidebarSections } from "../config/admin-sidebar-config"
import { useIsMobile } from "@/hooks/use-mobile"

const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 64

/**
 * System Admin sidebar. Mirrors ElevenSidebar's structure (fixed/collapsible
 * desktop rail, Sheet-based mobile drawer, same useSidebarStore) but
 * deliberately drops everything project-scoped: no WorkspaceSwitcher, no
 * useProject(), no pre-audit item filtering. Reuses the generic
 * SidebarHeader/SidebarNav primitives from components/sidebar; navigation
 * data comes from ./admin-sidebar-config.js instead of sidebar-config.js.
 */
export function AdminSidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, setMobileOpen } =
    useSidebarStore()
  const isMobile = useIsMobile()

  // Keyboard shortcut: Ctrl/Cmd + B to toggle — same shortcut/behavior as
  // the regular dashboard sidebar, sharing the same store.
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        if (isMobile) {
          setMobileOpen(!isMobileOpen)
        } else {
          toggleCollapse()
        }
      }
    },
    [isMobile, isMobileOpen, toggleCollapse, setMobileOpen]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const showLabel = !isMobile && !isCollapsed

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Sticky top: Header + static "System Admin" workspace label */}
      <div className="shrink-0">
        <SidebarHeader isCollapsed={!isMobile && isCollapsed} />
        <div
          className={cn(
            "mx-2 mb-1 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-hover/40 px-3 py-2",
            !showLabel && "justify-center px-2"
          )}
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-sidebar-icon" />
          {showLabel && (
            <span className="truncate text-sm font-semibold text-sidebar-hover-foreground">
              System Admin
            </span>
          )}
        </div>
      </div>

      {/* Scrollable middle: Navigation */}
      <div className="eleven-sidebar-scroll scrollbar-hidden flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarNav
          sections={adminSidebarSections}
          isCollapsed={!isMobile && isCollapsed}
        />
      </div>

      {/* Sticky bottom: Footer */}
      <div className="shrink-0">
        <AdminSidebarFooter isCollapsed={!isMobile && isCollapsed} />
      </div>
    </div>
  )

  // Mobile: Sheet/drawer — identical pattern to ElevenSidebar
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[280px] sidebar-surface p-0 [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>System Admin Navigation</SheetTitle>
            <SheetDescription>System Admin sidebar navigation</SheetDescription>
          </SheetHeader>
          <TooltipProvider delayDuration={0}>
            {sidebarContent}
          </TooltipProvider>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Fixed sidebar
  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className={cn(
          "eleven-sidebar fixed inset-y-0 left-0 z-30 flex flex-col sidebar-surface",
          "hidden md:flex"
        )}
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Spacer to push main content */}
      <motion.div
        className="hidden shrink-0 md:block"
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      />
    </TooltipProvider>
  )
}
